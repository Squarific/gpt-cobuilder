const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', async () => {
    const agentsFilePath = 'path_to_agents_json';
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
    
    const textarea = document.createElement("textarea");
    textarea.value = agent.systemMessage;
    textarea.rows = "5";

    tabContent.appendChild(textarea);
    
    document.getElementsByTagName("body")[0].appendChild(tabContent);
}
