class TabCreator {
    constructor(htmlCreator) {
        this.htmlCreator = htmlCreator;
    }

    createTabContent(agentData) {
        const tabContent = this.htmlCreator.createDiv("tabcontent");
        tabContent.id = agentData.name;

        if (agentData.inputs && agentData.inputs.includes("FILE_LIST")) {
            agentData.fileList = new FileListController();
            tabContent.appendChild(agentData.fileList.createDOM());
            agentData.fileList.element.addEventListener('filechange', () => {
                this.updateFullMessage();
            });
        }

        const systemMessage = this.htmlCreator.createTextAreaWithLabel("System Message:", agentData.name + "-system-message", false, 5);
        agentData.systemMessageTextarea = systemMessage.querySelector("textarea");
        agentData.systemMessageTextarea.value = agentData.systemMessage;
        tabContent.appendChild(systemMessage);

        var fullMessage = this.htmlCreator.createTextAreaWithLabel("Full Message:", agentData.name + "-full-message", true, 20);
        agentData.fullMessageTextArea = fullMessage.querySelector("textarea");
        tabContent.appendChild(fullMessage);

        const tokenCountDiv = this.htmlCreator.createDiv("token-count", "Token count: 0");
        tabContent.appendChild(tokenCountDiv);
        agentData.tokenCountElement = tokenCountDiv;

        const generateButton = this.htmlCreator.createButton("button", "Generate GPT Completion");
        tabContent.appendChild(generateButton);

        // Append textarea for Model Response
        const responseDiv = this.htmlCreator.createTextAreaWithLabel(`Model Response (saved as ${agentData.data.output}):`, agentData.data.name + '-model-response', true, 20);
        agentData.data.modelResponseTextArea = responseDiv.querySelector('textarea');
        tabContent.appendChild(responseDiv);

        const responseTokenCountDiv = this.htmlCreator.createDiv("token-count", "Waiting for response");
        tabContent.appendChild(responseTokenCountDiv);
        agentData.data.responseTokenCountElement = responseTokenCountDiv;

        const errorLogDiv = this.htmlCreator.createDiv("error-log");
        tabContent.appendChild(errorLogDiv);

        return tabContent;
    }

    createTabButton(agentData) {
        const tabButton = this.htmlCreator.createButton("tablinks", agentData.data.name, `openTab(event, '${this.data.name}')`);
        document.getElementsByClassName("tab")[0].insertBefore(tabButton, document.getElementById("add-tab-button"));
        return tabButton;
    } 
}
