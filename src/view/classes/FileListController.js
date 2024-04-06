import { elementFromHTML } from "../utils.js";

export let fileListControllers = [];

export class FileListController {
  constructor(alreadySelected = []) {
    fileListControllers.push(this);

    //"path" => new File()
    this.fileListMap = new Map();
    
    //"path" => new File()
    this.selectedFiles = new Set();

    //new file() => "contentoffile"
    this.fileContentMap = new Map(alreadySelected.map((f) => [{ path: f}, ""]));
    
    this.allFilesSelected = false;
    this.selectAllButton = null;
  }

  createDOM() {
    const targetDiv = elementFromHTML(`
      <div class="filelist">
        <label>Selected files tokens: 0</label>
        <button class="button selectall">Select All Files</button>
        <button class="button refresh">Refresh File List</button>
        <div class="selectedfiles"></div>
        <details>
          <summary>Unselected files</summary>
          <div class="unselectedfiles"></div>
        </details>
      </div>
    `);

    this.totalTokenLabel = targetDiv.querySelector("label");
    this.selectAllButton = targetDiv.querySelector(".selectall");
    this.selectAllButton.addEventListener('click', this.toggleAllFiles.bind(this));
    targetDiv.querySelector(".refresh").addEventListener('click', this.refresh.bind(this));

    this.selectedFilesElement = targetDiv.querySelector(".selectedfiles");
    this.unSelectedFilesElement = targetDiv.querySelector(".unselectedfiles");

    this.refresh();

    return targetDiv;
  }

  async refresh() {
    // Cache selected files
    this.selectedFiles = new Set(Array.from(this.fileContentMap.keys()).map(file => file.path));
    this.selectedFilesElement.innerHTML = '';
    this.unSelectedFilesElement.innerHTML = '';
    this.displayFileStructure(await this.getFilesInFolderWithFilter());
  }

  async displayFileStructure(fileList) {
    this.fileContentMap.clear();
    this.fileListMap.clear();
    this.selectedFilesElement.innerHTML = '';
    this.unSelectedFilesElement.innerHTML = '';

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

        for (let k = 0; k < gitIgnoredFiltered.length; k++) {
          let content = await window.fs.readFile(gitIgnoredFiltered[k].path);
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
    const id = Math.random() + "-checkbox";
    const warningClasses = file.size > 1000 ? 'class="token-serious-warning"' : file.size > 700 ? 'class="token-warning"' : '';

    const fileEntry = elementFromHTML(`
      <div class="file-entry">
        <input id="${id}" ${this.selectedFiles.has(file.path) ? "checked" : ""} type="checkbox" data-filepath="${file.path}"/>
        <label for="${id}" ${warningClasses}>${filePath} (${file.size})</label>
      </div>
    `);

    file.checkbox = fileEntry.querySelector("input");
    file.checkbox.addEventListener("change", () => this.updateFileSelection(file));

    if (this.selectedFiles.has(file.path)) {
      this.selectedFilesElement.appendChild(fileEntry);
      this.updateFileSelection(file);
    } else {
      this.unSelectedFilesElement.appendChild(fileEntry);
    }
  }

  async selectFile(file) {
    file.checkbox.checked = true;
    await this.updateFileSelection(file);
  }

  async updateFileSelection(file) {
    await this.setCheckboxSelected(file.checkbox, file.checkbox.checked);
    this.totalTokenLabel.innerText = `Selected files tokens: ${this.calculateTotalTokenCount()}`;
  }

  async toggleAllFiles() {
    this.allFilesSelected = !this.allFilesSelected;
    await this.setAllFilesSelected(this.allFilesSelected);
    this.selectAllButton.innerText = this.allFilesSelected ? "Deselect All Files" : "Select All Files";
  }

  async setAllFilesSelected(selected) {
    let checkboxes;

    if (selected) {
      checkboxes = this.unSelectedFilesElement.querySelectorAll('.file-entry input[type="checkbox"]');
    } else {
      checkboxes = this.selectedFilesElement.querySelectorAll('.file-entry input[type="checkbox"]');
    }

    await Promise.all(Array.from(checkboxes).map(checkbox => this.setCheckboxSelected(checkbox, selected)));

    this.totalTokenLabel.innerText = `Selected files tokens: ${this.calculateTotalTokenCount()}`;
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

    this.totalTokenLabel.innerText = `Selected files tokens: ${this.calculateTotalTokenCount()}`;
  }

  async setCheckboxSelected(checkbox, selected) {
    let fileEntry = checkbox.parentNode;
    if (fileEntry) fileEntry.parentNode.removeChild(fileEntry);

    checkbox.checked = selected;
    const filePath = checkbox.getAttribute('data-filepath');
    const file = this.fileFromFilePath(filePath);

    if (selected) {
      if (fileEntry) this.selectedFilesElement.appendChild(fileEntry);
      const content = await window.fs.readFile(file.path);
      this.fileContentMap.set(file, content);
    } else {
      this.fileContentMap.delete(file);
      if (fileEntry) this.unSelectedFilesElement.appendChild(fileEntry);
    }
  }

  fileFromFilePath(filePath) {
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
