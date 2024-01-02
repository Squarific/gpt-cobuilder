async function createCustomWorkflowsTab() {
  const customWorkflowsTab = document.getElementById('CustomWorkflows');
  customWorkflowsTab.innerHTML = `
    <h2>Manage Custom Workflows:</h2>
    <button class="button" id="add-custom-workflow-button">Add New Workflow</button>
    <div id="custom-workflows-list"></div>
  `;

  document.getElementById('add-custom-workflow-button').addEventListener('click', () => {
    new CustomWorkflowModal(agents);
  });
}

createCustomWorkflowsTab();
