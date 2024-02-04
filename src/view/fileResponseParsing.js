const parseBlocks = (response) => {
    let lines = response.split("\n");
    let blocks = [];
    let currentBlock = '';

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith(FILE_DELIMETER)) {
          if (currentBlock !== '') {
              blocks.push(currentBlock);
              currentBlock = '';
          }
      } else {
          currentBlock += lines[i] + "\n";
      }
    }

    if (currentBlock !== '') blocks.push(currentBlock);

    return blocks;
};

const parseFilesResponse = (response) => {
  const files = [];

  // Split the response by the code block delimiter
  const blocks = parseBlocks(response);

  // Iterate over the blocks, skipping the language specifier
  for(let i = 0; i < blocks.length - 1; i += 2) {
    // Get the file path
    let path = blocks[i].trim().split("\n");
    path = path[path.length - 1]; // Only the line directly before the delimiter

    // Get the file content
    let content = blocks[i + 1];

    // Add the file to the list
    files.push({ path, content });
  }
  return files;
};
