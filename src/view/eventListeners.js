// Attach event listener to the button
const generateButton = document.getElementById('generate-button');
const convertButton = document.getElementById('convert-button');
const errorLog = document.getElementById('error-log');
const reponseField = document.getElementById('model-response');
const modelSelection = document.getElementById('model-selection');

function clearErrorLog() {
  errorLog.textContent = "";
}

// Add an event listener to Apply files button
const applyButton = document.getElementById('apply-button');
applyButton.addEventListener('click', async () => {
  const parsedFiles = parseResponse(savedOutputs.get("OUTPUT.GPT_FILE_CHANGES"));

  for (const file of parsedFiles) {
    try {
      await window.fs.saveFile(file.path, file.content);
      console.log(`Saved file: ${file.path}`);
    } catch (error) {
      console.error(`Error saving file ${file.path}: `, error);
    }
  }

  agents.agents.forEach((agent) => {
    agent.data.fileList.refresh();
  });
});

modelSelection.addEventListener('change', async () => {
    const settings = { modelSelection: modelSelection.value };
    await saveSettings(settings);
});

// new code
savedOutputs.addEventListener('change', (event) => {
    if(event.detail.name === "OUTPUT.GPT_FILE_CHANGES"){
        updateFileList(event.detail.content);
    }
});

async function updateFileList(fileChanges) {
    // Get the current list container
    let listContainer = document.getElementById('file-changes-container');
    // Clear current content
    listContainer.innerHTML = '';

    let parsedFiles = parseResponse(fileChanges);
    for (const file of parsedFiles) {
      // Create and append new list item details
      let listItem = document.createElement('li');

      let fileContent;
      try {
        // Attempt to read the file
        fileContent = await window.fs.readFile(file.path);
      } catch (error) {
        // If the file does not exist, catch the error and set fileContent to an empty string
        fileContent = '';
      }

      // Display the length as zero if the file does not exist
      listItem.textContent = `File path: ${file.path} Current length: ${fileContent.length || 0} New Length: ${file.content.length}`;

      listContainer.appendChild(listItem);
    }
}
