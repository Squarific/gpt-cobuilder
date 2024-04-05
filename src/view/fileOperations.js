const formattedTime = () => {
  const currentTime = new Date();
  const tzOffset = currentTime.getTimezoneOffset() * 60000;
  const localDate = new Date(currentTime - tzOffset);
  return localDate.toISOString().split('.')[0].replace(/:/g, '-');
};

export async function logRequestAndResponse(request, response) {
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

export async function createFilechangesProposalFile (filechanges) {
  const dirPath = `${localStorage.getItem('folder')}/gptcobuilder/filechangesproposals`;
  const content = `File changes proposal:
${filechanges}`;

  await window.fs.saveFile(`${dirPath}/${formattedTime()}.txt`, content);
}

export async function createChangeRequestFile (changerequest, selectedfiles) {
  const dirPath = `${localStorage.getItem('folder')}/gptcobuilder/userchangerequests`;
  const commitHash = (await window.gitCommands.getHash(localStorage.getItem('folder'))).split("\n")[0];
  const content = `Files (${commitHash}):
${selectedfiles.map((f) => "- " + path.relative(localStorage.getItem('folder'), f.path)).join('\n')}

Change request:
${changerequest}`;

  await window.fs.saveFile(`${dirPath}/${formattedTime()}.txt`, content);
}

export async function createHighLevelChangeRequestFile (response, selectedFiles) {
  const dirPath = `${localStorage.getItem('folder')}/gptcobuilder/highlevelchangerequests`;
  const commitHash = (await window.gitCommands.getHash(localStorage.getItem('folder'))).split("\n")[0];
  const content = `Files (${commitHash}):
${selectedFiles.map((f) => "- " + path.relative(localStorage.getItem('folder'), f.path)).join('\n')}

High level change request:
${response}`;

  await window.fs.saveFile(`${dirPath}/${formattedTime()}.txt`, content);
}

export async function updateFolder (folder) {
  if (folder) {
    localStorage.setItem('folder', folder);
    $('#folder-display').innerText = ` Selected Folder: ${folder}`;

    const dirs = [
      `${folder}/gptcobuilder`,
      `${folder}/gptcobuilder/requests`,
      `${folder}/gptcobuilder/userchangerequests`,
      `${folder}/gptcobuilder/highlevelchangerequests`,
      `${folder}/gptcobuilder/filechangesproposals`,
    ];

    dirs.forEach(async (dir) => {
      if(!await fs.exists(dir)) {
        await fs.mkdir(dir);
      }
    });
    
    // Load the projectDescription
    if ($('#project-description')) {
      const projectDescriptionFilePath = `${folder}/gptcobuilder/project_description.txt`;
      const projectDescription = await window.fs.readFile(projectDescriptionFilePath);
      $('#project-description').value = projectDescription;
    }

    // Load the settings
    const settings = await loadSettings();
    if (settings && settings.modelSelection) {
        $('#model-selection').value = settings.modelSelection;
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

export async function filterFilesByGitignore(fileList) {
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

export async function getFilesInFolderWithFilter(folder) {
  const filePaths = await window.fs.getFilesInDirectory(folder);
  const fileEntries = filePaths.map(filePath => ({name: path.basename(filePath), path: filePath}));
  return await filterFilesByGitignore(fileEntries);
}

export async function saveSettings(settings) {
    const settingsFilePath = `${localStorage.getItem('folder')}/gptcobuilder/settings.json`;
    try {
        await window.fs.saveFile(settingsFilePath, JSON.stringify(settings, null, 2));
    } catch (error) {
        console.error('Error saving settings file:', error);
    }
}

export async function loadSettings() {
    const settingsFilePath = `${localStorage.getItem('folder')}/gptcobuilder/settings.json`;
    try {
        const settingsJSON = await window.fs.readFile(settingsFilePath);
        return JSON.parse(settingsJSON);
    } catch (error) {
        console.error('Error loading settings file:', error);
    }
    return null;
}

