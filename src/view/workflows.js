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

// Variable for total cost
let totalCost = 0;

async function runFullWorkflow () {
  totalCost = 0; // reset total cost
  
  const SeniorDevAgent = agents.find((agent) => agent.data.name === 'Senior Dev');
  const JuniorDevAgent = agents.find((agent) => agent.data.name === 'Junior Dev');
  const GitMasterAgent = agents.find((agent) => agent.data.name === 'Git Master');

  if(!SeniorDevAgent || !JuniorDevAgent || !GitMasterAgent) {
    console.error("AGENT MISSING", SeniorDevAgent, JuniorDevAgent, GitMasterAgent);
  }
    
  console.log("Setting selected files", fileListController.fileContentMap.keys());
  await SeniorDevAgent.data.fileList.setFromContentMap(fileListController.fileContentMap);
  let response = await SeniorDevAgent.run();
  totalCost += calculateCostFromResponse(response);

  console.log("Setting selected files", fileListController.fileContentMap.keys());
  await JuniorDevAgent.data.fileList.setFromContentMap(fileListController.fileContentMap);
  response = await JuniorDevAgent.run();
  totalCost += calculateCostFromResponse(response);
  
  await applyFileChanges();
  response = await GitMasterAgent.run();
  totalCost += calculateCostFromResponse(response);
  
  await gitOperations();

  // Display total cost
  document.getElementById('total-cost').textContent = `Total cost for previous full workflow run: $${totalCost.toFixed(2)}`;
}