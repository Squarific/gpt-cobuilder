const projectDescriptionTextarea = document.getElementById('project-description');
projectDescriptionTextarea.addEventListener('input', async () => {
  const projectDescription = projectDescriptionTextarea.value;
  const folderPath = localStorage.getItem('folder');
  const dirPath = `${folderPath}/${GPT_COBUILDER_FOLDER_NAME}`;
  const projectDescriptionFilePath = `${folderPath}/${PROJECT_DESCRIPTION_FILE}`;

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

async function loadExamples() {
  try {
    if (await fs.exists(EXAMPLE_DIRECTORY)) {
      const exampleFiles = await fs.readdir(EXAMPLE_DIRECTORY);
      for (const file of exampleFiles) {
        const filePath = EXAMPLE_DIRECTORY + "/" + file;
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

function createHumanInputTab() {
  const inputsTab = document.getElementById('Inputs');
  
  // Clear existing content if any
  inputsTab.innerHTML = '';

  // Project Description
  const projectDescLabel = document.createElement('label');
  projectDescLabel.setAttribute('for', 'project-description');
  projectDescLabel.innerText = 'Project Description:';
  inputsTab.appendChild(projectDescLabel);

  const projectDescTextarea = document.createElement('textarea');
  projectDescTextarea.id = 'project-description';
  projectDescTextarea.rows = 5;
  projectDescTextarea.value = 'This is an electron project that aims to let users quickly create and iterate on applications.';
  inputsTab.appendChild(projectDescTextarea);

  // User Change Request
  const userChangeRequestLabel = document.createElement('label');
  userChangeRequestLabel.setAttribute('for', 'user-change-request');
  userChangeRequestLabel.innerText = 'User change request:';
  inputsTab.appendChild(userChangeRequestLabel);

  const userChangeRequestTextarea = document.createElement('textarea');
  userChangeRequestTextarea.id = 'user-change-request';
  userChangeRequestTextarea.rows = 5;
  inputsTab.appendChild(userChangeRequestTextarea);

  // Example Change Requests
  const changeRequestExamplesLabel = document.createElement('label');
  changeRequestExamplesLabel.setAttribute('for', 'change-request-examples');
  changeRequestExamplesLabel.innerText = 'Example Change Requests:';
  inputsTab.appendChild(changeRequestExamplesLabel);

  const changeRequestExamplesSelect = document.createElement('select');
  changeRequestExamplesSelect.id = 'change-request-examples';
  const defaultOption = document.createElement('option');
  defaultOption.value = "";
  defaultOption.innerText = 'Choose an example...';
  changeRequestExamplesSelect.appendChild(defaultOption);
  inputsTab.appendChild(changeRequestExamplesSelect);

  // File List Container
  const fileListContainer = document.createElement('div');
  fileListContainer.id = 'file-list';
  inputsTab.appendChild(fileListContainer);

  // Git Warning
  const gitWarningDiv = document.createElement('div');
  gitWarningDiv.id = 'git-warning';
  gitWarningDiv.className = 'error-log';
  gitWarningDiv.style.display = 'none';
  gitWarningDiv.innerText = 'There are uncommitted changes';
  inputsTab.appendChild(gitWarningDiv);

  // Commit Push Button
  const commitPushButton = document.createElement('button');
  commitPushButton.className = 'button';
  commitPushButton.id = 'commit-push-button';
  commitPushButton.style.display = 'none';
  commitPushButton.innerText = 'Generate commit message and commit and push changes';
  inputsTab.appendChild(commitPushButton);

  // Run Full Workflow Button
  const runFullWorkflowButton = document.createElement('button');
  runFullWorkflowButton.className = 'button';
  runFullWorkflowButton.id = 'run-full-workflow-button';
  runFullWorkflowButton.innerText = 'Run full workflow';
  inputsTab.appendChild(runFullWorkflowButton);

  // Total Cost
  const totalCostP = document.createElement('p');
  totalCostP.id= 'total-cost';
  totalCostP.innerText = 'Total cost for previous full workflow run: $0';
  inputsTab.appendChild(totalCostP);

  // File Changes Container 2
  const fileChangesContainer2 = document.createElement('div');
  fileChangesContainer2.id = 'file-changes-container2';
  inputsTab.appendChild(fileChangesContainer2);

  // Custom Buttons
  const customButtonsDiv = document.createElement('div');
  customButtonsDiv.id = 'custom-buttons';

  const applyButton2 = document.createElement('button');
  applyButton2.className = 'button';
  applyButton2.id = 'apply-button2';
  applyButton2.innerText = 'Apply generated file changes';
  customButtonsDiv.appendChild(applyButton2);

  const gitOperationButton2 = document.createElement('button');
  gitOperationButton2.className = 'button';
  gitOperationButton2.id = 'git-operation-button2';
  gitOperationButton2.innerText = 'Perform git add, commit (with outputs.GPT_COMMIT_MESSAGE) and push';
  customButtonsDiv.appendChild(gitOperationButton2);

  const gitUndoLastCommitButton = document.createElement('button');
  gitUndoLastCommitButton.className = 'button';
  gitUndoLastCommitButton.id = 'git-undo-last-commit-button';
  gitUndoLastCommitButton.innerText = 'Undo last commit and push';
  customButtonsDiv.appendChild(gitUndoLastCommitButton);

  inputsTab.appendChild(customButtonsDiv);

  // Init the FileListController
  window.fileListController = new FileListController(); 
  const fileListElement = window.fileListController.createDOM();
  fileListContainer.appendChild(fileListElement);
}

window.addEventListener('DOMContentLoaded', async () => {
  createHumanInputTab();
  loadExamples();
});
