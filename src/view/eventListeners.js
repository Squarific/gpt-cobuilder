// Attach event listener to the button
const generateButton = document.getElementById('generate-button');
const refreshButton = document.getElementById('refresh-filelist');
const convertButton = document.getElementById('convert-button');
const errorLog = document.getElementById('error-log');
const reponseField = document.getElementById('model-response');

function clearErrorLog() {
  errorLog.textContent = "";
}

const userMessage = 'Hello, how can you help me?';

generateButton.addEventListener('click', () => {
  openTab(event, 'ChangeResponse');
  
  reponseField.disabled = true;
  generateButton.disabled = true;
  convertButton.disabled = true;
  
  sendMessageToChatGPT()
  .then(response => {
    console.log('Assistant:', response);
    reponseField.disabled = false;
    generateButton.disabled = false;
    convertButton.disabled = false;

    clearErrorLog();
    displayAssistantResponse(response);
  })
  .catch(error => {
    errorLog.textContent = `Error: ${error.message}`;
    reponseField.disabled = false;
    generateButton.disabled = false;
    convertButton.disabled = false;
  });
});

 // Attach event listener to refresh button
refreshButton.addEventListener('click', async () => {
  const savedFolder = localStorage.getItem('folder');
  if (savedFolder) {
    clearSelectedFiles();
    await updateFolder(savedFolder);
  }
});

// Add an event listener to Apply files button
const applyButton = document.getElementById('apply-button');
applyButton.addEventListener('click', () => {
  refreshButton.click();
});

convertButton.addEventListener('click', () => {
  convertButton.disabled = true;
  convertChangeRequestToFiles();
});
