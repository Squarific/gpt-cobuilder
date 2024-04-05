import { Agent } from './classes/Agent.js';
import { agentTab } from './tabs/AgentTab.js';
import { updateUserChangeRequestsTab } from './tabs/UserChangeRequestsTab.js';
import { updateHighLevelChangeRequestsTab } from './tabs/HighLevelChangeRequestsTab.js';

export let agents = [];

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
  }

  updateUserChangeRequestsTab();
  updateHighLevelChangeRequestsTab();
});
