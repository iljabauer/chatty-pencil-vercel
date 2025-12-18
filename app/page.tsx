'use client';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputHeader,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { CopyIcon, RefreshCcwIcon, KeyboardIcon, PenToolIcon, PlusIcon } from 'lucide-react';
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai-elements/sources';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import { Loader } from '@/components/ai-elements/loader';

import { useCanvasPlugin } from '@/lib/useCanvasPlugin';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { API_KEY } from '@/lib/api-config';

const models = [
  {
    name: 'DevBoost/SelfHosted/OpenAI/gpt-oss-20b',
    value: 'DevBoost/SelfHosted/OpenAI/gpt-oss-20b',
  }
];
const ChatBotDemo = () => {
  const [input, setInput] = useState('');
  const [model] = useState<string>(models[0].value);

  const [inputMode, setInputMode] = useState<'canvas' | 'keyboard'>('canvas');
  const { messages, sendMessage, status, regenerate, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      headers: {
        'x-api-key': API_KEY,
      },
    }),
  });
  
  // Canvas plugin integration
  const { openCanvas, clearCanvas, hasUnsavedContent, isCanvasOpen } = useCanvasPlugin({
    onSubmit: (imageData) => {
      console.log('Canvas submitted with image data length:', imageData.length);
      
      // Convert base64 PNG to proper file attachment format
      const canvasFile = {
        type: 'file' as const,
        url: imageData, // Base64 data URL (data:image/png;base64,...)
        mediaType: 'image/png',
        filename: 'canvas-drawing.png',
      };
      
      // Send the image as a message attachment (no text, just the image)
      sendMessage(
        { 
          text: '',
          files: [canvasFile]
        },
        {
          body: {
            model: model
          },
        },
      );
      
      // Canvas state is automatically cleared after successful submission
      // as handled by the useCanvasPlugin hook
    },
    onMinimize: (hasContent) => {
      console.log('Canvas minimized, has content:', hasContent);
    },
    onCancel: () => {
      console.log('Canvas cancelled');
    }
  });


  

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);
    if (!(hasText || hasAttachments)) {
      return;
    }
    sendMessage(
      { 
        text: message.text || 'Sent with attachments',
        files: message.files 
      },
      {
        body: {
          model: model
        },
      },
    );
    setInput('');
  };

  const handleNewConversation = async () => {
    // Clear messages
    setMessages([]);
    // Clear canvas state
    await clearCanvas();
    // Reset input
    setInput('');
  };
  return (
    <div className="max-w-4xl mx-auto relative size-full h-screen" style={{
      paddingTop: 'max(3rem, env(safe-area-inset-top))',
      paddingBottom: 'max(3rem, env(safe-area-inset-bottom))',
      paddingLeft: 'max(1.5rem, env(safe-area-inset-left))',
      paddingRight: 'max(1.5rem, env(safe-area-inset-right))',
    }}>
      <div className="flex flex-col h-full">
        {/* Header with New Conversation Button */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Chatty Pencil</h1>
          <Button
            onClick={handleNewConversation}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <PlusIcon className="size-4" />
            New Conversation
          </Button>
        </div>

        
        <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message) => (
              <div key={message.id}>
                {message.role === 'assistant' && message.parts.filter((part) => part.type === 'source-url').length > 0 && (
                  <Sources>
                    <SourcesTrigger
                      count={
                        message.parts.filter(
                          (part) => part.type === 'source-url',
                        ).length
                      }
                    />
                    {message.parts.filter((part) => part.type === 'source-url').map((part, i) => (
                      <SourcesContent key={`${message.id}-${i}`}>
                        <Source
                          key={`${message.id}-${i}`}
                          href={part.url}
                          title={part.url}
                        />
                      </SourcesContent>
                    ))}
                  </Sources>
                )}
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case 'text':
                      // Hide empty text parts visually (e.g., canvas-only messages)
                      const isEmpty = !part.text?.trim();
                      return (
                        <Message 
                          key={`${message.id}-${i}`} 
                          from={message.role}         
                          className={isEmpty ? 'sr-only' : ''}
                        >
                          <MessageContent>
                            <MessageResponse>
                              {part.text}
                            </MessageResponse>
                          </MessageContent>
                          {message.role === 'assistant' && i === messages.length - 1 && (
                            <MessageActions>
                              <MessageAction
                                onClick={() => regenerate()}
                                label="Retry"
                              >
                                <RefreshCcwIcon className="size-3" />
                              </MessageAction>
                              <MessageAction
                                onClick={() =>
                                  navigator.clipboard.writeText(part.text)
                                }
                                label="Copy"
                              >
                                <CopyIcon className="size-3" />
                              </MessageAction>
                            </MessageActions>
                          )}
                        </Message>
                      );
                    case 'file':
                      // Handle canvas image attachments
                      if (part.mediaType?.startsWith('image/')) {
                        return (
                          <Message key={`${message.id}-${i}`} from={message.role}>
                            <MessageContent>
                              <div className="max-w-md">
                                <img 
                                  src={part.url} 
                                  alt={part.filename || 'Canvas drawing'} 
                                  className="rounded-lg border shadow-sm max-w-full h-auto"
                                />
                              </div>
                            </MessageContent>
                          </Message>
                        );
                      }
                      return null;
                    case 'reasoning':
                      return (
                        <Reasoning
                          key={`${message.id}-${i}`}
                          className="w-full"
                          isStreaming={status === 'streaming' && i === message.parts.length - 1 && message.id === messages.at(-1)?.id}
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            ))}
            {status === 'submitted' && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <PromptInput onSubmit={handleSubmit} className="mt-4">
          <PromptInputHeader>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
          </PromptInputHeader>
          {inputMode === 'canvas' ? (
            /* Canvas Mode - Replace textarea with prominent canvas button */
            <div className="w-full p-3">
              <Button
                onClick={openCanvas}
                disabled={isCanvasOpen}
                size="lg"
                className={cn(
                  "w-full h-12 text-lg font-medium relative",
                  hasUnsavedContent && "bg-blue-600 hover:bg-blue-700"
                )}
              >
                <PenToolIcon className="mr-3 size-5" />
                {hasUnsavedContent ? 'Continue Drawing' : 'Open Canvas'}
                {hasUnsavedContent && (
                  <div className="absolute -top-1 -right-1 size-3 bg-orange-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </Button>
            </div>
          ) : (
            /* Keyboard Mode - Standard textarea */
            <PromptInputBody>
              <PromptInputTextarea
                onChange={(e) => setInput(e.target.value)}
                value={input}
                placeholder="Type your message..."
              />
            </PromptInputBody>
          )}
          <PromptInputFooter>
            <PromptInputTools>
              {/* Input Mode Toggle Button */}
              <PromptInputButton
                onClick={() => setInputMode(inputMode === 'canvas' ? 'keyboard' : 'canvas')}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                {inputMode === 'canvas' ? (
                  <>
                    <KeyboardIcon className="size-4" />
                    <span>Switch to keyboard</span>
                  </>
                ) : (
                  <>
                    <PenToolIcon className="size-4" />
                    <span>Switch to canvas</span>
                  </>
                )}
              </PromptInputButton>
            </PromptInputTools>
            {/* Only show submit button in keyboard mode */}
            {inputMode === 'keyboard' && (
              <PromptInputSubmit disabled={!input && status !== 'streaming'} status={status} />
            )}
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
};
export default ChatBotDemo;