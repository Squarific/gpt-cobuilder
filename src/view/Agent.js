class Agent {
    constructor(agentData) {
        this.data = agentData;
        this.projectDescriptionTextArea = document.getElementById('project-description');
        this.userChangeRequestTextArea = document.getElementById('user-change-request');
        this.tabCreator = new TabCreator();
        this.inputGetter = new InputGetter();
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

        // Add a run agent button to the human inputs tab when an agent is created
        let runAgentButton = document.createElement("button");
        runAgentButton.textContent = "Run" + this.data.name;
        document.getElementById('Inputs').appendChild(runAgentButton);

        runAgentButton.onclick = async function() { 
            this.data.fileList = fileListController.fileContentMap; // Set the selected files to be the same as the files in the human inputs tab
            // Run the same code as if the generateButton was clicked
            generateButton.dispatchEvent(new Event('click'));
        }.bind(this);
        
        generateButton.onclick = async function() {
            let systemMessage = this.data.systemMessageTextarea.value;
            let userMessage = this.data.fullMessageTextArea.value;
            generateButton.disabled = true;
            try {
                let response = await sendMessageToChatGPT(systemMessage, userMessage);
                this.data.modelResponseTextArea.value = response.choices[0].message.content;
                this.data.responseTokenCountElement.innerText = displayTokenCounts(response);
                savedOutputs.save(this.data.output, response.choices[0].message.content);
                savedOutputs.save("LAST_GPT_OUTPUT", response.choices[0].message.content);
            } catch (error) {
                console.error('An error occurred while generating completion:', error);
                this.data.errorLogDiv.innerText = error;
            } finally {
                generateButton.disabled = false;
            }
        }.bind(this); 

        this.updateFullMessage();
    }

    fileContentMapToText(fileContentMap) {
        return this.inputGetter.fileContentMapToText(fileContentMap);
    }

    async updateFullMessage() {
        this.data.fullMessageTextArea.value = "";

        for (const input of this.data.inputs) {
            this.data.fullMessageTextArea.value += this.inputGetter.getInput(input, this.data) + "\n\n";
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
