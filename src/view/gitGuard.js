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
  const fileRegex = /^(?:\s*modified:|\s*M)\s*(.+)$/mg;
  let match;
  const files = [];
  while ((match = fileRegex.exec(gitStatus)) !== null) {
    files.push(match[1].trim());
  }
  return files;
}

async function generateAndPushCommit() {
  // Get the Git Master agent button
  const commitPushButton = document.getElementById('commit-push-button');
  try {
    // Disable the button
    commitPushButton.disabled = true;

    const GitMasterAgent = agents.find(agent => agent.name === 'GitMaster');
    if (!GitMasterAgent) {
      console.error('Git Master agent not found');
      return;
    }

    document.getElementById('last-response').value = "";
    const response = await GitMasterAgent.run(new PromptParameters(), chunkCallback);
    
    if (response && response.choices && response.choices.length > 0) {
      const commitMessage = response.choices[0].message.content;
      await window.gitCommands.gitAdd(localStorage.getItem("folder"));
      await window.gitCommands.gitCommit(localStorage.getItem("folder"), commitMessage);
      await window.gitCommands.gitPush(localStorage.getItem("folder"));
      checkUncommittedChanges();
    } else {
      console.error('Failed to generate commit message');
    }
  } catch (error) {
    console.error('Error during commit and push', error);
  } finally {
    // Re-enable the button
    commitPushButton.disabled = false;
  }
}

setInterval(checkUncommittedChanges, 30000);
window.addEventListener('load', checkUncommittedChanges);

