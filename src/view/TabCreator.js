class TabCreator {
    constructor() {
        this.htmlCreator = new HtmlElementCreator();
    }

    createTabContent(agentData) {
        const tabContent = this.htmlCreator.createDiv("tabcontent");
        tabContent.id = agentData.name;

        if (agentData.inputs && agentData.inputs.includes("FILE_LIST")) {
            agentData.fileList = new FileListController();
            tabContent.appendChild(agentData.fileList.createDOM());
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
        const responseDiv = this.htmlCreator.createTextAreaWithLabel(`Model Response (saved as ${agentData.output}):`, agentData.name + '-model-response', true, 20);
        agentData.modelResponseTextArea = responseDiv.querySelector('textarea');
        tabContent.appendChild(responseDiv);

        const responseTokenCountDiv = this.htmlCreator.createDiv("token-count", "Waiting for response");
        tabContent.appendChild(responseTokenCountDiv);
        agentData.responseTokenCountElement = responseTokenCountDiv;

        const errorLogDiv = this.htmlCreator.createDiv("error-log");
        tabContent.appendChild(errorLogDiv);

        generateButton.onclick = async function() {
            let systemMessage = agentData.systemMessageTextarea.value;
            let userMessage = agentData.fullMessageTextArea.value;
            generateButton.disabled = true;
            try {
                let response = await sendMessageToChatGPT(systemMessage, userMessage);
                agentData.modelResponseTextArea.value = response.choices[0].message.content;
                agentData.responseTokenCountElement.innerText = displayTokenCounts(response);
                savedOutputs.save(agentData.output, response.choices[0].message.content);
                savedOutputs.save("LAST_GPT_OUTPUT", response.choices[0].message.content);
            } catch (error) {
                console.error('An error occurred while generating completion:', error);
                errorLogDiv.innerText = error;
            } finally {
                generateButton.disabled = false;
            }
        }.bind(this);

        return tabContent;
    }

    createTabButton(agentData) {
        const tabButton = this.htmlCreator.createButton("tablinks", agentData.name, `openTab(event, '${agentData.name}')`);
        document.getElementsByClassName("tab")[0].insertBefore(tabButton, document.getElementById("add-tab-button"));
        return tabButton;
    } 
}
