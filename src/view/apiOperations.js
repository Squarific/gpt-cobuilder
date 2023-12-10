// Function to calculate cost given a response
function calculateCostFromResponse(response) {
  let model = response.model;
  return calculateCost(response.usage.prompt_tokens, response.usage.completion_tokens, model);
}

// Exposed calculateCost function for import
export const calculateCost = (inputTokens, outputTokens, model) => {
  // Set default model costs
  let INPUT_TOKEN_COST = 0.02;  // Cost per 1000 input tokens
  let OUTPUT_TOKEN_COST = 0.06; // Cost per 1000 output tokens

  // Update costs for "gpt-4-1106-preview" model
  if (model === 'gpt-4-1106-preview') {
    INPUT_TOKEN_COST = 0.01;
    OUTPUT_TOKEN_COST = 0.02;
  }

  const cost = (inputTokens * INPUT_TOKEN_COST / 1000) + (outputTokens * OUTPUT_TOKEN_COST / 1000);

  return cost; // Returns the cost
};

// ...Rest of the apiOperations.js contents...
