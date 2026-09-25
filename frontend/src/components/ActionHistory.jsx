import React from 'react';
import { Clock, CircleCheck } from 'lucide-react';

export default function ActionHistory({ executedActions = [] }) {
  if (!executedActions || executedActions.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-paper-muted text-center space-y-2">
        <div className="w-10 h-10 rounded-xl bg-paper flex items-center justify-center text-ink-subtle mx-auto">
          <Clock className="w-5 h-5" />
        </div>
        <h4 className="font-display font-bold text-navy text-sm">
          No Actions Executed Yet
        </h4>
        <p className="text-xs text-ink-muted max-w-sm mx-auto">
          Click any 1-Click Action button in the Proactive Insights or Chat Copilot above to execute simulated supplier orders or customer vouchers.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-paper-muted shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-teal/15 flex items-center justify-center text-teal">
            <CircleCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-navy text-base">
              Executed Actions & Activity Log
            </h3>
            <p className="text-xs text-ink-muted">
              Live record of automated WhatsApp purchase orders, customer retention vouchers, and schedule triggers.
            </p>
          </div>
        </div>
        <span className="text-xs bg-teal/15 text-teal font-extrabold px-3 py-1 rounded-full border border-teal/30">
          {executedActions.length} Executed
        </span>
      </div>

      <div className="divide-y divide-paper-muted">
        {executedActions.map((act) => (
          <div key={act.execution_id} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-navy">{act.summary}</span>
                <span className="text-[10px] font-mono bg-paper px-2 py-0.5 rounded text-ink-muted">
                  {act.execution_id}
                </span>
              </div>
              <div className="text-[11px] text-ink-subtle flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" />
                <span>{new Date(act.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>

            {act.message_sent && (
              <div className="bg-paper p-3 rounded-xl text-xs text-ink font-sans border border-paper-muted whitespace-pre-line leading-relaxed">
                <div className="text-[10px] font-bold text-navy uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Message Sent:</span>
                  <span className="text-teal font-semibold flex items-center gap-1">
                    <CircleCheck className="w-3 h-3" />
                    Dispatched
                  </span>
                </div>
                {act.message_sent}
              </div>
            )}

            {act.details && (
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-ink-muted">
                {act.details.supplier && (
                  <span>
                    Supplier: <strong className="text-navy">{act.details.supplier}</strong>
                  </span>
                )}
                {act.details.voucher_code && (
                  <span>
                    Code: <strong className="font-mono text-teal font-bold">{act.details.voucher_code}</strong>
                  </span>
                )}
                {act.details.est_delivery && (
                  <span>
                    ETA: <strong className="text-navy">{act.details.est_delivery}</strong>
                  </span>
                )}
                {act.details.status && (
                  <span className="text-gold-dark font-bold">
                    Status: {act.details.status}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
