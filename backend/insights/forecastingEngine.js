import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');

function readJsonData(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${filename} in forecastingEngine:`, err.message);
    return null;
  }
}

/**
 * Computes live forecasts from transaction trends and inventory burn rates
 */
export function generateForecasts() {
  const stock = readJsonData('stock.json') || [];
  const transactions = readJsonData('transactions.json') || {};
  const merchant = readJsonData('merchant.json') || {};

  const dailySummaries = transactions.daily_summaries || [];

  // --- 1. Stock Depletion Forecasting ---
  const stockForecasts = stock.map((item) => {
    const daysUntilStockout = Number((item.current_stock / item.daily_burn_rate).toFixed(1));
    const hoursRemaining = Math.round(daysUntilStockout * 24);
    const estDailyLostRevenue = item.daily_burn_rate * item.selling_price;
    const estTotalRiskRevenue = Math.round(item.daily_burn_rate * item.selling_price * (item.supplier?.lead_time_days || 1));

    let urgency = 'HEALTHY';
    if (daysUntilStockout <= 1.0) {
      urgency = 'CRITICAL';
    } else if (daysUntilStockout <= 2.5) {
      urgency = 'LOW';
    } else if (daysUntilStockout <= 5.0) {
      urgency = 'MODERATE';
    }

    return {
      id: item.id,
      name: item.name,
      variant: item.variant,
      category: item.category,
      current_stock: item.current_stock,
      unit: item.unit,
      daily_burn_rate: item.daily_burn_rate,
      days_until_stockout: daysUntilStockout,
      hours_remaining: hoursRemaining,
      urgency,
      supplier_name: item.supplier?.name,
      supplier_contact: item.supplier?.contact,
      lead_time_days: item.supplier?.lead_time_days || 1,
      est_daily_revenue_risk: estDailyLostRevenue,
      est_stockout_risk_total: estTotalRiskRevenue,
      forecast_statement: `At current burn rate of ${item.daily_burn_rate} ${item.unit}/day, stock exhausts in ~${hoursRemaining} hours (${daysUntilStockout} days).`
    };
  });

  // Sort by most urgent stockout first
  stockForecasts.sort((a, b) => a.days_until_stockout - b.days_until_stockout);

  // --- 2. Monthly Revenue Run-Rate Forecasting ---
  const totalSalesLast7Days = dailySummaries.reduce((sum, d) => sum + d.total_sales, 0);
  const avgDailySales7Days = Math.round(totalSalesLast7Days / Math.max(dailySummaries.length, 1));
  
  // Assuming 30-day month, day 24 of current month
  const currentDayOfMonth = 24;
  const daysInMonth = 30;
  const daysRemainingInMonth = daysInMonth - currentDayOfMonth;

  // Estimate month-to-date sales: 23 completed days at avg + today's current sales
  const completedDaysEstimate = (currentDayOfMonth - 1) * avgDailySales7Days;
  const mtdSalesSoFar = completedDaysEstimate + (merchant.metrics?.today_sales || 14280);
  
  // Projected month-end total = MTD + (remaining days * daily run-rate)
  const projectedRemainingSales = daysRemainingInMonth * avgDailySales7Days;
  const projectedMonthEndTotal = mtdSalesSoFar + projectedRemainingSales;
  
  const monthlyTarget = 500000; // ₹5,00,000 monthly store goal
  const projectedAchievementPct = Number(((projectedMonthEndTotal / monthlyTarget) * 100).toFixed(1));
  const projectedGap = monthlyTarget - projectedMonthEndTotal;

  const monthlyForecast = {
    current_day_of_month: currentDayOfMonth,
    days_remaining: daysRemainingInMonth,
    avg_daily_run_rate: avgDailySales7Days,
    mtd_sales_estimate: mtdSalesSoFar,
    projected_month_end_sales: projectedMonthEndTotal,
    monthly_target: monthlyTarget,
    projected_achievement_pct: projectedAchievementPct,
    projected_gap: projectedGap,
    is_on_track: projectedGap <= 0,
    forecast_summary: projectedGap > 0
      ? `On track for ₹${projectedMonthEndTotal.toLocaleString('en-IN')} this month (${projectedAchievementPct}% of ₹5.0L target). Estimated ₹${projectedGap.toLocaleString('en-IN')} deficit can be bridged with weekend specials.`
      : `On track to exceed monthly target of ₹5.0L by ₹${Math.abs(projectedGap).toLocaleString('en-IN')}!`,
    reasoning: `Calculated from 7-day rolling transaction volume (₹${avgDailySales7Days.toLocaleString('en-IN')}/day average) applied across ${daysRemainingInMonth} remaining trading days in September.`
  };

  // --- 3. Generate Dedicated Forecast Insights for Proactive Feed ---
  const forecastInsights = [];

  // Monthly Target Run-Rate Forecast Insight
  forecastInsights.push({
    id: 'ins-forecast-revenue-2a',
    type: 'FORECAST_REVENUE',
    severity: monthlyForecast.projected_gap > 0 ? 'warning' : 'opportunity',
    tag: 'Monthly Forecast',
    title: `Monthly Pace: Projected ₹${(projectedMonthEndTotal / 100000).toFixed(2)}L (${projectedAchievementPct}% of ₹5.0L target)`,
    summary: monthlyForecast.forecast_summary,
    reasoning: {
      data_source: '7-Day Rolling Revenue Extrapolation',
      trigger_condition: 'Computed month-end run rate vs ₹5,00,000 monthly target.',
      metrics_evaluated: {
        daily_average_run_rate: `₹${avgDailySales7Days.toLocaleString('en-IN')}`,
        mtd_estimate: `₹${mtdSalesSoFar.toLocaleString('en-IN')}`,
        projected_total: `₹${projectedMonthEndTotal.toLocaleString('en-IN')}`,
        days_remaining: daysRemainingInMonth
      },
      plain_reason: monthlyForecast.reasoning
    },
    recommended_action: {
      action_id: 'act-weekend-growth-sprint-2a',
      type: 'BROADCAST_FLASH_PROMO',
      button_label: 'Launch Weekend Growth Sprint',
      action_title: 'Bridge ₹17.5k Monthly Gap via Weekend Flash Campaign',
      target_group: 'All 248 Regular Patrons (WhatsApp & SMS)',
      default_message: `🛒 Weekend Savings at Gupta General Store! Stock up on monthly flour, oil, pulses & spices this Saturday-Sunday and get flat ₹100 cashback on Paytm Soundbox payments over ₹1,000.`
    }
  });

  return {
    stock_forecasts: stockForecasts,
    monthly_forecast: monthlyForecast,
    forecast_insights: forecastInsights
  };
}
