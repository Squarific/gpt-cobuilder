const { exec } = require('child_process');

let agents = [];

window.addEventListener('DOMContentLoaded', async () => {
  const agentsDirPath = `gptcobuilder/agents/`;
  const agentsFiles = await window.fs.readdir(agentsDirPath);
  
  // Load each agent file
  for (let i = 0; i < agentsFiles.length; i++) {
    let agentFilePath = `${agentsDirPath}${agentsFiles[i]}`;
    const agentFile = await window.fs.readFile(agentFilePath);
  
    let agentData = JSON.parse(agentFile);
    let agent = new Agent(agentData);

    agents.push(agent);
    agent.createTab();
  }

  const folderPath = localStorage.getItem('folder');
  const hasChanges = await checkGitStatus(folderPath);

  if (hasChanges) {
    displayGitWarning(folderPath);
  }
  
});

async function checkGitStatus(folderPath) {
  return new Promise((resolve) => {
    exec(`git -C ${folderPath} status --porcelain`, (error, stdout, stderr) => {
      if (error) {
        console.error(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      
      // If stdout has content, it means there are changes
      if (stdout) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

function displayGitWarning(folderPath) {
  const gitWarningContainer = document.getElementById('git-warning-container');
  const warningMessage = document.createElement('p');
  warningMessage.textContent = 'There are uncommitted changes';
  warningMessage.style.color = 'red';

  const commitButton = document.createElement('button');
  commitButton.textContent = 'Generate commit message and commit and push changes';
  commitButton.addEventListener('click', async () => {
    // Trigger the GitMasterAgent to create a commit message
    const GitMasterAgent = agents.find((agent) => agent.data.name === 'Git Master');
    const response = await GitMasterAgent.run();
    
    // Commit and push changes
    await gitOperations();
  });

  gitWarningContainer.appendChild(warningMessage);
  gitWarningContainer.appendChild(commitButton);
}

