"use client";

import { useState, useEffect, useRef } from "react";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState("en"); // 'en' or 'si'
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => scrollToBottom(), [messages]);

  const getIntroMessage = () => ({
    sender: "bot",
    text:
      lang === "en"
        ? "Hello! How can I help you today?"
        : "හෙලෝ! අද ඔබට මම කෙසේ උදව් කළ හැකිද?",
  });

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen && messages.length === 0) setMessages([getIntroMessage()]);
  };

  const toggleLanguage = () => setLang((prev) => (prev === "en" ? "si" : "en"));

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, lang }),
      });
      const data = await res.json();
      if (data?.reply) setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { sender: "bot", text: "Something went wrong." }]);
    }
  };

  const handleKeyPress = (e) => e.key === "Enter" && sendMessage();

  useEffect(() => {
    if (messages.length === 1 && messages[0].sender === "bot") setMessages([getIntroMessage()]);
  }, [lang]);

  return (
    <>
      {/* Floating Bubble */}
      {!isOpen && (
        <button className="chat-toggle-btn" onClick={toggleChat}>
          💬
        </button>
      )}

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <span>Loops Assistant</span>
            <button className="close-btn" onClick={toggleChat}>✖</button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-bubble ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={lang === "en" ? "Type a message..." : "ඔබේ පණිවිඩය ටයිප් කරන්න..."}
            />
            <button onClick={sendMessage}>{lang === "en" ? "Send" : "Send"}</button>

            {/* Language toggle in bottom bar */}
            <div className="lang-container" onClick={toggleLanguage}>
              <span className="lang-label">{lang === "en" ? "EN" : "සි"}</span>
              <div className="lang-switch">
                <div className={`slider ${lang === "si" ? "si" : "en"}`} />
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Floating Bubble */
        .chat-toggle-btn {
          position: fixed;
          bottom: 25px;
          right: 25px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: none;
          background: #0070f3;
          color: white;
          font-size: 28px;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
          z-index: 1000;
          transition: transform 0.3s, background 0.3s;
        }
        .chat-toggle-btn:hover { transform: scale(1.1); background: #005bb5; }

        /* Chat Window */
        .chat-window {
          position: fixed;
          bottom: 25px;
          right: 25px;
          width: 380px;
          max-height: 520px;
          display: flex;
          flex-direction: column;
          border-radius: 20px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
          background: #ffffff;
          overflow: hidden;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          animation: grow 0.3s ease;
        }

        @keyframes grow {
          0% { opacity: 0; transform: scale(0.8) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #0070f3;
          color: white;
          font-weight: 600;
          font-size: 16px;
        }

        .close-btn {
          background: transparent;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
        }

        .chat-messages {
          flex: 1;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow-y: auto;
          background: #f0f2f5;
        }

        .chat-bubble {
          max-width: 75%;
          padding: 12px 18px;
          border-radius: 20px;
          font-size: 14px;
          line-height: 1.4;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          animation: fadeIn 0.2s;
        }
        .chat-bubble.user { background: #0070f3; color: white; align-self: flex-end; border-bottom-right-radius: 5px; }
        .chat-bubble.bot { background: #e0e0e0; color: black; align-self: flex-start; border-bottom-left-radius: 5px; }

        .chat-input-area {
          display: flex;
          color: #222;
          align-items: center;
          padding: 12px 16px;
          border-top: 1px solid #ddd;
          background: #fafafa;
          gap: 10px;
          position: relative;
        }

        .chat-input-area input {
          flex: 1;
          padding: 10px 16px;
          border-radius: 20px;
          border: 1px solid #ccc;
          font-size: 14px;
          outline: none;
          background: #fff;
        }
        .chat-input-area input::placeholder { color: #888; }

        .chat-input-area button {
          padding: 10px 20px;
          border-radius: 20px;
          border: none;
          background: #0070f3;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s;
        }
        .chat-input-area button:hover { background: #005bb5; }

        /* Language switch container */
        .lang-container {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }

        .lang-label {
          font-weight: 600;
          font-size: 14px;
          color: #050505ff;
        }

        .lang-switch {
          position: relative;
          width: 40px;
          height: 22px;
          background: #0070f3;
          border-radius: 12px;
        }

        .slider {
          position: absolute;
          top: 1px;
          left: 1px;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: 0.3s;
        }

        .slider.si { transform: translateX(18px); }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
}
