// Get the API key from the HTML input field
const apiKeyInput = document.getElementById('api-key');
const url = 'https://api.openai.com/v1/chat/completions';

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
    fileEntries.push(`Content of ${filePath}:\n${content}`);
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

  const tokenCountElement = document.getElementById('token-count');
  tiktoken.countTokens(fullMessage)
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
  console.log(event.target.files);
  displayFileStructure(fileList);
});

// Add event listener to the user message textarea
const userMessageTextarea = document.getElementById('user-message');
userMessageTextarea.addEventListener('input', () => {
  updateFullMessageContent();
});

const sendMessageToChatGPT = async (message) => {
    const apiKey = apiKeyInput.value;
    const systemMessage = document.getElementById('system-message').value;
    const userMessage = document.getElementById('user-message').value;
  
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-16k-0613',
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
        return data.choices[0].message.content;
      } catch (error) {
        throw new Error(`Request failed! ${error.message}`);
      }
  };