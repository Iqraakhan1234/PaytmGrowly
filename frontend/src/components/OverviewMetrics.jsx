import React, { useState } from 'react';
import { IndianRupee, Target, TrendingUp, TrendingDown, Users, Info } from 'lucide-react';

export default function OverviewMetrics({ merchant, transactions }) {
  const [selectedDay, setSelectedDay] = useState(null);

  if (!merchant || !transactions) return null;

  const metrics = merchant.metrics || {};
  const dailySummaries = transactions.daily_summaries || [];
  const maxSales = Math.max(...dailySummaries.map(d => d.total_sales), 25000);
  const diffPct = Math.round(((metrics.today_sales - metrics.daily_average_sales) / metrics.daily_average_sales) * 100);
  const targetPct = Math.min(Math.round((metrics.today_sales / metrics.daily_target) * 100), 100);

  return (
    <div className="space-y-6">
      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Sales */}
        <div className="bg-white rounded-2xl p-5 border border-paper-muted shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-ink-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Sales</span>
            <div className="w-8 h-8 rounded-lg bg-navy/5 flex items-center justify-center text-navy">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-navy">
              ₹{metrics.today_sales?.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-semibold text-ink-muted">
              {metrics.today_transactions} txns
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-ink-muted">
                Target: ₹{metrics.daily_target?.toLocaleString('en-IN')}
              </span>
              <span className="font-bold text-navy">{targetPct}%</span>
            </div>
            <div className="w-full bg-paper rounded-full h-2 overflow-hidden border border-paper-muted">
              <div
                className="bg-gold h-full rounded-full transition-all duration-500"
                style={{ width: `${targetPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Vs Daily Average */}
        <div className="bg-white rounded-2xl p-5 border border-paper-muted shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-ink-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Vs Daily Average</span>
            <div className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center text-teal">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-navy">
              ₹{metrics.daily_average_sales?.toLocaleString('en-IN')}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
              diffPct >= 0 ? 'bg-teal/15 text-teal-dark' : 'bg-amber-100 text-amber-800'
            }`}>
              {diffPct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {diffPct >= 0 ? `+${diffPct}%` : `${diffPct}%`}
            </span>
          </div>
          <p className="mt-3 text-[11px] text-ink-muted">
            Historical store average across all weekdays (Sector 14 benchmark).
          </p>
        </div>

        {/* Card 3: Repeat Customer Rate */}
        <div className="bg-white rounded-2xl p-5 border border-paper-muted shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-ink-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Repeat Customer Rate</span>
            <div className="w-8 h-8 rounded-lg bg-gold/15 flex items-center justify-center text-gold-dark">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-teal">
              {metrics.repeat_customer_rate_pct}%
            </span>
            <span className="text-xs font-medium text-ink-subtle">
              {metrics.active_customers_count} regular patrons
            </span>
          </div>
          <div className="mt-3 text-[11px] text-ink-muted flex items-center justify-between">
            <span>
              Lapsed regulars: <strong className="text-red-600 font-bold">{metrics.lapsed_customers_count}</strong>
            </span>
            <span className="text-teal font-semibold">High loyalty index</span>
          </div>
        </div>

        {/* Card 4: Paytm Soundbox Live */}
        <div className="bg-navy rounded-2xl p-5 border border-navy-light text-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-paper-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Paytm Soundbox</span>
            <span className="w-2.5 h-2.5 rounded-full bg-teal animate-pulse" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-white">
              {metrics.today_transactions}
            </span>
            <span className="text-xs text-gold font-bold">Audio confirmed</span>
          </div>
          <div className="mt-3 text-[11px] text-paper-muted flex items-center justify-between border-t border-navy-light pt-2">
            <span>
              Avg ticket: <strong className="text-white font-mono">₹{Math.round(metrics.today_sales / metrics.today_transactions)}</strong>
            </span>
            <span className="text-teal-light font-mono">{merchant.soundbox_id}</span>
          </div>
        </div>
      </div>

      {/* 7-Day Trend Bar Chart Section */}
      <div className="bg-white rounded-2xl p-6 border border-paper-muted shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-display text-lg font-bold text-navy">7-Day Sales Pattern & Trend</h3>
              <span className="text-[11px] bg-paper text-ink-muted px-2 py-0.5 rounded font-medium">Live POS Data</span>
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              Hover over days to inspect sales volume, customer count, and anomalies like the Tuesday afternoon dip.
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-navy inline-block" />
              <span className="text-ink-muted">Normal Days</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-amber-400 inline-block" />
              <span className="text-ink-muted">Tuesday Slump</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded bg-gold inline-block" />
              <span className="text-ink-muted">Today (In Progress)</span>
            </div>
          </div>
        </div>

        {/* Bar Visualizer */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end pt-6 pb-2 min-h-[190px]">
          {dailySummaries.map((summary) => {
            const barHeightPct = Math.round((summary.total_sales / maxSales) * 100);
            const isTuesday = summary.day.includes('Tuesday');
            const isToday = summary.day.includes('Today');
            const isSelected = selectedDay?.date === summary.date;

            return (
              <div
                key={summary.date}
                onClick={() => setSelectedDay(isSelected ? null : summary)}
                className={`group flex flex-col items-center cursor-pointer transition-transform hover:-translate-y-1 ${
                  isSelected ? 'scale-105' : ''
                }`}
              >
                <span className="text-[11px] font-mono font-bold text-navy opacity-80 group-hover:opacity-100 mb-1">
                  ₹{(summary.total_sales / 1000).toFixed(1)}k
                </span>
                <div className="w-full max-w-[48px] bg-paper-muted rounded-t-xl overflow-hidden flex flex-col justify-end h-36 border border-paper-muted group-hover:border-navy transition-colors">
                  <div
                    className={`w-full rounded-t-xl transition-all duration-300 ${
                      isTuesday
                        ? 'bg-amber-400 hover:bg-amber-500'
                        : isToday
                        ? 'bg-gold hover:bg-gold-light'
                        : 'bg-navy hover:bg-navy-light'
                    }`}
                    style={{ height: `${barHeightPct}%` }}
                  />
                </div>
                <div className="text-center mt-2">
                  <div className={`text-xs font-bold truncate ${
                    isToday ? 'text-gold-dark' : isTuesday ? 'text-amber-800' : 'text-navy'
                  }`}>
                    {summary.day.split(' ')[0].slice(0, 3)}
                  </div>
                  <div className="text-[10px] text-ink-subtle">
                    {summary.date.slice(8)}th
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Day Info Popup or Anomaly Tip */}
        {selectedDay ? (
          <div className="mt-4 p-4 rounded-xl bg-paper border border-paper-muted flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-navy">{selectedDay.day} ({selectedDay.date})</span>:
              <span className="font-mono font-bold text-navy ml-1">₹{selectedDay.total_sales.toLocaleString('en-IN')}</span>
              {' '}across {selectedDay.transaction_count} orders (Avg ticket: ₹{selectedDay.avg_ticket}).
              {selectedDay.notes && (
                <p className="text-amber-800 mt-1 font-medium">⚠️ Note: {selectedDay.notes}</p>
              )}
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-xs font-bold text-navy hover:underline self-start sm:self-auto"
            >
              Close Details
            </button>
          </div>
        ) : (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200/70 flex items-start gap-3 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">AI Pattern Insight:</span> Notice the sharp drop on Tuesday (₹11,200 vs ₹16,500 weekday avg). The AI insight engine below has pinpointed a 12 PM - 4 PM idle window and created a recovery action.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
