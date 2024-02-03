async function gitAddCommitPush (gitMessage) {
  try {
    await window.gitCommands.gitAdd(localStorage.getItem("folder"));
    await window.gitCommands.gitCommit(localStorage.getItem("folder"), gptGitMessage);
    await window.gitCommands.gitPush(localStorage.getItem("folder"));
  } catch (error) {
    console.log("Error performing git operations", error);
  }
}

let chunkCallback = (chunk) => {
  document.getElementById('last-response').value += chunk.choices[0]?.delta?.content || '';
}

async function runFullWorkflow () {
  let totalCost = 0;
  
  const SeniorDevAgent = agents.find((agent) => agent.name === 'SeniorDev');
  const JuniorDevAgent = agents.find((agent) => agent.name === 'JuniorDev');
  const GitMasterAgent = agents.find((agent) => agent.name === 'GitMaster');

  if(!SeniorDevAgent || !JuniorDevAgent || !GitMasterAgent) {
    console.error("AGENT MISSING", SeniorDevAgent, JuniorDevAgent, GitMasterAgent);
  }
  
  document.getElementById('last-response').value = "";
  let seniorResponse = await SeniorDevAgent.run(new PromptParameters(fileListController), chunkCallback);
  document.getElementById('token-counts').innerText = displayTokenCounts(seniorResponse);
  totalCost += parseFloat(calculateCostFromResponse(seniorResponse));

  document.getElementById('last-response').value = "";
  let juniorResponse = await JuniorDevAgent.run(new PromptParameters(fileListController, {
    HIGH_LEVEL_CHANGE_REQUEST: seniorResponse.choices[0].message.content
  }), chunkCallback);
  document.getElementById('token-counts').innerText = displayTokenCounts(juniorResponse);
  totalCost += parseFloat(calculateCostFromResponse(juniorResponse));
  
  await applyFileChanges(juniorResponse);
  document.getElementById('last-response').value = "";
  let gitResponse = await GitMasterAgent.run(new PromptParameters(), chunkCallback);
  document.getElementById('token-counts').innerText = displayTokenCounts(gitResponse);
  totalCost += parseFloat(calculateCostFromResponse(gitResponse));
  
  await gitAddCommitPush(gitResponse);

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

async function applyFileChanges (fileChanges) {
  const parsedFiles = parseResponse(fileChanges);

  for (const file of parsedFiles) {
    try {
      await window.fs.saveFile(file.path, file.content);
      console.log(`Saved file: ${file.path}`);
    } catch (error) {
      console.error(`Error saving file ${file.path}: `, error);
    }
  }

  fileListController.refresh();
}
