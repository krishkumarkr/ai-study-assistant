import React, { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Sparkles } from "lucide-react";
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
        const chatData = Array.isArray(response.data)
          ? response.data
          : response.data?.messages || [];
        setHistory(chatData);
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchChatHistory();
  }, [documentId]);

  console.log("Chat history: ", history);

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };
    setHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await aiService.chat(documentId, userMessage.content);
      const assistantMessage = {
        role: "assistant",
        content: response.data.answer,
        timestamp: new Date(),
        relevantChunks: response.data.relevantChunks,
      };
      setHistory((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error: ", error);
      const errorMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setHistory((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (msg, index) => {
    const isUser = msg.role === 'user';
    return (
      <div
        key={index}
        className={`flex items-start gap-4 my-6 animate-in fade-in slide-in-from-bottom-2 duration-300 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      >
        {/* Avatar Section */}
        <div
          className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border font-bold text-xs shadow-lg ${
            isUser
              ? "bg-emerald-500 border-emerald-400 text-black shadow-emerald-500/20"
              : "bg-zinc-900 border-white/10 text-emerald-400"
          }`}
        >
          {isUser ? (
            user?.username?.charAt(0).toUpperCase() || "U"
          ) : (
            <Sparkles size={18} strokeWidth={2.5} />
          )}
        </div>
        <div
          className={`flex flex-col max-w-[80%] ${isUser ? "items-end" : "items-start"}`}
        >
          <div
            className={`p-4 rounded-2xl border backdrop-blur-md shadow-xl transition-all duration-300 ${
              isUser
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-50 rounded-tr-none"
                : "bg-white/3 border-white/10 text-zinc-300 rounded-tl-none"
            }`}
          >
            {isUser ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </p>
            ) : (
              <div className="text-sm">
                <MarkdownRenderer content={msg.content} />
              </div>
            )}
          </div>
          {/* Timestamp */}
          <span className="mt-2 px-1 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
            {new Date(msg.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    );
  };


  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 min-h-[400px] text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mb-4 border border-white/5 shadow-2xl">
          <MessageSquare className="text-emerald-500" />
        </div>
        <Spinner />
        <p className="text-zinc-500 text-sm mt-4 font-bold uppercase tracking-widest">
          Loading chat history...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white/1 border border-white/5 rounded-4xl overflow-hidden shadow-2xl backdrop-blur-3xl">
      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <div className="p-5 rounded-3xl bg-zinc-900 border border-white/5">
              <MessageSquare
                size={40}
                className="text-zinc-500"
                strokeWidth={1.5}
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                Start a conversation
              </h3>
              <p className="text-sm text-zinc-400 max-w-[200px] mx-auto">
                Ask me anything about the document!
              </p>
            </div>
          </div>
        ) : (
          history.map(renderMessage)
        )}
        <div ref={messagesEndRef} />
        {loading && (
          <div className="flex justify-start mb-6 animate-pulse">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-emerald-400">
                <Sparkles size={16} />
              </div>
              <div className="bg-white/3 border border-white/10 rounded-2xl p-4">
                <div className="flex gap-1.5">
                  <span
                    className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></span>
                  <span
                    className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></span>
                  <span
                    className="w-1.5 h-1.5 bg-emerald-500/50 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-zinc-950/40 border-t border-white/5 backdrop-blur-xl rounded-b-4xl">
        <form
          onSubmit={handleSendMessage}
          className="relative group flex items-center"
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a follow-up question..."
            className="relative w-full bg-white/3 border border-white/10 rounded-2xl py-4 pl-6 pr-16 text-white text-sm focus:outline-none focus:border-emerald-500/40 focus:bg-white/5 transition-all placeholder:text-zinc-600 disabled:opacity-50"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="absolute right-2 p-3 rounded-xl bg-emerald-500 text-black hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-600 transition-all duration-300 shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/20 border-t-black animate-spin rounded-full" />
            ) : (
              <Send size={18} strokeWidth={2.5} />
            )}
          </button>
        </form>
        <p className="mt-3 text-center text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
          Press Enter to send • Powered by Gemini AI
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
