// New file: src/view/gitOperations.js

async function checkUncommittedChanges() {
    const directory = localStorage.getItem('folder');
    const gitStatus = await window.gitCommands.gitStatus(directory);

    // If git status indicates uncommitted changes/staged changes
    const hasUncommittedChanges = gitStatus.includes('Changes to be committed:') || gitStatus.includes('Changes not staged for commit:');
    const warningElement = document.getElementById('git-warning');
    const commitPushButton = document.getElementById('commit-push-button');

    if(hasUncommittedChanges) {
        warningElement.style.display = 'block';
        commitPushButton.style.display = 'block';
    } else {
        warningElement.style.display = 'none';
        commitPushButton.style.display = 'none';
    }
}

async function generateAndPushCommit() {
    const commitMessage = "Auto-generated commit message"; // This should be replaced with a real generation process
    const directory = localStorage.getItem('folder');
    await window.gitCommands.gitCommit(directory, commitMessage);
    await window.gitCommands.gitPush(directory);
}

// Add this function call at the end of your window onload or DOMContentLoaded event handler
checkUncommittedChanges();

// Attach event listener to the new button for committing and pushing
document.getElementById('commit-push-button').addEventListener('click', generateAndPushCommit);

