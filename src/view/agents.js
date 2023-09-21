let agents;

window.addEventListener('DOMContentLoaded', async () => {
    const agentsFilePath = `${localStorage.getItem('folder')}/gptcobuilder/agents.json`;
    const agentsFile = await window.fs.readFile(agentsFilePath);
    agents = JSON.parse(agentsFile);
    agents.agents.forEach(createTab);
});

function createTab(agent) {
    const tabButton = document.createElement("button");
    tabButton.className = "tablinks";
    tabButton.innerText = agent.name;
    tabButton.setAttribute("onclick", `openTab(event, '${agent.name}')`);

    document.getElementsByClassName("tab")[0].appendChild(tabButton);
    
    const tabContent = document.createElement("div");
    tabContent.id = agent.name;
    tabContent.className = "tabcontent";

    //If agent inputs includes FILE_LIST, append a file list
    if(agent.inputs && agent.inputs.includes("FILE_LIST")) {
        agent.fileList = new FileListController();
        tabContent.appendChild(agent.fileList.createDOM());
        agent.fileList.element.addEventListener('filechange', () => {
            updateAgentFullMessage(agent);
        });
    }

    //Append system message
    const systemMessage = createTextAreaWithLabel("System Message:", agent.name + "-system-message", false, 5);
    systemMessage.querySelector("textarea").value = agent.systemMessage;
    tabContent.appendChild(systemMessage);
    
    //Append div for Full Message
    var fullMessage = createTextAreaWithLabel("Full Message:", agent.name + "-full-message", true, 20);
    agent.fullMessageTextArea = fullMessage.querySelector("textarea");
    tabContent.appendChild(fullMessage);

    //Append div to display token count
    const tokenCountDiv = document.createElement("div");
    tokenCountDiv.className = "token-count";
    tokenCountDiv.innerText = "Token count: 0";
    tabContent.appendChild(tokenCountDiv);
    agent.tokenCountElement = tokenCountDiv;

    //Append Generate Button
    const generateButton = document.createElement("button");
    generateButton.className = "button";
    generateButton.innerText = "Generate GPT Completion";
    tabContent.appendChild(generateButton);

    // Append textarea for Model Response
    const responseDiv = createTextAreaWithLabel(`Model Response (saved as ${agent.output}):`, agent.name + '-model-response', true, 20);
    agent.modelResponseTextArea = responseDiv.querySelector('textarea');
    tabContent.appendChild(responseDiv);

    //Append div to display token count
    const responseTokenCountDiv = document.createElement("div");
    responseTokenCountDiv.className = "token-count";
    responseTokenCountDiv.innerText = "Waiting for response";
    tabContent.appendChild(responseTokenCountDiv);
    agent.responseTokenCountElement = responseTokenCountDiv;

    //Append div to display error log
    const errorLogDiv = document.createElement("div");
    errorLogDiv.className = "error-log";
    tabContent.appendChild(errorLogDiv);

    generateButton.onclick = async function() {
        let systemMessage = agent.systemMessage;
        let userMessage = agent.fullMessageTextArea.value;
        generateButton.disabled = true;
        try {
            let response = await sendMessageToChatGPT(systemMessage, userMessage);
            agent.modelResponseTextArea.value = response.choices[0].message.content;
            agent.responseTokenCountElement.innerText = displayTokenCounts(response);
        } catch (error) {
            console.error('An error occurred while generating completion:', error);
            errorLogDiv.innerText = error;
        } finally {
            generateButton.disabled = true;
        }
    }

    document.getElementsByTagName("body")[0].appendChild(tabContent);

    updateAgentFullMessage(agent);
}

function createTextAreaWithLabel (labelmessage, id, disabled, rows) {
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

function getInput (agent, input) {
    if (input == "USER_CHANGE_REQUEST") {
        return document.getElementById("user-change-request").value;
    } else if (input == "PROJECT_DESCRIPTION") {
        return document.getElementById("project-description").value;
    } else if (input == "FILE_LIST") {
        return fileContentMapToText(agent.fileList.fileContentMap);
    }

    console.error("Unknown input", input);
    return "Unknown input " + input;
}

function fileContentMapToText (fileContentMap) {
    let returnValue = "";

    fileContentMap.forEach((value, key, map) => {
        returnValue += key.path + "\n";
        returnValue += FILE_DELIMETER + "\n";
        returnValue += value + "\n";
        returnValue += FILE_DELIMETER + "\n\n";
    });

    return returnValue;
}

function updateAgentFullMessage (agent) {
    agent.fullMessageTextArea.value = "";

    agent.inputs.forEach((input) => {
        agent.fullMessageTextArea.value += getInput(agent, input) + "\n\n";
    });

    tiktoken.countTokens(agent.fullMessageTextArea.value)
    .then((tokenCount) => {
      agent.tokenCountElement.textContent = `Total Tokens: ${tokenCount}`;
    })
    .catch((error) => {
      console.error('Failed to count tokens:', error);
    });
}
