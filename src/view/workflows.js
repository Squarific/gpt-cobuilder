// ... existing code ...

// This function will check for uncommitted changes and display the warning/button if necessary
async function checkForUncommittedChanges() {
  const directory = localStorage.getItem('folder');
  const gitDiff = await window.gitCommands.gitDiff(directory);

  if (gitDiff.trim() !== '') {
    // Uncommitted changes found
    document.getElementById('uncommitted-changes-warning').style.display = 'block';
    document.getElementById('commit-push-changes-button').style.display = 'block';
  } else {
    // No uncommitted changes
    document.getElementById('uncommitted-changes-warning').style.display = 'none';
    document.getElementById('commit-push-changes-button').style.display = 'none';
  }
}

// Event listener for the new button
document.getElementById('commit-push-changes-button').addEventListener('click', async () => {
  const GitMasterAgent = agents.find((agent) => agent.data.name === 'Git Master');

  if (!GitMasterAgent) {
    console.error("Git Master Agent is missing.");
    return;
  }

  // Generate and use the commit message from the Git Master agent
  const response = await GitMasterAgent.run();
  if (response) {
    const commitMessage = response.choices[0].message.content;

    // Perform git add, commit, and push
    const directory = localStorage.getItem('folder');
    await window.gitCommands.gitAdd(directory);
    await window.gitCommands.gitCommit(directory, commitMessage);
    await window.gitCommands.gitPush(directory);
  }
});

// Call this function on page load and whenever the project folder is changed
window.addEventListener('DOMContentLoaded', checkForUncommittedChanges);
document.getElementById('folder-selection').addEventListener('click', () => setTimeout(checkForUncommittedChanges, 1000));

// ... existing code ...
