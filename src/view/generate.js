const FILE_DELIMETER = '``' + '`';

// Get the API key from the HTML input field
const apiKeyInput = document.getElementById('api-key');
const url = 'https://api.openai.com/v1/chat/completions';

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
  
  //Push the new folder into the array
  recentFolders.push(folder);

  //Remove duplicates from the array
  const uniqueFolders = [...new Set(recentFolders)];

  //Slice the array to only hold the latest 5 folders
  const lastFiveFolders = uniqueFolders.slice(Math.max(uniqueFolders.length - 5, 0));
  
  //Save the recent folders to localStorage
  localStorage.setItem('recentFolders', JSON.stringify(lastFiveFolders));

  updateFolder(folder);
  event.preventDefault();
});

const projectDescriptionTextarea = document.getElementById('project-description');
projectDescriptionTextarea.addEventListener('input', async () => {
  const projectDescription = projectDescriptionTextarea.value;
  const folderPath = localStorage.getItem('folder');
  const dirPath = `${folderPath}/gptcobuilder`;
  const projectDescriptionFilePath = `${folderPath}/gptcobuilder/project_description.txt`;

  try {
    // Checking if the directory 'gptcobuilder' exists & creating if it doesn't exist
    if(!await fs.exists(dirPath)){
      await fs.mkdir(dirPath);
    }
    // Save the projectDescription string into the project_description.txt file
    await window.fs.saveFile(projectDescriptionFilePath,  projectDescription);
  } catch(error){
    console.error("Failed to save project description to the file: ", error);
  }
});

window.addEventListener('DOMContentLoaded', () => {
  
  const recentFolders = JSON.parse(localStorage.getItem('recentFolders')) || [];
  const recentFoldersList = document.getElementById('recent-folders-list');
  const loadFolderButton = document.getElementById('load-folder-button');

  
  //Populate the list with the recentFolder
  recentFolders.forEach(folder => {
    const listItem = document.createElement('li');
    listItem.textContent = folder;
    listItem.addEventListener('click', () => {
      listItem.setAttribute('selected', 'selected');
    });
    recentFoldersList.appendChild(listItem);
  });

  //Add event listener to the loadFolderButton
  loadFolderButton.addEventListener('click', () => {
    const selectedListItems = Array.from(recentFoldersList.getElementsByTagName('li')).filter(listItem => listItem.hasAttribute('selected'));
    if(selectedListItems.length > 0) {
      const folderToLoad = selectedListItems[0].innerText;
      updateFolder(folderToLoad);
    } else {
      console.log('No folder selected');
    }
  });

  // Make the fileListController global so it can be accessed in Agent.js
  window.fileListController = new FileListController(); 
  const fileListElement = window.fileListController.createDOM();
  const fileListContainer = document.getElementById('file-list');
  
  fileListContainer.appendChild(fileListElement);
});

