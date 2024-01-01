async function checkUncommittedChanges() {
  const directory = localStorage.getItem('folder');
  const gitStatus = await window.gitCommands.gitStatus(directory);
  const hasUncommittedChanges = gitStatus.includes('Changes to be committed:') || gitStatus.includes('Changes not staged for commit:');
  const warningElement = createGitWarningElement(hasUncommittedChanges);
  const bodyElement = document.querySelector('body');
  const existingWarning = document.getElementById('git-warning');

  if (existingWarning) {
    bodyElement.removeChild(existingWarning);
  }

  if (hasUncommittedChanges) {
    bodyElement.insertBefore(warningElement, bodyElement.firstChild);
  }
}

function createGitWarningElement(hasUncommittedChanges) {
  const warningElement = document.createElement('div');
  warningElement.id = 'git-warning';
  warningElement.className = 'error-log';
  warningElement.style.display = hasUncommittedChanges ? 'block' : 'none';
  warningElement.textContent = 'There are uncommitted changes ';

  const commitPushButton = document.createElement('button');
  commitPushButton.className = 'button';
  commitPushButton.id = 'commit-push-button';
  commitPushButton.textContent = 'Generate commit message and commit and push changes';
  commitPushButton.addEventListener('click', generateAndPushCommit);

  warningElement.appendChild(commitPushButton);
  return warningElement;
}

async function generateAndPushCommit() {
  const directory = localStorage.getItem('folder');

  // Retrieve GitMaster agent
  const GitMasterAgent = agents.find(agent => agent.data.name === 'Git Master');
  if (!GitMasterAgent) {
    console.error('Git Master agent not found');
    return;
  }

  // Run GitMaster agent to generate commit message
  const response = await GitMasterAgent.run();

  // Check if the generation was successful
  if (response && response.choices && response.choices.length > 0) {
    const commitMessage = response.choices[0].message.content;
    // The files should first be added using gitAdd
    await window.gitCommands.gitAdd(directory);
    // Commit changes with generated message
    await window.gitCommands.gitCommit(directory, commitMessage);
    // Push changes to the repository
    await window.gitCommands.gitPush(directory);

    checkUncommittedChanges();
  } else {
    console.error('Failed to generate commit message');
  }
}

setInterval(checkUncommittedChanges, 30000);
window.addEventListener('load', checkUncommittedChanges);
