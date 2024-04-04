function addActiveRequest(prompt, agentName) {
    const table = document.getElementById('active-requests-table');
    const row = table.insertRow(-1);
    const promptCell = row.insertCell(0);
    const agentCell = row.insertCell(1);
    const responseCell = row.insertCell(2);

    promptCell.innerText = prompt;
    agentCell.innerText = agentName;
    
    return responseCell;
}

function initActiveRequestsTab() {
    const activeRequestsTab = document.getElementById('ActiveRequests');
    
    activeRequestsTab.innerHTML = `
        <h2>Active Requests</h2>
        <table id="active-requests-table" class="wide-first-child">
            <tr>
                <th>Prompt</th>
                <th>Agent</th>
                <th>Response</th>
            </tr>
        </table>
    `;
}

initActiveRequestsTab();