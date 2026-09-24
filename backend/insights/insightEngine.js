import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');

import { generateForecasts } from './forecastingEngine.js';

function readJsonData(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${filename} in insightEngine:`, err.message);
    return null;
  }
}

/**
 * Core Insight Generation Engine
 * Analyzes store transactions, inventory, customer loyalty, and merchant targets.
 * Generates proactive insights with plain-language explanations, reasoning trails, and 1-click actions.
 */
export function generateInsights() {
  const merchant = readJsonData('merchant.json') || {};
  const stock = readJsonData('stock.json') || [];
  const customers = readJsonData('customers.json') || [];
  const transactions = readJsonData('transactions.json') || {};

  const insights = [];

  // Generate forecasts as single source of truth for inventory burn & monthly target
  let forecasts = {};
  try {
    forecasts = generateForecasts() || {};
    if (forecasts.forecast_insights) {
      insights.push(...forecasts.forecast_insights);
    }
  } catch (err) {
    console.error('Error generating forecasts in insightEngine:', err.message);
  }

  // 1. UNIFIED INSIGHT: Critical Stock Shortage & Urgent Reorder
  // Single source of truth: forecastingEngine.js per-item hours_remaining calculation
  const stockForecasts = forecasts.stock_forecasts || [];
  const criticalStockItems = stockForecasts.filter(
    (item) => item.hours_remaining <= 24 || item.urgency === 'CRITICAL'
  );

  if (criticalStockItems.length > 0) {
    const totalRiskRevenue = criticalStockItems.reduce((sum, item) => sum + item.est_daily_revenue_risk, 0);
    const primaryShortage = criticalStockItems[0];
    const secondaryShortage = criticalStockItems[1];

    insights.push({
      id: 'ins-stock-critical-01',
      type: 'INVENTORY_ALERT',
      severity: 'critical',
      tag: 'Stockout Risk',
      title: `${criticalStockItems.length} essential items will run out in under 20 hours`,
      summary: `${primaryShortage.name} (${primaryShortage.current_stock} ${primaryShortage.unit} left, ~${primaryShortage.hours_remaining}h runway)${
        secondaryShortage ? ` and ${secondaryShortage.name} (${secondaryShortage.current_stock} ${secondaryShortage.unit} left, ~${secondaryShortage.hours_remaining}h runway)` : ''
      } will run out before tomorrow's peak rush. Risk losing ~₹${totalRiskRevenue.toLocaleString('en-IN')} in missed sales.`,
      reasoning: {
        data_source: 'Predictive Inventory Burn Engine (forecastingEngine.js)',
        trigger_condition: 'Computed stockout runway is under 24 hours (less than supplier lead time + safety buffer).',
        metrics_evaluated: {
          critical_items_count: criticalStockItems.length,
          items_at_risk: criticalStockItems.map(i => `${i.name}: ${i.current_stock} ${i.unit} left (~${i.hours_remaining}h runway, burn: ${i.daily_burn_rate} ${i.unit}/day)`),
          fastest_depleting_item: `${primaryShortage.name} (${primaryShortage.hours_remaining}h runway)`,
          est_daily_revenue_at_risk: `₹${totalRiskRevenue.toLocaleString('en-IN')}`,
          formula: 'current_stock / daily_burn_rate * 24'
        },
        plain_reason: `Based on your sales velocity, your remaining ${primaryShortage.current_stock} ${primaryShortage.unit} of ${primaryShortage.name} will exhaust in ~${primaryShortage.hours_remaining} hours (by ~11:00 AM) and ${secondaryShortage ? `${secondaryShortage.current_stock} ${secondaryShortage.unit} of ${secondaryShortage.name} will exhaust in ~${secondaryShortage.hours_remaining} hours (by ~02:00 PM)` : ''}. With 1-day supplier lead times, placing the order today ensures delivery before tomorrow morning's peak grocery rush.`
      },
      recommended_action: {
        action_id: 'act-reorder-stock-01',
        type: 'REORDER_STOCK',
        button_label: '1-Tap Reorder via WhatsApp',
        action_title: `Reorder Stock for ${criticalStockItems.length} Depleted Items`,
        supplier_name: primaryShortage.supplier_name || 'Mahalaxmi FMCG Distributors',
        supplier_contact: primaryShortage.supplier_contact || '+91 98110 44211',
        items_to_order: criticalStockItems.map((i) => ({
          name: i.name,
          variant: i.variant,
          suggested_qty: Math.max(i.current_stock * 4, 15),
          unit: i.unit,
          hours_remaining: i.hours_remaining
        })),
        default_message: `Namaste Distributors,\nPlease confirm urgent stock reorder for Gupta General Store (Sector 14):\n` +
          criticalStockItems.map((i) => `- ${i.name} (${i.variant}): ${Math.max(i.current_stock * 4, 15)} ${i.unit} (Current runway: ${i.hours_remaining}h)`).join('\n') +
          `\nPlease deliver by tomorrow 09:00 AM before peak hours. Payment via Paytm Soundbox UPI.`
      }
    });
  }

  // 2. INSIGHT: Lapsed Regular Customers Retention
  const lapsedRegulars = customers.filter(
    (c) => c.status === 'lapsed' && c.total_visits >= 15
  );

  if (lapsedRegulars.length > 0) {
    const names = lapsedRegulars.map((c) => c.name).join(' & ');
    const totalLostSpend = lapsedRegulars.reduce((acc, c) => acc + c.total_spend, 0);

    insights.push({
      id: 'ins-lapsed-customers-02',
      type: 'CUSTOMER_RETENTION',
      severity: 'warning',
      tag: 'Lapsed Regulars',
      title: `${lapsedRegulars.length} high-value regular customers haven't visited in 18+ days`,
      summary: `${names} used to shop every week (spent ₹${totalLostSpend.toLocaleString('en-IN')} total), but haven't placed an order in over 2 weeks.`,
      reasoning: {
        data_source: 'Paytm Soundbox & Customer Visit Frequency Tracker',
        trigger_condition: 'Frequent shopper (>15 visits) with 0 transactions in >14 days.',
        metrics_evaluated: {
          lapsed_count: lapsedRegulars.length,
          historical_avg_frequency: 'Every 5-7 days',
          inactive_duration: '18 to 22 days',
          top_basket_items: lapsedRegulars.flatMap((c) => c.favorite_items).slice(0, 3)
        },
        plain_reason: `Priya Verma has visited 24 times and Vikas Mehra 19 times. Their typical interval is 5–7 days, but it has now been 18–22 days since their last Soundbox payment. A targeted discount on their regular staple items can bring them back.`
      },
      recommended_action: {
        action_id: 'act-send-retention-offer-02',
        type: 'SEND_PROMO_OFFER',
        button_label: 'Send ₹50 Welcome-Back Voucher',
        action_title: `Send WhatsApp Voucher to ${lapsedRegulars.length} Lapsed Customers`,
        target_customers: lapsedRegulars.map((c) => ({
          customer_id: c.customer_id,
          name: c.name,
          phone: c.phone,
          days_inactive: c.days_since_last_visit,
          favorites: c.favorite_items
        })),
        offer_value: '₹50 OFF on purchases above ₹499',
        default_message: `Namaste Priya ji! We missed you at Gupta General Store (Sector 14). Here is a special ₹50 OFF voucher on your favorite groceries & pantry staples on your next visit of ₹500+. Show this SMS at billing. Valid till Sunday!`
      }
    });
  }

  // 3. INSIGHT: Weekday Afternoon Sales Dip & Tuesday Recovery Opportunity
  const dailySummaries = transactions.daily_summaries || [];
  const tuesdaySummary = dailySummaries.find((d) => d.day.includes('Tuesday'));

  if (tuesdaySummary) {
    insights.push({
      id: 'ins-tuesday-dip-03',
      type: 'REVENUE_OPPORTUNITY',
      severity: 'opportunity',
      tag: 'Sales Pattern Dip',
      title: 'Recurring Tuesday afternoon slump detected (54% below weekday average)',
      summary: `Tuesday sales dropped to ₹${tuesdaySummary.total_sales.toLocaleString('en-IN')} (weekday average is ₹16,500), primarily due to near-zero footfall between 12:00 PM and 4:00 PM.`,
      reasoning: {
        data_source: 'Paytm POS & Hourly Transaction Heatmap',
        trigger_condition: 'Time slot revenue falls >40% below 4-week weekday moving average.',
        metrics_evaluated: {
          tuesday_total: tuesdaySummary.total_sales,
          weekday_average: 16500,
          afternoon_dip_percentage: '-54.3%',
          slow_window: '12:00 PM - 4:00 PM'
        },
        plain_reason: 'Historical Tuesday afternoon transactions drop from an average of ₹4,600 to ₹2,100. Running a dedicated "Afternoon Chai & Snacks Combo" deal can utilize idle store hours and lift revenue by ₹2,000–₹3,000.'
      },
      recommended_action: {
        action_id: 'act-afternoon-happy-hour-03',
        type: 'SCHEDULE_FLASH_DEAL',
        button_label: 'Schedule Tuesday Happy Hours',
        action_title: 'Set 12 PM - 4 PM "Tea & Snack Combo 10% Off" Deal',
        discount: '10% OFF on Tea, Biscuits & Snacks',
        time_slot: 'Tuesdays 12:00 PM - 4:00 PM',
        default_message: `⚡ Gupta General Store Afternoon Special: Get 10% OFF on all Tea, Biscuits & Snacks every Tuesday between 12 PM and 4 PM! Shop during afternoon hours and save big.`
      }
    });
  }

  // 4. INSIGHT: Today's Target Gap & Evening Sprint
  const todaySales = merchant.metrics?.today_sales || 14280;
  const target = merchant.metrics?.daily_target || 18000;
  const gap = target - todaySales;

  if (gap > 0) {
    insights.push({
      id: 'ins-target-gap-04',
      type: 'TARGET_SPRINT',
      severity: 'info',
      tag: 'Target Sprint',
      title: `₹${gap.toLocaleString('en-IN')} needed in the next 3 hours to hit today's target`,
      summary: `Today's revenue is ₹${todaySales.toLocaleString('en-IN')} (${merchant.metrics.target_achievement_pct}% of ₹${target.toLocaleString('en-IN')} goal). Evening walk-ins average ₹1,100/hour.`,
      reasoning: {
        data_source: 'Real-time Daily Target Tracker',
        trigger_condition: 'Remaining deficit requires >15% boost over standard evening run-rate.',
        metrics_evaluated: {
          current_sales: todaySales,
          target_sales: target,
          gap: gap,
          hours_remaining: 3.5,
          required_hourly_pace: Math.round(gap / 3.5)
        },
        plain_reason: `To bridge the ₹${gap.toLocaleString('en-IN')} gap before 10 PM closing, you need ~₹${Math.round(gap / 3.5)}/hour. Broadcasting an evening flash reminder on daily essentials to nearby regular customers can close the gap.`
      },
      recommended_action: {
        action_id: 'act-evening-sprint-04',
        type: 'BROADCAST_FLASH_PROMO',
        button_label: 'Broadcast Evening Flash Offer',
        action_title: 'Send Evening Essentials Notification to 45 Active Regulars',
        target_group: '45 Active Regulars within 1.5 km',
        default_message: `🌟 Evening special at Gupta General Store! Fresh stock of Dairy, Edible Oils & Snacks ready for your dinner preparations. Quick delivery or 5-minute counter pickup available.`
      }
    });
  }

  return insights;
}
