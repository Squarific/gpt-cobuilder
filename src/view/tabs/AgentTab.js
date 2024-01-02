class AgentTab {
    constructor() {}

    createTab(agent) {
        this.createTabButton(agent.name);
        this.createTabContent(agent);
    }

    createTabContent(agent) {
        const tabContent = elementFromHTML(`<div class="tabcontent" id="${agent.name}"></div>`);
        
        tabContent.innerHTML = `
            <label for="${agent.name}-system-message">System Message:</label>
            <textarea id="${agent.name}-system-message" rows="20">${agent.systemMessage}</textarea>
            <div class="token-count" id="${agent.name}-system-message-token-count">
                Token count: 0
            </div>

            <label for="${agent.name}-user-message">User Message:</label>
            <textarea id="${agent.name}-user-message" rows="10">${agent.userMessage}</textarea>
            <div class="token-count" id="${agent.name}-user-message-token-count">
                Token count: 0
            </div>
        `;

        document.getElementsByTagName("body")[0].appendChild(tabContent);
    }

    createTabButton(name) {
        const tabButton = document.createElement("button");
        tabButton.className = "tablinks";
        tabButton.innerText = name;
        tabButton.onclick = (event) => openTab(event, name);
        document.getElementsByClassName("tab")[0].insertBefore(tabButton, document.getElementById("add-tab-button"));
    }
}

agentTab = new AgentTab();