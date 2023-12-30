const projectDescriptionTextarea = document.getElementById('project-description');
projectDescriptionTextarea.addEventListener('input', async () => {
  const projectDescription = projectDescriptionTextarea.value;
  const folderPath = localStorage.getItem('folder');
  const dirPath = `${folderPath}/${GPT_COBUILDER_FOLDER_NAME}`;
  const projectDescriptionFilePath = `${folderPath}/${PROJECT_DESCRIPTION_FILE}`;

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
});

async function loadExamples() {
  try {
    if (await fs.exists(EXAMPLE_DIRECTORY)) {
      const exampleFiles = await fs.readdir(EXAMPLE_DIRECTORY);
      for (const file of exampleFiles) {
        const filePath = EXAMPLE_DIRECTORY + "/" + file;
        const fileContent = await fs.readFile(filePath);
        const exampleOption = document.createElement('option');
        exampleOption.value = fileContent;
        exampleOption.innerText = fileContent;
        document.getElementById('change-request-examples').appendChild(exampleOption);
      }
    }
  } catch (error) {
    console.error("Failed to load examples: ", error);
  }
}

window.addEventListener('DOMContentLoaded', async () => {
    loadExamples();
  
    // Make the fileListController global so it can be accessed in Agent.js
    window.fileListController = new FileListController(); 
    const fileListElement = window.fileListController.createDOM();
    const fileListContainer = document.getElementById('file-list');
    
    fileListContainer.appendChild(fileListElement);
});
  