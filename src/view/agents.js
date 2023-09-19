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
        refreshButton.id = "refresh-filelist";
        refreshButton.innerText = "Refresh File List";
        tabContent.appendChild(refreshButton);
        
        //Display File structure
        const preElement = document.createElement('pre');
        preElement.id = 'file-structure';
        tabContent.appendChild(preElement);

        // Bind the refresh element to the preElement and call refresh once already
        refreshButton.onclick = refreshFileList.bind(preElement);
        refreshFileList.bind(preElement)();
    }

    //Append system message
    const textarea = document.createElement("textarea");
    textarea.value = agent.systemMessage;
    textarea.rows = "5";
    tabContent.appendChild(textarea);
    
    //Append div for Full Message
    const fullMessageDiv = document.createElement("div");
    fullMessageDiv.innerHTML = `<label for="full-message">Full Message:</label>
    <textarea id="full-message" class="full-message" rows="20" disabled></textarea>`;
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
    errorLogDiv.id = "error-log";
    tabContent.appendChild(errorLogDiv);

    document.getElementsByTagName("body")[0].appendChild(tabContent);
}

async function refreshFileList() {
    let fileList = await getFilesInFolderWithFilter(localStorage.getItem('folder')); 
    displayFileStructure(fileList, this);
  }
