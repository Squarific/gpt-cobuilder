let watcher;

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
        <th>File Name</th>
        <th>Contents</th>
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
                <td>${fileName}</td>
                <td><pre>${fileContent}</pre></td>
                </tr>
            `;
            
            userChangeRequestsTab.querySelector('#user-change-requests-table').innerHTML += tableRow;
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