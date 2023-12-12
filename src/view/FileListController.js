class FileListController {
  constructor() {
    this.element = document.createElement('pre');
    this.fileContentMap = new Map(); // to hold selected files
    this.fileListMap = new Map(); // to hold all files
    this.totalTokenCount = 0;
    this.selectedFiles = new Set(); // to hold selected files paths
    
    //Create a new Event named 'filechange'
    this.fileChange = new Event('filechange');
    
    // New state variable to track whether all files are selected
    this.allFilesSelected = false;

    // Select all button reference
    this.selectAllButton = null;
  }

  createDOM() {
    const targetDiv = document.createElement("div");

    this.totalTokenLabel = document.createElement("p");
    targetDiv.appendChild(this.totalTokenLabel);
    this.totalTokenLabel.innerText = `Selected files tokens: ${this.totalTokenCount}`;

    // Reference to the select all button is stored
    this.selectAllButton = document.createElement("button");
    this.selectAllButton.innerText = "Select All Files";
    this.selectAllButton.className = "button";
    this.selectAllButton.addEventListener('click', this.toggleAllFiles.bind(this));
    targetDiv.appendChild(this.selectAllButton);
    
    const refreshButton = document.createElement("button");
    refreshButton.innerText = "Refresh File List";
    refreshButton.className = "button";
    refreshButton.addEventListener('click', this.refresh.bind(this));
    targetDiv.appendChild(refreshButton);

    targetDiv.appendChild(this.element);

    this.refresh();

    return targetDiv;
  }

  async refresh() {
    // Remember the selected files 
    this.selectedFiles = new Set(Array.from(this.fileContentMap.keys()).map(file => file.path));

    this.element.textContent = '';
    this.totalTokenCount = 0;
    let fileList = await this.getFilesInFolderWithFilter(); 
    this.displayFileStructure(fileList);
    this.element.dispatchEvent(this.fileChange);
  }

  async displayFileStructure(fileList) {
    this.fileContentMap.clear();
    this.fileListMap.clear(); // clear out any old entries
    this.element.textContent = '';

    const savedFolder = localStorage.getItem('folder');

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      let filePath = file.path;

      if (savedFolder) {
        filePath = path.relative(savedFolder, filePath);
      }

      this.fileListMap.set(file.path, file); // store file in fileListMap
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
        const gitignoreFile = fileListArray.find(file => file.path.endsWith('.gitignore'));
        if (!gitignoreFile) {
        return fileListArray;
        }

        const gitignoreContent = (await window.fs.readFile(gitignoreFile.path)) + "\n.git/";
        const gitignore = gitignoreParser.compile(gitignoreContent);

        const gitIgnoredFiltered = fileListArray.filter(file => {
          const normalizedFilePath = path.relative(path.dirname(gitignoreFile.path), file.path).replaceAll("\\", "/");
          return gitignore.accepts(normalizedFilePath);
        });

        for (var k = 0; k < gitIgnoredFiltered.length; k++) {
          var content = await window.fs.readFile(gitIgnoredFiltered[k].path);
          if (content.length > 16192) continue;
          gitIgnoredFiltered[k].size = await tiktoken.countTokens(content);
        }
        
        return gitIgnoredFiltered.filter(file => file.size < 8096);
    } catch (error) {
        console.error('Error reading .gitignore:', error);
        return fileListArray;
    }
  }

  async addFileUI(filePath, file) {
    const fileEntry = document.createElement("div");
    fileEntry.className = "file-entry";

    const checkbox = document.createElement("input");
    checkbox.setAttribute("data-filepath", file.path);
    checkbox.id = Math.random() + "-checkbox";
    checkbox.type = "checkbox";
    checkbox.addEventListener("change", () => this.updateFileSelection(file)); //update event listener
        
    file.checkbox = checkbox; // store checkbox element in file object for future reference

    // Check if the file was previously selected
    if (this.selectedFiles.has(file.path)) {
      checkbox.checked = true; // Restore the checkbox state
      await this.updateFileSelection(file); // Handle the file selection
    }
    
    const label = document.createElement('label');
    label.setAttribute("for", checkbox.id);

    if (file.size > 1024) {
      label.classList.add('token-warning');
    }

    if (file.size > 2048) {
      label.classList.add('token-serious-warning');
    }

    label.textContent = `${filePath} (${file.size})`;

    fileEntry.appendChild(checkbox);
    fileEntry.appendChild(label);

    this.element.appendChild(fileEntry);
  }

  // Function to select a file
  async selectFile(file) {
    this.checkbox(file).checked = true;
    await this.updateFileSelection(file);
  }

  // Function to deselect a file
  async deselectFile(file) {
    this.checkbox(file).checked = false;
    await this.updateFileSelection(file);
  }

  async updateFileSelection(file) {
    if (this.checkbox(file).checked) {
        const content = await window.fs.readFile(file.path);
        this.fileContentMap.set(file, content);
    } else {
        this.fileContentMap.delete(file);
    }

    this.totalTokenCount = this.calculateTotalTokenCount();
    this.totalTokenLabel.innerText = `Selected files tokens: ${this.totalTokenCount}`;
    this.element.dispatchEvent(this.fileChange);
  }
  async handleCheckboxChange(checkbox, selected) {
    return new Promise(async (resolve) => {
      checkbox.checked = selected;
      const filePath = checkbox.getAttribute('data-filepath');
      const file = this.fileListMap.get(filePath);
      if (selected) {
        const content = await window.fs.readFile(file.path);
        this.fileContentMap.set(file, content); // Set file content in fileContentMap
      } else {
        this.fileContentMap.delete(file); // Remove file from fileContentMap
      }
      resolve();
    });
  }

  // Function to toggle all files selection
  async toggleAllFiles() {
    this.allFilesSelected = !this.allFilesSelected;
    await this.setAllFilesSelected(this.allFilesSelected);
    this.selectAllButton.innerText = this.allFilesSelected ? "Deselect All Files" : "Select All Files"; // Update button text
  }

  // Function to select all files in the file list
  async selectAllFiles() {
    await this.setAllFilesSelected(true);
  }

  async deselectAllFiles() {
    await this.setAllFilesSelected(false);
  }

  async setAllFilesSelected(selected) {
    const checkboxes = this.element.querySelectorAll('.file-entry input[type="checkbox"]');
    const updatePromises = [];

    for (let checkbox of checkboxes) {
      updatePromises.push(this.handleCheckboxChange(checkbox, selected));
    }

    // Wait for all the change handling promises to resolve before updating totals
    await Promise.all(updatePromises);

    this.totalTokenCount = this.calculateTotalTokenCount();
    this.totalTokenLabel.innerText = `Selected files tokens: ${this.totalTokenCount}`;
    this.allFilesSelected = selected;
    this.selectAllButton.innerText = this.allFilesSelected ? "Deselect All Files" : "Select All Files";
    this.element.dispatchEvent(this.fileChange);
  }

  // Helper method that will find the file in our map based on the file path
  findFileInMap(filePath) {
    return this.fileListMap.get(filePath);
  }

  // Helper method to set selected files from content map
  async setFromContentMap(contentMap) {
    await this.deselectAllFiles();

    for (let file of contentMap.keys()) {
        const ourFile = this.findFileInMap(file.path);
        
        if(ourFile) {
          await this.selectFile(ourFile);
        }
    }
  }

  // Helper method to calculate total token count
  calculateTotalTokenCount() {
    let count = 0;

    for (let fileEntry of this.fileContentMap.keys()) {
      count += fileEntry.size;
    }

    return count;
  } 

  checkbox(file) {
    return file.checkbox;
  }  
}

