class Agent {
    constructor(agentData) {
        this.data = agentData;
    }

    createTab() {
        const tabButton = document.createElement("button");
        tabButton.className = "tablinks";
        tabButton.innerText = this.data.name;
        tabButton.setAttribute("onclick", `openTab(event, '${this.data.name}')`);

        document.getElementsByClassName("tab")[0].insertBefore(tabButton, document.getElementById("add-tab-button"));

        const tabContent = document.createElement("div");
        tabContent.id = this.data.name;
        tabContent.className = "tabcontent";

        if (this.data.inputs && this.data.inputs.includes("FILE_LIST")) {
            this.data.fileList = new FileListController();
            tabContent.appendChild(this.data.fileList.createDOM());
            this.data.fileList.element.addEventListener('filechange', () => {
                this.updateFullMessage();
            });
        }

        const systemMessage = this.createTextAreaWithLabel("System Message:", this.data.name + "-system-message", false, 5);
        this.data.systemMessageTextarea = systemMessage.querySelector("textarea");
        this.data.systemMessageTextarea.value = this.data.systemMessage;
        tabContent.appendChild(systemMessage);

        var fullMessage = this.createTextAreaWithLabel("Full Message:", this.data.name + "-full-message", true, 20);
        this.data.fullMessageTextArea = fullMessage.querySelector("textarea");
        tabContent.appendChild(fullMessage);

        const tokenCountDiv = document.createElement("div");
        tokenCountDiv.className = "token-count";
        tokenCountDiv.innerText = "Token count: 0";
        tabContent.appendChild(tokenCountDiv);
        this.data.tokenCountElement = tokenCountDiv;

        const generateButton = document.createElement("button");
        generateButton.className = "button";
        generateButton.innerText = "Generate GPT Completion";
        tabContent.appendChild(generateButton);

        // Append textarea for Model Response
        const responseDiv = this.createTextAreaWithLabel(`Model Response (saved as ${this.data.output}):`, this.data.name + '-model-response', true, 20);
        this.data.modelResponseTextArea = responseDiv.querySelector('textarea');
        tabContent.appendChild(responseDiv);

        const responseTokenCountDiv = document.createElement("div");
        responseTokenCountDiv.className = "token-count";
        responseTokenCountDiv.innerText = "Waiting for response";
        tabContent.appendChild(responseTokenCountDiv);
        this.data.responseTokenCountElement = responseTokenCountDiv;

        const errorLogDiv = document.createElement("div");
        errorLogDiv.className = "error-log";
        tabContent.appendChild(errorLogDiv);

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
                errorLogDiv.innerText = error;
            } finally {
                generateButton.disabled = false;
            }
        }.bind(this);

        document.getElementsByTagName("body")[0].appendChild(tabContent);

        savedOutputs.addEventListener("change", () => {
            this.updateFullMessage();
        });

        this.updateFullMessage();
    }

    createTextAreaWithLabel(labelmessage, id, disabled, rows) {
        const div = document.createElement("div");

        const label = document.createElement("label");
        label.setAttribute("for", id);
        label.innerText = labelmessage;
        div.appendChild(label);

        const textarea = document.createElement("textarea");
        textarea.id = id;
        textarea.setAttribute("rows", rows);
        textarea.disabled = disabled;
        div.appendChild(textarea);

        return div;
    }

    getInput(input) {
        if (input == "USER_CHANGE_REQUEST") {
            return document.getElementById("user-change-request").value || "Empty change request";
        } else if (input == "PROJECT_DESCRIPTION") {
            return document.getElementById("project-description").value || "No project description";
        } else if (input == "FILE_LIST") {
            return this.fileContentMapToText(this.data.fileList.fileContentMap);
        } else if (input.startsWith("OUTPUT.")) {
            return savedOutputs.get(input);
        }

        console.error("Unknown input", input);
        return "Unknown input " + input;
    }

    fileContentMapToText(fileContentMap) {
        let files = [];

        fileContentMap.forEach((value, key, map) => {
            var file = key.path + "\n";
            file += FILE_DELIMETER + "\n";
            file += value + "\n";
            file += FILE_DELIMETER;
            files.push(file);
        });

        return files.join("\n\n") || "No files selected.";
    }

    async updateFullMessage() {
        this.data.fullMessageTextArea.value = "";

        for (const input of this.data.inputs) {
            this.data.fullMessageTextArea.value += this.getInput(input) + "\n\n";
        }

        try {
            const tokenCountFullMessage = await tiktoken.countTokens(this.data.fullMessageTextArea.value);
            const tokenCountSystemMessage = await tiktoken.countTokens(this.data.systemMessageTextarea.value);
            this.data.tokenCountElement.textContent = `Total Tokens: ${tokenCountSystemMessage + tokenCountFullMessage}`;
        }
        catch (error) {
            console.error('Failed to count tokens:', error);
        }
    }
}