import React from 'react';
import { Sparkles, X, Target, Clock, ShieldCheck, CircleCheck } from 'lucide-react';

export default function PitchModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-paper-muted overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="bg-navy text-white px-6 py-5 flex items-center justify-between border-b border-navy-light">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center text-navy font-bold shadow-md">
              <Sparkles className="w-6 h-6 text-navy-dark" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-display font-bold text-lg text-white">
                  Demo-Day Pitch & 90-Second Script
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-gold/20 text-gold px-2 py-0.5 rounded border border-gold/30">
                  Judges Walkthrough
                </span>
              </div>
              <p className="text-xs text-paper-muted">
                Track 1: Merchant Growth AI • PaytmGrowly
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-paper-muted hover:text-white p-1.5 rounded-xl hover:bg-navy-light transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto font-sans text-xs text-ink leading-relaxed">
          {/* Core Value Proposition */}
          <div className="bg-gold/10 border border-gold/30 rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center space-x-1.5 text-gold-dark font-bold text-xs uppercase tracking-wider">
              <Target className="w-4 h-4" />
              <span>Core Value Proposition</span>
            </div>
            <p className="text-ink font-medium">
              "Paytm Soundbox gave merchants a voice for payments.{' '}
              <strong>PaytmGrowly</strong> gives merchants an AI brain to proactively grow their business — turning passive transaction telemetry into unprompted insights and 1-click executable growth actions."
            </p>
          </div>

          {/* 90-Second Flow */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-navy text-sm flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gold-dark" />
              <span>90-Second Demo Execution Flow</span>
            </h4>

            {/* Step 1 */}
            <div className="p-3.5 rounded-xl bg-paper border border-paper-muted flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-navy text-gold font-bold flex items-center justify-center shrink-0 text-xs">
                1
              </div>
              <div className="space-y-1">
                <div className="font-bold text-navy">
                  Open Pulse Dashboard (The Problem Context)
                </div>
                <p className="text-ink-muted">
                  Show Gupta General Store's pulse: ₹14,280 sales today. Highlight the{' '}
                  <strong>7-Day Sales Trend</strong> and point out the Tuesday slump bar (₹11,200 vs ₹16,500 weekday average).
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-xl bg-paper border border-paper-muted flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-navy text-gold font-bold flex items-center justify-center shrink-0 text-xs">
                2
              </div>
              <div className="space-y-1">
                <div className="font-bold text-navy">
                  Show Unprompted Proactive Insights (The "AI Notices" Moment)
                </div>
                <p className="text-ink-muted">
                  Scroll to <strong>Proactive Insights</strong>. Emphasize that the AI surfaced these <em>without being asked</em>:
                  <br />
                  • <strong>Stockout Risk:</strong> Sunflower Oil & Butter run out in 14–19 hours.
                  <br />
                  • <strong>Lapsed Regulars:</strong> Priya Verma (18 days inactive) & Vikas Mehra (22 days inactive).
                  <br />
                  • Click <strong>"Why AI suggested this (Reasoning Trail)"</strong> to show complete transparency (no black box).
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 rounded-xl bg-paper border border-paper-muted flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-navy text-gold font-bold flex items-center justify-center shrink-0 text-xs">
                3
              </div>
              <div className="space-y-1">
                <div className="font-bold text-navy">
                  Execute 1-Click Action with Dynamic Copy (The "AI Acts" Moment)
                </div>
                <p className="text-ink-muted">
                  Click <strong>"Send ₹50 Welcome-Back Voucher"</strong>. Show the modal generating a customized Hinglish WhatsApp draft citing Priya's favorite items (<em>Fortune Sunflower Oil & Brooke Bond Tea</em>). Approve it and show the visible state update in the <strong>Action Activity Log</strong>.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-3.5 rounded-xl bg-paper border border-paper-muted flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-navy text-gold font-bold flex items-center justify-center shrink-0 text-xs">
                4
              </div>
              <div className="space-y-1">
                <div className="font-bold text-navy">
                  Ask Free-Form Question in Chat Copilot
                </div>
                <p className="text-ink-muted">
                  Click the prompt chip: <em>"Why did sales drop on Tuesday?"</em>. Show how the AI explains the 12 PM - 4 PM idle window and offers a 1-tap "Schedule Tuesday Happy Hours" action.
                </p>
              </div>
            </div>
          </div>

          {/* Prepared Answers for Judges */}
          <div className="bg-paper p-4 rounded-2xl border border-paper-muted space-y-2.5">
            <h4 className="font-display font-bold text-navy text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal" />
              <span>Prepared Answers for Judges</span>
            </h4>
            <div className="space-y-2 text-[11px]">
              <div>
                <strong className="text-navy">Q: How does this plug into real Paytm infrastructure?</strong>
                <p className="text-ink-muted">
                  A: It consumes Soundbox payment webhooks (item basket, customer VPA, time of day) and POS catalog records. Our schema matches production transaction streams.
                </p>
              </div>
              <div>
                <strong className="text-navy">Q: Why not just an ordinary dashboard?</strong>
                <p className="text-ink-muted">
                  A: Kirana merchants don't have time to stare at graphs between customers. PaytmGrowly proactively acts on their behalf with guardrailed approval.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-paper px-6 py-4 border-t border-paper-muted flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[11px] text-ink-subtle">
            <CircleCheck className="w-4 h-4 text-teal" />
            <span>Ready for live judging presentation</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-navy hover:bg-navy-light text-white transition-all shadow-sm active:scale-95"
          >
            Got it, Start Demo
          </button>
        </div>
      </div>
    </div>
  );
}
