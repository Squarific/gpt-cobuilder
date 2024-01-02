async function createRequestsTab() {
  const requestsTab = document.getElementById('Requests');
  requestsTab.innerHTML = `
    <div id="requests-table-container">
      <h2>Requests Log</h2>
      <table id="requests-table"></table>
      <!-- Pagination controls will be added here programmatically -->
    </div>
  `;

  // Instantiate and call loadTable on tab creation
  const paginatedRequestTable = new PaginatedTable('requests-table');
  await paginatedRequestTable.loadTable();
}

// Call the function when the module is loaded to ensure the tab is populated
createRequestsTab();
