import React, { useState, useRef, useEffect } from 'react';
import { InfrastructureProject } from '../../types';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  RotateCcw,
  Layers,
  CheckCircle2,
  HelpCircle,
  Zap,
  ShieldCheck
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateProjectIntelligenceResponse } from '../../utils/projectAiEngine';

const cleanMarkdown = (raw: string): string => {
  if (!raw) return '';
  let text = raw;
  // Fix single-line or compressed markdown tables: | col | |---| -> | col |\n|---|
  text = text.replace(/\|\s*\|/g, '|\n|');
  text = text.replace(/(\|\s*[-:]+[-| :]*\|)\s*(\|)/g, '$1\n$2');
  
  // Strictly enforce risk scores out of 100 instead of /10
  text = text.replace(/(\b[0-9](\.[0-9]+)?)\s*\/\s*10\b/g, (_m, score) => {
    const val = Math.min(100, Math.max(0, Math.round(parseFloat(score) * 10)));
    return `${val}/100`;
  });
  text = text.replace(/\b10(\.0+)?\s*\/\s*10\b/g, '100/100');
  text = text.replace(/\(0\s*=\s*no risk,\s*10\s*=\s*maximum risk\)/gi, '(0 = low risk, 100 = critical risk)');

  // Clean hallucinated fake endpoint paths
  text = text.replace(/GET\s+\/projects\/[^\s\n]+/gi, '');
  return text.trim();
};

interface AiAssistantViewProps {
  projects: InfrastructureProject[];
  onSelectProject: (project: InfrastructureProject) => void;
  onNavigate: (view: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
  matchedProject?: InfrastructureProject;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  projects,
  onSelectProject,
  onNavigate,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<'groq' | 'gemini' | 'offline'>(() => {
    return (localStorage.getItem('nirmaanx_ai_provider') as any) || 'groq';
  });

  const handleProviderChange = (p: 'groq' | 'gemini' | 'offline') => {
    setSelectedProvider(p);
    localStorage.setItem('nirmaanx_ai_provider', p);
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = sessionStorage.getItem('paimana_ai_chat_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: 'welcome-msg',
        sender: 'assistant',
        text: `### Welcome to NirmaanX AI Project Intelligence Assistant

I am your official decision-support assistant for the **Ministry of Statistics and Programme Implementation (MoSPI)** infrastructure monitoring portfolio, engineered by **Team InfraMinds**.

**I am trained to answer questions about all ${projects.length} monitored projects.** You can switch between **Groq (Llama 3.3)**, **Gemini 3.7**, and **Offline Engine** using the model toggle above!

Try asking me:
- **Why a project is at risk**: e.g., *"Why is Delhi-Amritsar-Katra Expressway at risk?"*
- **When a project started**: e.g., *"When did Subansiri project start?"*
- **Cost & Expenditure**: e.g., *"What is the cost overrun of AIIMS Guwahati?"*
- **Search by Project Code**: e.g., \`N04000092\`, \`180100221\`, \`612786\`, or \`N24001533\`
- **Portfolio Analytics**: e.g., *"Which projects have highest delay in Railways?"* or *"Show divergence anomalies"*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'NirmaanX Project Intelligence Engine',
      },
    ];
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('paimana_ai_chat_session', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  const handleClearChat = () => {
    sessionStorage.removeItem('paimana_ai_chat_session');
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: 'Session history cleared. How can I assist you with MoSPI infrastructure monitoring today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'NirmaanX Project Intelligence Engine',
      }
    ]);
  };

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const PRESET_QUERIES = [
    'Why is Delhi-Amritsar-Katra Expressway at critical risk?',
    'When did Subansiri project start and what is its delay?',
    'What is the cost overrun of AIIMS Guwahati?',
    'Why is Mumbai Metro Line 3 delayed?',
    'Show projects with high expenditure-progress divergence',
    'Which Railway projects are at critical risk?',
  ];

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInputQuery('');
    setIsLoading(true);

    const safeProjects = Array.isArray(projects) ? projects : [];

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          provider: selectedProvider,
          history: messages.slice(-6).map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const replyText = data.reply || data.explanation || 'Analysis completed.';

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'NirmaanX Project Intelligence Engine',
        matchedProject: data.matchedProject,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      // Fallback directly to client-side deterministic project intelligence engine
      const engineResult = generateProjectIntelligenceResponse(textToSend, safeProjects);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: engineResult.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: `${engineResult.source} (Client Engine)`,
        matchedProject: engineResult.matchedProject,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([messages[0]]);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                selectedProvider === 'groq'
                  ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                  : selectedProvider === 'gemini'
                  ? 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
                  : 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
              }`}
            >
              {selectedProvider === 'groq'
                ? '⚡ Groq (Llama 3.3 70B) Active'
                : selectedProvider === 'gemini'
                ? '✨ Gemini 3.7 Flash Active'
                : '🛡️ Offline Rules Active'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Grounded on {projects.length} MoSPI Projects
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            LLM Project Intelligence Assistant
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Query project delays, budget escalations, and root-cause explanations in natural language.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Dual Engine Model Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => handleProviderChange('groq')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedProvider === 'groq'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Groq Llama 3.3 70B (Sub-second speed)"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Groq (GPT-OSS / Llama)</span>
            </button>
            <button
              onClick={() => handleProviderChange('gemini')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedProvider === 'gemini'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Google Gemini 3.7 Flash"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini 3.7</span>
            </button>
            <button
              onClick={() => handleProviderChange('offline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedProvider === 'offline'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Built-in Offline Heuristic & Rule Engine"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Offline</span>
            </button>
          </div>

          <button
            onClick={handleClearChat}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-900 text-xs font-medium hover:bg-slate-100 transition-all border border-slate-200 shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Session</span>
          </button>
        </div>
      </div>

      {/* Preset Suggested Questions */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Recommended Analytical Queries (Click to Run):</span>
        </span>
        <div className="flex flex-wrap gap-2.5">
          {PRESET_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl bg-white hover:bg-purple-50 text-slate-800 hover:text-purple-900 border border-slate-200 shadow-2xs hover:border-purple-300 transition-all text-left disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-500 mr-1">Direct Project Queries:</span>
          {[
            { label: 'Delhi-Amritsar-Katra (Why at risk?)', query: 'Why is Delhi-Amritsar-Katra Expressway at risk?' },
            { label: 'Subansiri HEP (When started?)', query: 'When did Subansiri project start?' },
            { label: 'AIIMS Guwahati (Cost Overrun)', query: 'What is the cost overrun of AIIMS Guwahati?' },
            { label: 'Hollongi Airport (Code N04000092)', query: 'N04000092' },
            { label: 'Bullet Train (Status)', query: 'Status of Mumbai Ahmedabad High Speed Rail Bullet Train' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(item.query)}
              disabled={isLoading}
              className="text-xs px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 transition-all font-medium disabled:opacity-50"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[680px] overflow-hidden">
        {/* Messages Feed */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-5 bg-slate-50/60">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div
                  className={`max-w-3xl rounded-2xl p-5 text-sm sm:text-base leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-purple-700 text-white rounded-tr-xs font-medium'
                      : 'bg-white text-slate-900 rounded-tl-xs border border-slate-200'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap text-sm sm:text-base font-medium">{msg.text}</p>
                  ) : (
                    <div className="prose prose-sm sm:prose-base max-w-none text-slate-800 space-y-2 leading-relaxed">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({ node, ...props }) => (
                            <div className="my-3 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs max-w-full">
                              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[540px]" {...props} />
                            </div>
                          ),
                          thead: ({ node, ...props }) => (
                            <thead className="bg-slate-100/90 text-slate-700 font-semibold text-xs border-b border-slate-200 uppercase tracking-wider" {...props} />
                          ),
                          tbody: ({ node, ...props }) => (
                            <tbody className="divide-y divide-slate-100 bg-white" {...props} />
                          ),
                          tr: ({ node, ...props }) => (
                            <tr className="hover:bg-slate-50/80 transition-colors" {...props} />
                          ),
                          th: ({ node, ...props }) => (
                            <th className="px-3.5 py-2.5 font-bold text-slate-800 text-xs border-b border-slate-200 whitespace-nowrap" {...props} />
                          ),
                          td: ({ node, ...props }) => (
                            <td className="px-3.5 py-2.5 text-slate-700 align-top text-xs sm:text-sm leading-snug" {...props} />
                          ),
                          p: ({ node, ...props }) => (
                            <p className="my-1.5 leading-relaxed" {...props} />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul className="my-2 list-disc list-inside space-y-1" {...props} />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol className="my-2 list-decimal list-inside space-y-1" {...props} />
                          ),
                          li: ({ node, ...props }) => (
                            <li className="leading-relaxed" {...props} />
                          ),
                          h1: ({ node, ...props }) => (
                            <h1 className="text-base sm:text-lg font-bold text-slate-900 mt-3 mb-1" {...props} />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2 className="text-sm sm:text-base font-bold text-slate-900 mt-2.5 mb-1" {...props} />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 mt-2 mb-1" {...props} />
                          ),
                        }}
                      >
                        {cleanMarkdown(msg.text)}
                      </ReactMarkdown>
                    </div>
                  )}

                  <div
                    className={`mt-3 flex items-center justify-between text-xs ${
                      isUser ? 'text-purple-200' : 'text-slate-500'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.source && <span className="font-mono font-medium">({msg.source})</span>}
                  </div>
                </div>

                {isUser && (
                  <div className="w-10 h-10 rounded-xl bg-purple-800 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3.5 justify-start items-center">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 animate-spin" />
              </div>
              <div className="bg-white rounded-2xl p-4 text-sm text-slate-600 border border-slate-200 flex items-center gap-2.5 shadow-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-bounce" />
                <div className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-bounce" style={{ animationDelay: '0.4s' }} />
                <span className="font-semibold text-slate-800 ml-1.5 text-sm sm:text-base">
                  Analyzing infrastructure telemetry & formulating prescriptive brief...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              placeholder="Ask anything about infrastructure delays, cost overruns, ministries, or project risks..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-5 py-3 text-sm sm:text-base focus:outline-hidden focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all font-medium disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="px-6 py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-sm sm:text-base font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-40 disabled:pointer-events-none shrink-0"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
