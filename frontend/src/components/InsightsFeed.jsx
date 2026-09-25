import React, { useState } from 'react';
import {
  Sparkles,
  OctagonAlert,
  TriangleAlert,
  TrendingUp,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  ArrowRight
} from 'lucide-react';

export default function InsightsFeed({
  insights = [],
  onOpenActionModal,
  executedActions = []
}) {
  const [expandedReasoning, setExpandedReasoning] = useState({});

  const toggleReasoning = (id) => {
    setExpandedReasoning((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'critical':
        return {
          badge: 'bg-red-100 text-red-700 border-red-200',
          border: 'border-l-4 border-l-red-500',
          icon: <OctagonAlert className="w-5 h-5 text-red-600" />
        };
      case 'warning':
        return {
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          border: 'border-l-4 border-l-amber-500',
          icon: <TriangleAlert className="w-5 h-5 text-amber-600" />
        };
      case 'opportunity':
        return {
          badge: 'bg-gold/15 text-gold-dark border-gold/30',
          border: 'border-l-4 border-l-gold',
          icon: <TrendingUp className="w-5 h-5 text-gold-dark" />
        };
      default:
        return {
          badge: 'bg-teal/15 text-teal-dark border-teal/30',
          border: 'border-l-4 border-l-teal',
          icon: <Zap className="w-5 h-5 text-teal" />
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center text-gold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-display font-bold text-xl text-navy">Proactive AI Insights</h2>
              <span className="text-xs bg-gold/20 text-navy font-extrabold px-2 py-0.5 rounded-full border border-gold/40">
                {insights.length} Detected
              </span>
            </div>
            <p className="text-xs text-ink-muted">
              Auto-detected by PaytmGrowly engine from your live transactions, stock, and loyalty data.
            </p>
          </div>
        </div>
        <div className="text-xs text-ink-subtle font-medium">
          Watching your store 24/7 — no setup needed
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight) => {
          const style = getSeverityStyle(insight.severity);
          const isExpanded = !!expandedReasoning[insight.id];
          const executed = executedActions.find(
            (act) => act.action_id === insight.recommended_action?.action_id
          );

          return (
            <div
              key={insight.id}
              className={`bg-white rounded-2xl p-5 border border-paper-muted shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${style.border}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center space-x-2">
                    {style.icon}
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${style.badge}`}>
                      {insight.tag}
                    </span>
                  </div>
                  {executed ? (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal/15 text-teal border border-teal/40 flex items-center gap-1">
                      <CircleCheck className="w-3 h-3 text-teal" />
                      Executed
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-ink-subtle">
                      Needs Action
                    </span>
                  )}
                </div>

                <h3 className="font-display font-bold text-navy text-base leading-snug">
                  {insight.title}
                </h3>
                <p className="text-xs text-ink-muted mt-1.5 leading-relaxed">
                  {insight.summary}
                </p>

                {/* Reasoning Accordion */}
                <div className="mt-3">
                  <button
                    onClick={() => toggleReasoning(insight.id)}
                    className="flex items-center space-x-1.5 text-xs font-bold text-navy hover:text-gold-dark transition-colors py-1"
                  >
                    <Info className="w-3.5 h-3.5 text-gold-dark" />
                    <span>Why AI suggested this (Reasoning Trail)</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {isExpanded && insight.reasoning && (
                    <div className="mt-2 p-3 bg-paper rounded-xl border border-paper-muted text-xs space-y-2 animate-in fade-in duration-150">
                      <div className="text-[11px] text-ink font-medium leading-relaxed">
                        <strong>Logic:</strong> {insight.reasoning.plain_reason}
                      </div>
                      <div className="pt-2 border-t border-paper-muted grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-ink-muted">
                        <div>
                          <span className="font-bold text-navy">Data Source:</span>{' '}
                          {insight.reasoning.data_source}
                        </div>
                        <div>
                          <span className="font-bold text-navy">Trigger:</span>{' '}
                          {insight.reasoning.trigger_condition}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Trigger Area */}
              {insight.recommended_action && (
                <div className="mt-5 pt-4 border-t border-paper-muted flex items-center justify-between gap-3">
                  <div className="text-[11px] text-ink-subtle">
                    {executed ? (
                      <span className="text-teal font-medium flex items-center gap-1">
                        <CircleCheck className="w-3.5 h-3.5" />
                        Dispatched at{' '}
                        {new Date(executed.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    ) : (
                      <span>1-click merchant action</span>
                    )}
                  </div>

                  {executed ? (
                    <button
                      onClick={() => onOpenActionModal(insight.recommended_action)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-paper border border-paper-muted text-navy hover:bg-paper-muted transition-colors flex items-center space-x-1.5"
                    >
                      <span>View Receipt</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenActionModal(insight.recommended_action)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-gold hover:bg-gold-light text-navy-dark shadow-sm transition-all flex items-center space-x-1.5 active:scale-95 group"
                    >
                      <span>{insight.recommended_action.button_label}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
