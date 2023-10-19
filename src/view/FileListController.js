
class FileListController {
  constructor() {
    this.element = document.createElement('pre');
    this.fileContentMap = new Map();
    this.totalTokenCount = 0;
    
    //Create a new Event named 'filechange'
    this.fileChange = new Event('filechange');
  }

  createDOM() {
    const targetDiv = document.createElement("div");

    this.totalTokenLabel = document.createElement("p");
    targetDiv.appendChild(this.totalTokenLabel);
    this.totalTokenLabel.innerText = `Selected files tokens: ${this.totalTokenCount}`;

    const refreshButton = document.createElement("button");
    refreshButton.innerText = "Refresh File List";
    refreshButton.className = "button";
    
    targetDiv.appendChild(refreshButton);
    targetDiv.appendChild(this.element);

    // refresh the file list when the button is clicked
    refreshButton.addEventListener('click', this.refresh.bind(this));

    this.refresh();

    return targetDiv;
  }

  async refresh() {
    this.element.textContent = '';
    let fileList = await this.getFilesInFolderWithFilter(); 
    this.displayFileStructure(fileList);
    this.element.dispatchEvent(this.fileChange);
  }

  async displayFileStructure(fileList) {
    this.fileContentMap.clear();
    this.element.textContent = '';

    const savedFolder = localStorage.getItem('folder');

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      let filePath = file.path;

      if (savedFolder) {
        filePath = path.relative(savedFolder, filePath);
      }

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
        
        return gitIgnoredFiltered.filter(file => file.size < 4048);
    } catch (error) {
        console.error('Error reading .gitignore:', error);
        return fileListArray;
    }
  }

  async addFileUI(filePath, file) {
    const fileEntry = document.createElement('div');
    fileEntry.className = 'file-entry';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = Math.random() + "-checkbox";
    
    checkbox.addEventListener('change', async () => {
      if (checkbox.checked) {
        const content = await window.fs.readFile(file.path);
        this.fileContentMap.set(file, content);
        this.totalTokenCount += file.size;
      } else {
        this.fileContentMap.delete(file);
        this.totalTokenCount -= file.size;
      }

      this.element.dispatchEvent(this.fileChange);
      this.totalTokenLabel.innerText = `Selected files tokens: ${this.totalTokenCount}`;
    });

    const label = document.createElement('label');
    label.setAttribute("for", checkbox.id);

    if (file.size > 512) {
      label.classList.add('token-warning');
    }

    if (file.size > 1024) {
      label.classList.add('token-serious-warning');
    }

    label.textContent = `${filePath} (${file.size})`;

    fileEntry.appendChild(checkbox);
    fileEntry.appendChild(label);

    this.element.appendChild(fileEntry);
  }
}
