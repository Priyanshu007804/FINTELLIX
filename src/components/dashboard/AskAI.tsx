"use client";

import { useChat } from "@ai-sdk/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import type { UIMessage } from "ai";

export function AskAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "submitted" || status === "streaming";

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const quickActions = [
    "Analyze my spending this month",
    "Any fraud risks I should know?",
    "How much can I spend this week?",
  ];

  const handleQuickAction = (text: string) => {
    setInput(text);
  };

  const getMessageText = (message: UIMessage) => {
    return message.parts
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    await sendMessage({ text: trimmedInput });
    setInput("");
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/20 text-[#020617] hover:bg-cyan-400 transition-colors"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
        ) : (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-28 right-8 z-[60] w-[90vw] sm:w-[400px] h-[550px] flex flex-col rounded-3xl border border-slate-800 bg-[#0f172a]/95 backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-[#1e293b]/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Ask Fintellix AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Financial Analyst Online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.length === 0 && (
                <div className="space-y-4 mt-4">
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-[#1e293b]/40 border border-slate-800 text-sm text-slate-300 leading-relaxed"
                  >
                    Hi! I&apos;m your **Fintellix Intelligence Assistant**. I have access to your current month&apos;s transactions and fraud data.
                    <br /><br />
                    How can I help you analyze your finances today?
                  </motion.div>
                  
                  <div className="grid gap-2">
                    {quickActions.map((action, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + (i * 0.1) }}
                        onClick={() => handleQuickAction(action)}
                        className="text-left px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/50 text-xs text-slate-400 hover:border-cyan-500/40 hover:text-cyan-400 hover:bg-cyan-500/5 transition-all"
                      >
                        {action}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm ${
                    m.role === 'user' 
                      ? 'bg-cyan-500 text-[#020617] font-medium' 
                      : 'bg-[#1e293b] text-slate-200 border border-slate-800'
                  }`}>
                    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800">
                      <ReactMarkdown>
                        {getMessageText(m)}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#1e293b] border border-slate-800 p-4 rounded-2xl">
                    <div className="flex gap-1">
                      <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                      <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-center">
                  Something went wrong. Please check your API key or try again.
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800 bg-[#1e293b]/30">
              <div className="relative group">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about your spending..."
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 transition-all outline-none"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-1.5 h-9 w-9 flex items-center justify-center rounded-lg bg-cyan-500 text-[#020617] hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                </button>
              </div>
              <p className="mt-2 text-[10px] text-center text-slate-500 uppercase tracking-widest font-medium">
                AI can make mistakes. Verify important financial info.
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
