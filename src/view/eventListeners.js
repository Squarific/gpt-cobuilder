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
    agent.fileList.refresh();
  });
});

modelSelection.addEventListener('change', async () => {
    const settings = { modelSelection: modelSelection.value };
    await saveSettings(settings);
});
