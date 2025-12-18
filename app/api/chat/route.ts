import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// CORS headers for production
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
  'Access-Control-Max-Age': '86400',
};

/**
 * Validates the API key from the request headers
 * @param request - The incoming HTTP request
 * @returns boolean indicating if the API key is valid
 */
function validateApiKey(request: Request): boolean {
  const apiKey = request.headers.get('x-api-key');
  const expectedKey = process.env.API_SECRET_KEY;
  
  if (!expectedKey || !apiKey) {
    return false;
  }
  
  // Simple string comparison (sufficient for beta)
  return apiKey === expectedKey;
}

const provider = createOpenAICompatible({
  name: 'DevBoost',
  apiKey: process.env.PROVIDER_API_KEY,
  baseURL: 'https://gateway.ai.devboost.com/v1',
  includeUsage: true,
});

// Handle preflight OPTIONS request
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  // Validate API key first
  if (!validateApiKey(req)) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { 
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }

  const {
    messages,
    model,
    webSearch,
  }: { 
    messages: UIMessage[]; 
    model: string; 
    webSearch: boolean;
  } = await req.json();
  const result = streamText({
    model: provider("DevBoost/OpenAI/gpt-5.1"),
    messages: convertToModelMessages(messages),
    system:
      'You are a helpful assistant that can answer questions and help with tasks. I will send you handwritten prompts as images. Answer me. Do not mention my handwriting.',
  });
  // send sources and reasoning back to the client
  const response = result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true
  });
  
  // Add CORS headers to the streaming response
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}