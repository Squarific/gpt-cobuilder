// Function to display file structure
const displayFileStructure = (fileList, element) => {
    fileContentMap.clear(); // Add this line to clear fileContentMap
    element.textContent = ''; // Clear any previous content
  
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
  
      element.appendChild(fileEntry);
    }
  };
  
// Read the content of a file
const readFileContent = async (file) => {
  return await window.fs.readFile(file.path);
};

// Function to save HTTP request and response to a file
async function logRequestAndResponse(apiKey, model, role, content, response) {
  try {
    const currentTime = new Date(); // Get current date and time
    let formattedTime = toLocalISOString(currentTime); // Format the time in the required format
    formattedTime = formattedTime.replace(/:/g, '-'); // Replace colons with dashes
    const filename = `${localStorage.getItem('folder')}/gptcobuilder/requests/${formattedTime}.txt`; // Form the filename
    
    const fileContent = {};
    fileContent['request'] = {apiKey, model, role, content};
    fileContent['response'] = response;

    // Save the request and response to the file
    await window.fs.saveFile(filename, JSON.stringify(fileContent, null, 2)); // The second argument of JSON.stringify is a replacer function which we don't need and the third argument is the number of spaces for indentation
    console.log(`Request and response logged to ${filename}`);
  } catch (error) {
    console.error('Error logging request and response: ', error);
  }
}
  
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

async function updateFolder (folder) {
  if (folder) {
    localStorage.setItem('folder', folder);
    document.getElementById('folder-display').textContent = ` Selected Folder: ${folder}`;

    const dirPath = `${folder}/gptcobuilder`;
    if(!await fs.exists(dirPath)){
      await fs.mkdir(dirPath);
    }

    const dirPathRequests = `${folder}/gptcobuilder/requests`;
    if(!await fs.exists(dirPathRequests)){
      await fs.mkdir(dirPathRequests);
    }
    
    // Update the file list
    let filteredFileList = await getFilesInFolderWithFilter(folder);
    displayFileStructure(filteredFileList, document.getElementById('file-structure'));

    // Load the projectDescription
    const projectDescriptionFilePath = `${folder}/gptcobuilder/project_description.txt`;
    const projectDescription = await window.fs.readFile(projectDescriptionFilePath);
    document.getElementById('project-description').value = projectDescription;

    // Load the settings
    const settings = await loadSettings();
    if (settings && settings.modelSelection) {
        document.getElementById('model-selection').value = settings.modelSelection;
    }
  }
};

async function getFilesInFolderWithFilter(folder) {
  const filePaths = await window.fs.getFilesInDirectory(folder);
  const fileEntries = filePaths.map(filePath => ({name: path.basename(filePath), path: filePath}));
  return await filterFilesByGitignore(fileEntries);
}

async function saveSettings(settings) {
    const settingsFilePath = `${localStorage.getItem('folder')}/gptcobuilder/settings.json`;
    try {
        await window.fs.saveFile(settingsFilePath, JSON.stringify(settings, null, 2));
    } catch (error) {
        console.error('Error saving settings file:', error);
    }
}

async function loadSettings() {
    const settingsFilePath = `${localStorage.getItem('folder')}/gptcobuilder/settings.json`;
    try {
        const settingsJSON = await window.fs.readFile(settingsFilePath);
        return JSON.parse(settingsJSON);
    } catch (error) {
        console.error('Error loading settings file:', error);
    }
    return null;
}
