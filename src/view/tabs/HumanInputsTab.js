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

async function loadExamples() {
  try {
    if (await fs.exists(EXAMPLE_DIRECTORY)) {
      const exampleFiles = await fs.readdir(EXAMPLE_DIRECTORY);
      for (const file of exampleFiles) {
        const filePath = EXAMPLE_DIRECTORY + "/" + file;
        const fileContent = await fs.readFile(filePath);
        document.getElementById('change-request-examples').innerHTML += `<option value="${fileContent}">${fileContent}</option>`;
      }
    }
  } catch (error) {
    console.error("Failed to load examples: ", error);
  }
}

async function createHumanInputTab() {
  const inputsTab = document.getElementById('Inputs');
  inputsTab.innerHTML = `
    <label for="project-description">Project Description:</label>
    <textarea id="project-description" rows="5"></textarea>

    <label for="user-change-request">User change request:</label>
    <textarea id="user-change-request" rows="5"></textarea>

    <label for="change-request-examples">Example Change Requests:</label>
    <select id="change-request-examples"></select>

    <div id="file-list"></div>
    
    <button class="button" id="run-full-workflow-button">Run full workflow</button>
    <p id="total-cost">Total cost for previous full workflow run: $0</p>
    <div id="file-changes-container2"></div>

    <div id="custom-buttons">
      <button class="button" id="apply-button2">Apply generated file changes</button>
      <button class="button" id="git-operation-button2">
        Perform git add, commit (with outputs.GPT_COMMIT_MESSAGE) and push
      </button>
      <button class="button" id="git-undo-last-commit-button">
        Undo last commit and push
      </button>
    </div>
  `;

  const projectDescriptionTextarea = document.getElementById('project-description');
  projectDescriptionTextarea.addEventListener('input', updateProjectDescription);

  const changeRequestExamplesSelect = document.getElementById('change-request-examples');
  changeRequestExamplesSelect.addEventListener('change', () => {
    document.getElementById('user-change-request').value = changeRequestExamplesSelect.value;
  });

  const runFullWorkflowButton = document.getElementById('run-full-workflow-button');
  runFullWorkflowButton.addEventListener('click', async () => {
    runFullWorkflowButton.disabled = true;
    await runFullWorkflow();
    runFullWorkflowButton.disabled = false;
  });

  document.getElementById('apply-button2').addEventListener('click', applyFileChanges);
  document.getElementById('git-operation-button2').addEventListener('click', gitOperations);
  document.getElementById('git-undo-last-commit-button').addEventListener('click', gitUndoLastCommitAndPush);

  window.fileListController = new FileListController();
  const fileListElement = window.fileListController.createDOM();
  document.getElementById('file-list').appendChild(fileListElement);

  // Loading existing data
  const folder = localStorage.getItem('folder');
  const projectDescriptionFilePath = `${folder}/gptcobuilder/project_description.txt`;
  if (await window.fs.exists(projectDescriptionFilePath)) {
    const projectDescription = await window.fs.readFile(projectDescriptionFilePath);
    projectDescriptionTextarea.value = projectDescription;
  }

  loadExamples();
}

createHumanInputTab();

