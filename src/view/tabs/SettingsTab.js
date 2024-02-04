async function createSettingsTab() {
  const settingsTab = document.getElementById('Settings');
  settingsTab.innerHTML = `
    <label for="api-key">ChatGPT API Key:</label>
    <input type="text" id="api-key" value="${localStorage.getItem('apiKey') || ''}" />

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
    </select>
    
    <div id="folder-display"></div>
    <ul id="recent-folders-list"></ul>
  `;

  const projectDescriptionTextarea = document.getElementById('project-description');
  projectDescriptionTextarea.addEventListener('input', updateProjectDescription);

  const folder = localStorage.getItem('folder');
  const projectDescriptionFilePath = `${folder}/gptcobuilder/project_description.txt`;
  if (await window.fs.exists(projectDescriptionFilePath)) {
    const projectDescription = await window.fs.readFile(projectDescriptionFilePath);
    projectDescriptionTextarea.value = projectDescription;
  }
  
  document.getElementById('api-key').addEventListener('input', () => {
    localStorage.setItem('apiKey', document.getElementById('api-key').value.trim());
  });

  document.getElementById('folder-selection').addEventListener('click', async () => {
    const folder = await folderDialog.open();
    updateFolder(folder);
  });

  var modelSelect = document.getElementById('model-selection');
  modelSelect.value = (await loadSettings()).modelSelection;
  modelSelect.addEventListener('change', () => {
    const model = modelSelect.value;
    const settings = { modelSelection: model };
    saveSettings(settings);
  });

  updateRecentFoldersList();
}

async function updateProjectDescription() {
  const projectDescription = document.getElementById('project-description').value;
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
  const recentFoldersList = document.getElementById('recent-folders-list');
  recentFoldersList.innerHTML = "";

  recentFolders.forEach(folder => {
    const listItem = document.createElement('li');
    listItem.textContent = folder;
    listItem.className = "button";
    listItem.addEventListener('click', () => {
      updateFolder(folder);
    });

    recentFoldersList.appendChild(listItem);
  });
}

createSettingsTab();
