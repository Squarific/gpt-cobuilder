// Get the API key from the HTML input field
const apiKeyInput = document.getElementById('api-key');
const url = 'https://api.openai.com/v1/chat/completions';

// Load the API key from localStorage if it exists
const savedApiKey = localStorage.getItem('apiKey');
if (savedApiKey) {
  apiKeyInput.value = savedApiKey;
}

// Add event listener to the apiKeyInput field
apiKeyInput.addEventListener('input', () => {
  const apiKey = apiKeyInput.value;
  // Save the API key in localStorage
  localStorage.setItem('apiKey', apiKey.trim());
});

// Mapping to store the content of each checked file
const fileContentMap = new Map();

// Function to display file structure
const displayFileStructure = (fileList) => {
  const fileStructure = document.getElementById('file-structure');
  fileStructure.textContent = ''; // Clear any previous content

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    const filePath = file.webkitRelativePath || file.path || file.name;
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
  //serverResponse.innerHTML = mdrender(response);
  serverResponse.value = response;
};

const filterFilesByGitignore = async (fileList) => {
  let fileListArray = Array.from(fileList);

  try {
    // Find the .gitignore file in the fileListArray
    const gitignoreFile = fileListArray.find(file => file.name === '.gitignore');
    if (!gitignoreFile) {
      return fileListArray;
    }

    // Read the .gitignore file content
    const gitignoreContent = await readFileContent(gitignoreFile) + "\n.git/";
    gitignore = gitignoreParser.compile(gitignoreContent);

    // Filter out files based on .gitignore rules
    return fileListArray.filter(file => {
      const filePath = file.webkitRelativePath || file.path || file.name;
      const normalizedFilePath = filePath.replace(/^[^/]+\//, ''); // Remove the first folder in the path
      return gitignore.accepts(normalizedFilePath);
    });
  } catch (error) {
    console.error('Error reading .gitignore:', error);
    return fileListArray;
  }
};

// Read the content of a file
const readFileContent = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    reader.onerror = (event) => {
      reject(new Error('Error reading file.'));
    };
    reader.readAsText(file);
  });
};

// Function to update the content of the "generated-message" textarea
const updateGeneratedMessageContent = () => {
  const generatedMessageTextarea = document.getElementById('generated-message');
  const fileEntries = [];

  for (const [file, content] of fileContentMap) {
    const filePath = file.webkitRelativePath || file.path || file.name;
    const fileDelimeter = "```";
    fileEntries.push(`${filePath}:\n${fileDelimeter}\n${content}\n${fileDelimeter}`);
  }

  generatedMessageTextarea.value = fileEntries.join('\n\n'); // Add two new lines between file entries

  updateFullMessageContent();
};

const displayTokenCounts = (response) => {
  const tokenCountElement = document.getElementById('response-token-count');
  const { prompt_tokens, completion_tokens, total_tokens } = response.usage;
  tokenCountElement.textContent = `Prompt Tokens: ${prompt_tokens}, Completion Tokens: ${completion_tokens}, Total Tokens: ${total_tokens}`;
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

// Add event listener to the folder selection input
const folderSelectionInput = document.getElementById('folder-selection');
folderSelectionInput.addEventListener('change', (event) => {
  const fileList = event.target.files;
  filterFilesByGitignore(fileList)
  .then(filteredFileList => {
    displayFileStructure(filteredFileList);
  })
  .catch(error => {
    console.error(error);
    displayFileStructure(fileList);
  });
});

// Add event listener to the user message textarea
const userMessageTextarea = document.getElementById('user-message');
userMessageTextarea.addEventListener('input', () => {
  updateFullMessageContent();
});

const projectDescriptionTextarea = document.getElementById('project-description');
projectDescriptionTextarea.addEventListener('input', () => {
  updateFullMessageContent();
})

const displayGitDiffResponse = (response) => {
  const gitDiffResponse = document.getElementById('model-git-diff-response');
  gitDiffResponse.value = response;
};

const displayGitDiffTokenCounts = (response) => {
  const tokenCountElement = document.getElementById('git-diff-response-token-count');
  const { prompt_tokens, completion_tokens, total_tokens } = response.usage;
  tokenCountElement.textContent = `Prompt Tokens: ${prompt_tokens}, Completion Tokens: ${completion_tokens}, Total Tokens: ${total_tokens}`;
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
        model: 'gpt-4',
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
        displayTokenCounts(data);
        return data.choices[0].message.content;
      } catch (error) {
        throw new Error(`Request failed! ${error.message}`);
      }
  };

const convertChangeRequestToGitDiff = async () => {
  const apiKey = apiKeyInput.value;
  const projectDescription = document.getElementById('project-description').value;
  const modelResponse = document.getElementById('model-response').value;
  const convertSystemMessage = document.getElementById('convert-system-message').value;
  const convertUserMessage = document.getElementById('convert-user-message').value;

  const fileEntries = [];

  for (const [file, content] of fileContentMap) {
    const filePath = file.webkitRelativePath || file.path || file.name;
    const fileDelimeter = "```";
    fileEntries.push(`${filePath}:\n${fileDelimeter}\n${content}\n${fileDelimeter}`);
  }
  
  const userMessage = `${projectDescription}\n\n${fileEntries.join('\n\n')}\n\n${modelResponse}\n\n${convertUserMessage}`;
  
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo-16k-0613',
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
    displayGitDiffTokenCounts(data);
    displayGitDiffResponse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error converting change request to git diff:', error);
  } finally {
    convertButton.disabled = false;
  }
};