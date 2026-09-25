import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Users,
  Package,
  Languages,
  RefreshCw,
  MessageSquare,
  WandSparkles,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

const TONES = [
  { id: 'hinglish', label: 'Warm Hinglish', desc: 'Natural Hindi-English mix for local regulars' },
  { id: 'friendly', label: 'Friendly & Direct', desc: 'Polite, clear shop-owner message' },
  { id: 'urgent', label: 'Urgent & Flash Deal', desc: 'High urgency for slow hours' }
];

export default function ActionModal({
  isOpen,
  onClose,
  action,
  onConfirm,
  isExecuting
}) {
  if (!isOpen || !action) return null;

  const [messageDraft, setMessageDraft] = useState(action.default_message || '');
  const [selectedTone, setSelectedTone] = useState('hinglish');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiReasoning, setAiReasoning] = useState('');
  const [isManuallyEdited, setIsManuallyEdited] = useState(false);

  const generateCopy = async (tone = selectedTone) => {
    setIsGenerating(true);
    try {
      const payload = {
        action_type: action.type,
        customer_name: action.target_customers?.[0]?.name || action.action_title,
        customer_id: action.target_customers?.[0]?.customer_id,
        favorite_items: action.target_customers?.[0]?.favorites || [],
        discount: action.discount || action.offer_value || '₹50 OFF',
        time_slot: action.time_slot,
        supplier_name: action.supplier_name,
        items: action.items_to_order || [],
        tone: tone
      };

      const res = await fetch('/api/marketing/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const json = await res.json();
        setMessageDraft(json.message || action.default_message);
        setAiReasoning(json.reasoning || '');
        setIsManuallyEdited(false);
      }
    } catch (err) {
      console.warn('Could not auto-generate copy, retaining default message:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (isOpen && action) {
      generateCopy('hinglish');
    }
  }, [isOpen, action?.action_id]);

  const handleToneChange = (toneId) => {
    setSelectedTone(toneId);
    generateCopy(toneId);
  };

  const handleTextChange = (e) => {
    setMessageDraft(e.target.value);
    setIsManuallyEdited(true);
  };

  const handleExecute = () => {
    onConfirm({
      ...action,
      custom_message: messageDraft,
      tone_used: selectedTone,
      ai_reasoning: aiReasoning
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-paper-muted overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="bg-navy text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center text-navy font-bold">
              <Sparkles className="w-5 h-5 text-navy-dark" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">Review & Send</h3>
              <p className="text-[11px] text-paper-muted">
                Edit the message, choose tone, then approve to send
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-paper-muted hover:text-white p-1 rounded-lg hover:bg-navy-light transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gold/15 text-gold-dark border border-gold/30">
              {action.type?.replace(/_/g, ' ')}
            </span>
            <h4 className="font-display font-bold text-navy text-lg mt-2">
              {action.action_title || action.button_label}
            </h4>
          </div>

          {/* Context Snippet for Customer Offer */}
          {action.type === 'SEND_PROMO_OFFER' && (
            <div className="bg-paper p-3 rounded-xl border border-paper-muted text-xs space-y-1.5">
              <div className="flex items-center justify-between font-semibold text-navy">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-teal" />
                  Target: {action.target_customers?.map((c) => c.name).join(', ')}
                </span>
                <span className="text-teal font-bold">{action.offer_value}</span>
              </div>
              {action.target_customers?.[0]?.favorites && (
                <div className="text-[11px] text-ink-subtle">
                  Favorite Basket items:{' '}
                  <strong className="text-navy">
                    {action.target_customers[0].favorites.join(', ')}
                  </strong>
                </div>
              )}
            </div>
          )}

          {/* Context Snippet for Stock Reorder */}
          {action.type === 'REORDER_STOCK' && (
            <div className="bg-paper p-3 rounded-xl border border-paper-muted text-xs space-y-1.5">
              <div className="flex items-center justify-between font-semibold text-navy">
                <span className="flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-gold-dark" />
                  Supplier: {action.supplier_name}
                </span>
                <span className="text-ink-subtle">{action.supplier_contact}</span>
              </div>
            </div>
          )}

          {/* Tone Selector */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-navy flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-gold-dark" />
                <span>AI Tone & Language Selection</span>
              </span>
              <button
                type="button"
                onClick={() => generateCopy(selectedTone)}
                disabled={isGenerating}
                className="text-[11px] font-bold text-gold-dark hover:text-gold flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>Regenerate Draft</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {TONES.map((tone) => (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => handleToneChange(tone.id)}
                  className={`p-2 rounded-xl text-left border transition-all text-xs ${
                    selectedTone === tone.id
                      ? 'border-gold bg-gold/10 text-navy font-bold shadow-sm'
                      : 'border-paper-muted bg-paper text-ink-muted hover:border-navy/30'
                  }`}
                >
                  <div className="truncate text-[11px]">{tone.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Message Draft Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-navy flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-navy" />
                <span>Message Draft (Preview & Edit)</span>
              </label>
              {isManuallyEdited ? (
                <span className="text-[10px] text-gold-dark font-medium">
                  Manually Edited
                </span>
              ) : (
                <span className="text-[10px] text-teal font-medium flex items-center gap-1">
                  <WandSparkles className="w-3 h-3 text-teal" />
                  Auto-Generated from Profile Context
                </span>
              )}
            </div>
            <div className="relative">
              <textarea
                rows={4}
                value={messageDraft}
                onChange={handleTextChange}
                disabled={isGenerating}
                className="w-full text-xs font-sans bg-paper border border-paper-muted rounded-xl p-3 text-ink focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent leading-relaxed"
                placeholder="Message payload..."
              />
              {isGenerating && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] rounded-xl flex items-center justify-center text-xs text-navy font-bold space-x-2">
                  <div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                  <span>Drafting tailored copy...</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Context Rationale */}
          {aiReasoning && (
            <div className="bg-paper p-2.5 rounded-xl border border-paper-muted text-[11px] text-ink-muted">
              <strong className="text-navy">AI Context Rationale:</strong> {aiReasoning}
            </div>
          )}

          {/* Safe Guardrail Notice */}
          <div className="flex items-center gap-2 text-[11px] text-ink-muted bg-paper/60 p-2.5 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-teal shrink-0" />
            <span>
              Human-in-the-loop control: No message is dispatched without your review and approval.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-paper px-6 py-4 border-t border-paper-muted flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isExecuting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-ink-muted hover:text-navy transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExecute}
            disabled={isExecuting || !messageDraft.trim()}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-navy hover:bg-navy-light text-white shadow-sm transition-all flex items-center space-x-1.5 active:scale-95 disabled:opacity-50"
          >
            {isExecuting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Executing...</span>
              </>
            ) : (
              <>
                <span>Approve & Execute via Paytm Gateway</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
