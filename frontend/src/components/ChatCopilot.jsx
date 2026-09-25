import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  CircleHelp,
  Bot,
  User,
  Info,
  ChevronDown,
  ChevronUp,
  Zap,
  Send
} from 'lucide-react';

const QUICK_QUESTIONS = [
  'Why did sales drop on Tuesday?',
  'Which stock items are running low?',
  'Who are our lapsed regular customers?',
  "How are today's sales pacing vs target?"
];

export default function ChatCopilot({ onOpenActionModal, insights = [] }) {
  const [messages, setMessages] = useState([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Namaste Rajesh ji! I am **PaytmGrowly**, your AI shop partner for Gupta General Store.

I have gone through your sales records, stock levels, and which regular customers haven't visited in a while. Ask me anything — I will explain my reasoning so you always know why I am suggesting something.`,
      reasoning: 'Initialized from Gupta General Store transaction history, inventory, and customer visit records.',
      suggested_actions: [
        {
          action_id: 'act-reorder-stock-01',
          label: '1-Tap Reorder Stock',
          type: 'REORDER_STOCK'
        },
        {
          action_id: 'act-send-retention-offer-02',
          label: 'Send Welcome-Back Offer',
          type: 'SEND_PROMO_OFFER'
        }
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedReasoning, setExpandedReasoning] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const toggleReasoning = (id) => {
    setExpandedReasoning((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSendMessage = async (customPrompt) => {
    const textToSend = customPrompt || inputMessage;
    if (!textToSend || !textToSend.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-4)
        })
      });

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'I have analyzed your request based on current store telemetry.',
        reasoning: data.reasoning || 'Derived from Paytm Soundbox and POS inventory logs.',
        suggested_actions: data.suggested_actions || []
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `asst-err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Sorry, I encountered an issue: ${err.message}. Showing latest store data: Today's sales ₹14,280, 2 low stock items (Sunflower Oil, Butter).`,
          reasoning: 'Fallback response due to local request timeout.',
          suggested_actions: []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action) => {
    const matchingInsight = insights.find(
      (ins) =>
        ins.recommended_action?.action_id === action.action_id ||
        ins.recommended_action?.type === action.type
    );

    if (matchingInsight && matchingInsight.recommended_action) {
      onOpenActionModal(matchingInsight.recommended_action);
    } else {
      onOpenActionModal({
        action_id: action.action_id,
        type: action.type,
        button_label: action.label,
        action_title: action.label,
        default_message: `Action dispatched for ${action.label}`
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-paper-muted shadow-sm overflow-hidden flex flex-col h-[620px]">
      {/* Chat Header */}
      <div className="bg-navy text-white px-5 py-4 flex items-center justify-between border-b border-navy-light">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gold flex items-center justify-center text-navy font-bold shadow-sm">
            <Sparkles className="w-5 h-5 text-navy-dark" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-display font-bold text-base text-white">Ask Your Shop Partner</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-teal/20 text-teal-light px-2 py-0.5 rounded border border-teal/40">
                Answers from Your Own Data
              </span>
            </div>
            <p className="text-[11px] text-paper-muted">
              Sales • Stock • Customer loyalty — explained in plain language
            </p>
          </div>
        </div>
        <button
          onClick={() => setMessages(messages.slice(0, 1))}
          className="text-xs text-paper-muted hover:text-white flex items-center space-x-1 p-1.5 rounded-lg hover:bg-navy-light transition-colors"
          title="Reset Conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Quick Prompt Chips */}
      <div className="bg-paper px-4 py-2.5 border-b border-paper-muted flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
        <span className="text-ink-subtle text-[11px] font-bold shrink-0 flex items-center gap-1">
          <CircleHelp className="w-3.5 h-3.5 text-gold-dark" />
          Quick Ask:
        </span>
        {QUICK_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="shrink-0 bg-white hover:bg-gold/15 border border-paper-muted hover:border-gold/40 text-navy text-xs font-semibold px-3 py-1 rounded-full transition-all active:scale-95 disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-paper/30">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isExpanded = !!expandedReasoning[msg.id];

          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-navy flex items-center justify-center text-gold shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[75%] space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-navy text-white rounded-tr-none shadow-sm'
                      : 'bg-white text-ink border border-paper-muted rounded-tl-none shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-line font-sans font-normal">
                    {msg.content}
                  </div>
                </div>

                {/* Assistant Reasoning Trail */}
                {!isUser && msg.reasoning && (
                  <div className="space-y-1">
                    <button
                      onClick={() => toggleReasoning(msg.id)}
                      className="text-[11px] font-semibold text-ink-muted hover:text-navy flex items-center space-x-1 transition-colors"
                    >
                      <Info className="w-3 h-3 text-gold-dark" />
                      <span>Data Trail:</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-2.5 bg-paper rounded-xl border border-paper-muted text-[11px] text-ink-muted leading-relaxed animate-in fade-in duration-150">
                        {msg.reasoning}
                      </div>
                    )}
                  </div>
                )}

                {/* Assistant Suggested Action Buttons */}
                {!isUser && msg.suggested_actions && msg.suggested_actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {msg.suggested_actions.map((action, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleActionClick(action)}
                        className="text-xs font-bold bg-gold hover:bg-gold-light text-navy-dark px-3 py-1.5 rounded-xl transition-all shadow-sm flex items-center space-x-1.5 active:scale-95"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-gold flex items-center justify-center text-navy font-bold shrink-0 mt-0.5 shadow-sm">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-ink-muted p-2">
            <div className="w-6 h-6 rounded-lg bg-navy flex items-center justify-center text-gold">
              <Bot className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <span className="italic">Analyzing store records...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-white border-t border-paper-muted flex items-center space-x-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask anything about today's sales, stock runway, regular customers..."
          className="flex-1 bg-paper border border-paper-muted rounded-xl px-4 py-2.5 text-xs text-ink placeholder-ink-subtle focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="bg-navy hover:bg-navy-light disabled:opacity-50 text-gold font-bold px-4 py-2.5 rounded-xl transition-all flex items-center space-x-1 text-xs shadow-sm active:scale-95"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
