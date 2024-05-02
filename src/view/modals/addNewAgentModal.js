import { elementFromHTML } from "../utils.js";
import { AGENTS_DIR_PATH } from '../classes/Constants.js';

async function createNewAgent (name) {
    const newAgentDirPath = `${AGENTS_DIR_PATH}/${name}/`;

    try {
        await window.fs.mkdir(newAgentDirPath);
        await window.fs.saveFile(`${newAgentDirPath}SystemMessage`, '');
        await window.fs.saveFile(`${newAgentDirPath}UserMessage`, '');
        location.reload();
    } catch (error) {
        console.error('Error creating new agent:', error);
    }
}

function addNewAgentModal () {
    let modal = elementFromHTML(`
        <div class="modal visible addNewAgentModal">
            <div class="modal-content">
                <h2>Add New Agent</h2>
                <label for="new-agent-name">What is the name of the new agent?</label>
                <input type="text" class="new-agent-name" />
                <button class="create-agent-btn">Create</button>
            </div>
        </div>
    `);

    modal.querySelector('.create-agent-btn').addEventListener("click", () => {
        createNewAgent(modal.querySelector('.new-agent-name').value);
    });

    $(".modals").appendChild(modal);
}

$('#AddNewAgent').addEventListener('click', addNewAgentModal);