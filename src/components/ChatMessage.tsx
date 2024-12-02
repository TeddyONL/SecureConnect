import { User, Bot } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex gap-4 p-4 ${isAssistant ? 'bg-gray-50' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isAssistant ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
      }`}>
        {isAssistant ? <Bot size={20} /> : <User size={20} />}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900 mb-1">
          {isAssistant ? 'AI Assistant' : 'You'}
        </div>
        <div className="text-gray-700 whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  );
}