import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I am CodeLens AI, powered by Ollama. How can I help you with your code today?',
      isUser: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      switch (message.type) {
        case 'chatResponse':
          setMessages((prev) => [
            ...prev,
            { id: Date.now().toString(), text: message.value, isUser: false },
          ]);
          setIsLoading(false);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      isUser: true,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Send to VS Code Extension Host
    // @ts-ignore
    tsvscode.postMessage({
      type: 'chatMessage',
      value: userMsg.text,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      <div className="messages-area">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message-wrapper ${msg.isUser ? 'user' : 'ai'}`}
          >
            <div className="avatar">
              {msg.isUser ? <User size={18} /> : <Bot size={18} />}
            </div>
            <div className="message-content">
              {msg.text.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message-wrapper ai">
            <div className="avatar">
              <Bot size={18} />
            </div>
            <div className="message-content loading">
              <Loader2 className="spinner" size={16} /> Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <div className="input-box">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask CodeLens AI..."
            rows={1}
            disabled={isLoading}
          />
          <button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            className="send-button"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="footer-text">Powered by Ollama</div>
      </div>
    </div>
  );
};

export default App;
