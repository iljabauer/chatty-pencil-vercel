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
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputHeader,
  type PromptInputMessage,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { Fragment, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { CopyIcon, GlobeIcon, RefreshCcwIcon, PenToolIcon } from 'lucide-react';
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
import { Canvas } from '@/lib/canvas-plugin';
import { Button } from '@/components/ui/button';

const models = [
  {
    name: 'DevBoost/SelfHosted/OpenAI/gpt-oss-20b',
    value: 'DevBoost/SelfHosted/OpenAI/gpt-oss-20b',
  }
];
const ChatBotDemo = () => {
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].value);
  const [webSearch, setWebSearch] = useState(false);
  const { messages, sendMessage, status, regenerate } = useChat();
  
  // Test functions for different canvas presentation styles
  const testCanvasSheet = async () => {
    try {
      console.log('Opening canvas with sheet presentation...');
      const result = await Canvas.openCanvas({
        presentationStyle: 'sheet',
        showGrabber: true,
        allowMediumDetent: false,
        sheetSize: 'large'
      });
      console.log('Canvas result:', result);
      
      if (result.action === 'submitted' && result.imageData) {
        console.log('Canvas submitted with image data length:', result.imageData.length);
        alert(`Canvas submitted! Image data length: ${result.imageData.length}`);
      } else if (result.action === 'minimized') {
        console.log('Canvas minimized, has content:', result.hasContent);
        alert(`Canvas minimized. Has content: ${result.hasContent}`);
      } else {
        console.log('Canvas cancelled');
        alert('Canvas cancelled');
      }
    } catch (error) {
      console.error('Canvas error:', error);
      alert(`Canvas error: ${error}`);
    }
  };

  const testCanvasExtraLarge = async () => {
    try {
      console.log('Opening canvas with extra large sheet...');
      const result = await Canvas.openCanvas({
        presentationStyle: 'sheet',
        showGrabber: true,
        allowMediumDetent: false,
        sheetSize: 'extraLarge'
      });
      console.log('Canvas result:', result);
      
      if (result.action === 'submitted' && result.imageData) {
        alert(`Canvas submitted! Image data length: ${result.imageData.length}`);
      } else if (result.action === 'minimized') {
        alert(`Canvas minimized. Has content: ${result.hasContent}`);
      } else {
        alert('Canvas cancelled');
      }
    } catch (error) {
      console.error('Canvas error:', error);
      alert(`Canvas error: ${error}`);
    }
  };

  const testCanvasFullHeight = async () => {
    try {
      console.log('Opening canvas with full height sheet...');
      const result = await Canvas.openCanvas({
        presentationStyle: 'sheet',
        showGrabber: true,
        allowMediumDetent: false,
        sheetSize: 'fullHeight'
      });
      console.log('Canvas result:', result);
      
      if (result.action === 'submitted' && result.imageData) {
        alert(`Canvas submitted! Image data length: ${result.imageData.length}`);
      } else if (result.action === 'minimized') {
        alert(`Canvas minimized. Has content: ${result.hasContent}`);
      } else {
        alert('Canvas cancelled');
      }
    } catch (error) {
      console.error('Canvas error:', error);
      alert(`Canvas error: ${error}`);
    }
  };

  const testCanvasFullScreen = async () => {
    try {
      console.log('Opening canvas with fullscreen presentation...');
      const result = await Canvas.openCanvas({
        presentationStyle: 'fullScreen'
      });
      console.log('Canvas result:', result);
      
      if (result.action === 'submitted' && result.imageData) {
        alert(`Canvas submitted! Image data length: ${result.imageData.length}`);
      } else if (result.action === 'minimized') {
        alert(`Canvas minimized. Has content: ${result.hasContent}`);
      } else {
        alert('Canvas cancelled');
      }
    } catch (error) {
      console.error('Canvas error:', error);
      alert(`Canvas error: ${error}`);
    }
  };
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
  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full h-screen">
      <div className="flex flex-col h-full">
        {/* Canvas presentation style tests */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800 mb-3">Canvas Presentation Tests</h3>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={testCanvasSheet}
              className="flex items-center gap-2"
              variant="outline"
              size="sm"
            >
              <PenToolIcon className="size-4" />
              Sheet (Default)
            </Button>
            <Button 
              onClick={testCanvasExtraLarge}
              className="flex items-center gap-2"
              variant="outline"
              size="sm"
            >
              <PenToolIcon className="size-4" />
              Extra Large Sheet
            </Button>
            <Button 
              onClick={testCanvasFullHeight}
              className="flex items-center gap-2"
              variant="outline"
              size="sm"
            >
              <PenToolIcon className="size-4" />
              Full Height Sheet
            </Button>
            <Button 
              onClick={testCanvasFullScreen}
              className="flex items-center gap-2"
              variant="outline"
              size="sm"
            >
              <PenToolIcon className="size-4" />
              Full Screen
            </Button>
          </div>
          <div className="text-xs text-blue-700 mt-2 space-y-1">
            <p><strong>Sheet (Default):</strong> Standard iOS sheet (~70% height)</p>
            <p><strong>Extra Large Sheet:</strong> Bigger sheet (~95% height)</p>
            <p><strong>Full Height Sheet:</strong> Nearly full screen sheet (~98% height)</p>
            <p><strong>Full Screen:</strong> Traditional full-screen presentation</p>
          </div>
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
                      return (
                        <Message key={`${message.id}-${i}`} from={message.role}>
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
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
            </PromptInputTools>
            <PromptInputSubmit disabled={!input && !status} status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
};
export default ChatBotDemo;