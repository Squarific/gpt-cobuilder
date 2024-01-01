async function checkUncommittedChanges() {
    const directory = localStorage.getItem('folder');
    const gitStatus = await window.gitCommands.gitStatus(directory);

    const hasUncommittedChanges = gitStatus.includes('Changes to be committed:') || gitStatus.includes('Changes not staged for commit:');
    const warningElement = document.getElementById('git-warning');

    if (hasUncommittedChanges) {
        const modifiedFiles = parseGitStatus(gitStatus);
        const modifiedFilesList = document.createElement('ul');
        modifiedFiles.forEach(file => {
            const fileItem = document.createElement('li');
            fileItem.textContent = file;
            modifiedFilesList.appendChild(fileItem);
        });

        warningElement.innerHTML = 'There are uncommitted changes:<br/>';
        warningElement.appendChild(modifiedFilesList);
        warningElement.style.display = 'block';
        warningElement.appendChild(document.getElementById('commit-push-button'));
    } else {
        warningElement.style.display = 'none';
    }
}

// Parse git status output to extract modified files
function parseGitStatus(gitStatus) {
    const lines = gitStatus.split('\n');
    const modifiedFiles = [];

    let capture = false; // Flag to capture modified files
    for (const line of lines) {
        if (line.startsWith('Changes to be committed:') || line.startsWith('Changes not staged for commit:')) {
            capture = true; // Start capturing modified files
        } else if (line === '') {
            capture = false; // Stop capturing modified files
        } else if (capture && (line.startsWith('\tmodified:') || line.startsWith('\tnew file:'))) {
            const filePath = line.substring(line.indexOf(':') + 1).trim();
            modifiedFiles.push(filePath); // Add file path to the list
        }
    }
    return modifiedFiles;
}

document.getElementById('commit-push-button').addEventListener('click', generateAndPushCommit);
setInterval(() => {
    checkUncommittedChanges();
}, 30000);
checkUncommittedChanges();
