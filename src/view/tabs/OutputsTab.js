async function createOutputsTab() {
  const outputsTab = document.getElementById('Outputs');
  outputsTab.innerHTML = `
    <h2>Saved Outputs:</h2>
    <div id="saved-outputs-container"></div>

    <h2>Apply File Changes:</h2>
    <div id="file-changes-container"></div>
    
    <div id="custom-buttons">
      <button class="button" id="apply-button">Apply generated file changes</button>
      <button class="button" id="git-operation-button">
        Perform git add, commit (with outputs.GPT_COMMIT_MESSAGE) and push
      </button>
      <button class="button" id="git-undo-last-commit-button">
        Undo last commit and push
      </button>
    </div>
  `;

  document.getElementById('apply-button').addEventListener('click', applyFileChanges);
  document.getElementById('git-operation-button').addEventListener('click', gitOperations);
  document.getElementById('git-undo-last-commit-button').addEventListener('click', gitUndoLastCommitAndPush);
}

createOutputsTab();