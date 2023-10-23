// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');
const { exec } = require('child_process');

const { getEncoding } = require("js-tiktoken");
const enc = getEncoding("cl100k_base");

const parser = require("@gerhobbelt/gitignore-parser");

const markdownIt = require('markdown-it');
const md = new markdownIt();

const fs = require('fs').promises;
const fsSync = require('fs');
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

async function saveFile(filePath, content) {
  await fs.writeFile(filePath, content, 'utf8');
}

contextBridge.exposeInMainWorld('fs', {
  readFile: async (filePath) => {
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  },
  getFilesInDirectory,
  saveFile,
  exists: fsSync.existsSync,
  mkdir: fs.mkdir,
  readdir: fs.readdir
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

contextBridge.exposeInMainWorld('gitCommands', {
  gitDiff: async (directory) => {
    return new Promise((resolve, reject) => {
      exec(`git -C ${directory} diff`, (error, stdout, stderr) => {
        if (error) {
          console.log(`error with git diff: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr with git diff: ${stderr}`);
          return;
        }
        resolve(stdout);
      });
    });
  },
  gitPush: async (directory) => {
    return new Promise((resolve, reject) => {
      exec(`git -C ${directory} push`, (error, stdout, stderr) => {
        if (error) {
          console.log(`error with git push: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr with git push: ${stderr}`);
          return;
        }
        resolve(stdout);
      });
    });
  },
  gitAdd: async (directory) => {
    return new Promise((resolve, reject) => {
      exec(`git -C ${directory} add .`, (error, stdout, stderr) => {
        if (error) {
          console.log(`error with git add: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr with git add: ${stderr}`);
          return;
        }
        resolve(stdout);
      });
    });
  },
  gitCommit: async (directory, commitMessage) => {
    return new Promise((resolve, reject) => {
      exec(`git -C ${directory} commit -m "${commitMessage}"`, (error, stdout, stderr) => {
        if (error) {
          console.log(`error with git commit: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr with git commit: ${stderr}`);
          return;
        }
        resolve(stdout);
      });
    });
  },
});
