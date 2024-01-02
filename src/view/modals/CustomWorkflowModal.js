class CustomWorkflowModal {
    constructor(agents) {
        this.agents = agents;
        this.steps = [];
        this.modalDiv = null;
        this.initModal();
    }

    initModal() {
        this.modalDiv = document.createElement('div');
        this.modalDiv.id = 'workflow-modal';
        this.modalDiv.className = 'modal';

        // Modal Content
        const modalContentDiv = document.createElement('div');
        modalContentDiv.className = 'modal-content';

        // Close Button
        const closeButton = document.createElement('span');
        closeButton.className = 'close';
        closeButton.innerHTML = '&times;';
        closeButton.onclick = () => (this.modalDiv.style.display = 'none');

        // Name Input
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.id = 'workflow-name';
        nameInput.placeholder = 'Enter Workflow Name';

        // Steps Section
        const stepsSectionDiv = document.createElement('div');
        stepsSectionDiv.id = 'steps-section';

        // Steps List
        const stepsListDiv = document.createElement('div');
        stepsListDiv.id = 'steps-list';

        // Add Step Button
        const addStepButton = document.createElement('button');
        addStepButton.className = 'button';
        addStepButton.textContent = 'Add Step';
        addStepButton.onclick = () => this.addStep(stepsListDiv);

        // Save Button
        const saveButton = document.createElement('button');
        saveButton.className = 'button';
        saveButton.textContent = 'Save Workflow';
        saveButton.onclick = () => this.saveWorkflow();

        // Append everything
        stepsSectionDiv.appendChild(stepsListDiv);
        stepsSectionDiv.appendChild(addStepButton);
        modalContentDiv.appendChild(closeButton);
        modalContentDiv.appendChild(nameInput);
        modalContentDiv.appendChild(stepsSectionDiv);
        modalContentDiv.appendChild(saveButton);
        this.modalDiv.appendChild(modalContentDiv);
        document.body.appendChild(this.modalDiv);

        this.modalDiv.style.display = "block";

        this.refreshStepsList(stepsListDiv);
    }

    addStep(stepsListDiv) {
        this.steps.push({type: 'agent', agentName: '', customCode: ''});
        this.refreshStepsList(stepsListDiv);
    }

    refreshStepsList(stepsListDiv) {
        stepsListDiv.innerHTML = '';

        this.steps.forEach((step, index) => {
            const stepDiv = document.createElement('div');
            const agentDropdown = this.createAgentDropdown(step, index);
            const customCodeTextarea = this.createCustomCodeTextarea(step, index);

            const removeStepButton = document.createElement('button');
            removeStepButton.textContent = 'Remove';
            removeStepButton.onclick = () => {
                this.steps.splice(index, 1);
                this.refreshStepsList(stepsListDiv);
            };

            stepDiv.appendChild(agentDropdown);
            stepDiv.appendChild(customCodeTextarea);
            stepDiv.appendChild(removeStepButton);
            stepsListDiv.appendChild(stepDiv);
        });
    }

    createAgentDropdown(step, index) {
        const dropdown = document.createElement('select');

        // Agent options
        this.agents.forEach(agent => {
            const option = document.createElement('option');
            option.value = agent.data.name;
            option.textContent = `Run agent ${agent.data.name}`;
            dropdown.appendChild(option);
        });

        // Custom JS option
        const customJsOption = document.createElement('option');
        customJsOption.value = 'custom';
        customJsOption.textContent = 'Custom JavaScript Code';
        dropdown.appendChild(customJsOption);

        // Set selected value
        dropdown.value = step.type === 'agent' ? step.agentName : 'custom';
        dropdown.onchange = () => {
            step.type = dropdown.value === 'custom' ? 'custom' : 'agent';
            step.agentName = dropdown.value;
            this.refreshStepsList(document.getElementById('steps-list'));
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
        const workflowName = document.getElementById('workflow-name').value;
        if (!workflowName) {
            alert('Please enter a name for the workflow.');
            return;
        }
        if (this.steps.length === 0) {
            alert('Please add at least one step to the workflow.');
            return;
        }

        // Save the workflow
        
        this.modalDiv.parentNode.removeChild(this.modalDiv);
    }
}