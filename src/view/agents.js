let agents;

window.addEventListener('DOMContentLoaded', async () => {
    const agentsFilePath = `${localStorage.getItem('folder')}/gptcobuilder/agents.json`;
    const agentsFile = await window.fs.readFile(agentsFilePath);
    agents = JSON.parse(agentsFile);
    agents.agents = agents.agents.map(agentData => new Agent(agentData));
    agents.agents.forEach(agent => agent.createTab());
});