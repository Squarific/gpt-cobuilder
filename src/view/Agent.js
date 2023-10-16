class Agent {
    constructor(agentData) {
        this.data = agentData;
        this.projectDescriptionTextArea = document.getElementById('project-description');
        this.userChangeRequestTextArea = document.getElementById('user-change-request');
        this.tabCreator = new TabCreator();
        this.inputGetter = new InputGetter();
    }

    createTab() {
        const tabButton = this.tabCreator.createTabButton(this.data);
        const tabContent = this.tabCreator.createTabContent(this.data);

        document.getElementsByTagName("body")[0].appendChild(tabContent);

        savedOutputs.addEventListener("change", this.updateFullMessage.bind(this));
        this.projectDescriptionTextArea.addEventListener('change', this.updateFullMessage.bind(this))
        this.userChangeRequestTextArea.addEventListener('change', this.updateFullMessage.bind(this));

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
