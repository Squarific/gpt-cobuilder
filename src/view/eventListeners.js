// Attach event listener to the button
const generateButton = document.getElementById('generate-button');
const refreshButton = document.getElementById('refresh-filelist');
const convertButton = document.getElementById('convert-button');
const errorLog = document.getElementById('error-log');
const reponseField = document.getElementById('model-response');
const modelSelection = document.getElementById('model-selection');

function clearErrorLog() {
  errorLog.textContent = "";
}

// Add an event listener to Apply files button
const applyButton = document.getElementById('apply-button');
applyButton.addEventListener('click', () => {
  refreshButton.click();
});

convertButton.addEventListener('click', () => {
  convertButton.disabled = true;
  convertChangeRequestToFiles();
});

modelSelection.addEventListener('change', async () => {
    const settings = { modelSelection: modelSelection.value };
    await saveSettings(settings);
});
