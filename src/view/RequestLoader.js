class RequestLoader {
  constructor() {
    // Accessing the calculateCost function from apiOperations
    this.calculateCost = window.calculateCost;  
  }

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

        // Extract the date/time from the file name by removing the file extension first
        const dateTimeString = fileName.split('.')[0].replace(/-/g, ':');
        const cellDateTime = row.insertCell();
        cellDateTime.textContent = new Date(dateTimeString).toLocaleString();

        const cellAgentName = row.insertCell();
        cellAgentName.textContent = requestLog.response.model;

        const cellStatus = row.insertCell();
        cellStatus.textContent = 'DONE'; // Since all requests are considered DONE for now

        const requestContent = requestLog.request.content;
        const responseContent = requestLog.response.choices[0].message.content;
        const finishReason = requestLog.response.choices[0].finish_reason;
        const tokensCount = requestLog.response.usage;
        const cost = this.calculateCost(tokensCount.prompt_tokens, tokensCount.completion_tokens, requestLog.response.model);
        
        const cellContent = row.insertCell();
        const collapsibleSection = this.createCollapsibleSection('View Details', `Request: ${requestContent}\n\nResponse: ${responseContent}`, tokensCount, finishReason, cost);
        cellContent.appendChild(collapsibleSection);
      });
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  }
  
  createCollapsibleSection(title, content, count, reason, cost) {
    const container = document.createElement('div');

    const button = document.createElement('button');
    button.className = 'collapsible';
    button.innerText = title;
    container.appendChild(button);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'collapsible-content';

    const pre = document.createElement('pre');
    pre.textContent = content;
    contentDiv.appendChild(pre);

    const infoDiv = document.createElement('div');
    infoDiv.innerHTML = `<strong>Input Tokens:</strong> ${count.prompt_tokens}, <strong>Completion Tokens:</strong> ${count.completion_tokens}, <strong>Total Tokens:</strong> ${count.total_tokens}, <strong>Cost:</strong> $${cost.toFixed(2)}, <strong>Finish Reason:</strong> ${reason}`;
    contentDiv.appendChild(infoDiv);

    container.appendChild(contentDiv);

    // Add event listener to toggle collapsible content
    button.addEventListener('click', function () {
      this.classList.toggle('active');
      const contentDiv = this.nextElementSibling;
      if (contentDiv.style.display === 'none' || contentDiv.style.display === '') {
        contentDiv.style.display = 'block';
      } else {
        contentDiv.style.display = 'none';
      }
    });

    return container;
  }
}

// Instantiate and call loadRequests on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const requestLoader = new RequestLoader();
  requestLoader.loadRequests();
});

