// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');
const { exec } = require('child_process');

const { getEncoding } = require("js-tiktoken");
const enc = getEncoding("cl100k_base");

const parser = require("@gerhobbelt/gitignore-parser");

const OpenAI = require('openai');

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
          console.error(`error with git diff: ${error.message}`);
          reject(error);
        }
        if (stderr) {
          console.error(`stderr with git diff: ${stderr}`);
        }
        resolve(stdout);
      });
    });
  },
  gitStatus: async (directory) => {
    return new Promise((resolve, reject) => {
      exec(`git -C ${directory} status`, (error, stdout, stderr) => {
        if (error) {
          console.error(`error with git status: ${error.message}`);
          reject(error);
        }
        if (stderr) {
          console.error(`stderr with git status: ${stderr}`);
        }
        resolve(stdout);
      });
    });
  },
  gitPush: async (directory) => {
    return new Promise((resolve, reject) => {
      exec(`git -C ${directory} push`, (error, stdout, stderr) => {
        if (error) {
          console.error(`error with git push: ${error.message}`);
          reject(error);
        }
        if (stderr) {
          console.error(`stderr with git push: ${stderr}`);
        }
        resolve(stdout);
      });
    });
  },
  gitAdd: async (directory) => {
    return new Promise((resolve, reject) => {
      exec(`git -C ${directory} add .`, (error, stdout, stderr) => {
        if (error) {
          console.error(`error with git add: ${error.message}`);
          reject(error);
        }
        if (stderr) {
          console.error(`stderr with git add: ${stderr}`);
        }
        resolve(stdout);
      });
    });
  },
  gitCommit: async (directory, commitMessage) => {
    return new Promise((resolve, reject) => {
      const safeCommitMessage = commitMessage.replace(/"/g, '\\"');
      exec(`git -C ${directory} commit -m "${safeCommitMessage}"`, (error, stdout, stderr) => {
        if (error) {
          console.error(`error with git commit: ${error.message}`);
          reject(error);
        }
        if (stderr) {
          console.error(`stderr with git commit: ${stderr}`);
        }
        resolve(stdout);
      });
    });
  },
  gitResetLastCommit: async (directory) => {
    return new Promise((resolve, reject) => {
      exec(`git -C ${directory} reset --soft HEAD~1`, (error, stdout, stderr) => {
        if (error) {
          console.error(`error with git reset: ${error.message}`);
          reject(error);
        }
        if (stderr) {
          console.error(`stderr with git reset: ${stderr}`);
        }
        resolve(stdout);
      });
    });
  },
  gitRevertLastCommit: async (directory) => {
    return new Promise((resolve, reject) => {
      exec(`git -C ${directory} revert HEAD`, (error, stdout, stderr) => {
        if (error) {
          console.error(`error with git revert HEAD: ${error.message}`);
          reject(error);
        }
        if (stderr) {
          console.error(`stderr with git revert HEAD: ${stderr}`);
        }
        resolve(stdout);
      });
    });
  },
});

contextBridge.exposeInMainWorld('openAiNpmApi', {
  chatCompletion: async (apiKey, model, messages, chunkCallback) => {
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

    const completionStream = await openai.beta.chat.completions.stream({
      model: model,
      messages: messages,
      stream: true,
    });

    for await (const chunk of completionStream) {
      chunkCallback(chunk);
    }

    var response = await completionStream.finalChatCompletion();
    response.usage = {
      prompt_tokens: enc.encode(messages[0].content + messages[1].content).length,
      completion_tokens: enc.encode(response.choices[0].message.content).length
    };

    response.usage.total_tokens = response.usage.prompt_tokens + response.usage.completion_tokens;

    return response;
  },
});
