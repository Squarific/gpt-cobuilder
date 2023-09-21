class FileListController {
  constructor() {
    this.element = document.createElement('pre');
    this.fileContentMap = new Map();
    
    //Create a new Event named 'filechange'
    this.fileChange = new Event('filechange');
  }

  createDOM() {
    const targetDiv = document.createElement("div");

    const refreshButton = document.createElement("button");
    refreshButton.innerText = "Refresh File List";
    
    targetDiv.appendChild(refreshButton);
    targetDiv.appendChild(this.element);

    // refresh the file list when the button is clicked
    refreshButton.addEventListener('click', this.refresh.bind(this));

    this.refresh();

    return targetDiv;
  }

  async refresh() {
    let fileList = await this.getFilesInFolderWithFilter(); 
    this.displayFileStructure(fileList);
    this.element.dispatchEvent(this.fileChange);
  }

  // Replace the original displayFileStructure function
  async displayFileStructure(fileList) {
    this.fileContentMap.clear(); // Add this line to clear fileContentMap
    this.element.textContent = ''; // Clear any previous content

    // Get the selected folder from localStorage
    const savedFolder = localStorage.getItem('folder');

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      let filePath = file.path;

      if (savedFolder) {
        // Display only the path relative to the selected folder
        filePath = path.relative(savedFolder, filePath);
      }

      // Add UI for every file
      await this.addFileUI(filePath, file);
    }
  }

  async getFilesInFolderWithFilter() {
    const filePaths = await window.fs.getFilesInDirectory(localStorage.getItem('folder'));
    const fileEntries = filePaths.map(filePath => ({name: path.basename(filePath), path: filePath}));
    return await this.filterFilesByGitignore(fileEntries);
  }

  async filterFilesByGitignore(fileList) {
    let fileListArray = Array.from(fileList);

    try {
        // Find the .gitignore file in the fileListArray
        const gitignoreFile = fileListArray.find(file => file.path.endsWith('.gitignore'));
        if (!gitignoreFile) {
        return fileListArray;
        }

        // Read the .gitignore file content
        const gitignoreContent = (await window.fs.readFile(gitignoreFile.path)) + "\n.git/";
        const gitignore = gitignoreParser.compile(gitignoreContent);

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
  
  async addFileUI(filePath, file) {
    const fileEntry = document.createElement('div');
    fileEntry.className = 'file-entry';

    // Create checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = Math.random() + "-checkbox";

    checkbox.addEventListener('change', async () => {
      if (checkbox.checked) {
        const content = await window.fs.readFile(file.path);
        this.fileContentMap.set(file, content);
      } else {
        this.fileContentMap.delete(file);
      }
      
      this.element.dispatchEvent(this.fileChange);
    });

    // Create label for checkbox
    const label = document.createElement('label');
    label.textContent = filePath;
    label.setAttribute("for", checkbox.id);

    fileEntry.appendChild(checkbox);
    fileEntry.appendChild(label);
    
    this.element.appendChild(fileEntry);
  }
}