async function checkUncommittedChanges() {
    const directory = localStorage.getItem('folder');
    const gitStatus = await window.gitCommands.gitStatus(directory);

    const hasUncommittedChanges = gitStatus.includes('Changes to be committed:') || gitStatus.includes('Changes not staged for commit:');
    const warningElement = document.getElementById('git-warning');

    warningElement.style.display = hasUncommittedChanges ? "block" : "none";
}

async function generateAndPushCommit() {
    const directory = localStorage.getItem('folder');

    // Retrieve GitMaster agent
    const GitMasterAgent = agents.find((agent) => agent.data.name === 'Git Master');
    if (!GitMasterAgent) {
      console.error("Git Master agent not found");
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
      console.error("Failed to generate commit message");
    }
}

document.getElementById('commit-push-button').addEventListener('click', generateAndPushCommit);

setInterval(() => {
    checkUncommittedChanges();
}, 30000);
checkUncommittedChanges();
