const formattedTime = () => {
  const currentTime = new Date();
  const tzOffset = currentTime.getTimezoneOffset() * 60000;
  const localDate = new Date(currentTime - tzOffset);
  return localDate.toISOString().split('.')[0].replace(/:/g, '-');
};

async function logRequestAndResponse(request, response) {
  try {
    const filename = `${localStorage.getItem('folder')}/gptcobuilder/requests/${formattedTime()}.txt`;
    
    const fileContent = {};
    fileContent['request'] = request;
    fileContent['response'] = response;

    await window.fs.saveFile(filename, JSON.stringify(fileContent, null, 2));
    console.log(`Request and response logged to ${filename}`);
  } catch (error) {
    console.error('Error logging request and response: ', error);
  }
}

async function createChangeRequestFile (changerequest, selectedfiles) {
  const dirPath = `${localStorage.getItem('folder')}/gptcobuilder/userchangerequests`;
  
  if(!await fs.exists(dirPath)){
    await fs.mkdir(dirPath);
  }

  var commitHash = await window.gitCommands.gitGetHash(localStorage.getItem('folder'));

  var content = `Files (${commitHash})
- ${selectedfiles.map((f) => f.path.replace(localStorage.getItem('folder'), "")).join('\n- ')}

Change request:
${changerequest}
`;

  await window.fs.saveFile(`${dirPath}/${formattedTime()}.txt`, content);
}

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
    
    // Load the projectDescription
    if (document.getElementById('project-description')) {
      const projectDescriptionFilePath = `${folder}/gptcobuilder/project_description.txt`;
      const projectDescription = await window.fs.readFile(projectDescriptionFilePath);
      document.getElementById('project-description').value = projectDescription;
    }

    // Load the settings
    const settings = await loadSettings();
    if (settings && settings.modelSelection) {
        document.getElementById('model-selection').value = settings.modelSelection;
    }

    // Save the new folder as a recent folder
    const recentFolders = JSON.parse(localStorage.getItem('recentFolders')) || [];
    recentFolders.push(folder);
    const uniqueFolders = [...new Set(recentFolders)];
    localStorage.setItem('recentFolders', JSON.stringify(uniqueFolders.slice(-5)));
    
    // Display the new recent folders
    updateRecentFoldersList();
  }
};

async function filterFilesByGitignore(fileList) {
  let fileListArray = Array.from(fileList);

  try {
      // Find the .gitignore file in the fileListArray
      const gitignoreFile = fileListArray.find(file => file.path.endsWith('.gitignore'));
      if (!gitignoreFile) {
      return fileListArray;
      }

      // Read the .gitignore file content
      gitignoreContent = await window.fs.readFile(gitignoreFile.path) + "\n.git/";
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
}

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

