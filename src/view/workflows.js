import { parseFilesResponse } from "./fileResponseParsing.js";

async function addCommitPush (gitMessage) {
  try {
    await window.gitCommands.add(localStorage.getItem("folder"));
    await window.gitCommands.commit(localStorage.getItem("folder"), gptGitMessage);
    await window.gitCommands.push(localStorage.getItem("folder"));
  } catch (error) {
    console.log("Error performing git operations", error);
  }
}

export async function gitUndoLastCommitAndPush() {
  try {
    const directory = localStorage.getItem('folder');
    // Run git revert on the last commit without creating a new commit
    // It should automatically revert the changes made by the last commit
    await window.gitCommands.revertLastCommit(directory);
    // Push the changes after reverting
    await window.gitCommands.push(directory);
    alert('The last commit has been successfully undone and the changes have been pushed.');
  } catch (error) {
    console.error('Error reverting the last commit and pushing:', error);
    alert('An error occurred while reverting the last commit and pushing changes.');
  }
}

export async function applyFileChanges (fileChanges) {
  const parsedFiles = parseFilesResponse(fileChanges);

  for (const file of parsedFiles) {
    try {
      await window.fs.saveFile(file.path, file.content);
      console.log(`Saved file: ${file.path}`);
    } catch (error) {
      console.error(`Error saving file ${file.path}: `, error);
    }
  }

  fileListControllers.foreach((c) => c.refresh());
}
