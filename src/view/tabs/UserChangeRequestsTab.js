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

    function logparsedFileContent (fileContent) {
        var changeRequest = parseUserChangeRequestFileContent(fileContent);
        console.log(changeRequest);
    }
    
    userChangeRequestsTab.innerHTML = `
        <h2>User Change Requests</h2>
        <table id="user-change-requests-table">
            <tr>
                <th>User Change Request</th>
                <th>Actions</th>
            </tr>
        </table>
    `;
    
    try {
        const userChangeRequestFiles = await window.fs.readdir(userChangeRequestsDir);
        for (const fileName of userChangeRequestFiles) {
            const filePath = `${userChangeRequestsDir}/${fileName}`;
            const fileContent = await window.fs.readFile(filePath);
            const tableRow = `
                <tr>
                    <td><pre class="filecontent">${fileContent}</pre></td>
                    <td>
                        <button class="logbutton">Log</button>
                    </td>
                </tr>
            `;
            
            userChangeRequestsTab.querySelector('#user-change-requests-table').innerHTML += tableRow;
            Array.from(userChangeRequestsTab.querySelectorAll(".logbutton")).forEach((button) => {
                button.addEventListener("click", (event) => {
                    logparsedFileContent(event.target.parentNode.parentNode.querySelector(".filecontent").textContent);
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

updateUserChangeRequestsTab();