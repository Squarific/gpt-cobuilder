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

        const cellDateTime = row.insertCell();
        cellDateTime.textContent = new Date(fileName.split('.')[0]).toLocaleString();

        const cellStatus = row.insertCell();
        cellStatus.textContent = 'DONE'; // Since all requests are considered DONE for now
      });
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  }
}

// Instantiate and call loadRequests on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const requestLoader = new RequestLoader();
  requestLoader.loadRequests();
});
