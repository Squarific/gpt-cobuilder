export function addActiveRequest(prompt, agentName) {
    const table = $('#active-requests-table');
    const row = table.insertRow(-1);
    const promptCell = row.insertCell(0);
    const agentCell = row.insertCell(1);
    const responseCell = row.insertCell(2);

    const shortenedPrompt = prompt.length > 512 ? prompt.substring(0, 512) + '...' : prompt;
    promptCell.innerText = shortenedPrompt;

    promptCell.dataset.fullPrompt = prompt;
    promptCell.dataset.shortened = "true";

    promptCell.addEventListener('click', () => {
        if (promptCell.dataset.shortened === "true") {
            promptCell.innerText = promptCell.dataset.fullPrompt;
            promptCell.dataset.shortened = "false";
        } else {
            promptCell.innerText = shortenedPrompt;
            promptCell.dataset.shortened = "true";
        }
    });

    agentCell.innerText = agentName;
    
    return responseCell;
}

function initActiveRequestsTab() {
    const activeRequestsTab = $('#ActiveRequests');
    
    activeRequestsTab.innerHTML = `
        <h2>Active Requests</h2>
        <table id="active-requests-table">
            <tr>
                <th>Prompt</th>
                <th>Agent</th>
                <th>Response</th>
            </tr>
        </table>
    `;
}

initActiveRequestsTab();