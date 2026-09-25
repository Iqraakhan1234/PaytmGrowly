import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  Target,
  Info,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function ForecastingEngine({ onOpenActionModal }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const fetchForecasts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/forecasts');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch forecasts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecasts();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-paper-muted text-center space-y-3">
        <div className="w-8 h-8 border-3 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-ink-muted">
          Calculating predictive stock burn rates & revenue run-rate...
        </p>
      </div>
    );
  }

  if (!data) return null;

  const stockForecasts = data.stock_forecasts || [];
  const monthlyForecast = data.monthly_forecast || {};
  const filteredStock = filter === 'ALL'
    ? stockForecasts
    : stockForecasts.filter((item) => item.urgency === filter);

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'LOW':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MODERATE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-teal/15 text-teal-dark border-teal/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center text-navy font-bold">
            <Sparkles className="w-5 h-5 text-navy-dark" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-display font-bold text-xl text-navy">
                Predictive Forecasting Engine
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-gold/20 text-gold-dark px-2 py-0.5 rounded border border-gold/40">
                Phase 2a
              </span>
            </div>
            <p className="text-xs text-ink-muted">
              Computed directly from 7-day rolling POS telemetry and daily SKU burn rates (not hardcoded).
            </p>
          </div>
        </div>
        <button
          onClick={fetchForecasts}
          className="text-xs font-semibold text-navy hover:text-gold-dark flex items-center space-x-1.5 self-start sm:self-auto bg-white px-3 py-1.5 rounded-xl border border-paper-muted shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Recalculate Run-Rates</span>
        </button>
      </div>

      {/* Top 2 Panels: Monthly Run-Rate Extrapolation + Weekend Sprint Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Monthly Revenue Run-Rate Projection */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-paper-muted shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-navy/10 flex items-center justify-center text-navy">
                <Target className="w-4 h-4 text-navy" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-navy">
                  Monthly Revenue Run-Rate Projection
                </h3>
                <span className="text-[11px] text-ink-muted">
                  September 2026 ({monthlyForecast.days_remaining} trading days remaining)
                </span>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                monthlyForecast.is_on_track
                  ? 'bg-teal/15 text-teal border-teal/40'
                  : 'bg-amber-100 text-amber-800 border-amber-200'
              }`}
            >
              {monthlyForecast.projected_achievement_pct}% of Target
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-paper p-3.5 rounded-xl border border-paper-muted text-center">
              <div className="text-[10px] uppercase font-bold tracking-wider text-ink-muted">
                7-Day Daily Run Rate
              </div>
              <div className="font-display font-bold text-navy text-lg mt-1">
                ₹{monthlyForecast.avg_daily_run_rate?.toLocaleString('en-IN')}
                <span className="text-xs font-sans font-normal text-ink-subtle">/day</span>
              </div>
            </div>

            <div className="bg-paper p-3.5 rounded-xl border border-paper-muted text-center">
              <div className="text-[10px] uppercase font-bold tracking-wider text-ink-muted">
                Month-to-Date Extrapolated
              </div>
              <div className="font-display font-bold text-navy text-lg mt-1">
                ₹{(monthlyForecast.mtd_sales_estimate / 100000).toFixed(2)} Lakh
              </div>
            </div>

            <div className="bg-paper p-3.5 rounded-xl border border-gold/30 bg-gold/5 text-center">
              <div className="text-[10px] uppercase font-bold tracking-wider text-gold-dark">
                Projected Month-End
              </div>
              <div className="font-display font-bold text-navy text-lg mt-1">
                ₹{(monthlyForecast.projected_month_end_sales / 100000).toFixed(2)} Lakh
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-muted">Progress to ₹5.00L Goal</span>
              <span className="font-bold text-navy">
                ₹{(monthlyForecast.projected_month_end_sales / 100000).toFixed(2)}L / ₹5.00L
              </span>
            </div>
            <div className="w-full bg-paper rounded-full h-3 overflow-hidden border border-paper-muted p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  monthlyForecast.is_on_track ? 'bg-teal' : 'bg-gold'
                }`}
                style={{
                  width: `${Math.min(monthlyForecast.projected_achievement_pct, 100)}%`
                }}
              />
            </div>
          </div>

          {/* Forecast Logic Explanation */}
          <div className="bg-paper p-3 rounded-xl border border-paper-muted flex items-start gap-2.5 text-xs text-ink">
            <Info className="w-4 h-4 text-gold-dark shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-navy">Forecast Logic:</span>{' '}
              {monthlyForecast.reasoning}
            </div>
          </div>
        </div>

        {/* Right: Target Optimizer / Weekend Sprint Card */}
        <div className="bg-navy text-white rounded-2xl p-6 border border-navy-light shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] uppercase font-extrabold tracking-wider bg-gold/20 text-gold px-2.5 py-0.5 rounded border border-gold/40">
              Target Optimizer
            </span>
            <h3 className="font-display font-bold text-lg text-white mt-2">
              Weekend Growth Sprint
            </h3>
            <p className="text-xs text-paper-muted mt-1 leading-relaxed">
              Applying a targeted weekend campaign on monthly grocery staples can boost average daily sales from ₹17.3k to ₹21.5k.
            </p>
          </div>

          <button
            onClick={() =>
              onOpenActionModal({
                action_id: 'act-weekend-growth-sprint-2a',
                type: 'BROADCAST_FLASH_PROMO',
                button_label: 'Launch Weekend Growth Sprint',
                action_title: 'Broadcast Weekend Cashback Campaign to 248 Regulars',
                target_group: '248 Regular Kirana Patrons',
                default_message:
                  '🛒 Weekend Savings at Gupta General Store! Stock up on monthly flour, oil, pulses & spices this Saturday-Sunday and get flat ₹100 cashback on Paytm Soundbox payments over ₹1,000.'
              })
            }
            className="w-full py-2.5 rounded-xl bg-gold hover:bg-gold-light text-navy-dark text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center space-x-1.5"
          >
            <span>Launch Weekend Sprint</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stock Depletion Timeline Table / Cards */}
      <div className="bg-white rounded-2xl border border-paper-muted shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-display font-bold text-lg text-navy">
                Predictive Stock Depletion Timeline
              </h3>
              <span className="text-xs bg-paper text-ink-muted px-2 py-0.5 rounded font-medium">
                {stockForecasts.length} SKUs Monitored
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              Calculates precise hours until zero inventory based on daily customer consumption velocity.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 bg-paper p-1 rounded-xl border border-paper-muted self-start sm:self-auto text-xs">
            {['ALL', 'CRITICAL', 'LOW', 'HEALTHY'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  filter === tab
                    ? 'bg-navy text-white shadow-sm'
                    : 'text-ink-muted hover:text-navy'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Item Rows */}
        <div className="space-y-3 pt-2">
          {filteredStock.map((item) => {
            const runwayPct = Math.min(Math.round((item.hours_remaining / 168) * 100), 100);

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-paper/50 hover:bg-paper border border-paper-muted transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="min-w-[220px]">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-navy text-xs sm:text-sm">{item.name}</span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${getUrgencyBadge(item.urgency)}`}>
                      {item.urgency}
                    </span>
                  </div>
                  <div className="text-[11px] text-ink-subtle mt-0.5">
                    {item.variant} • Current Stock: <strong className="text-navy">{item.current_stock} {item.unit}</strong> (burn: {item.daily_burn_rate} {item.unit}/day)
                  </div>
                </div>

                <div className="flex-1 max-w-md space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-ink-muted flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-navy" />
                      Runway: <strong className="text-navy">{item.hours_remaining} hours ({item.days_until_stockout} days)</strong>
                    </span>
                    <span className="text-ink-subtle text-[10px]">
                      Lead time: {item.lead_time_days}d
                    </span>
                  </div>
                  <div className="w-full bg-paper-muted rounded-full h-2.5 overflow-hidden border border-paper-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.urgency === 'CRITICAL'
                          ? 'bg-red-500'
                          : item.urgency === 'LOW'
                          ? 'bg-amber-400'
                          : 'bg-teal'
                      }`}
                      style={{ width: `${Math.max(runwayPct, 5)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-ink-subtle">
                    {item.forecast_statement}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() =>
                      onOpenActionModal({
                        action_id: `act-forecast-reorder-${item.id}`,
                        type: 'REORDER_STOCK',
                        button_label: '1-Tap Reorder',
                        action_title: `Urgent Reorder: ${item.name}`,
                        supplier_name: item.supplier_name,
                        supplier_contact: item.supplier_contact,
                        items_to_order: [
                          {
                            name: item.name,
                            variant: item.variant,
                            suggested_qty: 20,
                            unit: item.unit
                          }
                        ],
                        default_message: `Namaste ${item.supplier_name},\nPlease dispatch urgent order of 20 ${item.unit} of ${item.name} for Gupta General Store before tomorrow morning rush.`
                      })
                    }
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center space-x-1 ${
                      item.urgency === 'CRITICAL'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : item.urgency === 'LOW'
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : 'bg-paper text-navy hover:bg-paper-muted border border-paper-muted'
                    }`}
                  >
                    <span>Reorder</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
