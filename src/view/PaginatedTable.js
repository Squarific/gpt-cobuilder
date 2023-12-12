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
  updateTable(table, requestFiles) {
    // Only get files for the current page
    const start = (this.currentPage - 1) * ITEMS_PER_PAGE;
    const end = this.currentPage * ITEMS_PER_PAGE;
    const pageFiles = requestFiles.slice(start, end);

    table.innerHTML = ''; // clear table content

    // Generate the table with the sliced request logs
    // Add your logic to insert the rows into the table
    
    // Add table headers 
    // (...)
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

// Instantiate and call loadRequests on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const paginatedRequestTable = new PaginatedTable('requests-table');
  paginatedRequestTable.loadTable();
});
