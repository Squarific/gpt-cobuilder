class Agent {
    constructor(name, systemMessage, userMessage) {
        this.name = name;
        this.systemMessage = systemMessage;
        this.userMessage = userMessage;
    }

    async run(promptParameters, chunkCallback) {
        var userMessage = await this.parsedUserMessage(promptParameters);
        var responseCell = addActiveRequest(userMessage, this.name);
        
        try {
            let response = await sendMessageToChatGPTStreamed(
                await this.parsedSystemMessage(promptParameters),
                userMessage,
                (chunk) => {
                    chunkCallback(chunk);
                    responseCell.innerText += chunk.choices[0]?.delta?.content || '';
                }
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
