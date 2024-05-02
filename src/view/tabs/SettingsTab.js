import { GPT_COBUILDER_FOLDER_NAME, PROJECT_DESCRIPTION_FILE } from "../classes/Constants.js";
import { loadSettings, updateFolder, saveSettings } from "../fileOperations.js";

async function createSettingsTab() {
  const settingsTab = $('#Settings');
  settingsTab.innerHTML = `
    <label for="openai-api-key">ChatGPT API Key:</label>
    <input type="text" id="openai-api-key" value="${localStorage.getItem('apiKey') || ''}" />

    <label for="groq-api-key">Groq API Key:</label>
    <input type="text" id="groq-api-key" value="${localStorage.getItem('groq-apiKey') || ''}" />

    <label for="folder-selection">Select a Folder:</label>
    <button id="folder-selection">Project folder</button>
    
    <label for="project-description">Project Description</label>
    <textarea id="project-description" rows="5"></textarea>

    <label for="model-selection">Select a model:</label>
    <select id="model-selection">
      <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
      <option value="gpt-3.5-turbo-16k">gpt-3.5-turbo-16k</option>
      <option value="gpt-4">gpt-4</option>
      <option value="gpt-4-32k">gpt-4-32k</option>
      <option value="gpt-4-1106-preview">gpt-4-1106-preview</option>
      <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
      <option value="llama3-70b-8192">llama3-70b-8192</option>
    </select>
    
    <div id="folder-display"></div>
    <ul id="recent-folders-list"></ul>
  `;

  const projectDescriptionTextarea = $('#project-description');
  projectDescriptionTextarea.addEventListener('input', updateProjectDescription);

  const folder = localStorage.getItem('folder');
  const projectDescriptionFilePath = `${folder}/gptcobuilder/project_description.txt`;
  if (await window.fs.exists(projectDescriptionFilePath)) {
    const projectDescription = await window.fs.readFile(projectDescriptionFilePath);
    projectDescriptionTextarea.value = projectDescription;
  }
  
  $('#openai-api-key').addEventListener('input', () => {
    localStorage.setItem('apiKey', $('#openai-api-key').value.trim());
  });

  $('#groq-api-key').addEventListener('input', () => {
    localStorage.setItem('groq-apiKey', $('#groq-api-key').value.trim());
  });

  $('#folder-selection').addEventListener('click', async () => {
    const folder = await folderDialog.open();
    updateFolder(folder);
  });

  let modelSelect = $('#model-selection');
  modelSelect.value = (await loadSettings()).modelSelection;
  modelSelect.addEventListener('change', () => {
    const model = modelSelect.value;
    const settings = { modelSelection: model };
    saveSettings(settings);
  });

  updateRecentFoldersList();
}

async function updateProjectDescription() {
  const projectDescription = $('#project-description').value;
  const folderPath = localStorage.getItem('folder');
  const dirPath = `${folderPath}/${GPT_COBUILDER_FOLDER_NAME}`;
  const projectDescriptionFilePath = `${folderPath}/${PROJECT_DESCRIPTION_FILE}`;

  try {
    if (!await fs.exists(dirPath)) {
      await fs.mkdir(dirPath);
    }
    await window.fs.saveFile(projectDescriptionFilePath, projectDescription);
  } catch (error) {
    console.error("Failed to save project description to the file: ", error);
  }
}


function updateRecentFoldersList() {
  const recentFolders = JSON.parse(localStorage.getItem('recentFolders')) || [];
  const recentFoldersList = $('#recent-folders-list');
  recentFoldersList.innerHTML = "";

  recentFolders.forEach(folder => {
    const listItem = document.createElement('li');
    listItem.innerText = folder;
    listItem.className = "button";
    listItem.addEventListener('click', () => {
      updateFolder(folder);
    });

    recentFoldersList.appendChild(listItem);
  });
}

createSettingsTab();
