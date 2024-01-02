class CustomWorkflowModal {
    constructor(agents) {
        this.agents = agents;
        this.steps = [];
        this.modalDiv = null;
        this.initModal();
    }

    initModal() {
        this.modalDiv = document.createElement('div');
        this.modalDiv.innerHTML = `
            <div class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <input 
                        type="text" 
                        class="workflow-name" 
                        placeholder="Enter Workflow Name">
                    <div class="steps-section">
                        <div class="steps-list"></div>
                        <button class="button add-step-button">Add Step</button>
                    </div>
                    <button class="button save-workflow-button">Save Workflow</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.modalDiv);
        this.modalDiv.querySelector('.modal').style.display = "block";

        this.assignEventListeners();
        this.refreshStepsList();
    }

    assignEventListeners() {
        const closeButton = this.modalDiv.querySelector('.close');
        closeButton.onclick = () => this.modalDiv.remove();

        const addStepButton = this.modalDiv.querySelector('.add-step-button');
        addStepButton.onclick = () => this.addStep();

        const saveButton = this.modalDiv.querySelector('.save-workflow-button');
        saveButton.onclick = () => this.saveWorkflow();
    }

    addStep() {
        this.steps.push({type: 'agent', agentName: '', customCode: ''});
        this.refreshStepsList();
    }

    refreshStepsList() {
        const stepsListDiv = this.modalDiv.querySelector('.steps-list');
        stepsListDiv.innerHTML = '';

        this.steps.forEach((step, index) => {
            const agentDropdown = this.createAgentDropdown(step, index);
            const customCodeTextarea = this.createCustomCodeTextarea(step, index);

            const removeStepButton = document.createElement('button');
            removeStepButton.textContent = 'Remove';
            removeStepButton.onclick = () => {
                this.steps.splice(index, 1);
                this.refreshStepsList();
            };

            const stepDiv = document.createElement('div');
            stepDiv.appendChild(agentDropdown);
            stepDiv.appendChild(customCodeTextarea);
            stepDiv.appendChild(removeStepButton);
            stepsListDiv.appendChild(stepDiv);
        });
    }

    createAgentDropdown(step, index) {
        const dropdown = document.createElement('select');
        this.agents.forEach(agent => {
            const option = document.createElement('option');
            option.value = agent.data.name;
            option.textContent = `Run agent ${agent.data.name}`;
            dropdown.appendChild(option);
        });

        const customJsOption = document.createElement('option');
        customJsOption.value = 'custom';
        customJsOption.textContent = 'Custom JavaScript Code';
        dropdown.appendChild(customJsOption);

        dropdown.value = step.type === 'agent' ? step.agentName : 'custom';
        dropdown.onchange = () => {
            step.type = dropdown.value === 'custom' ? 'custom' : 'agent';
            step.agentName = dropdown.value;
            this.refreshStepsList();
        };

        return dropdown;
    }

    createCustomCodeTextarea(step, index) {
        const textarea = document.createElement('textarea');
        textarea.style.display = step.type === 'agent' ? 'none' : 'block';
        textarea.value = step.customCode;
        textarea.placeholder = 'Enter custom JavaScript code here...';
        textarea.oninput = (e) => {
            this.steps[index].customCode = e.target.value;
        };

        return textarea;
    }

    saveWorkflow() {
        const workflowNameInput = this.modalDiv.querySelector('.workflow-name');
        const workflowName = workflowNameInput.value;
        if (!workflowName) {
            alert('Please enter a name for the workflow.');
            return;
        }
        if (this.steps.length === 0) {
            alert('Please add at least one step to the workflow.');
            return;
        }
        // Save the workflow logic as before
        // ...

        this.modalDiv.remove();
    }
}
