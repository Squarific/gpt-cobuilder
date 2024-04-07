import { openTab } from "../tabOperations.js";

class NewProjectTab {
    constructor() {
        this.initialize();
    }

    initialize() {
        const tabButton = document.querySelector(`[data-tab-name="NewProject"]`);
        tabButton.addEventListener('click', openTab);
        
        this.createTabContent();
    }

    createTabContent() {
        const tabContent = document.getElementById('NewProject');
        tabContent.innerHTML = `
            <label for="project-name">Name of the Project:</label>
            <input type="text" id="project-name" placeholder="Enter the project name..." />

            <label for="project-type">What sort of project will it be?</label>
            <input type="text" id="project-type" placeholder="Enter a description..." />

            <button class="button" id="create-project-btn">Create Project</button>
        `;
    }
}

export const newProjectTab = new NewProjectTab();