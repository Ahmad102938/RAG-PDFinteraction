"use client";
import { useState } from "react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatComponent() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [query, setQuery] = useState<string>('');

    const handleSend = async () => {
        if(!query.trim()) return;

        const userMessage: Message = { role: 'user', content: query };
        setMessages((prev) => [...prev, userMessage]);
        setQuery('');

        try {
            const response = await fetch(`http://localhost:8000/chat?q=${encodeURIComponent(query)}`);
            if(response.ok) {
                const data = await response.json();
                const assistantMessage: Message = { role: 'assistant', content: data.answer };
                setMessages((prev) => [...prev, assistantMessage]);
            }else {
                console.error('Error fetching response from server');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <span
              className={`inline-block p-2 rounded-lg ${
                msg.role === 'user' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-black'
              }`}
            >
              {msg.content}
            </span>
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Ask a question..."
        />
        <button
          onClick={handleSend}
          className="mt-2 w-full py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Send
        </button>
      </div>
    </div>
    );
}