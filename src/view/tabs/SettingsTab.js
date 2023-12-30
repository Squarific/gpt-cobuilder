function updateRecentFolders () {
  const recentFolders = JSON.parse(localStorage.getItem('recentFolders')) || [];
  const recentFoldersList = document.getElementById('recent-folders-list');

  recentFoldersList.textContent = "";

  recentFolders.forEach(folder => {
    const listItem = document.createElement('li');
    listItem.textContent = folder;
    listItem.className = "button";
    listItem.addEventListener('click', () => {
      updateFolder(folder);
      location = location;
    });

    recentFoldersList.appendChild(listItem);
  });
}

const settingsTabContent = document.getElementById('Settings');

// Function to create and append settings elements
function createSettingsElements() {
  // API Key
  const apiKeyLabel = document.createElement('label');
  apiKeyLabel.setAttribute('for', 'api-key');
  apiKeyLabel.textContent = 'ChatGPT API Key:';
  settingsTabContent.appendChild(apiKeyLabel);

  const apiKeyInput = document.createElement('input');
  apiKeyInput.type = 'text';
  apiKeyInput.id = 'api-key';
  settingsTabContent.appendChild(apiKeyInput);

  // Folder Selection
  const folderSelectionLabel = document.createElement('label');
  folderSelectionLabel.setAttribute('for', 'folder-selection');
  folderSelectionLabel.textContent = 'Select a Folder:';
  settingsTabContent.appendChild(folderSelectionLabel);

  const folderSelectionButton = document.createElement('button');
  folderSelectionButton.id = 'folder-selection';
  folderSelectionButton.textContent = 'Project folder';
  settingsTabContent.appendChild(folderSelectionButton);

  // Model Selection
  const modelSelectionLabel = document.createElement('label');
  modelSelectionLabel.setAttribute('for', 'model-selection');
  modelSelectionLabel.textContent = 'Select a model:';
  settingsTabContent.appendChild(modelSelectionLabel);

  const modelSelectionSelect = document.createElement('select');
  modelSelectionSelect.id = 'model-selection';
  const modelOptions = [
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-16k',
    'gpt-4',
    'gpt-4-32k',
    'gpt-4-1106-preview',
  ];
  modelOptions.forEach(model => {
    const option = document.createElement('option');
    option.value = model;
    option.textContent = model;
    modelSelectionSelect.appendChild(option);
  });
  settingsTabContent.appendChild(modelSelectionSelect);
  
  // Folder Display
  const folderDisplay = document.createElement('div');
  folderDisplay.id = 'folder-display';
  settingsTabContent.appendChild(folderDisplay);

  // Recent Folders List
  const recentFoldersListUl = document.createElement('ul');
  recentFoldersListUl.id = 'recent-folders-list';
  settingsTabContent.appendChild(recentFoldersListUl);
}

// Call createSettingsElements on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  createSettingsElements();
  addSettingsEventListeners();
  updateRecentFolders();

  // Load saved API key and folder
  const savedApiKey = localStorage.getItem('apiKey');
  if (savedApiKey) {
    document.getElementById('api-key').value = savedApiKey;
  }
  updateFolder(localStorage.getItem('folder'));
});

// Function to add event listeners for settings elements
function addSettingsEventListeners() {
  const apiKeyInput = document.getElementById('api-key');
  apiKeyInput.addEventListener('input', () => {
    // Save the API key in localStorage
    localStorage.setItem('apiKey', apiKeyInput.value.trim());
  });

  const folderSelectionInput = document.getElementById('folder-selection');
  folderSelectionInput.addEventListener('click', async () => {
    const folder = await folderDialog.open();
    updateFolder(folder);
    // Save and update recent folders
    const recentFolders = JSON.parse(localStorage.getItem('recentFolders')) || [];
    recentFolders.push(folder);
    const uniqueFolders = [...new Set(recentFolders)];
    localStorage.setItem('recentFolders', JSON.stringify(uniqueFolders.slice(-5)));
    updateRecentFolders();
  });

  const modelSelection = document.getElementById('model-selection');
  modelSelection.addEventListener('change', async () => {
      const settings = { modelSelection: modelSelection.value };
      await saveSettings(settings);
  });
}
