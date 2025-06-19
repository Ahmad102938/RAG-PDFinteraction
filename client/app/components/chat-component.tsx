"use client";
import { useState, useEffect, useRef } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!query.trim() || isSending) return;

    setIsSending(true);
    const userMessage: Message = { role: "user", content: query };
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");

    try {
      const response = await fetch(
        `http://localhost:8000/chat?q=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          role: "assistant",
          content: data.answer,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        console.error("Error fetching response from server");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-[#0f0f1f] p-4 md:p-6 font-orbitron text-white flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 bg-[#1e1e2f] rounded-lg shadow-lg mb-4 space-y-3">
        <h2 className="text-lg md:text-xl font-semibold text-center text-purple-400 mb-4">
          AI Chat
        </h2>
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">Start chatting with AI...</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] p-2 rounded-lg ${
                  msg.role === "user"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-600 text-white"
                } shadow-sm`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-[#1e1e2f] rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 p-2 border-none rounded focus:outline-none focus:ring-2 focus:ring-purple-600 bg-gray-700 text-white placeholder-gray-400 max-w-[85%] flex-shrink-0"
            placeholder="Type your message..."
          />
          <button
            onClick={handleSend}
            disabled={isSending || !query.trim()}
            className="px-3  py-2 pr-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSending ? (
              <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full" />
            ) : (
              "➤"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}