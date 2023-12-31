class AgentTab {
    constructor() {}

    createTab(agent) {
        this.createTabButton(agent.name);
        this.createTabContent(agent);
    }

    createTabContent(agent) {
        const tabContent = elementFromHTML(`<div class="tabcontent" id="${agent.name}"></div>`);
  
        // It is recommended to use unique identifiers if agent names are not guaranteed to be unique.
        const agentSystemMessageId = `${agent.name}-system-message`;
        const agentUserMessageId = `${agent.name}-user-message`;
        
        tabContent.innerHTML = `
            <label for="${agentSystemMessageId}">System Message:</label>
            <textarea id="${agentSystemMessageId}" rows="20">${agent.systemMessage}</textarea>
            <div class="token-count" data-for="${agentSystemMessageId}">
                Token count: 0
            </div>
  
            <label for="${agentUserMessageId}">User Message:</label>
            <textarea id="${agentUserMessageId}" rows="10">${agent.userMessage}</textarea>
            <div class="token-count" data-for="${agentUserMessageId}">
                Token count: 0
            </div>
        `;
  
        document.getElementsByTagName("body")[0].appendChild(tabContent);
        this.initializeTokenCounts([agentSystemMessageId, agentUserMessageId]);
    }
  
    initializeTokenCounts(ids) {
        ids.forEach(id => {
            const textarea = document.getElementById(id);
            const tokenCountDiv = document.querySelector(`.token-count[data-for="${id}"]`);
            this.updateTokenCount(textarea, tokenCountDiv);
  
            textarea.addEventListener('input', () => {
                this.updateTokenCount(textarea, tokenCountDiv);
            });
        });
    }

    async updateTokenCount(textarea, tokenCountDiv) {
        const text = textarea.value;
        const tokens = await tiktoken.countTokens(text);
        tokenCountDiv.textContent = `Token count: ${tokens}`;
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