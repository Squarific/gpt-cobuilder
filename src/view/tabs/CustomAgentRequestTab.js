import { openTab } from "../tabOperations.js";
import { agents } from "../agents.js";

class CustomAgentRequestTab {
    constructor() {
        this.initialize();
    }

    initialize() {
        const tabButton = document.querySelector(`[data-tab-name="CustomAgentRequest"]`);
        tabButton.addEventListener('click', openTab);
    }

    updateTabContent() {
        if (!this.selectedAgent) this.selectedAgent = agents[0];

        const tabContent = document.getElementById('CustomAgentRequest');
        tabContent.innerHTML = `
            <h2>Custom request</h2>

            <select class="agent-names-dropdown">
                ${agents.map(agent => `<option value="${agent.name}" ${agent == this.selectedAgent ? "selected" : ""}>${agent.name}</option>`).join('')}
            </select>

            <h3>Template</h3>
            <label for="custom-request-systemmessage">System Message:</label>
            <textarea id="custom-request-systemmessage" rows="4">${this.selectedAgent.systemMessage}</textarea>
            <label for="custom-request-usermessage">User Message:</label>
            <textarea id="custom-request-usermessage" rows="4">${this.selectedAgent.userMessage}</textarea>

            <h3>Input</h3>
            <input value="https://www.somewebsite.com/page.html">

            <h3>Output</h3>
            <label>Output to:</label>
            <input type="checkbox" class="save-to-file">
            <button class="inline button folder-selection">Select folder</button>
            <span class="folder"></span>
            <input value="example.txt">

            <button class="button run-agent">Run</button>
        `;

        tabContent.querySelector(".agent-names-dropdown").addEventListener("change", (event) => {
            this.selectedAgent = agents.find(a => a.name == event.target.value);
            this.updateTabContent();
        });

        tabContent.querySelector(".folder-selection").addEventListener("click", async () => {
            const folder = await folderDialog.open();
            tabContent.querySelector(".folder").textContent = folder + "\\";
        });
    }
}

export const customAgentRequestTab = new CustomAgentRequestTab();