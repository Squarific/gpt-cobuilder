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
    }
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

    // Add page number display
    const pageNumDisplay = document.createElement('span');
    pageNumDisplay.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
    pageNumDisplay.className = 'pagination-control';
    container.appendChild(pageNumDisplay);

    // Add "Next" button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.className = 'button pagination-control';
    nextButton.disabled = this.currentPage >= this.totalPages;
    nextButton.addEventListener('click', () => this.changePage(1));
    container.appendChild(nextButton);
  }

  // Change to previous or next page
  changePage(direction) {
    this.currentPage += direction;
    this.loadTable(); // Reload the table content
  }
}

// Instantiate and call loadTable on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const paginatedRequestTable = new PaginatedTable('requests-table');
  paginatedRequestTable.loadTable();
});
