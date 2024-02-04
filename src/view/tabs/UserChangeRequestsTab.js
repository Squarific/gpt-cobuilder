let watcher;

function parseUserChangeRequestFileContent (fileContent) {
    var lines = fileContent.split('\n');
    var commitHash = lines[0].split("(")[1].split(")")[0];
    var files = [];
    var changeRequest = "";

    var i = 1;
    while (lines[i].indexOf("- ") == 0) {
        files.push(lines[i].substring(2));
        i++;
    }

    while (i < lines.length && lines[i] != "Change request:") i++;
    
    for (var k = i + 1; k < lines.length; k++) {
        changeRequest.push(lines[k]);
    }

    changeRequest = changeRequest.join("\n");

    return {
        files,
        changeRequest,
        commitHash
    };
}

async function updateUserChangeRequestsTab() {
    const userChangeRequestsTab = document.getElementById('UserChangeRequests');
    const userChangeRequestsDir = `${localStorage.getItem('folder')}/gptcobuilder/userchangerequests`;

    if (!watcher) {
        watcher = window.fs.watchDirectory(userChangeRequestsDir, { encoding: 'buffer' }, (eventType, filename) => {
            if (eventType === 'rename') {
                updateUserChangeRequestsTab();
            }
        });
    }
    
    userChangeRequestsTab.innerHTML = `
        <h2>User Change Requests</h2>
        <table id="user-change-requests-table">
            <tr>
                <th>User Change Request</th>
                <th>Selected files</th>
                <th>Actions</th>
            </tr>
        </table>
        <button class="button" id="new-change-request">New change request</button>
        <button class="button" id="git-undo-last-commit-button">Undo last commit and push</button>
    `;
    
    try {
        const userChangeRequestFiles = await window.fs.readdir(userChangeRequestsDir);
        for (const fileName of userChangeRequestFiles) {
            const filePath = `${userChangeRequestsDir}/${fileName}`;
            const fileContent = await window.fs.readFile(filePath);
            const { files, changeRequest, commitHash } = parseUserChangeRequestFileContent(fileContent);

            var agent = agents.find((agent) => agent.name == "SeniorDev") || {name: "undefined"};

            const tableRowHTML = `
                <tr>
                    <td><textarea class="changerequest">${changeRequest}</textarea></td>
                    <td class="files">Selected on commit: ${commitHash}<br/></td>
                    <td class="buttons">
                        <button class="button run-agent">Run ${agent.name}</button>
                        <button class="button delete-change-request">Delete</button>
                    </td>
                </tr>
            `;
            
            var row = userChangeRequestsTab.querySelector('#user-change-requests-table').appendChild(rowElementFromHTML(tableRowHTML));

            var fileListController = new FileListController(files.map((f) => localStorage.getItem('folder') + "\\" + f));            
            row.querySelector(".files").appendChild(fileListController.createDOM());

            var buttons = row.querySelector(".buttons");

            var runSeniorButton = row.querySelector(".run-agent");
            runSeniorButton.addEventListener("click", async () => {
                runSeniorButton.disabled = true;
                let seniorResponse = await agent.run(new PromptParameters(fileListController, {
                    USER_CHANGE_REQUEST: row.querySelector(".changerequest").value
                }), chunkCallback).finally(() => {
                    runSeniorButton.disabled = false;
                });

                createHighLevelChangeRequestFile(seniorResponse.choices[0].message.content, files);
            });

            var deleteButton = row.querySelector(".delete-change-request");
            deleteButton.addEventListener("click", async () => {
                await window.fs.unlink(`${filePath}`);
            });
        }
    } catch (error) {
        console.error('Failed to load user change request files: ', error);
    }

    document.getElementById('new-change-request').addEventListener('click', () => {
        createChangeRequestFile("", []);
    });

    document.getElementById('git-undo-last-commit-button').addEventListener('click', gitUndoLastCommitAndPush);
}

window.addEventListener('beforeunload', () => {
    if (watcher) {
        watcher();
    }
});