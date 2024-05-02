const { contextBridge, ipcRenderer } = require('electron');
const { exec } = require('child_process');

const { getEncoding } = require("js-tiktoken");
const enc = getEncoding("cl100k_base");

const parser = require("@gerhobbelt/gitignore-parser");

const OpenAI = require('openai');
const Groq = require("groq-sdk");

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
  readdir: fs.readdir,
  unlink: fs.unlink,
  watchDirectory: (dirPath, opt, callback) => {
    let watcher;
    try {
      watcher = fsSync.watch(dirPath, opt, (eventType, filename) => {
        if (filename) {
          callback(eventType, filename);
        }
      });
    } catch (error) {
      console.error('Failed to watch directory for changes: ', error);
    }
    return () => {
      if (watcher) watcher.close();
    };
  },
});

contextBridge.exposeInMainWorld('path', {
  basename: path.basename,
  dirname: path.dirname,
  relative: path.relative
});

contextBridge.exposeInMainWorld('tiktoken', {
  countTokens: async (text) => enc.encode(text).length
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

async function gitCommand (directory, command) {
  return new Promise((resolve, reject) => {
    exec(`git -C ${directory} ${command}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`error with git ${command}: ${error.message}`);
        reject(error);
        return;
      }

      if (stderr) {
        console.error(`stderr with git ${command}: ${stderr}`);
      }

      resolve(stdout);
    });
  });
}

contextBridge.exposeInMainWorld('gitCommands', {
  diff: async (directory) => gitCommand(directory, "diff"),
  diffstaged: async (directory) => gitCommand(directory, "diff --staged"),
  status: async (directory) => gitCommand(directory, "status"),
  push: async (directory) => gitCommand(directory, "push"),
  add: async (directory) => gitCommand(directory, "add ."),
  commit: async (directory, commitMessage) => {
      const safeCommitMessage = commitMessage.replace(/"/g, '\\"');
      return gitCommand(directory, `commit -m "${safeCommitMessage}`);
  },
  gitResetLastCommit: async (directory) => gitCommand(directory, `reset --soft HEAD~1`),
  revertLastCommit: async (directory) => gitCommand(directory, `revert HEAD`),
  getHash: async (directory) => gitCommand(directory, `rev-parse HEAD`),
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

    let response = await completionStream.finalChatCompletion();
    response.usage = {
      prompt_tokens: enc.encode(messages[0].content + messages[1].content).length,
      completion_tokens: enc.encode(response.choices[0].message.content).length
    };

    response.usage.total_tokens = response.usage.prompt_tokens + response.usage.completion_tokens;

    return response;
  },
});

contextBridge.exposeInMainWorld('groqApi', {
  chatCompletion: async (apiKey, model, messages, chunkCallback) => {
    const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

    console.log(model, messages);

    var completed = "";

    var a = await groq.chat.completions.create({
      messages,
      model,
      stream: true
    }).then(async (completionStream) => {
      for await (const chunk of completionStream) {
        chunkCallback(chunk);
        completed += chunk.choices[0]?.delta?.content || "";
      }
    });

    console.log("Groq complete", completed);

    let response = { choices: [{ message: { content: completed }}]};
    
    response.usage = {
      prompt_tokens: enc.encode(messages[0].content + messages[1].content).length,
      completion_tokens: enc.encode(response.choices[0].message.content).length
    };

    response.usage.total_tokens = response.usage.prompt_tokens + response.usage.completion_tokens;

    return response;
  },
});