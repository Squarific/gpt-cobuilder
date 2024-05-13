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
        const tabContent = document.getElementById('CustomAgentRequest');
        tabContent.innerHTML = `
            <h2>Custom request</h2>

            <select class="agent-names-dropdown">
                ${(agents || []).map(agent => `<option value="${agent.name}">${agent.name}</option>`).join('')}
            </select>

            <h3>Input</h3>

            <h3>Output</h3>
            <label>Output to:</label>
            <input type="checkbox" class="save-to-file">
            <button class="inline button folder-selection">Select folder</button>
            <span class="folder"></span>
            <input value="example.txt">

            <button class="button run-agent">Run</button>
        `;

        tabContent.querySelector(".folder-selection").addEventListener("click", async () => {
            const folder = await folderDialog.open();
            tabContent.querySelector(".folder").textContent = folder + "\\";
        });
    }
}

export const customAgentRequestTab = new CustomAgentRequestTab();