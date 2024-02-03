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
        changeRequest += lines[k];
    }

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
    `;
    
    try {
        const userChangeRequestFiles = await window.fs.readdir(userChangeRequestsDir);
        for (const fileName of userChangeRequestFiles) {
            const filePath = `${userChangeRequestsDir}/${fileName}`;
            const fileContent = await window.fs.readFile(filePath);
            const { files, changeRequest, commitHash } = parseUserChangeRequestFileContent(fileContent);

            const tableRowHTML = `
                <tr>
                    <td><textarea class="changerequest">${changeRequest}</textarea></td>
                    <td class="files">Selected on commit: ${commitHash}<br/></td>
                    <td class="buttons"></td>
                </tr>
            `;
            
            var row = userChangeRequestsTab.querySelector('#user-change-requests-table').appendChild(rowElementFromHTML(tableRowHTML));

            var fileListController = new FileListController(files.map((f) => localStorage.getItem('folder') + "\\" + f));            
            row.querySelector(".files").appendChild(fileListController.createDOM());

            var buttons = row.querySelector(".buttons");
            var agent = agents.find((agent) => agent.name == "SeniorDev");

            buttons.appendChild(elementFromHTML(`
                <button class="button">Run ${agent.name}</button>
            `)).addEventListener("click", () => {
                document.getElementById('last-response').value = "";

                agent.run(new PromptParameters(fileListController, {
                    USER_CHANGE_REQUEST: changeRequest
                }), chunkCallback).finally(() => {
                    runAgentButton.disabled = false;
                });
            });
        }
    } catch (error) {
        console.error('Failed to load user change request files: ', error);
    }
}

window.addEventListener('beforeunload', () => {
    if (watcher) {
        watcher();
    }
});