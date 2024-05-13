import { costStringFromGPTResponse } from "../apiOperations.js"

const ITEMS_PER_PAGE = 50; // Number of items per page

export class PaginatedTable {
  constructor(tableId) {
    this.tableId = tableId;
    this.currentPage = 1;
    this.totalPages = 1;
    this.requestLogData = [];
    this.currentlySortedBy = 1;
    this.isAscending = false;
  }

  async loadTable() {
    const folder = localStorage.getItem('folder');
    const requestsPath = `${folder}/gptcobuilder/requests`;

    try {
      const requestFiles = await window.fs.readdir(requestsPath);
      this.totalPages = Math.ceil(requestFiles.length / ITEMS_PER_PAGE);

      this.requestLogData = await this.parseRequestLogFiles(requestFiles);
      this.renderSortedTable();
      this.addPaginationControls();
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  }

  async populateTableWithPageFiles(table) {
    const start = (this.currentPage - 1) * ITEMS_PER_PAGE;
    const end = this.currentPage * ITEMS_PER_PAGE;
    const pageFiles = this.requestLogData.slice(start, end);

    table.innerHTML = '';
    this.createTableHeaders(table);

    for (const requestLog of pageFiles) {
      const row = table.insertRow();
      this.fillCell(row, requestLog.model);
      this.fillCell(row, requestLog.dateTime.toLocaleString());
      this.fillCell(row, requestLog.requestContent);
      this.fillCell(row, requestLog.responseContent);

      row.setAttribute('data-request', requestLog.filePath); // Set the data attribute for row
      row.classList.add('request-entry'); // Add class for event listener

      row.addEventListener('click', this.openRequestDetails.bind(this));
    }
  }

  parseDateTime (datetime) {
    let split = datetime.split('.')[0].split('T');
    return new Date(split[0] + "T" + split[1].replace(/-/g, ':'));
  }

  async parseRequestLogFiles(requestFiles) {
    const folder = localStorage.getItem('folder');
    const requestsPath = `${folder}/gptcobuilder/requests`;
    const requestLogData = [];

    for (const fileName of requestFiles) {
      const filePath = `${requestsPath}/${fileName}`;
      const fileContent = await window.fs.readFile(filePath);
      const requestLog = JSON.parse(fileContent);

      requestLogData.push({
        model: requestLog.response.model,
        dateTime: this.parseDateTime(fileName),
        inputTokens: parseInt(requestLog.response.usage.prompt_tokens),
        completionTokens: parseInt(requestLog.response.usage.completion_tokens),
        cost: costStringFromGPTResponse(requestLog.response),
        finishReason: requestLog.response.choices[0].finish_reason,
        requestContent: (requestLog.request.content || requestLog.request.messages[1].content).slice(-256),
        responseContent: requestLog.response.choices[0].message.content.slice(0, 256),
        filePath: filePath
      });
    }

    return requestLogData;
  }

  createTableHeaders(table) {
    let headersHTML = [
      "Model Name", "Date/Time", "Request Content", "Response Content"
    ].map(
      (headerText, index) => `<th data-sort-index="${index}">${headerText}</th>`
    ).join('');

    table.insertAdjacentHTML('beforeend', `<tr>${headersHTML}</tr>`);
    
    table.querySelectorAll("th").forEach(headerCell => {
      const sortOrderIndex = parseInt(headerCell.dataset.sortIndex);
      headerCell.addEventListener('click', () => this.sortTableByColumn(sortOrderIndex));
    });
  }

  sortTableByColumn(columnIndex) {
    if (this.currentlySortedBy === columnIndex) {
      this.isAscending = !this.isAscending;
    } else {
      this.currentlySortedBy = columnIndex;
      this.isAscending = true;
    }
    this.renderSortedTable();
  }

  renderSortedTable() {
    this.requestLogData.sort((a, b) => {
      const compareA = a[this.getColumnKeyByIndex(this.currentlySortedBy)];
      const compareB = b[this.getColumnKeyByIndex(this.currentlySortedBy)];
      if (compareA < compareB) return this.isAscending ? -1 : 1;
      if (compareA > compareB) return this.isAscending ? 1 : -1;
      return 0;
    });

    const table = document.getElementById(this.tableId);
    this.populateTableWithPageFiles(table);
    this.addPaginationControls();
  }

  getColumnKeyByIndex(index) {
    const keys = [
      "model", "dateTime", "requestContent", "responseContent"
    ];
    return keys[index] || null;
  }

  async openRequestDetails(event) {
    const filePath = event.currentTarget.getAttribute('data-request');
    const fileContent = await window.fs.readFile(filePath);
    const requestLog = JSON.parse(fileContent);

    // Now use the JSON to update the modal content
    const modal = $('#requestDetailsModal');
    const apiKeyParagraph = modal.querySelector('#modal-apiKey');
    const modelParagraph = modal.querySelector('#modal-model');
    const requestContentParagraph = modal.querySelector('#modal-requestContent');
    const responseContentParagraph = modal.querySelector('#modal-responseContent');
    const costParagraph = modal.querySelector('#modal-cost');

    modelParagraph.innerText = `Model: ${requestLog.response.model}`;
    costParagraph.innerText = `Cost: $${costStringFromGPTResponse(requestLog.response)}`;

    requestContentParagraph.value = requestLog.request.content || requestLog.request.messages[1].content;
    responseContentParagraph.value = requestLog.response.choices[0].message.content;

    modal.style.display = 'block';
  }

  fillCell(row, text) {
    const cell = row.insertCell();
    cell.innerText = text;
  }

  addPaginationControls() {
    const container = document.getElementById(this.tableId + "-container");
    if (!container) return;

    container.querySelectorAll('.pagination-control').forEach(ctrl => ctrl.remove());

    const paginationHTML = 
      `<button class="button pagination-control" ${this.currentPage <= 1 ? 'disabled' : ''} data-direction="-1">Previous</button>
       <button class="button pagination-control" ${this.currentPage >= this.totalPages ? 'disabled' : ''} data-direction="1">Next</button>
       <button class="button pagination-control" ${this.currentPage === 1 ? 'disabled' : ''} data-direction="first">First</button>
       <button class="button pagination-control" ${this.currentPage === this.totalPages ? 'disabled' : ''} data-direction="last">Last</button>
       <input type="number" class="pagination-control" min="1" max="${this.totalPages}" value="${this.currentPage}">`;

    container.insertAdjacentHTML('afterBegin', paginationHTML);

    // Add the event listeners to the buttons and input
    container.querySelector('[data-direction="-1"]').addEventListener('click', () => this.changePage(-1));
    container.querySelector('[data-direction="1"]').addEventListener('click', () => this.changePage(1));
    container.querySelector('[data-direction="first"]').addEventListener('click', () => this.goToPage(1));
    container.querySelector('[data-direction="last"]').addEventListener('click', () => this.goToPage(this.totalPages));
    container.querySelector('input').addEventListener('change', (e) => this.goToPage(e.target.value));
  }

  changePage(direction) {
    this.currentPage += direction;
    this.renderSortedTable();
  }

  goToPage(pageNumber) {
    pageNumber = parseInt(pageNumber, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.renderSortedTable();
    } else {
      alert(`Invalid page number. Please enter a number between 1 and ${this.totalPages}.`);
    }
  }
}
