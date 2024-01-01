async function checkUncommittedChanges() {
    const directory = localStorage.getItem('folder');
    const gitStatus = await window.gitCommands.gitStatus(directory);

    const hasUncommittedChanges = gitStatus.includes('Changes to be committed:') || gitStatus.includes('Changes not staged for commit:');
    const warningElement = document.getElementById('git-warning');
    const commitPushButton = document.getElementById('commit-push-button');

    warningElement.style.display = hasUncommittedChanges ? "block" : "none";
}

async function generateAndPushCommit() {
    const commitMessage = "Auto-generated commit message"; // This should be replaced with a real generation process
    const directory = localStorage.getItem('folder');
    // The files should first be added using gitAdd
    await window.gitCommands.gitCommit(directory, commitMessage);
    await window.gitCommands.gitPush(directory);
}

setInterval(() => {
    checkUncommittedChanges();
}, 30000);

document.getElementById('commit-push-button').addEventListener('click', generateAndPushCommit);
checkUncommittedChanges();