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

        // Additional data columns
        const cellInputTokens = row.insertCell();
        cellInputTokens.textContent = requestLog.response.usage.prompt_tokens;

        const cellCompletionTokens = row.insertCell();
        cellCompletionTokens.textContent = requestLog.response.usage.completion_tokens;

        const cellCost = row.insertCell();
        const cost = this.calculateCostFromResponse(requestLog.response);
        cellCost.textContent = `$${cost}`;

        const cellFinishReason = row.insertCell();
        cellFinishReason.textContent = requestLog.response.choices[0].finish_reason;

        const cellRequestContent = row.insertCell();
        const requestText = requestLog.request.content;
        cellRequestContent.textContent = requestText.substring(Math.max(requestText.length - 100, 0));
        cellRequestContent.classList.add('request-content');
        cellRequestContent.setAttribute('data-request', fileContent);
        
        const cellResponseContent = row.insertCell();
        const responseText = requestLog.response.choices[0].message.content;
        cellResponseContent.textContent = responseText.substring(Math.max(responseText.length - 100, 0));
        cellResponseContent.classList.add('response-content');
        cellResponseContent.setAttribute('data-response', JSON.stringify(requestLog.response, null, 2));
        
        cellRequestContent.addEventListener('click', this.showModal);
        cellResponseContent.addEventListener('click', this.showModal);
      });
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  }

  calculateCostFromResponse(response) {
    const model = response.model;
    const inputTokens = response.usage.prompt_tokens;
    const outputTokens = response.usage.completion_tokens;
    // Let's assume these costs for the example - adjust according to the actual costs
    let inputTokenCost = 0.02; // Cost per 1k input tokens
    let outputTokenCost = 0.06; // Cost per 1k output tokens

    if (model.includes("gpt-4")) {
      // Adjust costs for gpt-4 model
      inputTokenCost = 0.03;
      outputTokenCost = 0.09;
    }

    const cost = (inputTokens * inputTokenCost / 1000) + (outputTokens * outputTokenCost / 1000);
    return cost.toFixed(2); // Returns the cost with 2 decimal places
  }

  showModal(event) {
    const target = event.target;
    const modalContent = target.getAttribute(target.classList.contains('request-content') ? 'data-request' : 'data-response');

    // Get the modal and modal content elements
    const modal = document.getElementById('modal');
    const modalText = document.getElementById('modal-text');
    
    // Set the content of the modal
    modalText.textContent = '';
    modalText.textContent = modalContent;

    // Display the modal
    modal.style.display = 'block';
  }
}

// Instantiate and call loadRequests on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const requestLoader = new RequestLoader();
  requestLoader.loadRequests();
});

// Listen for clicks anywhere in the window to close the modal
window.addEventListener('click', (event) => {
  const modal = document.getElementById('modal');
  if (event.target == modal) {
    modal.style.display = 'none';
  }
});

const closeModal = document.getElementById('close-modal');
closeModal.onclick = () => {
  const modal = document.getElementById('modal');
  modal.style.display = "none";
}
