function createElement(type, attributes, parent) {
  const element = document.createElement(type);
  for (const key in attributes) {
    if (key === 'innerText') {
      element.innerText = attributes[key];
    } else if (key === 'event') {
      element.addEventListener(attributes.event.name, attributes.event.handler);
    } else if (key === 'className') {
      element.className = attributes[key];
    } else {
      element.setAttribute(key, attributes[key]);
    }
  }
  if (parent) {
    parent.appendChild(element);
  }
  return element;
}

async function updateProjectDescription () {
  const projectDescription = document.getElementById('project-description').value;
  const folderPath = localStorage.getItem('folder');
  const dirPath = `${folderPath}/${GPT_COBUILDER_FOLDER_NAME}`;
  const projectDescriptionFilePath = `${folderPath}/${PROJECT_DESCRIPTION_FILE}`;

  try {
    if(!await fs.exists(dirPath)){
      await fs.mkdir(dirPath);
    }
    await window.fs.saveFile(projectDescriptionFilePath,  projectDescription);
  } catch(error){
    console.error("Failed to save project description to the file: ", error);
  }
}

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

async function createHumanInputTab() {
  const inputsTab = document.getElementById('Inputs');
  inputsTab.innerHTML = '';

  // Project Description elements
  createElement('label', { for: 'project-description', innerText: 'Project Description:' }, inputsTab);
  const projectDescTextarea = createElement('textarea', { id: 'project-description', rows: 5, event: { name: 'input', handler: updateProjectDescription }}, inputsTab);

  // User Change Request elements
  createElement('label', { for: 'user-change-request', innerText: 'User change request:' }, inputsTab);
  const userChangeRequestTextarea = createElement('textarea', { id: 'user-change-request', rows: 5 }, inputsTab);

  // Example Change Requests elements
  createElement('label', { for: 'change-request-examples', innerText: 'Example Change Requests:' }, inputsTab);
  const changeRequestExamplesSelect = createElement('select', { id: 'change-request-examples', event: { name: 'change', handler: () => userChangeRequestTextarea.value = changeRequestExamplesSelect.value }}, inputsTab);
  createElement('option', { value: "", innerText: 'Choose an example...' }, changeRequestExamplesSelect);

  // File List Container
  const fileListContainer = createElement('div', { id: 'file-list' }, inputsTab);

  // Git Warning
  createElement('div', { id: 'git-warning', className: 'error-log', innerText: 'There are uncommitted changes', style: 'display: none' }, inputsTab);

  // Commit Push Button
  createElement('button', { className: 'button', id: 'commit-push-button', innerText: 'Generate commit message and commit and push changes', style: 'display: none', event: { name: 'click', handler: generateAndPushCommit }}, inputsTab);

  // Run Full Workflow Button
  const runFullWorkflowButton = createElement('button', { className: 'button', id: 'run-full-workflow-button', innerText: 'Run full workflow', event: { name: 'click', handler: async () => {
    runFullWorkflowButton.disabled = true;
    await runFullWorkflow();
    runFullWorkflowButton.disabled = false;
  } }}, inputsTab);

  // Total Cost
  createElement('p', { id: 'total-cost', innerText: 'Total cost for previous full workflow run: $0' }, inputsTab);

  // File Changes Container 2
  createElement('div', { id: 'file-changes-container2' }, inputsTab);

  // Custom Buttons
  const customButtonsDiv = createElement('div', { id: 'custom-buttons' }, inputsTab);
  createElement('button', { className: 'button', id: 'apply-button2', innerText: 'Apply generated file changes', event: { name: 'click', handler: applyFileChanges }}, customButtonsDiv);
  createElement('button', { className: 'button', id: 'git-operation-button2', innerText: 'Perform git add, commit (with outputs.GPT_COMMIT_MESSAGE) and push', event: { name: 'click', handler: gitOperations }}, customButtonsDiv);
  createElement('button', { className: 'button', id: 'git-undo-last-commit-button', innerText: 'Undo last commit and push', event: { name: 'click', handler: gitUndoLastCommitAndPush }}, customButtonsDiv);

  window.fileListController = new FileListController(); 
  const fileListElement = window.fileListController.createDOM();
  fileListContainer.appendChild(fileListElement);

  const folder = localStorage.getItem('folder');
  const projectDescriptionFilePath = `${folder}/gptcobuilder/project_description.txt`;
  const projectDescription = await window.fs.readFile(projectDescriptionFilePath);
  projectDescTextarea.value = projectDescription;
}

createHumanInputTab();
loadExamples();
