const FILE_DELIMETER = '``' + '`';
const MODEL = 'gpt-4';

// Get the API key from the HTML input field
const apiKeyInput = document.getElementById('api-key');
const url = 'https://api.openai.com/v1/chat/completions';

// Load the API key from localStorage if it exists
const savedApiKey = localStorage.getItem('apiKey');
if (savedApiKey) {
  apiKeyInput.value = savedApiKey;
}

document.getElementById('convert-system-message').value = `You are an excellent programmer. Output the changed files given the proposed changes. Make sure each file is there from beginning to end. All files should be complete. We want full files and not partial files. Every change should be accounted for and all current code should be there aswell, unless you are directly told to change or remove it. Do not put in any placeholders or use three dots (...) to denote the rest of the file. Instead give the whole file. 

Use this format:

path/to/file.ext
${FILE_DELIMETER}
CONTENT OF FILE
${FILE_DELIMETER}`;

//read saved folder from local storage
const savedFolder = localStorage.getItem('folder');

(async function () {
  if (savedFolder) {
    document.getElementById('folder-display').textContent = ` Selected Folder: ${savedFolder}`;
    const filePaths = await window.fs.getFilesInDirectory(savedFolder);
    const fileEntries = filePaths.map(filePath => ({name: path.basename(filePath), path: filePath}));
    let filteredFileList = fileEntries;
    filteredFileList = await filterFilesByGitignore(fileEntries);
    displayFileStructure(filteredFileList);
  }
})();

// Add event listener to the apiKeyInput field
apiKeyInput.addEventListener('input', () => {
  const apiKey = apiKeyInput.value;
  // Save the API key in localStorage
  localStorage.setItem('apiKey', apiKey.trim());
});

// Mapping to store the content of each checked file
const fileContentMap = new Map();

const parseResponse = (response) => {
  const files = [];
  // Split the response by the code block delimiter
  const blocks = response.split(FILE_DELIMETER);
  // Iterate over the blocks, skipping the language specifier
  for(let i = 0; i < blocks.length - 1; i += 2) {
    // Get the file path
    let path = blocks[i].trim().split("\n");
    path = path[path.length - 1]; // Only the line directly before the delimiter

    // Get the file content
    let content = blocks[i + 1];
    content = content.substring(content.indexOf("\n") + 1); // Remove language specifier

    // Add the file to the list
    files.push({ path, content });
  }
  return files;
};

// Function to display the assistant's response
const displayAssistantResponse = (response) => {
  const serverResponse = document.getElementById('model-response');
  serverResponse.value = response;
};

// Function to update the content of the "generated-message" textarea
const updateGeneratedMessageContent = () => {
  const generatedMessageTextarea = document.getElementById('generated-message');
  const fileEntries = [];
  const savedFolder = localStorage.getItem('folder');

  for (const [file, content] of fileContentMap) {
    let filePath = file.path;

    if (savedFolder) {
      // Display only the path relative to the selected folder
      filePath = path.relative(savedFolder, filePath);
    }

    fileEntries.push(`${filePath}\n${FILE_DELIMETER}\n${content}\n${FILE_DELIMETER}`);
  }

  generatedMessageTextarea.value = fileEntries.join('\n\n'); // Add two new lines between file entries

  updateFullMessageContent();
};

// Function to update the content of the "full-message" textarea
const updateFullMessageContent = () => {
  const generatedMessageTextarea = document.getElementById('generated-message');
  const userMessageTextarea = document.getElementById('user-message');
  const fullMessageTextarea = document.getElementById('full-message');

  const projectDescription = document.getElementById('project-description').value;
  const generatedMessages = generatedMessageTextarea.value;
  const userMessage = userMessageTextarea.value;

  // Combine project description, generated messages, and user message
  const fullMessage = `${projectDescription}\n\n${generatedMessages}\n\n${userMessage}`;
  fullMessageTextarea.value = fullMessage;

  const tokenCountElement = document.getElementById('local-token-count');
  const systemMessage = document.getElementById('system-message').value;
  const totalMessage = `${systemMessage}\n\n${fullMessage}`;

  tiktoken.countTokens(totalMessage)
    .then((tokenCount) => {
      tokenCountElement.textContent = `Total Tokens: ${tokenCount}`;
    })
    .catch((error) => {
      console.error('Failed to count tokens:', error);
    });
};

const folderSelectionInput = document.getElementById('folder-selection');

folderSelectionInput.addEventListener('click', async (event) => {
  const folder = await folderDialog.open();

  if (folder) {
    localStorage.setItem('folder', folder);

    document.getElementById('folder-display').textContent = ` Selected Folder: ${folder}`;

    const filePaths = await window.fs.getFilesInDirectory(folder);
    const fileEntries = filePaths.map(filePath => ({name: path.basename(filePath), path: filePath}));
    
    let filteredFileList = fileEntries;
    filteredFileList = await filterFilesByGitignore(fileEntries);
    displayFileStructure(filteredFileList);

    // Load the projectDescription
    const projectDescriptionFilePath = `${folder}/gptcobuilder/project_description.txt`;
    const projectDescription = await window.fs.readFile(projectDescriptionFilePath);
    document.getElementById('project-description').value = projectDescription;
  }

  event.preventDefault();
});

// Add event listener to the user message textarea
const userMessageTextarea = document.getElementById('user-message');
userMessageTextarea.addEventListener('input', () => {
  updateFullMessageContent();
});

const projectDescriptionTextarea = document.getElementById('project-description');
projectDescriptionTextarea.addEventListener('input', async () => {
  updateFullMessageContent();
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
})

const displayFilesResponse = (response) => {
  const filesResponse = document.getElementById('model-files-response');
  const parsedFiles = parseResponse(response);
  
  let formattedResponse = '';
  parsedFiles.forEach(file => {
    formattedResponse += `File Path: ${file.path}\n\nFile Content:\n${file.content}\n\n========================\n\n`;
  });
  
  filesResponse.value = response;
};

document.getElementById('apply-button').addEventListener('click', async () => {
  const parsedFiles = parseResponse(document.getElementById('model-files-response').value);

  for (const file of parsedFiles) {
    try {
      await window.fs.saveFile(file.path, file.content);
      console.log(`Saved file: ${file.path}`);
    } catch (error) {
      console.error(`Error saving file ${file.path}: `, error);
    }
  }
});

const toLocalISOString = (date) => {
  const tzOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date - tzOffset);
  return localDate.toISOString().split('.')[0];
};