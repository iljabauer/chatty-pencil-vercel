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

  const contentType = req.headers.get('content-type') || '';
  
  let messages: UIMessage[];
  let model: string;
  let webSearch: boolean = false;
  let imageBuffer: Buffer | null = null;
  
  if (contentType.includes('multipart/form-data')) {
    // Handle multipart request with binary image
    try {
      const formData = await req.formData();
      const imageFile = formData.get('image') as File | null;
      const dataJson = formData.get('data') as string;
      
      if (!dataJson) {
        return new Response(JSON.stringify({ error: 'Missing data field' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      
      let data;
      try {
        data = JSON.parse(dataJson);
      } catch (parseError) {
        console.error('[Multipart] Invalid JSON in data field:', parseError);
        return new Response(JSON.stringify({ error: 'Invalid JSON in data field' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      
      messages = data.messages;
      model = data.model;
      webSearch = data.webSearch || false;
      
      // Validate required fields
      if (!messages || !Array.isArray(messages)) {
        return new Response(JSON.stringify({ error: 'Invalid or missing messages array' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      
      if (!model) {
        return new Response(JSON.stringify({ error: 'Missing model field' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      
      if (imageFile) {
        // Read binary directly - no base64 decoding needed
        imageBuffer = Buffer.from(await imageFile.arrayBuffer());
        
        // Log transfer metrics
        const base64Size = Math.ceil(imageBuffer.length * 4 / 3);
        const savings = base64Size - imageBuffer.length;
        const savingsPercent = Math.round((savings / base64Size) * 100);
        
        console.log(`[Binary Transfer] Received ${imageBuffer.length} bytes`);
        console.log(`[Binary Transfer] Base64 would be: ${base64Size} bytes`);
        console.log(`[Binary Transfer] Savings: ${savings} bytes (${savingsPercent}%)`);
      }
    } catch (error) {
      console.error('[Multipart] Failed to parse multipart request:', error);
      return new Response(JSON.stringify({ error: 'Failed to parse multipart request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  } else {
    // Handle legacy JSON request
    try {
      const body = await req.json();
      messages = body.messages;
      model = body.model;
      webSearch = body.webSearch || false;
      
      // Validate required fields
      if (!messages || !Array.isArray(messages)) {
        return new Response(JSON.stringify({ error: 'Invalid or missing messages array' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      
      if (!model) {
        return new Response(JSON.stringify({ error: 'Missing model field' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
    } catch (error) {
      console.error('[JSON] Failed to parse JSON request:', error);
      return new Response(JSON.stringify({ error: 'Invalid JSON request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
  // Process messages and add image if present
  let processedMessages = messages;
  if (imageBuffer && messages && Array.isArray(messages)) {
    // Find the last user message and add the image to it
    // Using reverse iteration for compatibility (findLastIndex not available in older Node.js)
    let lastUserMessageIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        lastUserMessageIndex = i;
        break;
      }
    }
    
    if (lastUserMessageIndex !== -1) {
      processedMessages = [...messages];
      const lastUserMessage = processedMessages[lastUserMessageIndex];
      
      // Create a data URL for the image
      const base64Image = imageBuffer.toString('base64');
      const dataUrl = `data:image/png;base64,${base64Image}`;
      
      // Add image as a file part to the message
      const imagePart = { 
        type: 'file' as const, 
        mediaType: 'image/png',
        url: dataUrl,
        filename: 'canvas-drawing.png'
      };
      
      if (lastUserMessage.parts) {
        // Add image to existing parts array
        processedMessages[lastUserMessageIndex] = {
          ...lastUserMessage,
          parts: [...lastUserMessage.parts, imagePart]
        };
      } else {
        // Create parts array with image only (text should already be in parts)
        processedMessages[lastUserMessageIndex] = {
          ...lastUserMessage,
          parts: [imagePart]
        };
      }
    }
  }

  const result = streamText({
    model: provider("DevBoost/OpenAI/gpt-5.1"),
    messages: convertToModelMessages(processedMessages),
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