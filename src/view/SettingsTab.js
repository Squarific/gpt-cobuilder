const apiKeyInput = document.getElementById('api-key');

// Load the API key from localStorage if it exists
const savedApiKey = localStorage.getItem('apiKey');
if (savedApiKey) {
  apiKeyInput.value = savedApiKey;
}

//read saved folder from local storage
updateFolder(localStorage.getItem('folder'));

// Add event listener to the apiKeyInput field
apiKeyInput.addEventListener('input', () => {
  const apiKey = apiKeyInput.value;
  // Save the API key in localStorage
  localStorage.setItem('apiKey', apiKey.trim());
});

const folderSelectionInput = document.getElementById('folder-selection');

folderSelectionInput.addEventListener('click', async (event) => {
  const folder = await folderDialog.open();
  
  const recentFolders = JSON.parse(localStorage.getItem('recentFolders')) || [];
  
  recentFolders.push(folder);
  const uniqueFolders = [...new Set(recentFolders)];
  const lastFiveFolders = uniqueFolders.slice(Math.max(uniqueFolders.length - 5, 0));
  localStorage.setItem('recentFolders', JSON.stringify(lastFiveFolders));

  updateFolder(folder);
  event.preventDefault();
});

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

  window.addEventListener('DOMContentLoaded', async () => {
    updateRecentFolders();
  });