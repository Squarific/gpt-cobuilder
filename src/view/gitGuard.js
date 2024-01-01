async function checkUncommittedChanges() {
  const directory = localStorage.getItem('folder');
  const gitStatus = await window.gitCommands.gitStatus(directory);
  const hasUncommittedChanges = gitStatus.includes('Changes to be committed:') || gitStatus.includes('Changes not staged for commit:');
  const modifiedFiles = extractModifiedFiles(gitStatus);
  const warningElement = createGitWarningElement(hasUncommittedChanges, modifiedFiles);
  const bodyElement = document.querySelector('body');
  const existingWarning = document.getElementById('git-warning');

  if (existingWarning) {
    bodyElement.removeChild(existingWarning);
  }

  if (hasUncommittedChanges) {
    bodyElement.insertBefore(warningElement, bodyElement.firstChild);
  }
}

function createGitWarningElement(hasUncommittedChanges, modifiedFiles) {
  const warningElement = document.createElement('div');
  warningElement.id = 'git-warning';
  warningElement.className = 'error-log';
  warningElement.style.display = hasUncommittedChanges ? 'block' : 'none';
  warningElement.textContent = 'There are uncommitted changes:';

  if (modifiedFiles.length > 0) {
    const fileListElement = document.createElement('ul');
    for (const file of modifiedFiles) {
      const fileElement = document.createElement('li');
      fileElement.textContent = file;
      fileListElement.appendChild(fileElement);
    }
    warningElement.appendChild(fileListElement);
  }

  const commitPushButton = document.createElement('button');
  commitPushButton.className = 'button';
  commitPushButton.id = 'commit-push-button';
  commitPushButton.textContent = 'Generate commit message and commit and push changes';
  commitPushButton.addEventListener('click', generateAndPushCommit);
  warningElement.appendChild(commitPushButton);

  return warningElement;
}

function extractModifiedFiles(gitStatus) {
  const fileRegex = /^ M (.+)$/mg;
  let match;
  const files = [];
  while ((match = fileRegex.exec(gitStatus)) !== null) {
    files.push(match[1]);
  }
  return files;
}

async function generateAndPushCommit() {
  const directory = localStorage.getItem('folder');
  const GitMasterAgent = agents.find(agent => agent.data.name === 'Git Master');
  if (!GitMasterAgent) {
    console.error('Git Master agent not found');
    return;
  }
  const response = await GitMasterAgent.run();
  if (response && response.choices && response.choices.length > 0) {
    const commitMessage = response.choices[0].message.content;
    await window.gitCommands.gitAdd(directory);
    await window.gitCommands.gitCommit(directory, commitMessage);
    await window.gitCommands.gitPush(directory);
    checkUncommittedChanges();
  } else {
    console.error('Failed to generate commit message');
  }
}

setInterval(checkUncommittedChanges, 30000);
window.addEventListener('load', checkUncommittedChanges);
