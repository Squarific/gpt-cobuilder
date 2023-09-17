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
    // Get the file path and file content
    const path = blocks[i].trim();
    let content = blocks[i + 1].trim();
    content = content.substring(content.indexOf("\n") + 1); // Remove language specifier
    // Add the file to the list
    files.push({ path, content });
  }
  return files;
};

// Function to display file structure
const displayFileStructure = (fileList) => {
  const fileStructure = document.getElementById('file-structure');
  fileStructure.textContent = ''; // Clear any previous content
  fileContentMap.clear();

  // Get the selected folder from localStorage
  const savedFolder = localStorage.getItem('folder');

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    let filePath = file.path;

    if (savedFolder) {
      // Display only the path relative to the selected folder
      filePath = path.relative(savedFolder, filePath);
    }

    const fileEntry = document.createElement('div');
    fileEntry.className = 'file-entry';

    // Create checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `file-checkbox-${i}`;

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        readFileContent(file)
          .then(content => {
            fileContentMap.set(file, content);
            updateGeneratedMessageContent();
          })
          .catch(error => {
            console.error(error);
          });
      } else {
        fileContentMap.delete(file);
        updateGeneratedMessageContent();
      }
    });

    // Create label for checkbox
    const label = document.createElement('label');
    label.setAttribute('for', `file-checkbox-${i}`);
    label.textContent = filePath;

    fileEntry.appendChild(checkbox);
    fileEntry.appendChild(label);

    fileStructure.appendChild(fileEntry);
  }
};

// Function to display the assistant's response
const displayAssistantResponse = (response) => {
  const serverResponse = document.getElementById('model-response');
  serverResponse.value = response;
};

const filterFilesByGitignore = async (fileList) => {
  let fileListArray = Array.from(fileList);

  try {
    // Find the .gitignore file in the fileListArray
    const gitignoreFile = fileListArray.find(file => file.path.endsWith('.gitignore'));
    if (!gitignoreFile) {
      return fileListArray;
    }

    // Read the .gitignore file content
    gitignoreContent = await readFileContent(gitignoreFile) + "\n.git/";
    gitignore = gitignoreParser.compile(gitignoreContent);

    // Filter out files based on .gitignore rules
    return fileListArray.filter(file => {
      const filePath = file.path;
      const normalizedFilePath = path.relative(path.dirname(gitignoreFile.path), filePath).replaceAll("\\", "/");
      return gitignore.accepts(normalizedFilePath);
    });
  } catch (error) {
    console.error('Error reading .gitignore:', error);
    return fileListArray;
  }
};

// Read the content of a file
const readFileContent = async (file) => {
  return await window.fs.readFile(file.path);
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

// Function to calculate the cost given counts of input and output tokens
const calculateCost = (inputTokens, outputTokens) => {
  const INPUT_TOKEN_COST = 0.03;  // Cost per 1k input tokens
  const OUTPUT_TOKEN_COST = 0.06; // Cost per 1k output tokens

  const cost = (inputTokens * INPUT_TOKEN_COST / 1000) + (outputTokens * OUTPUT_TOKEN_COST / 1000);
  
  return cost.toFixed(2); // Returns the cost with 2 decimal places
};

const displayTokenCounts = (response) => {
  const tokenCountElement = document.getElementById('response-token-count');
  const { prompt_tokens, completion_tokens, total_tokens } = response.usage;
  
  // Calculate cost
  const cost = calculateCost(prompt_tokens, completion_tokens);

  tokenCountElement.textContent = `Prompt Tokens: ${prompt_tokens}, Completion Tokens: ${completion_tokens}, Total Tokens: ${total_tokens}, Cost: $${cost}`;
};

const displayFilesTokenCounts = (response) => {
  const tokenCountElement = document.getElementById('files-response-token-count');
  const { prompt_tokens, completion_tokens, total_tokens } = response.usage;
  
  // Calculate cost
  const cost = calculateCost(prompt_tokens, completion_tokens);

  tokenCountElement.textContent = `Prompt Tokens: ${prompt_tokens}, Completion Tokens: ${completion_tokens}, Total Tokens: ${total_tokens}, Cost: $${cost}`;
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

const sendMessageToChatGPT = async () => {
    const apiKey = apiKeyInput.value;
    const systemMessage = document.getElementById('system-message').value;
    const userMessage = document.getElementById('full-message').value;
  
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage }
          ]
      })
    };
  
    try {
        const response = await fetch(url, requestOptions);
    
        if (!response.ok) {
          let errorMessage = `HTTP error! Status: ${response.status}`;
          const errorData = await response.json();
          if (errorData.error && errorData.error.message) {
            errorMessage += ` Message: ${errorData.error.message}`;
          }
          throw new Error(errorMessage);
        }
    
        const data = await response.json();
        // Log the request and response
        await logRequestAndResponse(apiKey, MODEL, 'user', userMessage, data);

        displayTokenCounts(data);
        return data.choices[0].message.content;
      } catch (error) {
        throw new Error(`Request failed! ${error.message}`);
      }
  };

// Function to save HTTP request and response to a file
async function logRequestAndResponse(apiKey, model, role, content, response) {
  try {
    const currentTime = new Date(); // Get current date and time
    const formattedTime = currentTime.toISOString().split('.')[0].replace('T', ' '); // Format the time in the required format
    const filename = `gptcobuilder/requests/${formattedTime}.txt`; // Form the filename
    
    const fileContent = {};
    fileContent['request'] = {
      apiKey,
      model,
      role,
      content
    };
    fileContent['response'] = response;

    // Save the request and response to the file
    await window.fs.saveFile(filename, JSON.stringify(fileContent, null, 2)); // The second argument of JSON.stringify is a replacer function which we don't need and the third argument is the number of spaces for indentation
    console.log(`Request and response logged to ${filename}`);
  } catch (error) {
    console.error('Error logging request and response: ', error);
  }
}

const convertChangeRequestToFiles = async () => {
  const apiKey = apiKeyInput.value;
  const projectDescription = document.getElementById('project-description').value;
  const modelResponse = document.getElementById('model-response').value;
  const convertSystemMessage = document.getElementById('convert-system-message').value;
  const convertUserMessage = document.getElementById('convert-user-message').value;

  const fileEntries = [];

  for (const [file, content] of fileContentMap) {
    const filePath = file.path;
    fileEntries.push(`${filePath}\n${FILE_DELIMETER}\n${content}\n${FILE_DELIMETER}`);
  }
  
  const userMessage = `${projectDescription}\n\n${fileEntries.join('\n\n')}\n\n${modelResponse}\n\n${convertUserMessage}`;
  
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: convertSystemMessage },
        { role: 'user', content: userMessage }
      ]
    })
  };
  
  try {
    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      let errorMessage = `HTTP error! Status: ${response.status}`;
      const errorData = await response.json();
    if (errorData.error && errorData.error.message) {
      errorMessage += ` Message: ${errorData.error.message}`;
    }
    throw new Error(errorMessage);
  }
  
  const data = await response.json();
  // Log the request and response
  await logRequestAndResponse(apiKey, MODEL, 'user', userMessage, data);

  displayFilesTokenCounts(data);
  displayFilesResponse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error converting change request to files:', error);
  } finally {
    convertButton.disabled = false;
  }
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