import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

// ============================================================================
// Configuration
// ============================================================================

export const maxDuration = 30;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
  'Access-Control-Max-Age': '86400',
} as const;

const SYSTEM_PROMPT = `You are a helpful assistant that can answer questions and help with tasks. I will send you handwritten prompts as images. Answer me. Do not mention my handwriting.`;

const provider = createOpenAICompatible({
  name: 'DevBoost',
  apiKey: process.env.PROVIDER_API_KEY,
  baseURL: 'https://gateway.ai.devboost.com/v1',
  includeUsage: true,
});

// ============================================================================
// Types
// ============================================================================

interface ParsedRequestData {
  messages: UIMessage[];
  model: string;
  webSearch: boolean;
  imageBuffer: Buffer | null;
}

// ============================================================================
// Response Helpers
// ============================================================================

function jsonResponse(body: object, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function errorResponse(message: string, status: number = 400): Response {
  return jsonResponse({ error: message }, status);
}

function addCorsHeaders(response: Response): Response {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// ============================================================================
// Validation
// ============================================================================

function validateApiKey(request: Request): boolean {
  const apiKey = request.headers.get('x-api-key');
  const expectedKey = process.env.API_SECRET_KEY;
  return Boolean(expectedKey && apiKey && apiKey === expectedKey);
}

function validateRequestData(data: { messages?: unknown; model?: unknown }): string | null {
  if (!data.messages || !Array.isArray(data.messages)) {
    return 'Invalid or missing messages array';
  }
  if (!data.model) {
    return 'Missing model field';
  }
  return null;
}

// ============================================================================
// Request Parsing
// ============================================================================

async function parseMultipartRequest(req: Request): Promise<ParsedRequestData> {
  const formData = await req.formData();
  const imageFile = formData.get('image') as File | null;
  const dataJson = formData.get('data') as string;

  if (!dataJson) {
    throw new Error('Missing data field');
  }

  let data;
  try {
    data = JSON.parse(dataJson);
  } catch {
    throw new Error('Invalid JSON in data field');
  }

  const validationError = validateRequestData(data);
  if (validationError) {
    throw new Error(validationError);
  }

  let imageBuffer: Buffer | null = null;
  if (imageFile) {
    imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    logBinaryTransferMetrics(imageBuffer);
  }

  return {
    messages: data.messages,
    model: data.model,
    webSearch: data.webSearch || false,
    imageBuffer,
  };
}

async function parseJsonRequest(req: Request): Promise<ParsedRequestData> {
  const body = await req.json();

  const validationError = validateRequestData(body);
  if (validationError) {
    throw new Error(validationError);
  }

  return {
    messages: body.messages,
    model: body.model,
    webSearch: body.webSearch || false,
    imageBuffer: null,
  };
}

async function parseRequest(req: Request): Promise<ParsedRequestData> {
  const contentType = req.headers.get('content-type') || '';
  
  if (contentType.includes('multipart/form-data')) {
    return parseMultipartRequest(req);
  }
  return parseJsonRequest(req);
}

// ============================================================================
// Image Processing
// ============================================================================

function logBinaryTransferMetrics(buffer: Buffer): void {
  const base64Size = Math.ceil(buffer.length * 4 / 3);
  const savings = base64Size - buffer.length;
  const savingsPercent = Math.round((savings / base64Size) * 100);

  console.log(`[Binary Transfer] Received ${buffer.length} bytes`);
  console.log(`[Binary Transfer] Base64 would be: ${base64Size} bytes`);
  console.log(`[Binary Transfer] Savings: ${savings} bytes (${savingsPercent}%)`);
}

function findLastUserMessageIndex(messages: UIMessage[]): number {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') {
      return i;
    }
  }
  return -1;
}

function attachImageToMessages(messages: UIMessage[], imageBuffer: Buffer): UIMessage[] {
  const lastUserIndex = findLastUserMessageIndex(messages);
  if (lastUserIndex === -1) {
    return messages;
  }

  const processedMessages = [...messages];
  const lastUserMessage = processedMessages[lastUserIndex];

  const base64Image = imageBuffer.toString('base64');
  const imagePart = {
    type: 'file' as const,
    mediaType: 'image/png',
    url: `data:image/png;base64,${base64Image}`,
    filename: 'canvas-drawing.png',
  };

  processedMessages[lastUserIndex] = {
    ...lastUserMessage,
    parts: lastUserMessage.parts 
      ? [...lastUserMessage.parts, imagePart] 
      : [imagePart],
  };

  return processedMessages;
}

// ============================================================================
// Route Handlers
// ============================================================================

export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: Request): Promise<Response> {
  if (!validateApiKey(req)) {
    return errorResponse('Unauthorized', 401);
  }

  let requestData: ParsedRequestData;
  try {
    requestData = await parseRequest(req);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to parse request';
    console.error('[Request Parse Error]', message);
    return errorResponse(message);
  }

  const { messages, imageBuffer } = requestData;
  const processedMessages = imageBuffer 
    ? attachImageToMessages(messages, imageBuffer) 
    : messages;

  const result = streamText({
    model: provider('DevBoost/OpenAI/gpt-5.1'),
    messages: convertToModelMessages(processedMessages),
    system: SYSTEM_PROMPT,
  });

  const response = result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });

  return addCorsHeaders(response);
}