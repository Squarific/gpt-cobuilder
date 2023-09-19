window.addEventListener('DOMContentLoaded', async () => {
    const agentsFilePath = `${localStorage.getItem('folder')}/gptcobuilder/agents.json`;
    const agentsFile = await window.fs.readFile(agentsFilePath);
    const agents = JSON.parse(agentsFile);
    
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

    //If agent includes File_List, append a file list
    if(agent.inputs && agent.inputs.includes("FILE_LIST")) {
        const refreshButton = document.createElement("button");
        refreshButton.innerText = "Refresh File List";
        tabContent.appendChild(refreshButton);
        
        //Display File structure
        const preElement = document.createElement('pre');
        tabContent.appendChild(preElement);

        // Bind the refresh element to the preElement and call refresh once already
        refreshButton.onclick = refreshFileList.bind(this, preElement);
        refreshFileList(preElement);
    }

    //Append system message
    const textarea = document.createElement("textarea");
    textarea.value = agent.systemMessage;
    textarea.rows = "5";
    tabContent.appendChild(textarea);
    
    //Append div for Full Message
    const fullMessageDiv = document.createElement("div");

    const fullMessageLabel = document.createElement("label");
    fullMessageLabel.setAttribute("for", "full-message");
    fullMessageLabel.innerText = "Full Message:";
    fullMessageDiv.appendChild(fullMessageLabel);

    const fullMessageTextArea = document.createElement("textarea");
    fullMessageTextArea.className = "full-message";
    fullMessageTextArea.setAttribute("rows", "20");
    fullMessageTextArea.disabled = true;
    fullMessageDiv.appendChild(fullMessageTextArea);
    agent.fullMessageTextArea = fullMessageTextArea;

    tabContent.appendChild(fullMessageDiv);

    //Append div to display token count
    const tokenCountDiv = document.createElement("div");
    tokenCountDiv.className = "token-count";
    tokenCountDiv.innerText = "Token count: 0";
    tabContent.appendChild(tokenCountDiv);

    //Append Generate Button
    const generateButton = document.createElement("button");
    generateButton.className = "button";
    generateButton.innerText = "Generate GPT Completion";
    tabContent.appendChild(generateButton);

    //Append div to display error log
    const errorLogDiv = document.createElement("div");
    errorLogDiv.className = "error-log";
    tabContent.appendChild(errorLogDiv);

    document.getElementsByTagName("body")[0].appendChild(tabContent);

    updateAgentFullMessage(agent);
}

function updateAgentFullMessage (agent) {
    agent.fullMessageTextArea.value = document.getElementById("project-description").value;
}

async function refreshFileList(element) {
    let fileList = await getFilesInFolderWithFilter(localStorage.getItem('folder')); 
    displayFileStructure(fileList, element);
}
