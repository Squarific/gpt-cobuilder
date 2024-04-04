// This function is here to calculate cost given a response
// It gives back a string with a precision of two decimal places
function costStringFromGPTResponse(response) {
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

  return cost.toFixed(2);
};

const displayTokenCounts = (response) => {
  const { prompt_tokens, completion_tokens, total_tokens } = response.usage;
  const cost = calculateCost(prompt_tokens, completion_tokens, response.model);
  return `Prompt Tokens: ${prompt_tokens}, Completion Tokens: ${completion_tokens}, Total Tokens: ${total_tokens}, Cost: $${cost}`;
};

const displayFilesTokenCounts = (response) => {
  const tokenCountElement = document.getElementById('files-response-token-count');
  const { prompt_tokens, completion_tokens, total_tokens } = response.usage;
  const cost = calculateCost(prompt_tokens, completion_tokens, response.model);
  tokenCountElement.textContent = `Prompt Tokens: ${prompt_tokens}, Completion Tokens: ${completion_tokens}, Total Tokens: ${total_tokens}, Cost: $${cost}`;
};

const sendMessageToChatGPTStreamed = async (systemMessage, userMessage, chunkCallback) => {
  const apiKey = document.getElementById('api-key').value;

  const model = (await loadSettings()).modelSelection;

  const messages = [
    { role: 'system', content: systemMessage },
    { role: 'user', content: userMessage }
  ];
  
  let response = await openAiNpmApi.chatCompletion(apiKey, model, messages, chunkCallback);

  await logRequestAndResponse({ model, messages }, response);

  return response;
};
