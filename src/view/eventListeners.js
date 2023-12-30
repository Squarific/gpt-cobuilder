const generateButton = document.getElementById('generate-button');
const convertButton = document.getElementById('convert-button');
const errorLog = document.getElementById('error-log');
const reponseField = document.getElementById('model-response');
const modelSelection = document.getElementById('model-selection');

function clearErrorLog() {
  errorLog.textContent = "";
}

const applyButton = document.getElementById('apply-button');
applyButton.addEventListener('click', applyFileChanges);

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

savedOutputs.addEventListener("change", ({ detail }) => {
  const savedOutputsContainer = document.getElementById('saved-outputs-container');
  let outputArea = document.getElementById('output-' + detail.name);
  
  if (!outputArea) {
      let outputLabel = document.createElement('div');
      outputLabel.innerHTML = detail.name;
      outputArea = document.createElement('textarea');
      outputArea.id = 'output-' + detail.name;
      outputArea.disabled = true;
      savedOutputsContainer.appendChild(outputLabel);
      savedOutputsContainer.appendChild(outputArea);
  }

  outputArea.value = detail.content;
});

