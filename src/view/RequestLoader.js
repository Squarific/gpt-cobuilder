class RequestLoader {
  async loadRequests() {
    const folder = localStorage.getItem('folder');
    const requestsPath = `${folder}/gptcobuilder/requests`;
    const table = document.getElementById('requests-table');

    try {
      const requestFiles = await window.fs.readdir(requestsPath);
      for (const fileName of requestFiles) {
        const filePath = `${requestsPath}/${fileName}`;
        const fileContent = await window.fs.readFile(filePath);
        const requestLog = JSON.parse(fileContent);

        const row = table.insertRow(-1);

        const cellAgentName = row.insertCell(0);
        cellAgentName.textContent = requestLog.request.model;

        const dateTime = fileName.split('.')[0];
        const cellDateTime = row.insertCell(1);
        cellDateTime.textContent = new Date(dateTime).toLocaleString();

        const cellStatus = row.insertCell(2);
        cellStatus.textContent = requestLog.response.status;

        const cellInputTokens = row.insertCell(3);
        cellInputTokens.textContent = requestLog.request.usage.total_tokens;

        const cellCompletionTokens = row.insertCell(4);
        cellCompletionTokens.textContent = requestLog.response.usage.total_tokens;

        const cellCost = row.insertCell(5);
        cellCost.textContent = `$${calculateCostFromResponse(requestLog.response)}`;

        const cellFinishReason = row.insertCell(6);
        cellFinishReason.textContent = requestLog.response.choices[0].finish_reason;

        const cellRequestContent = row.insertCell(7);
        // Display only the last part of the request content if it's too long
        const requestContent = requestLog.request.content;
        if (requestContent.length > 100) {
            cellRequestContent.textContent = '...' + requestContent.slice(-100);
        } else {
            cellRequestContent.textContent = requestContent;
        }

        const cellResponseContent = row.insertCell(8);
        // Display only the beginning part of the response content
        cellResponseContent.textContent = requestLog.response.choices[0].message.content;
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  }

  calculateCostFromResponse(response) {
    const model = response.model;
    const inputTokens = response.usage.prompt_tokens;
    const outputTokens = response.usage.completion_tokens;
    const cost = (inputTokens + outputTokens) * MODEL_PRICING[model];
    return cost.toFixed(2);
  }
}

const MODEL_PRICING = {
  "gpt-3.5-turbo": 0.002, // example costs
  "gpt-4": 0.003,
};

// Instantiate class
const requestLoader = new RequestLoader();
// Load requests when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => requestLoader.loadRequests());
