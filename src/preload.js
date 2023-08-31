// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

const { getEncoding, encodingForModel } = require("js-tiktoken");
const enc = getEncoding("cl100k_base");

const parser = require("gitignore-parser");

const markdownIt = require('markdown-it');
const md = new markdownIt();

const fs = require('fs').promises;
const path = require('path');

async function getFilesInDirectory (dirPath) {
  let filePaths = [];
  const files = await fs.readdir(dirPath, {withFileTypes: true});
  for(const file of files){
    const res = path.resolve(dirPath, file.name);
    if (file.isDirectory()){
      const nestedFiles = await getFilesInDirectory(res);
      filePaths = filePaths.concat(nestedFiles);
    } else filePaths.push(res);
  }
  return filePaths;
}

contextBridge.exposeInMainWorld('fs', {
  readFile: async (filePath) => {
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  },
  getFilesInDirectory
});

contextBridge.exposeInMainWorld('path', {
  basename: path.basename,
  dirname: path.dirname,
  relative: path.relative
});

// Expose the Tokenizer module to the renderer process
contextBridge.exposeInMainWorld('tiktoken', {
  countTokens: async (text) => {
    return enc.encode(text).length;
  }
});

contextBridge.exposeInMainWorld('gitignoreParser', parser);

contextBridge.exposeInMainWorld('mdrender', (text) => {
  return md.render(text);
});

contextBridge.exposeInMainWorld('folderDialog', {
  open: async () => {
    return new Promise((resolve, reject) => {
      ipcRenderer.send('open-folder-dialog');

      ipcRenderer.on('selected-folder', (event, path) => {
        resolve(path);
      });
    });
  }
});