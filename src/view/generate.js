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
  
  recentFolders.push(folder);
  const uniqueFolders = [...new Set(recentFolders)];
  const lastFiveFolders = uniqueFolders.slice(Math.max(uniqueFolders.length - 5, 0));
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

async function loadExamples() {
  const exampleDirectory = `gptcobuilder/prompts/examples`;

  try {
      if (await fs.exists(exampleDirectory)) {
          const exampleFiles = await fs.readdir(exampleDirectory);
          for (const file of exampleFiles) {
              const filePath = exampleDirectory + "/" + file;
              const fileContent = await fs.readFile(filePath);
              const exampleOption = document.createElement('option');
              exampleOption.value = fileContent;
              exampleOption.innerText = fileContent;
              document.getElementById('change-request-examples').appendChild(exampleOption);
          }
      }
  } catch (error) {
      console.error("Failed to load examples: ", error);
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  await loadExamples();
  updateRecentFolders();

  // Make the fileListController global so it can be accessed in Agent.js
  window.fileListController = new FileListController(); 
  const fileListElement = window.fileListController.createDOM();
  const fileListContainer = document.getElementById('file-list');
  
  fileListContainer.appendChild(fileListElement);

  // Close the modal when the close button (x) is clicked
  const modal = document.getElementById('requestDetailsModal');
  const closeButton = modal.querySelector('.close');
  closeButton.onclick = function() {
    modal.style.display = "none";
  }

  // Close the modal when the user clicks anywhere outside of the modal content
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }

  // Create instance for managing custom workflows
  const customWorkflowsManager = new CustomWorkflows();
  customWorkflowsManager.loadAgents(agents);
  customWorkflowsManager.attachDOM();

  // Get modal elements for custom workflows
  const customWorkflowModal = document.getElementById('customWorkflowModal');
  const closeCustomWorkflowModalButton = customWorkflowModal.querySelector('.close');
  const customWorkflowNameInput = document.getElementById('customWorkflowNameInput');
  const submitCustomWorkflowNameButton = document.getElementById('submitCustomWorkflowNameButton');

  // Bind event to add workflow button
  document.getElementById('add-custom-workflow-button').addEventListener('click', () => {
      customWorkflowModal.style.display = "block";
  });

  // Bind event to close button of the modal
  closeCustomWorkflowModalButton.addEventListener('click', () => {
      customWorkflowModal.style.display = "none";
  });

  // Bind event to submit button of the modal
  submitCustomWorkflowNameButton.addEventListener('click', () => {
      const workflowName = customWorkflowNameInput.value.trim();
      if (workflowName === "") {
          alert("Workflow name cannot be empty.");
          return;
      }
      customWorkflowsManager.createNewWorkflow(workflowName);
      customWorkflowModal.style.display = "none";
      customWorkflowNameInput.value = ""; // Reset the value once submitted
  });

  // Close the modal when the user clicks anywhere outside of it
  window.onclick = (event) => {
      if (event.target == customWorkflowModal) {
          customWorkflowModal.style.display = "none";
      }
  };
});
