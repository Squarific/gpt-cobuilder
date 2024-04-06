import { FILE_DELIMETER } from "./classes/Constants.js";

const splitInBlocksByDelimiter = (response) => {
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

export const parseFilesResponse = (response) => {
  const files = [];

  // Split the response by the code block delimiter
  const blocks = splitInBlocksByDelimiter(response);

  // Iterate over the blocks, skipping the language specifier
  for(let i = 0; i < blocks.length - 1; i += 2) {
    let linesBeforeCodeBlock = blocks[i].trim().split("\n");
    let path = linesBeforeCodeBlock[linesBeforeCodeBlock.length - 1]; // The line directly before the delimiter

    // Get the file content
    let content = blocks[i + 1];
    files.push({ path, content });
  }
  return files;
};
