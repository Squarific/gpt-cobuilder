class CustomWorkflows {
  constructor() {
    this.workflows = [];
  }

  attachDOM() {
    const addWorkflowButton = document.getElementById('add-custom-workflow-button');
    
    if (addWorkflowButton) {
      addWorkflowButton.addEventListener('click', this.createNewWorkflow.bind(this));
    }
    
    this.loadWorkflowsFromLocalStorage();
    this.updateWorkflowList();
  }

  loadAgents(availableAgents) {
    this.availableAgents = availableAgents;
  }

  createNewWorkflow() {
    const workflowName = prompt("Enter the name for the new workflow:");
    if (!workflowName) return;
    
    const newWorkflow = { name: workflowName, agents: [] };
    this.workflows.push(newWorkflow);
    
    this.saveWorkflowsToLocalStorage();
    this.updateWorkflowList();
  }

  updateWorkflowList() {
    const listElem = document.getElementById('custom-workflows-list');
    listElem.innerHTML = '';
    
    this.workflows.forEach(workflow => {
      const workflowElem = document.createElement('div');
      workflowElem.className = "workflow-item";
      workflowElem.textContent = workflow.name;
      
      const runButton = document.createElement('button');
      runButton.className = "button";
      runButton.textContent = "Run";
      runButton.onclick = () => this.runWorkflow(workflow);

      const editButton = document.createElement('button');
      editButton.className = "button";
      editButton.textContent = "Edit";
      editButton.onclick = () => this.editWorkflow(workflow);

      const removeButton = document.createElement('button');
      removeButton.className = "button";
      removeButton.textContent = "Remove";
      removeButton.onclick = () => this.removeWorkflow(workflow);

      workflowElem.appendChild(runButton);
      workflowElem.appendChild(editButton);
      workflowElem.appendChild(removeButton);
      listElem.appendChild(workflowElem);
    });
  }

  runWorkflow(workflow) {
    // Implement workflow running logic
  }

  editWorkflow(workflow) {
    // Implement workflow editing logic
  }

  removeWorkflow(workflow) {
    const index = this.workflows.indexOf(workflow);
    if (index > -1) {
      this.workflows.splice(index, 1);
    }
    this.saveWorkflowsToLocalStorage();
    this.updateWorkflowList();
  }

  loadWorkflowsFromLocalStorage() {
    const storedWorkflows = localStorage.getItem('workflows');
    if (storedWorkflows) {
      this.workflows = JSON.parse(storedWorkflows);
    }
  }

  saveWorkflowsToLocalStorage() {
    localStorage.setItem('workflows', JSON.stringify(this.workflows));
  }
}

// Usage of Custom Workflows in generate.js
// const customWorkflowsManager = new CustomWorkflows();
// customWorkflowsManager.loadAgents(agents);
// customWorkflowsManager.attachDOM();
