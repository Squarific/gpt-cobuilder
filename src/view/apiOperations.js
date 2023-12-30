// This function is here to calculate cost given a response
function calculateCostFromResponse(response) {
  let model = response.model;
  return calculateCost(response.usage.prompt_tokens, response.usage.completion_tokens, model);
}

const calculateCost = (inputTokens, outputTokens, model) => {
  // Set default model costs
  let INPUT_TOKEN_COST = 0.03;  // Cost per 1k input tokens
  let OUTPUT_TOKEN_COST = 0.06; // Cost per 1k output tokens

  // Update costs for "gpt-4-1106-preview" model
  if (model === 'gpt-4-1106-preview') {
    INPUT_TOKEN_COST = 0.01;
    OUTPUT_TOKEN_COST = 0.03;
  }

  const cost = (inputTokens * INPUT_TOKEN_COST / 1000) + (outputTokens * OUTPUT_TOKEN_COST / 1000);

  return cost.toFixed(2); // Returns the cost with 2 decimal places
};

const displayTokenCounts = (response) => {
  const { prompt_tokens, completion_tokens, total_tokens } = response.usage;
  
  // Calculate cost
  const cost = calculateCost(prompt_tokens, completion_tokens, response.model);

  return `Prompt Tokens: ${prompt_tokens}, Completion Tokens: ${completion_tokens}, Total Tokens: ${total_tokens}, Cost: $${cost}`;
};

const displayFilesTokenCounts = (response) => {
  const tokenCountElement = document.getElementById('files-response-token-count');
  const { prompt_tokens, completion_tokens, total_tokens } = response.usage;
  
  // Calculate cost
  const cost = calculateCost(prompt_tokens, completion_tokens, response.model);

  tokenCountElement.textContent = `Prompt Tokens: ${prompt_tokens}, Completion Tokens: ${completion_tokens}, Total Tokens: ${total_tokens}, Cost: $${cost}`;
};

const sendMessageToChatGPT = async (systemMessage, userMessage) => {
  const apiKey = apiKeyInput.value;

  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: (await loadSettings()).modelSelection,
      messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ]
    })
  };

  try {
      const response = await fetch(OPENAI_URL, requestOptions);
  
      if (!response.ok) {
        let errorMessage = `HTTP error! Status: ${response.status}`;
        const errorData = await response.json();
        if (errorData.error && errorData.error.message) {
          errorMessage += ` Message: ${errorData.error.message}`;
        }
        throw new Error(errorMessage);
      }
  
      const data = await response.json();

      // Log the request and response
      await logRequestAndResponse(apiKey, (await loadSettings()).modelSelection, 'user', userMessage, data);

      return data;
    } catch (error) {
      throw new Error(`Request failed! ${error.message}`);
    }
};

