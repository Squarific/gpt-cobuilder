class FileListController {
  constructor(alreadySelected) {
    this.fileListMap = new Map();
    this.totalTokenCount = 0;
    this.selectedFiles = new Set();

    alreadySelected = alreadySelected || [];
    this.fileContentMap = new Map(alreadySelected.map((f) => [{ path: f}, ""]));
    
    this.allFilesSelected = false;
    this.selectAllButton = null;
  }

  createDOM() {
    const targetDiv = document.createElement("div");
    targetDiv.className = "filelist";

    this.totalTokenLabel = document.createElement("label");
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

    this.selectedFilesElement = targetDiv.appendChild(document.createElement('pre'));

    var details = targetDiv.appendChild(elementFromHTML(`
      <details>
        <summary>Unselected files</summary>
      </details>
    `));
    this.unSelectedFilesElement = details.appendChild(document.createElement('pre'));

    this.refresh();

    return targetDiv;
  }

  async refresh() {
    this.selectedFiles = new Set(Array.from(this.fileContentMap.keys()).map(file => file.path));

    this.selectedFilesElement.textContent = '';
    this.unSelectedFilesElement.textContent = '';
    this.totalTokenCount = 0;
    let fileList = await this.getFilesInFolderWithFilter(); 
    this.displayFileStructure(fileList);
  }

  async displayFileStructure(fileList) {
    this.fileContentMap.clear();
    this.fileListMap.clear();
    this.selectedFilesElement.textContent = '';
    this.unSelectedFilesElement.textContent = '';

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

    if (checkbox.checked) {
      this.selectedFilesElement.appendChild(fileEntry);
    } else {
      this.unSelectedFilesElement.appendChild(fileEntry);
    }
  }

  async selectFile(file) {
    file.checkbox.checked = true;
    await this.updateFileSelection(file);
  }

  async updateFileSelection(file) {
    this.handleCheckboxChange(file.checkbox, file.checkbox.checked);
    this.totalTokenCount = this.calculateTotalTokenCount();
    this.totalTokenLabel.innerText = `Selected files tokens: ${this.totalTokenCount}`;
  }

  async toggleAllFiles() {
    this.allFilesSelected = !this.allFilesSelected;
    await this.setAllFilesSelected(this.allFilesSelected);
    this.selectAllButton.innerText = this.allFilesSelected ? "Deselect All Files" : "Select All Files"; // Update button text
  }

  async setAllFilesSelected(selected) {
    let checkboxes;

    if (selected) {
      checkboxes = this.unSelectedFilesElement.querySelectorAll('.file-entry input[type="checkbox"]');
    } else {
      checkboxes = this.selectedFilesElement.querySelectorAll('.file-entry input[type="checkbox"]');
    }

    const updatePromises = [];

    for (let checkbox of checkboxes) {
      updatePromises.push(this.handleCheckboxChange(checkbox, selected));
    }

    await Promise.all(updatePromises);

    this.totalTokenCount = this.calculateTotalTokenCount();
    this.totalTokenLabel.innerText = `Selected files tokens: ${this.totalTokenCount}`;
    this.allFilesSelected = selected;
    this.selectAllButton.innerText = this.allFilesSelected ? "Deselect All Files" : "Select All Files";
  }

  async setFromContentMap(contentMap) {
    await this.setAllFilesSelected(false);

    for (let file of contentMap.keys()) {
      const ourFile = this.findFileInMap(file.path);
      if (ourFile) {
        await this.selectFile(ourFile);
      }
    }

    this.totalTokenCount = this.calculateTotalTokenCount();
    this.totalTokenLabel.innerText = `Selected files tokens: ${this.totalTokenCount}`;
  }

  async handleCheckboxChange(checkbox, selected) {
    return new Promise(async (resolve) => {
      var fileEntry = checkbox.parentNode;
      if (fileEntry) fileEntry.parentNode.removeChild(fileEntry);

      checkbox.checked = selected;
      const filePath = checkbox.getAttribute('data-filepath');
      const file = this.fileListMap.get(filePath);
      if (selected) {
        const content = await window.fs.readFile(file.path);
        this.fileContentMap.set(file, content);
        if (fileEntry) this.selectedFilesElement.appendChild(fileEntry);
      } else {
        this.fileContentMap.delete(file);
        if (fileEntry) this.unSelectedFilesElement.appendChild(fileEntry);
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
}
