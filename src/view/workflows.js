async function gitOperations () {
  // Get buttons by their IDs
  const gitOperationButton1 = document.getElementById('git-operation-button');
  const gitOperationButton2 = document.getElementById('git-operation-button2');

  try {
    // Disable the buttons
    gitOperationButton1.disabled = true;
    gitOperationButton2.disabled = true;

    const gptGitMessage = savedOutputs.get("OUTPUT.GPT_GIT_MESSAGE");
    await window.gitCommands.gitAdd(localStorage.getItem("folder"));
    await window.gitCommands.gitCommit(localStorage.getItem("folder"), gptGitMessage);
    await window.gitCommands.gitPush(localStorage.getItem("folder"));
  } catch (error) {
    console.log("Error performing git operations", error);
  } finally {
    // Re-enable the buttons
    gitOperationButton1.disabled = false;
    gitOperationButton2.disabled = false;
  }
}

// Variable for total cost
let totalCost = 0.0; // reset total cost as a number

async function runFullWorkflow () {
  totalCost = 0.0; // reset total cost
  
  const SeniorDevAgent = agents.find((agent) => agent.data.name === 'Senior Dev');
  const JuniorDevAgent = agents.find((agent) => agent.data.name === 'Junior Dev');
  const GitMasterAgent = agents.find((agent) => agent.data.name === 'Git Master');

  if(!SeniorDevAgent || !JuniorDevAgent || !GitMasterAgent) {
    console.error("AGENT MISSING", SeniorDevAgent, JuniorDevAgent, GitMasterAgent);
  }
    
  console.log("Setting selected files", fileListController.fileContentMap.keys());
  await SeniorDevAgent.data.fileList.setFromContentMap(fileListController.fileContentMap);
  let response = await SeniorDevAgent.run();
  totalCost += parseFloat(calculateCostFromResponse(response));

  console.log("Setting selected files", fileListController.fileContentMap.keys());
  await JuniorDevAgent.data.fileList.setFromContentMap(fileListController.fileContentMap);
  response = await JuniorDevAgent.run();
  totalCost += parseFloat(calculateCostFromResponse(response));
  
  await applyFileChanges();
  response = await GitMasterAgent.run();
  totalCost += parseFloat(calculateCostFromResponse(response));
  
  await gitOperations();

  // Display total cost
  document.getElementById('total-cost').textContent = `Total cost for previous full workflow run: $${totalCost.toFixed(2)}`;
}

async function gitUndoLastCommitAndPush() {
  try {
    const directory = localStorage.getItem('folder');
    // Run git revert on the last commit without creating a new commit
    // It should automatically revert the changes made by the last commit
    await window.gitCommands.gitRevertLastCommit(directory);
    // Push the changes after reverting
    await window.gitCommands.gitPush(directory);
    alert('The last commit has been successfully undone and the changes have been pushed.');
  } catch (error) {
    console.error('Error reverting the last commit and pushing:', error);
    alert('An error occurred while reverting the last commit and pushing changes.');
  }
}

async function applyFileChanges () {
  const parsedFiles = parseResponse(savedOutputs.get("OUTPUT.GPT_FILE_CHANGES"));

  for (const file of parsedFiles) {
    try {
      await window.fs.saveFile(file.path, file.content);
      console.log(`Saved file: ${file.path}`);
    } catch (error) {
      console.error(`Error saving file ${file.path}: `, error);
    }
  }

  agents.forEach((agent) => {
    if (agent.data.fileList) agent.data.fileList.refresh();
  });
}
