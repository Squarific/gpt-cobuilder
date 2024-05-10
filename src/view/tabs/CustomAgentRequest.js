import { openTab } from "../tabOperations.js";

class CustomAgentRequestTab {
    constructor() {
        this.initialize();
    }

    initialize() {
        const tabButton = document.querySelector(`[data-tab-name="CustomAgentRequest"]`);
        tabButton.addEventListener('click', openTab);
        
        this.createTabContent();
    }

    createTabContent() {
        const tabContent = document.getElementById('CustomAgentRequest');
        tabContent.innerHTML = `
            <h2>Custom request</h2>

            
        `;
    }
}

export const newProjectTab = new NewProjectTab();