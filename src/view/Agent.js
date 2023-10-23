class Agent {
    constructor(agentData) {
        this.data = agentData;
        this.projectDescriptionTextArea = document.getElementById('project-description');
        this.userChangeRequestTextArea = document.getElementById('user-change-request');
        this.tabCreator = new TabCreator();
        this.inputGetter = new InputGetter();
    }

    async run() {
        await this.updateFullMessage();
        
        let systemMessage = this.data.systemMessageTextarea.value;
        let userMessage = this.data.fullMessageTextArea.value;
        
        try {
            let response = await sendMessageToChatGPT(systemMessage, userMessage);
            this.data.modelResponseTextArea.value = response.choices[0].message.content;
            this.data.responseTokenCountElement.innerText = displayTokenCounts(response);
            savedOutputs.save(this.data.output, response.choices[0].message.content);
            savedOutputs.save("LAST_GPT_OUTPUT", response.choices[0].message.content);
        } catch (error) {
            console.error('An error occurred while generating completion:', error);
            this.data.errorLogDiv.innerText = error;
        }
    }

    createTab() {
        this.tabCreator.createTabButton(this.data);
     
        const {tabContent, generateButton} = this.tabCreator.createTabContent(this.data);

        document.getElementsByTagName("body")[0].appendChild(tabContent);

        savedOutputs.addEventListener("change", this.updateFullMessage.bind(this));
        this.projectDescriptionTextArea.addEventListener('change', this.updateFullMessage.bind(this));
        this.userChangeRequestTextArea.addEventListener('change', this.updateFullMessage.bind(this));

        if (this.data.inputs && this.data.inputs.includes("FILE_LIST")) {
            this.data.fileList.element.addEventListener('filechange', this.updateFullMessage.bind(this));
        }

        let runAgentButton = document.createElement("button");
        runAgentButton.textContent = "Run " + this.data.name;
        runAgentButton.className = "button";
        document.getElementById('Inputs').appendChild(runAgentButton);

        function disableButtons () {
            generateButton.disabled = true;
            runAgentButton.disabled = true;
        }

        function enableButtons () {
            generateButton.disabled = false;
            runAgentButton.disabled = false;
        }

        runAgentButton.onclick = async function() {
            disableButtons();
            this.data.fileList.setFromContentMap(fileListController.fileContentMap);
            this.run().finally(enableButtons);
        }.bind(this);

        generateButton.onclick = async function() {
            disableButtons();
            this.run().finally(enableButtons);
        }.bind(this);

        this.updateFullMessage();
    }

    fileContentMapToText(fileContentMap) {
        return this.inputGetter.fileContentMapToText(fileContentMap);
    }

    async updateFullMessage() {
        this.data.fullMessageTextArea.value = "";

        for (const input of this.data.inputs) {
            this.data.fullMessageTextArea.value += await this.inputGetter.getInput(input, this.data) + "\n\n";
        }

        try {
            const tokenCountFullMessage = await tiktoken.countTokens(this.data.fullMessageTextArea.value);
            const tokenCountSystemMessage = await tiktoken.countTokens(this.data.systemMessageTextarea.value);
            this.data.tokenCountElement.textContent = `Total Tokens: ${tokenCountSystemMessage + tokenCountFullMessage}`;
        } catch(error) {
            console.error('Failed to count tokens:', error);
        }
    }
}
