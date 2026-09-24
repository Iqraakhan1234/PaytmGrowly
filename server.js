import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { generateInsights } from './insights/insightEngine.js';
import { generateForecasts } from './insights/forecastingEngine.js';
import { handleChatMessage } from './services/aiChatService.js';
import { executeAction, getActionHistory } from './services/actionManager.js';
import { generateMarketingCopy } from './services/marketingGenerator.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper function to safely read JSON from /data
function readJsonData(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${filename} from ${DATA_DIR}:`, err.message);
    return null;
  }
}

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const merchant = readJsonData('merchant.json');
  const stock = readJsonData('stock.json');
  const customers = readJsonData('customers.json');
  const transactions = readJsonData('transactions.json');

  const allDataAvailable = Boolean(merchant && stock && customers && transactions);

  res.json({
    status: 'ok',
    service: 'PaytmGrowly Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    data_loaded: allDataAvailable,
    ai_provider: process.env.ANTHROPIC_API_KEY ? 'Anthropic Claude (Live API)' : 'PaytmGrowly Grounded Engine (Ready)',
    data_summary: {
      merchant: merchant?.store_name || null,
      stock_items_count: Array.isArray(stock) ? stock.length : 0,
      customers_count: Array.isArray(customers) ? customers.length : 0,
      recent_txns_count: transactions?.recent_transactions?.length || 0
    }
  });
});

// Mock Data Endpoints
app.get('/api/data', (req, res) => {
  res.json({
    merchant: readJsonData('merchant.json'),
    stock: readJsonData('stock.json'),
    customers: readJsonData('customers.json'),
    transactions: readJsonData('transactions.json')
  });
});

app.get('/api/data/merchant', (req, res) => {
  const data = readJsonData('merchant.json');
  if (!data) return res.status(500).json({ error: 'Merchant data unavailable' });
  res.json(data);
});

app.get('/api/data/stock', (req, res) => {
  const data = readJsonData('stock.json');
  if (!data) return res.status(500).json({ error: 'Stock data unavailable' });
  res.json(data);
});

app.get('/api/data/customers', (req, res) => {
  const data = readJsonData('customers.json');
  if (!data) return res.status(500).json({ error: 'Customer data unavailable' });
  res.json(data);
});

app.get('/api/data/transactions', (req, res) => {
  const data = readJsonData('transactions.json');
  if (!data) return res.status(500).json({ error: 'Transaction data unavailable' });
  res.json(data);
});

// Proactive Insights Endpoint (Phase 1 Core)
app.get('/api/insights', (req, res) => {
  try {
    const insights = generateInsights();
    res.json({
      success: true,
      count: insights.length,
      insights
    });
  } catch (err) {
    console.error('Error generating insights:', err);
    res.status(500).json({ error: 'Failed to generate insights', message: err.message });
  }
});

// Forecasting Endpoint (Phase 2a)
app.get('/api/forecasts', (req, res) => {
  try {
    const forecasts = generateForecasts();
    res.json({
      success: true,
      ...forecasts
    });
  } catch (err) {
    console.error('Error generating forecasts:', err);
    res.status(500).json({ error: 'Failed to generate forecasts', message: err.message });
  }
});

// Auto-Generated Marketing Copy Endpoint (Phase 2c)
app.post('/api/marketing/generate', async (req, res) => {
  try {
    const params = req.body || {};
    const copyResult = await generateMarketingCopy(params);
    res.json({
      success: true,
      ...copyResult
    });
  } catch (err) {
    console.error('Error generating marketing copy:', err);
    res.status(500).json({ error: 'Failed to generate marketing copy', message: err.message });
  }
});

// AI Chat Endpoint (Phase 1 Core)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message string is required' });
    }

    const response = await handleChatMessage(message, history || []);
    res.json({
      success: true,
      ...response
    });
  } catch (err) {
    console.error('Error in chat endpoint:', err);
    res.status(500).json({ error: 'Chat processing failed', message: err.message });
  }
});

// Action Execution Endpoints (Phase 1 Core)
app.post('/api/actions/execute', (req, res) => {
  try {
    const actionData = req.body;
    if (!actionData || !actionData.type) {
      return res.status(400).json({ error: 'Valid action payload is required' });
    }

    const result = executeAction(actionData);
    res.json({
      success: true,
      action: result
    });
  } catch (err) {
    console.error('Error executing action:', err);
    res.status(500).json({ error: 'Action execution failed', message: err.message });
  }
});

app.get('/api/actions/history', (req, res) => {
  res.json({
    success: true,
    history: getActionHistory()
  });
});

app.listen(PORT, () => {
  console.log(`[PaytmGrowly Backend] Listening on http://localhost:${PORT}`);
  console.log(`[PaytmGrowly Backend] Mock data directory: ${DATA_DIR}`);
});
