"use client";

import { useState, useRef, useEffect } from "react";

// Detect language based on Sinhala Unicode range
function detectLanguage(text) {
  const sinhalaRegex = /[\u0D80-\u0DFF]/;
  return sinhalaRegex.test(text) ? "si" : "en";
}

export default function ChatWidget() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    const lang = detectLanguage(input);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, lang }),
      });

      const data = await response.json();
      const botMessage = { sender: "bot", text: data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat API error:", error);
      const errorMessage = { sender: "bot", text: "Oops! Something went wrong." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/25 p-4 z-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-700 text-white text-lg font-semibold p-4">
          Loops Assistant
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-xl text-sm break-words max-w-[80%] ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white self-end shadow-md"
                  : "bg-gray-200 text-gray-900 self-start shadow-sm"
              }`}
            >
              {msg.text}
            </div>
          ))}
          {loading && <div className="text-gray-500 text-sm">Bot is typing...</div>}
          <div ref={messagesEndRef}></div>
        </div>

        {/* Input */}
        <div className="flex border-t border-gray-300 p-3 gap-2 bg-white">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
