let agents = [];

window.addEventListener('DOMContentLoaded', async () => {
  const agentsDirPath = `gptcobuilder/agents/`;
  const agentNames = await window.fs.readdir(agentsDirPath);
  
  for (let i = 0; i < agentNames.length; i++) {
    let agentDirPath = `${agentsDirPath}${agentNames[i]}`;

    const systemMessage = await window.fs.readFile(agentDirPath + '/SystemMessage');
    const userMessage = await window.fs.readFile(agentDirPath + '/UserMessage');

    let agent = new Agent(agentNames[i], systemMessage, userMessage);
    agents.push(agent);
    agentTab.createTab(agent);

    var runAgentButton = elementFromHTML(`<button class="button">Run ${agent.name}</button>`);
    document.getElementById('custom-buttons').appendChild(runAgentButton);

    runAgentButton.onclick = () => {
      runAgentButton.disabled = true;

      document.getElementById('last-response').value = "";
      agent.run(new PromptParameters(fileListController, {
        HIGH_LEVEL_CHANGE_REQUEST: document.getElementById('last-response').value
      }), chunkCallback).finally(() => {
        runAgentButton.disabled = false;
      });
    };
  }
});
