import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, User, MessageSquare, RefreshCw, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { InfrastructureProject } from '../../types';
import { generateProjectIntelligenceResponse } from '../../utils/projectAiEngine';

interface FloatingChatbotProps {
  projects: InfrastructureProject[];
  activeProject?: InfrastructureProject | null;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
  matchedProject?: InfrastructureProject;
}

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({ projects = [], activeProject }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `### Welcome to NirmaanX Project Intelligence Assistant
I am your official decision-support assistant for the **Ministry of Statistics and Programme Implementation (MoSPI)**, powered by **Team InfraMinds**.

**You can ask me about any project!** Try:
- Providing any **Project ID** or **Project Code** (e.g., \`N04000092\`, \`180100221\`, \`612786\`)
- Asking *"Why is [Project Name] at risk?"*
- Asking *"When did [Project Name] start?"*
- Checking cost overruns, delay months, or statutory clearances!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'NirmaanX Project Intelligence Engine',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const PRESET_QUERIES = [
    'Why is Delhi-Amritsar-Katra at risk?',
    'When did Subansiri project start?',
    'Cost overrun of AIIMS Guwahati',
    'Which projects are at critical risk?',
    'Top 3 cost escalation projects',
  ];

  const displayPresets = activeProject
    ? [
        `Why is this project at risk?`,
        `When did this project start?`,
        `Cost & budget details`,
        `Statutory clearances & land`,
      ]
    : PRESET_QUERIES;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToSend = customQuery || inputQuery;
    if (!queryToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customQuery) setInputQuery('');
    setIsLoading(true);

    const safeProjects = Array.isArray(projects) ? projects : [];

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: queryToSend,
          activeProjectId: activeProject?.id,
          activeProject: activeProject,
          projectContext: {
            totalProjects: safeProjects.length,
            projects: safeProjects,
          },
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        throw new Error(`Invalid response format or status ${res.status}`);
      }

      const data = await res.json();
      const replyText = data.reply || data.explanation || 'Analysis completed.';

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'PAIMANA Project Intelligence Engine',
        matchedProject: data.matchedProject || (activeProject || undefined),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      // Direct high-precision project intelligence engine fallback (100% data-backed, zero generic response)
      const engineResult = generateProjectIntelligenceResponse(queryToSend, safeProjects, activeProject);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: engineResult.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: `${engineResult.source} (Direct Client Engine)`,
        matchedProject: engineResult.matchedProject || (activeProject || undefined),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle AI Chatbot"
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all duration-300 z-50 flex items-center justify-center ${
          isOpen ? 'bg-rose-500 hover:bg-rose-600 rotate-90 scale-105' : 'bg-blue-700 hover:bg-blue-800 hover:scale-110 shadow-blue-900/40'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageSquare className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat Window Container */}
      <div
        className={`fixed bottom-24 right-6 w-[390px] h-[580px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-4 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/ border border-white/20 flex items-center justify-center shadow-xs">
              <Bot className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm">NirmaanX AI Assistant</h3>
              <p className="text-[10px] text-blue-200 flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3 h-3 text-amber-300" /> InfraMinds • MoSPI
              </p>
            </div>
          </div>

          <button
            onClick={() => setMessages([messages[0]])}
            title="Reset Chat"
            className="p-1.5 rounded-lg hover:bg-white/ text-blue-200 hover:text-white transition-all text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Active Project Banner */}
        {activeProject && (
          <div className="bg-blue-950 text-white px-3.5 py-2 text-xs flex items-center justify-between border-b border-blue-800 shrink-0">
            <div className="truncate flex items-center gap-1.5 flex-1 min-w-0">
              <span className="font-bold text-amber-300 text-[10px] uppercase tracking-wider shrink-0">Inspecting:</span>
              <span className="truncate font-medium text-slate-100">{activeProject.name}</span>
            </div>
            <span className="font-mono text-[9px] px-1.5 py-0.5 bg-white/ rounded shrink-0 ml-2 font-bold">{activeProject.projectCode}</span>
          </div>
        )}

        {/* Preset Query Chips */}
        <div className="bg-slate-100 dark:bg-slate-800 p-2.5 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-1.5 shrink-0">
          {displayPresets.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(undefined, q)}
              disabled={isLoading}
              className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 hover:bg-blue-50 text-slate-700 dark:text-slate-300 hover:text-blue-900 border border-slate-200 dark:border-slate-700/90 hover:border-blue-300 transition-all text-left shadow-2xs disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-800/70 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2.5`}>
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl p-3 text-xs shadow-xs leading-relaxed ${
                    isUser
                      ? 'bg-blue-700 text-white rounded-tr-none font-medium'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div className="prose prose-xs prose-p:leading-relaxed prose-headings:text-xs prose-headings:font-bold prose-headings:my-1 text-slate-800 dark:text-slate-200 max-w-none prose-li:my-0.5">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  )}
                  <div className={`text-[9px] mt-1.5 flex items-center justify-between ${isUser ? 'text-blue-200' : 'text-slate-400'}`}>
                    <span>{msg.timestamp}</span>
                    {!isUser && msg.source && <span className="font-mono text-[9px] text-slate-400">({msg.source})</span>}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-2xs">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-none p-3 shadow-xs flex items-center gap-1.5">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                <span className="text-[10px] text-slate-600 font-semibold ml-1">Analyzing MoSPI telemetry...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
          <form onSubmit={(e) => handleSendMessage(e)} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter project ID, name, or ask why at risk..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="w-9 h-9 rounded-xl bg-blue-700 hover:bg-blue-800 text-white flex items-center justify-center transition-all disabled:opacity-40 shadow-xs shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
