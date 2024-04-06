import { PaginatedTable } from '../classes/PaginatedTable.js';

export let paginatedRequestTable;

async function createRequestsTab() {
  const requestsTab = $('#Requests');
  requestsTab.innerHTML = `
    <div id="requests-table-container">
      <h2>Requests Log</h2>
      <table id="requests-table"></table>
    </div>
  `;

  // Instantiate and call loadTable on tab creation
  paginatedRequestTable = new PaginatedTable('requests-table');
  await paginatedRequestTable.loadTable();
}

// Call the function when the module is loaded to ensure the tab is populated
createRequestsTab();
