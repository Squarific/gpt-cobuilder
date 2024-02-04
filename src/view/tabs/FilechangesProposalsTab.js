let filechangesProposalsWatcher;

function parseFilechangesProposalFileContent (fileContent) {
    var lines = fileContent.split('\n');
    var filechangesProposal = [];

    while (i < lines.length && lines[i] != "File changes proposal:") i++;

    for (var k = i + 1; k < lines.length; k++) {
        filechangesProposal.push(lines[k]);
    }

    filechangesProposal = filechangesProposal.join("\n");

    return {
        filechangesProposal
    };
}

function generateFilechangesProposalFileContent (response) {
    return `File changes proposal:
${response}`;
}

async function createFileChangesComparison (rawNewFiles) {
    let newFiles = parseFilesResponse(rawNewFiles);
    let newFilesElements = [];

    for (var file in newFiles) {
        let fileContent;

        try {
          fileContent = await window.fs.readFile(file.path);
          tokenCount = await window.tiktoken.countTokens(fileContent);
        } catch (error) {
          fileContent = '';
          tokenCount = 0;
        }
  
        newFilesElements.push(`<li>File path: ${file.path} Current length: ${tokenCount} New Length: ${await window.tiktoken.countTokens(file.content)}</li>`);
    }

    return `<ul>${newFilesElements.join("")}</ul>`;
}

async function updateFilechangesProposalsTab() {
    const filechangesProposalsTab = document.getElementById('FilechangesProposals');
    const filechangesProposalsDir = `${localStorage.getItem('folder')}/gptcobuilder/filechangesproposals`;

    if (!filechangesProposalsWatcher) {
        filechangesProposalsWatcher = window.fs.watchDirectory(filechangesProposalsDir, { encoding: 'buffer' }, (eventType, filename) => {
            if (eventType === 'rename') {
                updateFilechangesProposalsTab();
            }
        });
    }

    filechangesProposalsTab.innerHTML = `
        <h2>Filechanges Proposals</h2>
        <table id="file-changes-proposals-table">
            <tr>
                <th>Raw file changes</th>
                <th>Parsed file changes</th>
                <th>Actions</th>
            </tr>
        </table>
        <button class="button" id="git-undo-last-commit-button">Undo last commit and push</button>
    `;

    try {
        const filechangesProposalsFiles = await window.fs.readdir(filechangesProposalsDir);
        for (const fileName of filechangesProposalsFiles) {
            const filePath = `${filechangesProposalsDir}/${fileName}`;
            const fileContent = await window.fs.readFile(filePath);
            const { filechangesProposal } = parseFilechangesProposalFileContent(fileContent);

            const tableRowHTML = `
                <tr>
                    <td><textarea class="proposal">${filechangesProposal}</textarea></td>
                    <td class="parsed-proposal">${createFileChangesComparison(filechangesProposal)}</td>
                    <td class="buttons">
                        <button class="button apply-changes">Apply file changes</button>
                        <button class="button delete-proposal">Delete</button>
                    </td>
                </tr>
            `;
            
            var row = filechangesProposalsTab.querySelector('#file-changes-proposals-table').appendChild(rowElementFromHTML(tableRowHTML));

            var proposalTextarea = row.querySelector(".proposal");
            proposalTextarea.addEventListener('input', async () => {
                const updatedProposal = proposalTextarea.value;
                const updatedFileContent = generateFilechangesProposalFileContent(updatedProposal);
                await window.fs.saveFile(filePath, updatedFileContent);
                row.querySelector(".parsed-proposal").innerHTML = createFileChangesComparison(updatedFileContent);
            });

            var applyButton = row.querySelector(".apply-changes");
            applyButton.addEventListener("click", async () => {
                applyFileChanges(proposalTextarea.value);
            });

            var deleteButton = row.querySelector(".delete-change-request");
            deleteButton.addEventListener("click", async () => {
                await window.fs.unlink(`${filePath}`);
            });
        }
    } catch (error) {
        console.error('Failed to load file changes proposals files: ', error);
    }

    document.getElementById('git-undo-last-commit-button').addEventListener('click', gitUndoLastCommitAndPush);
}

window.addEventListener('beforeunload', () => {
    if (filechangesProposalsWatcher) {
        filechangesProposalsWatcher();
    }
});

updateFilechangesProposalsTab();