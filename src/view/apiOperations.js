// Function to calculate the cost given counts of input and output tokens
const calculateCost = (inputTokens, outputTokens) => {
  const INPUT_TOKEN_COST = 0.03;  // Cost per 1k input tokens
  const OUTPUT_TOKEN_COST = 0.06; // Cost per 1k output tokens

  const cost = (inputTokens * INPUT_TOKEN_COST / 1000) + (outputTokens * OUTPUT_TOKEN_COST / 1000);

  return cost.toFixed(2); // Returns the cost with 2 decimal places
};

const displayTokenCounts = (response) => {
  const { prompt_tokens, completion_tokens, total_tokens } = response.usage;
  
  // Calculate cost
  const cost = calculateCost(prompt_tokens, completion_tokens);

  return `Prompt Tokens: ${prompt_tokens}, Completion Tokens: ${completion_tokens}, Total Tokens: ${total_tokens}, Cost: $${cost}`;
};

const displayFilesTokenCounts = (response) => {
  const tokenCountElement = document.getElementById('files-response-token-count');
  const { prompt_tokens, completion_tokens, total_tokens } = response.usage;
  
  // Calculate cost
  const cost = calculateCost(prompt_tokens, completion_tokens);

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
      const response = await fetch(url, requestOptions);
  
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
