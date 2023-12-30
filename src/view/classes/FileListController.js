class FileListController {
  constructor() {
    this.element = document.createElement('pre');
    this.fileContentMap = new Map();
    this.fileListMap = new Map();
    this.totalTokenCount = 0;
    this.selectedFiles = new Set();
    
    this.fileChange = new Event('filechange');
    this.allFilesSelected = false;
    this.selectAllButton = null;
    this.isBatchUpdating = false;
  }

  createDOM() {
    const targetDiv = document.createElement("div");

    this.totalTokenLabel = document.createElement("p");
    targetDiv.appendChild(this.totalTokenLabel);
    this.totalTokenLabel.innerText = `Selected files tokens: ${this.totalTokenCount}`;

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
    this.selectedFiles = new Set(Array.from(this.fileContentMap.keys()).map(file => file.path));

    this.element.textContent = '';
    this.totalTokenCount = 0;
    let fileList = await this.getFilesInFolderWithFilter(); 
    this.displayFileStructure(fileList);
    this.element.dispatchEvent(this.fileChange);
  }

  async displayFileStructure(fileList) {
    this.fileContentMap.clear();
    this.fileListMap.clear();
    this.element.textContent = '';

    const savedFolder = localStorage.getItem('folder');

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      let filePath = file.path;

      if (savedFolder) {
        filePath = path.relative(savedFolder, filePath);
      }

      this.fileListMap.set(file.path, file);
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
    checkbox.addEventListener("change", () => this.updateFileSelection(file));
        
    file.checkbox = checkbox;

    if (this.selectedFiles.has(file.path)) {
      checkbox.checked = true;
      await this.updateFileSelection(file);
    }
    
    const label = document.createElement('label');
    label.setAttribute("for", checkbox.id);

    if (file.size > 700) {
      label.classList.add('token-warning');
    }

    if (file.size > 1000) {
      label.classList.add('token-serious-warning');
    }

    label.textContent = `${filePath} (${file.size})`;

    fileEntry.appendChild(checkbox);
    fileEntry.appendChild(label);

    this.element.appendChild(fileEntry);
  }

  async selectFile(file) {
    this.checkbox(file).checked = true;
    await this.updateFileSelection(file);
  }

  async updateFileSelection(file) {
    if (this.checkbox(file).checked) {
        const content = await window.fs.readFile(file.path);
        this.fileContentMap.set(file, content);
    } else {
        this.fileContentMap.delete(file);
    }

    if (!this.isBatchUpdating) {
        this.totalTokenCount = this.calculateTotalTokenCount();
        this.totalTokenLabel.innerText = `Selected files tokens: ${this.totalTokenCount}`;
        this.element.dispatchEvent(this.fileChange);
    }
  }

  async toggleAllFiles() {
    this.allFilesSelected = !this.allFilesSelected;
    await this.setAllFilesSelected(this.allFilesSelected);
    this.selectAllButton.innerText = this.allFilesSelected ? "Deselect All Files" : "Select All Files"; // Update button text
  }

  async setAllFilesSelected(selected) {
    const checkboxes = this.element.querySelectorAll('.file-entry input[type="checkbox"]');
    const updatePromises = [];

    for (let checkbox of checkboxes) {
      updatePromises.push(this.handleCheckboxChange(checkbox, selected));
    }

    await Promise.all(updatePromises);

    this.totalTokenCount = this.calculateTotalTokenCount();
    this.totalTokenLabel.innerText = `Selected files tokens: ${this.totalTokenCount}`;
    this.allFilesSelected = selected;
    this.selectAllButton.innerText = this.allFilesSelected ? "Deselect All Files" : "Select All Files";
    this.element.dispatchEvent(this.fileChange);
  }

  async setFromContentMap(contentMap) {
    // This will prevent firing events for each file selection during batch updates
    this.isBatchUpdating = true;

    await this.setAllFilesSelected(false);

    for (let file of contentMap.keys()) {
      const ourFile = this.findFileInMap(file.path);
      if (ourFile) {
        await this.selectFile(ourFile);
      }
    }

    this.totalTokenCount = this.calculateTotalTokenCount();
    this.totalTokenLabel.innerText = `Selected files tokens: ${this.totalTokenCount}`;
    
    // Now that batch updating is done, reset the flag and fire the event once
    this.isBatchUpdating = false;
    this.element.dispatchEvent(this.fileChange);
  }

  async handleCheckboxChange(checkbox, selected) {
    return new Promise(async (resolve) => {
      checkbox.checked = selected;
      const filePath = checkbox.getAttribute('data-filepath');
      const file = this.fileListMap.get(filePath);
      if (selected) {
        const content = await window.fs.readFile(file.path);
        this.fileContentMap.set(file, content);
      } else {
        this.fileContentMap.delete(file);
      }
      resolve();
    });
  }

  findFileInMap(filePath) {
    return this.fileListMap.get(filePath);
  }

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
