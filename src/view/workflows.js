async function gitOperations () {
    try {
      const gptGitMessage = savedOutputs.get("OUTPUT.GPT_GIT_MESSAGE");
      await window.gitCommands.gitAdd(localStorage.getItem("folder"));
      await window.gitCommands.gitCommit(localStorage.getItem("folder"), gptGitMessage);
      await window.gitCommands.gitPush(localStorage.getItem("folder"));
    } catch (error) {
      console.log("Error performing git operations", error);
    }
  }
  
  document.getElementById('git-operation-button').addEventListener('click', gitOperations);
  document.getElementById('git-operation-button2').addEventListener('click', gitOperations);
  
  window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('run-full-workflow-button').addEventListener('click', async () => {
        document.getElementById('run-full-workflow-button').disabled = true;
        await runFullWorkflow();
        document.getElementById('run-full-workflow-button').disabled = false;
    });
  });
  
  async function runFullWorkflow () {
    const SeniorDevAgent = agents.find((agent) => agent.data.name === 'Senior Dev');
    const JuniorDevAgent = agents.find((agent) => agent.data.name === 'Junior Dev');
    const GitMasterAgent = agents.find((agent) => agent.data.name === 'Git Master');
  
    if(!SeniorDevAgent || !JuniorDevAgent || !GitMasterAgent) {
        console.error("AGENT MISSING", SeniorDevAgent, JuniorDevAgent, GitMasterAgent);
    }
    
    console.log("Setting selected files", fileListController.fileContentMap.keys());
    SeniorDevAgent.data.fileList.setFromContentMap(fileListController.fileContentMap);
    await SeniorDevAgent.run();
  
    console.log("Setting selected files", fileListController.fileContentMap.keys());
    JuniorDevAgent.data.fileList.setFromContentMap(fileListController.fileContentMap);
    await JuniorDevAgent.run();
  
    await applyFileChanges();
    await GitMasterAgent.run();
    await gitOperations();
  }