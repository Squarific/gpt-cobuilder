async function updateFileList(targetElementId, fileChanges) {
    let listContainer = document.getElementById(targetElementId);
    listContainer.innerHTML = '';

    let parsedFiles = parseResponse(fileChanges);
    for (const file of parsedFiles) {
      let listItem = document.createElement('li');

      let fileContent;
      try {
        fileContent = await window.fs.readFile(file.path);
        tokenCount = await window.tiktoken.countTokens(fileContent);
      } catch (error) {
        fileContent = '';
        tokenCount = 0;
      }

      listItem.textContent = `File path: ${file.path} Current length: ${tokenCount} New Length: ${await window.tiktoken.countTokens(file.content)}`;

      listContainer.appendChild(listItem);
    }
}
