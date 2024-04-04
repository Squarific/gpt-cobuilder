async function checkUncommittedChanges() {
  const directory = localStorage.getItem('folder');
  const status = await window.gitCommands.status(directory);
  const hasUncommittedChanges = status.includes('Changes to be committed:') || status.includes('Changes not staged for commit:');
  const modifiedFiles = extractModifiedFiles(status);
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
  warningElement.innerText = 'There are uncommitted changes:';

  if (modifiedFiles.length > 0) {
    const fileListElement = document.createElement('ul');
    for (const file of modifiedFiles) {
      const fileElement = document.createElement('li');
      fileElement.innerText = file;
      fileListElement.appendChild(fileElement);
    }
    warningElement.appendChild(fileListElement);
  }

  const commitPushButton = document.createElement('button');
  commitPushButton.className = 'button';
  commitPushButton.id = 'commit-push-button';
  commitPushButton.innerText = 'Generate commit message and commit and push changes';
  commitPushButton.addEventListener('click', generateAndPushCommit);
  warningElement.appendChild(commitPushButton);

  return warningElement;
}

function extractModifiedFiles(gitStatus) {
  const fileRegex = /^(?:\s*modified:|\s*M|\s*deleted:)\s*(.+)$/mg;
  let match;
  const files = [];
  while ((match = fileRegex.exec(gitStatus)) !== null) {
    files.push(match[1].trim());
  }
  return files;
}

async function generateAndPushCommit() {
  const commitPushButton = document.getElementById('commit-push-button');
  
  try {
    commitPushButton.disabled = true;

    const GitMasterAgent = agents.find(agent => agent.name === 'GitMaster');
    if (!GitMasterAgent) {
      console.error('Git Master agent not found');
      return;
    }

    await window.gitCommands.add(localStorage.getItem("folder"));
    const response = await GitMasterAgent.run(new PromptParameters(undefined, {
      GIT_DIFF: await window.gitCommands.diffstaged(localStorage.getItem("folder"))
    }), chunkCallback);
    
    if (response && response.choices && response.choices.length > 0) {
      const commitMessage = response.choices[0].message.content;
      await window.gitCommands.commit(localStorage.getItem("folder"), commitMessage);
      await window.gitCommands.push(localStorage.getItem("folder"));
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

