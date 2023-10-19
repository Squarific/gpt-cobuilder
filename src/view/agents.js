let agents;

window.addEventListener('DOMContentLoaded', async () => {
    const agentsFilePath = `${localStorage.getItem('folder')}/gptcobuilder/agents.json`;
    const agentsFile = await window.fs.readFile(agentsFilePath);
    agents = JSON.parse(agentsFile).agents;
    agents = agents.map(agentData => new Agent(agentData));
    agents.forEach(agent => agent.createTab());
});


window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('run-full-workflow-button').addEventListener('click', async () => {
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

        document.getElementById('run-full-workflow-button').disabled = false;
    });
});
