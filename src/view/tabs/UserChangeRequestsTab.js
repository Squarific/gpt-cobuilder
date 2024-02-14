let watcher;

function parseUserChangeRequestFileContent (fileContent) {
    let lines = fileContent.split('\n');
    let commitHash = lines[0].split("(")[1].split(")")[0];
    let files = [];
    let changeRequest = [];

    let i = 1;
    while (lines[i].indexOf("- ") == 0) {
        files.push(lines[i].substring(2));
        i++;
    }

    while (i < lines.length && lines[i] != "Change request:") i++;
    
    for (let k = i + 1; k < lines.length; k++) {
        changeRequest.push(lines[k]);
    }

    changeRequest = changeRequest.join("\n");

    return {
        files,
        changeRequest,
        commitHash
    };
}

function generateUserChangeRequestFileContent(files, changeRequest, commitHash) {
    return `Files (${commitHash}):
${files.join('\n')}

Change request:
${changeRequest}`;
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
        <table id="user-change-requests-table" class="wide-first-child">
            <tr>
                <th>User Change Request</th>
                <th>Selected files</th>
                <th>Actions</th>
            </tr>
        </table>
        <button class="button" id="new-change-request">New change request</button>
    `;
    
    try {
        const userChangeRequestFiles = await window.fs.readdir(userChangeRequestsDir);
        for (const fileName of userChangeRequestFiles) {
            const filePath = `${userChangeRequestsDir}/${fileName}`;
            const fileContent = await window.fs.readFile(filePath);
            const { files, changeRequest, commitHash } = parseUserChangeRequestFileContent(fileContent);

            let agent = agents.find((agent) => agent.name == "SeniorDev") || {name: "undefined"};

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
            
            let row = userChangeRequestsTab.querySelector('#user-change-requests-table').appendChild(rowElementFromHTML(tableRowHTML));

            let fileListController = new FileListController(files.map((f) => localStorage.getItem('folder') + "\\" + f));            
            row.querySelector(".files").appendChild(fileListController.createDOM());

            let changeRequestTextarea = row.querySelector(".changerequest");

            changeRequestTextarea.addEventListener('input', async () => {
                console.log("input");
                const updatedChangeRequest = changeRequestTextarea.value;
                const updatedFileContent = generateUserChangeRequestFileContent(files, updatedChangeRequest, commitHash);
                await window.fs.saveFile(filePath, updatedFileContent);
            });

            let runSeniorButton = row.querySelector(".run-agent");
            runSeniorButton.addEventListener("click", async () => {
                runSeniorButton.disabled = true;
                let seniorResponse = await agent.run(new PromptParameters(fileListController, {
                    USER_CHANGE_REQUEST: changeRequestTextarea.value
                }), chunkCallback).finally(() => {
                    runSeniorButton.disabled = false;
                });

                createHighLevelChangeRequestFile(seniorResponse.choices[0].message.content, files);
            });

            let deleteButton = row.querySelector(".delete-change-request");
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
}

window.addEventListener('beforeunload', () => {
    if (watcher) {
        watcher();
    }
});