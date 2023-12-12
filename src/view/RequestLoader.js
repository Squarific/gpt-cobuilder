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

        const row = table.insertRow();

        this.fillCell(row, requestLog.response.model);
        this.fillCell(row, new Date(fileName.split('.')[0].replace(/-/g, ':')).toLocaleString());
        this.fillCell(row, 'DONE');
        this.fillCell(row, requestLog.response.usage.prompt_tokens);
        this.fillCell(row, requestLog.response.usage.completion_tokens);
        this.fillCell(row, `$${this.calculateCostFromResponse(requestLog.response)}`);
        this.fillCell(row, requestLog.response.choices[0].finish_reason);
 
        // Truncate and add ellipsis at the end for long content if needed
        let requestContent = requestLog.request.content;
        let responseContent = requestLog.response.choices[0].message.content;
        const maxContentLength = 100;
        requestContent = requestContent.length > maxContentLength ?
          requestContent.slice(-maxContentLength) + "..." : requestContent;
        responseContent = responseContent.length > maxContentLength ?
          responseContent.slice(-maxContentLength) + "..." : responseContent;
        
        this.fillCell(row, requestContent);      
        this.fillCell(row, responseContent);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  }
  
  // Helper function to create and fill a cell in a row
  fillCell(row, content) {
    const cell = row.insertCell();
    cell.textContent = content;
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
}

// Instantiate and call loadRequests on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const requestLoader = new RequestLoader();
  requestLoader.loadRequests();
});
