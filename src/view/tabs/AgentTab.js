class AgentTab {
    constructor() {
        this.htmlCreator = new HtmlElementCreator();
    }

    createTab(agent) {
        this.createTabButton(agent.name);
        this.createTabContent(agent);
    }

    createTabContent(agent) {
        const tabContent = this.htmlCreator.createDiv("tabcontent");
        tabContent.id = agent.name;

        const systemMessage = this.htmlCreator.createTextAreaWithLabel("System Message:", agent.name + "-system-message", false, 20);
        const systemMessageTextarea = systemMessage.querySelector("textarea");
        systemMessageTextarea.value = agent.systemMessage;
        tabContent.appendChild(systemMessage);

        const systemMessageTokenCountDiv = this.htmlCreator.createDiv("token-count", "Token count: 0");
        tabContent.appendChild(systemMessageTokenCountDiv);

        const userMessage = this.htmlCreator.createTextAreaWithLabel("User Message:", agent.name + "-user-message", false, 10);
        const userMessageTextArea = userMessage.querySelector("textarea");
        userMessageTextArea.value = agent.userMessage;
        tabContent.appendChild(userMessage);

        const userMessageTokenCountDiv = this.htmlCreator.createDiv("token-count", "Token count: 0");
        tabContent.appendChild(userMessageTokenCountDiv);

        document.getElementsByTagName("body")[0].appendChild(tabContent);
    }

    createTabButton(name) {
        const tabButton = this.htmlCreator.createButton("tablinks", name, `openTab(event, '${name}')`);
        document.getElementsByClassName("tab")[0].insertBefore(tabButton, document.getElementById("add-tab-button"));
    } 
}

agentTab = new AgentTab();
