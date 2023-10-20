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
    const changeToProposalAgent = agents.find((agent) => agent.data.name === 'Change request to change proposal');
    const proposalToFileChangesAgent = agents.find((agent) => agent.data.name === 'Change proposal to file changes');

    document.getElementById('run-full-workflow-button').disabled = true;
    
    if(changeToProposalAgent) {
        changeToProposalAgent.data.fileList.fileContentMap = fileListController.fileContentMap;
        await changeToProposalAgent.run();
    }

    if(proposalToFileChangesAgent) {
        proposalToFileChangesAgent.data.fileList.fileContentMap = fileListController.fileContentMap;
        await proposalToFileChangesAgent.run();
    }

    await applyFileChanges();
}
