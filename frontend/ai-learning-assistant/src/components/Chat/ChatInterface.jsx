import React, { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Sparkles, User, Bot } from "lucide-react";
import { useParams } from "react-router-dom";
import aiService from "../../services/aiService";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../common/Spinner";
import MarkdownRenderer from "../common/MarkdownRenderer";

const ChatInterface = () => {
  const { id: documentId } = useParams();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        setInitialLoading(true);
        const response = await aiService.getChatHistory(documentId);
        const chatData = Array.isArray(response.data) ? response.data : response.data?.messages || [];
        setHistory(chatData);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchChatHistory();
  }, [documentId]);

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = { role: "user", content: message, timestamp: new Date() };
    setHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await aiService.chat(documentId, userMessage.content);
      setHistory((prev) => [...prev, { role: "assistant", content: response.data.answer, timestamp: new Date() }]);
    } catch (error) {
      setHistory((prev) => [...prev, { role: "assistant", content: "Sorry, error encountered.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (msg, index) => {
    const isUser = msg.role === 'user';
    return (
      <div
        key={index}
        className={`flex items-end gap-2 my-4 w-full ${isUser ? "justify-end" : "justify-start"}`}
      >
        {/* AVATAR SECTION: 
        'hidden lg:flex' hides them on mobile and tablet. 
        Only shows up on large desktop screens (lg).
      */}
        {!isUser && (
          <div className="hidden lg:flex shrink-0 w-8 h-8 rounded-full bg-zinc-800 items-center justify-center text-emerald-400">
            <Bot size={16} />
          </div>
        )}

        {/* BUBBLE SECTION: 
        Max-width adjusted to give bubbles more breathing room on mobile/tablet
      */}
        <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isUser ? "items-end" : "items-start"}`}>
          <div
            className={`p-3 md:p-4 rounded-2xl text-xs md:text-sm border shadow-lg ${isUser
                ? "bg-emerald-500 text-black rounded-br-none"
                : "bg-white/5 text-zinc-200 rounded-bl-none border-white/5"
              }`}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            ) : (
              <MarkdownRenderer content={msg.content} />
            )}
          </div>

          {/* Timestamp - Subtle and pinned to the bottom */}
          <span className="mt-1 px-1 text-[9px] text-zinc-600 uppercase tracking-widest">
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {/* USER AVATAR: Hidden on mobile and tablet */}
        {isUser && (
          <div className="hidden lg:flex shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 items-center justify-center text-emerald-400 font-bold text-xs">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
      </div>
    );
  };

  return (
    // FLUID HEIGHT: Uses 100vh dynamic math to fit perfectly on phones and desktops
    <div className="flex flex-col h-[calc(100vh-280px)] md:h-[65vh] w-full bg-zinc-950/30 border border-white/5 rounded-2xl md:rounded-3xl overflow-hidden backdrop-blur-xl">

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 md:p-6 custom-scrollbar">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-40">
            <MessageSquare size={40} className="mb-4 text-emerald-500" />
            <p className="text-sm font-bold uppercase tracking-widest text-white">No messages yet</p>
          </div>
        ) : (
          history.map(renderMessage)
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Input Area at Bottom */}
      <div className="p-3 md:p-4 border-t border-white/5 bg-zinc-900/50">
        <form onSubmit={handleSendMessage} className="relative flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a question..."
            className="w-full bg-black/40 text-white rounded-xl py-3 pl-4 pr-12 text-sm border border-white/10 focus:outline-none focus:border-emerald-500/50 transition-all"
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="absolute right-2 p-2 bg-emerald-500 text-black rounded-lg disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Send size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;