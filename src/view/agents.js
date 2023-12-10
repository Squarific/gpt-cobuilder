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
