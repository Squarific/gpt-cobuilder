class RequestLoader {
  async loadRequests() {
    const folder = localStorage.getItem('folder');
    const requestsPath = `${folder}/gptcobuilder/requests`;
    const table = document.getElementById('requests-table');

    try {
      const requestFiles = await window.fs.readdir(requestsPath);
      requestFiles.forEach(async (fileName) => {
        const filePath = `${requestsPath}/${fileName}`;
        const fileContent = await window.fs.readFile(filePath);
        const requestLog = JSON.parse(fileContent);

        const row = table.insertRow();

        const cellAgentName = row.insertCell();
        cellAgentName.textContent = requestLog.response.model;

        // Extract the date/time from the file name by removing the file extension first
        const dateTimeString = fileName.split('.')[0].replace(/-/g, ':');
        const cellDateTime = row.insertCell();
        cellDateTime.textContent = new Date(dateTimeString).toLocaleString();

        const cellStatus = row.insertCell();
        cellStatus.textContent = 'DONE'; // Since all requests are considered DONE for now

        // Make long contents collapsible in the table cell
        const cellContent = row.insertCell();
        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = this.truncateContent(JSON.stringify(requestLog, null, 2));
        contentDiv.addEventListener('click', this.toggleContent.bind(this)); // Bind function to the content div
        cellContent.appendChild(contentDiv);
      });
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  }

  // Function to truncate content for display in the requests table
  truncateContent(content, maxLength = 500) {
    if (content.length <= maxLength) {
      return content;
    }
    return `${content.substring(0, maxLength)}... <span style="color:blue;cursor:pointer;">[more]</span>`;
  }

  // Function to toggle display of full content in table cell
  toggleContent(event) {
    const content = event.target.parentElement.innerText;
    if (content.endsWith('... [more]')) {
      event.target.parentElement.innerHTML = content.replace(' ... [more]', '') +
        ' <span style="color:blue;cursor:pointer;">[less]</span>';
    } else {
      event.target.parentElement.innerHTML = this.truncateContent(content);
    }
  }
}

// Instantiate and call loadRequests on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const requestLoader = new RequestLoader();
  requestLoader.loadRequests();
});
