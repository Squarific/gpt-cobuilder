import { rowElementFromHTML } from "../utils.js";
import { createFilechangesProposalFile } from '../fileOperations.js';
import { PromptParameters } from '../classes/PromptParameters.js';
import { agents } from '../agents.js';
import { FileListController } from "../classes/FileListController.js";

let highLevelChangeRequestWatcher;

function parseHighLevelChangeRequestFileContent (fileContent) {
    let lines = fileContent.split('\n');
    let commitHash = lines[0].split("(")[1].split(")")[0];
    let files = [];
    let changeRequest = [];

    let i = 1;
    while (lines[i].indexOf("- ") == 0) {
        files.push(lines[i].substring(2));
        i++;
    }

    while (i < lines.length && lines[i] != "High level change request:") i++;

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

function generateHighLevelChangeRequestsFileContent (files, response, commitHash) {
    return `Files (${commitHash}):
${files.join('\n')}

High level change request:
${response}`;
}

export async function updateHighLevelChangeRequestsTab() {
    const highLevelChangeRequestsTab = $('#HighLevelChangeRequests');
    const highLevelChangeRequestsDir = `${localStorage.getItem('folder')}/gptcobuilder/highlevelchangerequests`;

    if (!highLevelChangeRequestWatcher) {
        highLevelChangeRequestWatcher = window.fs.watchDirectory(highLevelChangeRequestsDir, { encoding: 'buffer' }, (eventType, filename) => {
            if (eventType === 'rename') {
                updateHighLevelChangeRequestsTab();
            }
        });
    }

    highLevelChangeRequestsTab.innerHTML = `
        <h2>High Level Change Requests</h2>
        <table id="high-level-change-requests-table" class="wide-first-child">
            <tr>
                <th>Response from Senior Dev</th>
                <th>Selected files</th>
                <th>Actions</th>
            </tr>
        </table>
    `;

    try {
        const highLevelChangeRequestFiles = await window.fs.readdir(highLevelChangeRequestsDir);
        for (const fileName of highLevelChangeRequestFiles) {
            const filePath = `${highLevelChangeRequestsDir}/${fileName}`;
            const fileContent = await window.fs.readFile(filePath);
            const { files, changeRequest, commitHash } = parseHighLevelChangeRequestFileContent(fileContent);

            let agent = agents.find((agent) => agent.name == "JuniorDev") || {name: "undefined"};

            const tableRowHTML = `
                <tr>
                    <td><textarea class="changerequest"></textarea></td>
                    <td class="files">Selected on commit: ${commitHash}<br/></td>
                    <td class="buttons">
                        <button class="button run-agent">Run ${agent.name}</button>
                        <button class="button delete-change-request">Delete</button>
                    </td>
                </tr>
            `;
            
            let row = highLevelChangeRequestsTab.querySelector('#high-level-change-requests-table').appendChild(rowElementFromHTML(tableRowHTML));

            let fileListController = new FileListController(files.map((f) => localStorage.getItem('folder') + "\\" + f));            
            row.querySelector(".files").appendChild(fileListController.createDOM());

            let changeRequestTextarea = row.querySelector(".changerequest");
            changeRequestTextarea.innerText = changeRequest;
            changeRequestTextarea.addEventListener('input', async () => {
                const updatedChangeRequest = changeRequestTextarea.value;
                const updatedFileContent = generateHighLevelChangeRequestsFileContent(files, updatedChangeRequest, commitHash);
                await window.fs.saveFile(filePath, updatedFileContent);
            });

            let runJuniorButton = row.querySelector(".run-agent");
            runJuniorButton.addEventListener("click", async () => {
                runJuniorButton.disabled = true;
                let juniorResponse = await agent.run(new PromptParameters(fileListController, {
                    HIGH_LEVEL_CHANGE_REQUEST: changeRequestTextarea.value
                })).finally(() => {
                    runJuniorButton.disabled = false;
                });

                createFilechangesProposalFile(juniorResponse.choices[0].message.content);
            });

            let deleteButton = row.querySelector(".delete-change-request");
            deleteButton.addEventListener("click", async () => {
                await window.fs.unlink(`${filePath}`);
            });
        }
    } catch (error) {
        console.error('Failed to load high level change request files: ', error);
    }
}

window.addEventListener('beforeunload', () => {
    if (highLevelChangeRequestWatcher) {
        highLevelChangeRequestWatcher();
    }
});