const ITEMS_PER_PAGE = 10; // Number of items per page

class PaginatedTable {
  constructor(tableId) {
    this.tableId = tableId;
    this.currentPage = 1;
    this.totalPages = 1;
  }

  async loadTable() {
    const folder = localStorage.getItem('folder');
    const requestsPath = `${folder}/gptcobuilder/requests`;
    const table = document.getElementById(this.tableId);

    try {
      const requestFiles = await window.fs.readdir(requestsPath);
      this.totalPages = Math.ceil(requestFiles.length / ITEMS_PER_PAGE);

      this.updateTable(table, requestFiles);
      this.addPaginationControls();
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  }

  // Update display for the current page
  async updateTable(table, requestFiles) {
    // Only get files for the current page
    const start = (this.currentPage - 1) * ITEMS_PER_PAGE;
    const end = this.currentPage * ITEMS_PER_PAGE;
    const pageFiles = requestFiles.slice(start, end);

    table.innerHTML = ''; // clear table content
    this.createTableHeaders(table); // Add table headers
    await this.populateTableWithPageFiles(table, pageFiles);
  }

  createTableHeaders(table) {
    const headers = ["Agent Name", "Date/Time", "Status", "Input Tokens", "Completion Tokens", "Cost", "Finish Reason", "Request Content", "Response Content"];
    const headerRow = table.insertRow();
    for (const headerText of headers) {
      const headerCell = document.createElement('th'); // Using `th` element for header
      headerCell.textContent = headerText;
      headerRow.appendChild(headerCell); // Append `th` element to the row
    }
  }

  async populateTableWithPageFiles(table, pageFiles) {
    const folder = localStorage.getItem('folder');
    const requestsPath = `${folder}/gptcobuilder/requests`;

    for (const fileName of pageFiles) {
      const filePath = `${requestsPath}/${fileName}`;
      const fileContent = await window.fs.readFile(filePath);
      const requestLog = JSON.parse(fileContent);

      const row = table.insertRow();
      this.fillCell(row, requestLog.response.model);
      this.fillCell(row, new Date(fileName.split('.')[0].replace(/-/g, ':')).toLocaleString());
      this.fillCell(row, 'DONE');
      this.fillCell(row, requestLog.response.usage.prompt_tokens);
      this.fillCell(row, requestLog.response.usage.completion_tokens);
      this.fillCell(row, `$${this.calculateCostFromResponse(requestLog.response)}`);
      this.fillCell(row, requestLog.response.choices[0].finish_reason);

      let requestContent = requestLog.request.content.slice(-256);
      let responseContent = requestLog.response.choices[0].message.content.slice(0, 256);
      
      this.fillCell(row, requestContent);
      this.fillCell(row, responseContent);

      row.setAttribute('data-request', filePath); // Set the data attribute for row
      row.classList.add('request-entry'); // Add class for event listener

      row.addEventListener('click', this.openRequestDetails.bind(this));
    }
  }

  async openRequestDetails(event) {
    const filePath = event.currentTarget.getAttribute('data-request');
    const fileContent = await window.fs.readFile(filePath);
    const requestLog = JSON.parse(fileContent);

    // Now use the JSON to update the modal content
    const modal = document.getElementById('requestDetailsModal');
    const apiKeyParagraph = modal.querySelector('#modal-apiKey');
    const modelParagraph = modal.querySelector('#modal-model');
    const roleParagraph = modal.querySelector('#modal-role');
    const requestContentParagraph = modal.querySelector('#modal-requestContent');
    const responseContentParagraph = modal.querySelector('#modal-responseContent');
    const costParagraph = modal.querySelector('#modal-cost');

    apiKeyParagraph.textContent = `API Key: ${requestLog.request.apiKey}`;
    modelParagraph.textContent = `Model: ${requestLog.response.model}`;
    roleParagraph.textContent = `Role: ${requestLog.request.role}`;
    requestContentParagraph.textContent = `Request: ${requestLog.request.content}`;
    responseContentParagraph.textContent = `Response: ${requestLog.response.choices[0].message.content}`;
    costParagraph.textContent = `Cost: $${this.calculateCostFromResponse(requestLog.response)}`;

    modal.style.display = 'block';
  }

  fillCell(row, text) {
    const cell = row.insertCell();
    cell.textContent = text;
  }

  calculateCostFromResponse(response) {
    // Assume you have some logic to calculate cost based on response tokens
    const cost = response.usage.total_tokens * 0.0006; // Example cost calculation
    return cost.toFixed(2);
  }

  // Add pagination controls below the table
  addPaginationControls() {
    const container = document.getElementById(this.tableId + "-container");

    if (!container) return;

    // Clear existing controls
    container.querySelectorAll('.pagination-control').forEach(ctrl => ctrl.remove());

    // Add "Previous" button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.className = 'button pagination-control';
    prevButton.disabled = this.currentPage <= 1;
    prevButton.addEventListener('click', () => this.changePage(-1));
    container.appendChild(prevButton);

    // Add "Next" button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.className = 'button pagination-control';
    nextButton.disabled = this.currentPage >= this.totalPages;
    nextButton.addEventListener('click', () => this.changePage(1));
    container.appendChild(nextButton);

    // Add "First" button
    const firstButton = document.createElement('button');
    firstButton.textContent = 'First';
    firstButton.className = 'button pagination-control';
    firstButton.disabled = this.currentPage === 1;
    firstButton.addEventListener('click', () => this.goToFirstPage());
    container.insertBefore(firstButton, prevButton); // Insert before 'Previous' button

    // Add "Last" button
    const lastButton = document.createElement('button');
    lastButton.textContent = 'Last';
    lastButton.className = 'button pagination-control';
    lastButton.disabled = this.currentPage === this.totalPages;
    lastButton.addEventListener('click', () => this.goToLastPage());
    container.appendChild(lastButton);

    // Add input field to jump to a page
    const pageInput = document.createElement('input');
    pageInput.type = 'number';
    pageInput.min = '1';
    pageInput.max = `${this.totalPages}`;
    pageInput.value = this.currentPage;
    pageInput.className = 'pagination-control';
    pageInput.addEventListener('change', () => this.goToPage(pageInput.value));
    container.appendChild(pageInput);
  }

  // Change to previous or next page
  changePage(direction) {
    this.currentPage += direction;
    this.loadTable(); // Reload the table content
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
