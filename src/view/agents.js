let agents = [];

window.addEventListener('DOMContentLoaded', async () => {
  const agentsDirPath = `gptcobuilder/agents/`;
  const agentsFiles = await window.fs.readdir(agentsDirPath);
  
  // Load each agent file
  for (let i = 0; i < agentsFiles.length; i++) {
    let agentFilePath = `${agentsDirPath}${agentsFiles[i]}`;
    const agentFile = await window.fs.readFile(agentFilePath);
  
    let agentData = JSON.parse(agentFile);
    let agent = new Agent(agentData);

    agents.push(agent);
    agent.createTab();
  }
});

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('run-full-workflow-button').addEventListener('click', async () => {
        await runFullWorkflow();
        document.getElementById('run-full-workflow-button').disabled = false;
    });
});

async function runFullWorkflow () {
    const JuniorDevAgent = agents.find((agent) => agent.data.name === 'Junior Dev');
    const SeniorDevAgent = agents.find((agent) => agent.data.name === 'Senior Dev');

    document.getElementById('run-full-workflow-button').disabled = true;
    
    if(SeniorDevAgent) {
        console.log("Setting selected files", fileListController.fileContentMap.keys());
        SeniorDevAgent.data.fileList.setFromContentMap(fileListController.fileContentMap);
        await SeniorDevAgent.run();
    }

    if(JuniorDevAgent) {
        console.log("Setting selected files", fileListController.fileContentMap.keys());
        JuniorDevAgent.data.fileList.setFromContentMap(fileListController.fileContentMap);
        await JuniorDevAgent.run();
    }

    await applyFileChanges();
}
