import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Store,
  Zap,
  Volume2,
  RefreshCw,
  Activity,
  MessageSquare,
  History,
  Database,
  CirclePlay,
  CircleCheck,
  Languages
} from 'lucide-react';

import OverviewMetrics from './components/OverviewMetrics.jsx';
import InsightsFeed from './components/InsightsFeed.jsx';
import ChatCopilot from './components/ChatCopilot.jsx';
import ForecastingEngine from './components/ForecastingEngine.jsx';
import ActionHistory from './components/ActionHistory.jsx';
import ActionModal from './components/ActionModal.jsx';
import PitchModal from './components/PitchModal.jsx';

export default function App() {
  const [storeData, setStoreData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [executedActions, setExecutedActions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedAction, setSelectedAction] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [dataRes, insightsRes, historyRes] = await Promise.all([
        fetch('/api/data'),
        fetch('/api/insights'),
        fetch('/api/actions/history')
      ]);

      if (!dataRes.ok || !insightsRes.ok) {
        throw new Error('Failed to fetch store data and insights from backend');
      }

      const dataJson = await dataRes.json();
      const insightsJson = await insightsRes.json();
      const historyJson = historyRes.ok ? await historyRes.json() : { history: [] };

      setStoreData(dataJson);
      setInsights(insightsJson.insights || []);
      setExecutedActions(historyJson.history || []);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Unable to connect to PaytmGrowly backend');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openActionModal = (action) => {
    setSelectedAction(action);
    setIsActionModalOpen(true);
  };

  const closeActionModal = () => {
    setIsActionModalOpen(false);
    setSelectedAction(null);
  };

  const playAudioFeedback = (text) => {
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      console.log('Audio feedback not available');
    }
  };

  const handleConfirmAction = async (actionPayload) => {
    setIsExecutingAction(true);
    try {
      const res = await fetch('/api/actions/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_id: actionPayload.action_id,
          type: actionPayload.type,
          details: actionPayload,
          custom_message: actionPayload.custom_message
        })
      });

      if (!res.ok) {
        throw new Error(`Execution error: ${res.status}`);
      }

      const executedResult = (await res.json()).action;
      setExecutedActions((prev) => [executedResult, ...prev]);
      closeActionModal();

      // Play Soundbox style audio voice confirmation
      playAudioFeedback(`Paytm Merchant Action Executed. ${executedResult.summary}`);

      // Show toast notification
      setToast({
        title: 'Action Successfully Executed',
        summary: executedResult.summary,
        id: executedResult.execution_id
      });
      setTimeout(() => setToast(null), 6000);
    } catch (err) {
      console.error('Action execution failed:', err);
      alert(`Action execution failed: ${err.message}`);
    } finally {
      setIsExecutingAction(false);
    }
  };

  const merchant = storeData?.merchant;
  const stock = storeData?.stock || [];
  const customers = storeData?.customers || [];
  const transactions = storeData?.transactions;

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col selection:bg-gold/20 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 max-w-md bg-navy text-white p-4 rounded-2xl shadow-2xl border border-teal/40 flex items-start space-x-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="w-8 h-8 rounded-xl bg-teal/20 flex items-center justify-center text-teal shrink-0">
            <CircleCheck className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 text-xs flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">{toast.title}</span>
              <span className="font-mono text-[10px] text-teal-light">{toast.id}</span>
            </div>
            <p className="text-paper-muted leading-relaxed">{toast.summary}</p>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-navy text-white border-b border-navy-light sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Subtitle */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center text-navy font-bold text-xl shadow-md">
              <Sparkles className="w-6 h-6 text-navy-dark" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display font-bold text-xl tracking-tight">
                  PaytmGrowly
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-gold/20 text-gold px-2 py-0.5 rounded border border-gold/30">
                  Paytm Merchant AI Copilot
                </span>
              </div>
              <p className="text-[11px] text-paper-muted/80">
                Proactive Kirana Growth Partner
              </p>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <button
              onClick={() => setIsPitchModalOpen(true)}
              className="flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-gold hover:bg-gold-light text-navy-dark shadow-sm transition-all active:scale-95"
              title="Open 90-Second Judges Pitch Script"
            >
              <CirclePlay className="w-4 h-4 text-navy-dark" />
              <span>Pitch Script</span>
            </button>

            <div className="hidden lg:flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-navy-light text-paper-muted border border-navy-light">
              <Zap className="w-3.5 h-3.5 text-gold" />
              <span>Actions Executed:</span>
              <strong className="text-gold font-mono">{executedActions.length}</strong>
            </div>

            <div className="hidden sm:flex items-center space-x-2 text-xs bg-navy-light/70 px-3 py-1.5 rounded-xl border border-navy-light text-paper-muted">
              <Volume2 className="w-4 h-4 text-teal" />
              <span>{merchant?.soundbox_id || 'Paytm Soundbox'}</span>
              <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
            </div>

            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-navy-light hover:bg-navy-light/80 text-paper transition-colors"
              title="Refresh Data & Insights"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Store Profile Header Card */}
        {merchant && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-paper-muted flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-navy/5 flex items-center justify-center text-navy shrink-0 mt-0.5">
                <Store className="w-7 h-7 text-navy" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="font-display text-2xl font-bold text-navy">
                    {merchant.store_name}
                  </h1>
                  <span className="text-xs bg-navy/5 text-ink-muted px-2.5 py-0.5 rounded-full font-semibold">
                    {merchant.business_type}
                  </span>
                </div>
                <p className="text-xs text-ink-muted mt-0.5">{merchant.location}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-ink-subtle">
                  <span>
                    Merchant: <strong className="text-navy">{merchant.owner_name}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    UPI VPA: <strong className="text-navy">{merchant.paytm_vpa}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    POS: <strong className="text-navy">{merchant.pos_device}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-paper p-3 rounded-xl border border-paper-muted">
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-teal">
                  Autonomous Watch Active
                </div>
                <div className="text-xs text-ink-muted">
                  Analyzing 8 inventory SKUs & 248 patrons
                </div>
              </div>
              <div className="w-3 h-3 rounded-full bg-teal animate-ping" />
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-paper-muted space-x-2 sm:space-x-4 overflow-x-auto text-xs no-scrollbar">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'border-gold text-navy'
                : 'border-transparent text-ink-muted hover:text-navy'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Core Pulse & Insights</span>
          </button>

          <button
            onClick={() => setActiveTab('forecasting')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'forecasting'
                ? 'border-gold text-navy'
                : 'border-transparent text-ink-muted hover:text-navy'
            }`}
          >
            <Sparkles className="w-4 h-4 text-gold-dark" />
            <span>Forecasting & Stock Runway</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'chat'
                ? 'border-gold text-navy'
                : 'border-transparent text-ink-muted hover:text-navy'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ask Your Copilot</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'activity'
                ? 'border-gold text-navy'
                : 'border-transparent text-ink-muted hover:text-navy'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Action Activity Log ({executedActions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('data_inspect')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'data_inspect'
                ? 'border-gold text-navy'
                : 'border-transparent text-ink-muted hover:text-navy'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Stock & Customers Data</span>
          </button>
        </div>

        {/* Tab 1: Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <section>
              <OverviewMetrics merchant={merchant} transactions={transactions} />
            </section>
            <section>
              <InsightsFeed
                insights={insights}
                onOpenActionModal={openActionModal}
                executedActions={executedActions}
              />
            </section>
            <section>
              <div className="mb-3">
                <h3 className="font-display font-bold text-lg text-navy">
                  Ask Your AI Business Partner
                </h3>
                <p className="text-xs text-ink-muted">
                  Free-form conversational Q&A grounded on Gupta General Store data.
                </p>
              </div>
              <ChatCopilot onOpenActionModal={openActionModal} insights={insights} />
            </section>
          </div>
        )}

        {/* Tab 2: Forecasting View */}
        {activeTab === 'forecasting' && (
          <ForecastingEngine onOpenActionModal={openActionModal} />
        )}

        {/* Tab 3: Chat View */}
        {activeTab === 'chat' && (
          <div className="max-w-4xl mx-auto">
            <ChatCopilot onOpenActionModal={openActionModal} insights={insights} />
          </div>
        )}

        {/* Tab 4: Activity Log View */}
        {activeTab === 'activity' && (
          <div className="max-w-4xl mx-auto">
            <ActionHistory executedActions={executedActions} />
          </div>
        )}

        {/* Tab 5: Data Inspection View (Stock & Customers Tables) */}
        {activeTab === 'data_inspect' && (
          <div className="space-y-6">
            {/* Stock Table */}
            <div className="bg-white rounded-2xl border border-paper-muted shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-paper-muted flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-navy text-lg">
                    Inventory & Reorder Levels
                  </h3>
                  <p className="text-xs text-ink-muted">
                    Live catalog from{' '}
                    <code className="bg-paper px-1.5 py-0.5 rounded text-navy font-mono">
                      /data/stock.json
                    </code>
                  </p>
                </div>
                <span className="text-xs bg-navy/5 text-navy font-bold px-3 py-1 rounded-full">
                  {stock.length} Products
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-paper text-ink-muted uppercase font-bold text-[10px] tracking-wider border-b border-paper-muted">
                    <tr>
                      <th className="px-6 py-3">Item / Variant</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Current Stock</th>
                      <th className="px-6 py-3">Reorder Point</th>
                      <th className="px-6 py-3">Daily Burn</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-paper-muted">
                    {stock.map((item) => (
                      <tr key={item.id} className="hover:bg-paper/50">
                        <td className="px-6 py-3 font-semibold text-navy">
                          {item.name}
                          <div className="text-[11px] text-ink-subtle font-normal">
                            {item.variant}
                          </div>
                        </td>
                        <td className="px-6 py-3 text-ink-muted">{item.category}</td>
                        <td className="px-6 py-3 font-bold text-navy">
                          {item.current_stock} {item.unit}
                        </td>
                        <td className="px-6 py-3 text-ink-muted">
                          {item.reorder_level} {item.unit}
                        </td>
                        <td className="px-6 py-3 text-ink-muted">
                          {item.daily_burn_rate} {item.unit}/day
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] tracking-wider ${
                              item.status === 'critical'
                                ? 'bg-red-100 text-red-700'
                                : item.status === 'low'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-teal/15 text-teal-dark'
                            }`}
                          >
                            {item.status} ({item.days_until_stockout}d)
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          {item.status !== 'healthy' && (
                            <button
                              onClick={() =>
                                openActionModal({
                                  action_id: 'act-reorder-stock-01',
                                  type: 'REORDER_STOCK',
                                  button_label: 'Reorder Stock',
                                  action_title: `Reorder ${item.name}`,
                                  supplier_name: item.supplier?.name,
                                  supplier_contact: item.supplier?.contact,
                                  items_to_order: [
                                    {
                                      name: item.name,
                                      variant: item.variant,
                                      suggested_qty: 20,
                                      unit: item.unit
                                    }
                                  ],
                                  default_message: `Namaste ${item.supplier?.name},\nPlease dispatch urgent order of 20 ${item.unit} of ${item.name} for Gupta General Store.`
                                })
                              }
                              className="text-[11px] font-bold bg-gold/20 text-navy-dark px-2.5 py-1 rounded-lg hover:bg-gold transition-colors"
                            >
                              Reorder
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-2xl border border-paper-muted shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-paper-muted flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-navy text-lg">
                    Customer Loyalty & Lapsed Status
                  </h3>
                  <p className="text-xs text-ink-muted">
                    Customer profiles from{' '}
                    <code className="bg-paper px-1.5 py-0.5 rounded text-navy font-mono">
                      /data/customers.json
                    </code>
                  </p>
                </div>
                <span className="text-xs bg-navy/5 text-navy font-bold px-3 py-1 rounded-full">
                  {customers.length} Regular Profiles
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-paper text-ink-muted uppercase font-bold text-[10px] tracking-wider border-b border-paper-muted">
                    <tr>
                      <th className="px-6 py-3">Customer</th>
                      <th className="px-6 py-3">Segment</th>
                      <th className="px-6 py-3">Visits</th>
                      <th className="px-6 py-3">Total Spend</th>
                      <th className="px-6 py-3">Last Visit</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-paper-muted">
                    {customers.map((cust) => (
                      <tr key={cust.customer_id} className="hover:bg-paper/50">
                        <td className="px-6 py-3">
                          <div className="font-semibold text-navy">{cust.name}</div>
                          <div className="text-[10px] text-ink-subtle">{cust.phone}</div>
                        </td>
                        <td className="px-6 py-3 text-ink-muted">{cust.segment}</td>
                        <td className="px-6 py-3 font-semibold text-navy">
                          {cust.total_visits}
                        </td>
                        <td className="px-6 py-3 font-mono font-bold text-navy">
                          ₹{cust.total_spend.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={
                              cust.days_since_last_visit > 10
                                ? 'text-red-600 font-bold'
                                : 'text-ink-muted'
                            }
                          >
                            {cust.days_since_last_visit} days ago
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] tracking-wider ${
                              cust.status === 'lapsed'
                                ? 'bg-red-100 text-red-700'
                                : cust.status === 'drifting'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-teal/15 text-teal-dark'
                            }`}
                          >
                            {cust.status}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          {cust.status === 'lapsed' && (
                            <button
                              onClick={() =>
                                openActionModal({
                                  action_id: 'act-send-retention-offer-02',
                                  type: 'SEND_PROMO_OFFER',
                                  button_label: 'Send Voucher',
                                  action_title: `Send ₹50 Voucher to ${cust.name}`,
                                  target_customers: [cust],
                                  offer_value: '₹50 OFF on ₹500+',
                                  default_message: `Namaste ${cust.name} ji! We missed you at Gupta General Store. Here is a special ₹50 OFF voucher on your next visit of ₹500+. Show this SMS at billing.`
                                })
                              }
                              className="text-[11px] font-bold bg-gold/20 text-navy-dark px-2.5 py-1 rounded-lg hover:bg-gold transition-colors"
                            >
                              Send Offer
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Action Review & Confirmation Modal */}
        <ActionModal
          isOpen={isActionModalOpen}
          onClose={closeActionModal}
          action={selectedAction}
          onConfirm={handleConfirmAction}
          isExecuting={isExecutingAction}
        />

        {/* Pitch Script / Demo Guide Modal */}
        <PitchModal
          isOpen={isPitchModalOpen}
          onClose={() => setIsPitchModalOpen(false)}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-paper-muted py-4 mt-auto text-xs text-ink-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>PaytmGrowly</strong> — Paytm Merchant AI Copilot • Track 1: Merchant Growth AI
          </div>
          <div className="flex items-center space-x-4 text-ink-subtle">
            <span>React + Vite + Tailwind CSS</span>
            <span>•</span>
            <span>Node.js + Express API</span>
            <span>•</span>
            <span>Anthropic Claude AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
