class CustomWorkflows {
  constructor(tabContent) {
    this.tabContent = tabContent;
    this.workflows = [];
  }

  attachDOM() {
    // A simple button to illustrate the feature.
    const addWorkflowButton = document.createElement("button");
    addWorkflowButton.textContent = "Add New Workflow";
    addWorkflowButton.className = "button";
    addWorkflowButton.addEventListener('click', this.createNewWorkflow.bind(this));
    this.tabContent.appendChild(addWorkflowButton);
  }

  loadAgents(availableAgents) {
    this.availableAgents = availableAgents;
  }

  createNewWorkflow() {
    const workflowName = prompt("Enter the name for the new workflow:");
    if (!workflowName) return;
    
    const newWorkflow = { name: workflowName, agents: [] };
    this.workflows.push(newWorkflow);
    
    // Just add all agents for the example purpose
    newWorkflow.agents = this.availableAgents.map(agent => agent.data.name);
    
    // Create a button to execute the workflow
    const runWorkflowButton = document.createElement("button");
    runWorkflowButton.textContent = `Run ${workflowName}`;
    runWorkflowButton.className = "button";
    runWorkflowButton.addEventListener('click', () => this.runWorkflow(newWorkflow));
    this.tabContent.appendChild(runWorkflowButton);
  }

  async runWorkflow(workflow) {
    for (const agentName of workflow.agents) {
      const agent = this.availableAgents.find(a => a.data.name === agentName);
      if (agent) {
        await agent.run();
        // Error handling or delays could be added if necessary.
      }
    }
    alert(`Workflow ${workflow.name} completed.`);
  }
}
