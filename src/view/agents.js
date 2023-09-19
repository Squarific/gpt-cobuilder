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

    if(agent.inputs && agent.inputs.includes("FILE_LIST")) {
        const refreshButton = document.createElement("button");
        refreshButton.id = "refresh-filelist";
        refreshButton.innerText = "Refresh File List";
        tabContent.appendChild(refreshButton);
        
        const preElement = document.createElement('pre');
        preElement.id = 'file-structure';
        refreshButton.onclick = refreshFileList.bind(preElement);
        tabContent.appendChild(preElement);
        refreshFileList.bind(preElement)();
    }
    
    const textarea = document.createElement("textarea");
    textarea.value = agent.systemMessage;
    textarea.rows = "5";
    tabContent.appendChild(textarea);
    
    document.getElementsByTagName("body")[0].appendChild(tabContent);
}

async function refreshFileList() {
    try {
      const folder = localStorage.getItem('folder');
      if (folder === null) { 
        throw new Error("No folder selected"); 
      } 
      let fileList = await getFilesInFolderWithFilter(folder); 
      displayFileStructure(fileList, this);
    } catch (error) {
      console.error(`Refresh file list failed: ${error.message}`);
    }
  }
