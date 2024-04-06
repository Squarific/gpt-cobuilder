import { costStringFromGPTResponse } from "../apiOperations.js"

const ITEMS_PER_PAGE = 50; // Number of items per page

export class PaginatedTable {
  constructor(tableId) {
    this.tableId = tableId;
    this.currentPage = 1;
    this.totalPages = 1;
    this.requestLogData = []; // Holds parsed log objects
    this.currentlySortedBy = null;
    this.isAscending = true;
  }

  async loadTable() {
    const folder = localStorage.getItem('folder');
    const requestsPath = `${folder}/gptcobuilder/requests`;
    const table = document.getElementById(this.tableId);

    try {
      const requestFiles = await window.fs.readdir(requestsPath);
      this.totalPages = Math.ceil(requestFiles.length / ITEMS_PER_PAGE);

      this.requestLogData = await this.parseRequestLogFiles(requestFiles);
      this.populateTableWithPageFiles(table);
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
      this.fillCell(row, requestLog.status);
      this.fillCell(row, requestLog.inputTokens);
      this.fillCell(row, requestLog.completionTokens);
      this.fillCell(row, requestLog.cost);
      this.fillCell(row, requestLog.finishReason);
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
        status: 'DONE',
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
    const headers = [
      "Model Name", "Date/Time", "Status", "Input Tokens", "Completion Tokens", 
      "Cost", "Finish Reason", "Request Content", "Response Content"
    ];
    const headerRow = table.insertRow();
    headers.forEach((headerText, index) => {
      const headerCell = document.createElement('th');
      headerCell.innerHTML = headerText;
      headerCell.addEventListener('click', () => this.sortTableByColumn(index));
      headerRow.appendChild(headerCell);
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
  }

  getColumnKeyByIndex(index) {
    const keys = [
      "model", "dateTime", "status", "inputTokens", "completionTokens",
      "cost", "finishReason", "requestContent", "responseContent"
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

    const prevButton = document.createElement('button');
    prevButton.innerText = 'Previous';
    prevButton.className = 'button pagination-control';
    prevButton.disabled = this.currentPage <= 1;
    prevButton.addEventListener('click', () => this.changePage(-1));
    container.appendChild(prevButton);

    const nextButton = document.createElement('button');
    nextButton.innerText = 'Next';
    nextButton.className = 'button pagination-control';
    nextButton.disabled = this.currentPage >= this.totalPages;
    nextButton.addEventListener('click', () => this.changePage(1));
    container.appendChild(nextButton);

    const firstButton = document.createElement('button');
    firstButton.innerText = 'First';
    firstButton.className = 'button pagination-control';
    firstButton.disabled = this.currentPage === 1;
    firstButton.addEventListener('click', () => this.goToFirstPage());
    container.insertBefore(firstButton, prevButton); // Insert before 'Previous' button

    const lastButton = document.createElement('button');
    lastButton.innerText = 'Last';
    lastButton.className = 'button pagination-control';
    lastButton.disabled = this.currentPage === this.totalPages;
    lastButton.addEventListener('click', () => this.goToLastPage());
    container.appendChild(lastButton);

    const pageInput = document.createElement('input');
    pageInput.type = 'number';
    pageInput.min = '1';
    pageInput.max = `${this.totalPages}`;
    pageInput.value = this.currentPage;
    pageInput.className = 'pagination-control';
    pageInput.addEventListener('change', () => this.goToPage(pageInput.value));
    container.appendChild(pageInput);
  }

  changePage(direction) {
    this.currentPage += direction;
    this.loadTable();
  }

  goToFirstPage() {
    this.currentPage = 1;
    this.loadTable();
  }

  goToLastPage() {
    this.currentPage = this.totalPages;
    this.loadTable();
  }

  goToPage(pageNumber) {
    pageNumber = parseInt(pageNumber, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= this.totalPages) {
      this.currentPage = pageNumber;
      this.loadTable();
    } else {
      alert(`Invalid page number. Please enter a number between 1 and ${this.totalPages}.`);
    }
  }
}

// Instantiate and call loadTable on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const paginatedRequestTable = new PaginatedTable('requests-table');
  paginatedRequestTable.loadTable();
});
