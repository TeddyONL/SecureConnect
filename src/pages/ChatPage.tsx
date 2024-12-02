import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import { ChatMessage } from '../components/ChatMessage';
import { useBusinessStore } from '../stores/businessStore';
import toast from 'react-hot-toast';
import OpenAI from 'openai';

// Initialize OpenAI client - in a real app, this would use an environment variable
const openai = new OpenAI({
  apiKey: 'your-api-key-here', // Replace with your actual API key
  dangerouslyAllowBrowser: true // Only for demo purposes
});

// Enhanced system prompt for better AI responses
const SYSTEM_PROMPT = `You are an advanced AI assistant for a business directory platform. Your capabilities include:

1. Business Discovery & Recommendations
   - Provide personalized business recommendations based on user preferences
   - Filter and search across multiple categories and criteria
   - Offer detailed insights about business types and industries

2. Local Business Knowledge
   - Share comprehensive information about business operations
   - Explain industry-specific regulations and requirements
   - Provide guidance on business hours, services, and locations

3. Expert Guidance
   - Help users navigate business registration processes
   - Explain verification procedures and requirements
   - Guide users through business listing optimization

4. Problem-Solving
   - Troubleshoot common business listing issues
   - Provide solutions for business-related challenges
   - Help resolve customer service queries

5. Best Practices
   - Share industry best practices and trends
   - Offer tips for business profile optimization
   - Provide guidance on customer engagement

Guidelines:
- Be concise and direct in your responses
- Provide specific, actionable information
- Use examples when relevant
- Maintain a professional yet friendly tone
- If uncertain, acknowledge limitations and suggest alternatives
- Focus on practical, implementable solutions

Remember: Your goal is to help users succeed in finding, listing, and interacting with businesses on our platform.`;

interface ChatPageProps {
  isFloating?: boolean;
  onClose?: () => void;
}

export function ChatPage({ isFloating = false, onClose }: ChatPageProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const { messages, clearMessages, addMessage } = useChatStore();
  const { businesses, searchBusinesses } = useBusinessStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateContextualResponse = async (userMessage: string) => {
    // Create a context-aware message that includes relevant business data
    let contextMessage = userMessage;
    
    // If the message seems to be about finding businesses, include relevant search results
    if (userMessage.toLowerCase().includes('find') || 
        userMessage.toLowerCase().includes('looking for') ||
        userMessage.toLowerCase().includes('search')) {
      const searchResults = searchBusinesses(userMessage);
      if (searchResults.length > 0) {
        contextMessage += "\n\nRelevant businesses in our directory:\n" + 
          searchResults.slice(0, 3).map(b => 
            `- ${b.name} (${b.category}): ${b.description.slice(0, 100)}...`
          ).join('\n');
      }
    }

    // Add platform statistics for relevant queries
    if (userMessage.toLowerCase().includes('statistics') || 
        userMessage.toLowerCase().includes('numbers') ||
        userMessage.toLowerCase().includes('how many')) {
      contextMessage += `\n\nPlatform statistics:\n` +
        `- Total businesses: ${businesses.length}\n` +
        `- Categories: ${Array.from(new Set(businesses.map(b => b.category))).join(', ')}\n` +
        `- Average rating: ${(businesses.reduce((acc, b) => acc + b.averageRating, 0) / businesses.length).toFixed(1)}`;
    }

    return contextMessage;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setIsThinking(true);
    
    try {
      // Add user message immediately
      addMessage('user', userMessage);

      // Generate contextual message with business data
      const contextualMessage = await generateContextualResponse(userMessage);
      
      // Create the messages array for the API with improved system prompt
      const apiMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.slice(-5).map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content
        })),
        { role: 'user', content: contextualMessage }
      ];

      // Send to OpenAI
      const completion = await openai.chat.completions.create({
        messages: apiMessages,
        model: 'gpt-4',
        max_tokens: 1000,
        temperature: 0.7,
        presence_penalty: 0.6,
        frequency_penalty: 0.3,
        stream: true
      });

      let accumulatedResponse = '';
      
      // Process the stream
      for await (const part of completion) {
        const chunk = part.choices[0]?.delta?.content || '';
        accumulatedResponse += chunk;
        
        // Update the UI immediately with the accumulated response
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.content = accumulatedResponse;
        } else {
          addMessage('assistant', accumulatedResponse);
        }
        scrollToBottom();
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response from AI. Please try again.');
    } finally {
      setIsLoading(false);
      setIsThinking(false);
    }
  };

  const suggestedQuestions = [
    "What are the best-rated restaurants nearby?",
    "How do I verify my business listing?",
    "What documents do I need to register a new business?",
    "Can you help me optimize my business profile?",
    "What are the trending business categories right now?",
    "How can I improve my business visibility on the platform?"
  ];

  // If not floating, render the full-page version
  if (!isFloating) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col">
          {/* ... rest of the full-page chat implementation ... */}
        </div>
      </div>
    );
  }

  // Floating version
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg font-medium">Welcome to AI Assistant!</p>
            <p className="text-sm mt-2">I'm here to help you with all your business-related questions.</p>
            <div className="mt-8 space-y-4">
              <p className="text-sm text-gray-600 font-medium">Popular Questions:</p>
              <div className="grid grid-cols-1 gap-3">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(question)}
                    className="text-left p-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        {isThinking && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm">AI Assistant is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        <div className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about businesses..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}