async function createSettingsTab() {
  const settingsTab = document.getElementById('Settings');
  settingsTab.innerHTML = `
    <label for="api-key">ChatGPT API Key:</label>
    <input type="text" id="api-key" value="${localStorage.getItem('apiKey') || ''}" />

    <label for="folder-selection">Select a Folder:</label>
    <button id="folder-selection">Project folder</button>

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
  
  document.getElementById('api-key').addEventListener('input', () => {
    localStorage.setItem('apiKey', document.getElementById('api-key').value.trim());
  });

  document.getElementById('folder-selection').addEventListener('click', async () => {
    const folder = await folderDialog.open();
    updateFolder(folder);
    const recentFolders = JSON.parse(localStorage.getItem('recentFolders')) || [];
    recentFolders.push(folder);
    const uniqueFolders = [...new Set(recentFolders)];
    localStorage.setItem('recentFolders', JSON.stringify(uniqueFolders.slice(-5)));
    updateRecentFolders();
  });

  document.getElementById('model-selection').addEventListener('change', () => {
    const model = document.getElementById('model-selection').value;
    const settings = { modelSelection: model };
    saveSettings(settings);
  });

  updateRecentFolders();
  
  function updateFolder(folder) {
    if (folder) {
      localStorage.setItem('folder', folder);
      document.getElementById('folder-display').textContent = `Selected folder: ${folder}`;
      location.reload(true);
    }
  }

  function updateRecentFolders() {
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
}

document.addEventListener('DOMContentLoaded', createSettingsTab);
