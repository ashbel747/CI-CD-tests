"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Send, Headphones, Camera } from "lucide-react";
import { sendQueryToChatbot } from "../lib/chatbot-api";
import { ChatbotResponse } from "../api/chatbot/route";

interface Message {
  type: "user" | "bot";
  text: string;
}

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    { type: "bot", text: "How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { type: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const data: ChatbotResponse = await sendQueryToChatbot(input, sessionId);

      const botMessage: Message = { type: "bot", text: data.response };
      setMessages(prev => [...prev, botMessage]);
      setSessionId(data.session_id);
    } catch (err: any) {
      const errorMessage: Message = {
        type: "bot",
        text: "Sorry, something went wrong. Please try again.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-800 text-black dark:text-white mt-16">
      {/* Header */}
      <div className="flex justify-center w-screen shadow border-b-2 border-black dark:border-white">
        <div className="flex flex-col items-center justify-center p-4 w-full max-w-4xl mb-4">
          <h1 className="text-xl font-bold flex items-center">
            <Headphones className="mr-2" /> Assistant
          </h1>
        </div>
      </div>

      {/* Message Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto space-y-4 shadow-md pt-7 px-4"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`${
                msg.type === "user"
                  ? "bg-gray-400 dark:bg-white text-black"
                  : "bg-gray-300 text-gray-800 dark:bg-pink-400"
              } p-3 rounded max-w-xs break-words`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-300 text-gray-800 dark:bg-pink-400 p-3 rounded-full max-w-xs">
              Typing...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-12 mt-4 rounded-lg shadow-md flex items-center">
        <button>
          <Camera className="text-2xl hover:opacity-50" />
        </button>
        <input
          type="text"
          placeholder="Write Here..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="ml-4 mr-4 flex-1 p-3 rounded-full bg-gray-200 dark:bg-gray-600 text-black dark:text-white focus:outline-none"
        />
        <button>
          <Mic className="text-2xl hover:opacity-50 mr-2" />
        </button>
        <button onClick={handleSend}>
          <Send className="text-2xl hover:opacity-50" />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
