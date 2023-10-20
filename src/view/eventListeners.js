// Attach event listener to the button
const generateButton = document.getElementById('generate-button');
const convertButton = document.getElementById('convert-button');
const errorLog = document.getElementById('error-log');
const reponseField = document.getElementById('model-response');
const modelSelection = document.getElementById('model-selection');

function clearErrorLog() {
  errorLog.textContent = "";
}

async function applyFileChanges () {
  const parsedFiles = parseResponse(savedOutputs.get("OUTPUT.GPT_FILE_CHANGES"));

  for (const file of parsedFiles) {
    try {
      await window.fs.saveFile(file.path, file.content);
      console.log(`Saved file: ${file.path}`);
    } catch (error) {
      console.error(`Error saving file ${file.path}: `, error);
    }
  }

  agents.forEach((agent) => {
    if (agent.data.fileList) agent.data.fileList.refresh();
  });
}

const applyButton = document.getElementById('apply-button');
applyButton.addEventListener('click', applyFileChanges);

const apply2Button = document.getElementById('apply2-button');
apply2Button.addEventListener('click', applyFileChanges);

// Added event listener for example change requests dropdown
const changeRequestExamples = document.getElementById('change-request-examples');
const userChangeRequest = document.getElementById('user-change-request');
changeRequestExamples.addEventListener('change', () => {
  userChangeRequest.value = changeRequestExamples.value;
});

modelSelection.addEventListener('change', async () => {
    const settings = { modelSelection: modelSelection.value };
    await saveSettings(settings);
});

savedOutputs.addEventListener('change', (event) => {
    if(event.detail.name === "OUTPUT.GPT_FILE_CHANGES"){
        updateFileList('file-changes-container', event.detail.content);
        updateFileList('file-changes-container2', event.detail.content);
    }
});

async function updateFileList(targetElementId, fileChanges) {
    let listContainer = document.getElementById(targetElementId);
    listContainer.innerHTML = '';

    let parsedFiles = parseResponse(fileChanges);
    for (const file of parsedFiles) {
      let listItem = document.createElement('li');

      let fileContent;
      try {
        fileContent = await window.fs.readFile(file.path);
        tokenCount = await window.tiktoken.countTokens(fileContent);
      } catch (error) {
        fileContent = '';
        tokenCount = 0;
      }

      listItem.textContent = `File path: ${file.path} Current length: ${tokenCount} New Length: ${await window.tiktoken.countTokens(file.content)}`;

      listContainer.appendChild(listItem);
    }
}
