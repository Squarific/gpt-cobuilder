class Agent {
    constructor(name, systemMessage, userMessage) {
        this.name = name;
        this.systemMessage = systemMessage;
        this.userMessage = userMessage;
    }

    async run(promptParameters, chunkCallback) {
        /*
        try {
            const tokenCountFullMessage = await tiktoken.countTokens(this.data.fullMessageTextArea.value);
            const tokenCountSystemMessage = await tiktoken.countTokens(this.data.systemMessageTextarea.value);
            this.data.tokenCountElement.textContent = `Total Tokens: ${tokenCountSystemMessage + tokenCountFullMessage}`;
        } catch(error) {
            console.error('Failed to count tokens:', error);
        }*/
        
        try {
            let response = await sendMessageToChatGPTStreamed(
                await this.parsedSystemMessage(promptParameters),
                await this.parsedUserMessage(promptParameters),
                chunkCallback
            );

            return response;
        } catch (error) {
            console.error('An error occurred while generating completion:', error);
        }
    }

    async countPromptTokens (promptParameters) {
        const tokenCountUserMessage = await tiktoken.countTokens(this.parsedUserMessage(promptParameters));
        const tokenCountSystemMessage = await tiktoken.countTokens(this.parsedSystemMessage(promptParameters));
        return tokenCountUserMessage + tokenCountSystemMessage;
    }

    async parsedSystemMessage (promptParameters) {
        return await promptParameters.parsePrompt(this.systemMessage);
    }

    async parsedUserMessage(promptParameters) {
        return await promptParameters.parsePrompt(this.userMessage);
    }
}
