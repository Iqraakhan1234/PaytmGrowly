import Anthropic from '@anthropic-ai/sdk';
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
    console.error(`Error reading ${filename} in marketingGenerator:`, err.message);
    return null;
  }
}

/**
 * Intelligent context-constrained message generator (Fallback / Zero-shot)
 */
function generateContextualMessageFallback({ action_type, customer_name, customer_id, favorite_items = [], tone = 'friendly_hinglish', discount, time_slot, supplier_name, items = [] }) {
  const store = 'Gupta General Store (Sector 14 Gurugram)';

  // Case 1: Lapsed Customer Specific Retention (Priya Verma / Vikas Mehra)
  if (action_type === 'SEND_PROMO_OFFER' || customer_name) {
    const itemsMention = favorite_items.length > 0 
      ? favorite_items.slice(0, 2).join(' & ')
      : 'your regular pantry staples';

    if (tone === 'hinglish') {
      return {
        message: `Namaste ${customer_name || 'ji'}! 🙏 Aapko ${store} me dekhe kaafi din ho gaye. Aapki pasandida items (${itemsMention}) ka fresh stock aa chuka hai. Is weekend billing par paaiye flat ${discount || '₹50 OFF'} (min order ₹500). Counter par ye SMS dikhayein! - Rajesh Gupta`,
        reasoning: `Tailored specifically for ${customer_name} referencing their purchase history of ${itemsMention}.`,
        tone_used: 'Warm Hinglish'
      };
    }

    if (tone === 'urgent') {
      return {
        message: `⚡ Special Comeback Offer for ${customer_name || 'Valued Customer'}: Get ${discount || '₹50 OFF'} on your grocery bill of ₹500+ at ${store}. Perfect time to restock ${itemsMention}! Offer valid till Sunday only.`,
        reasoning: `Urgency-driven retention message mentioning ${itemsMention}.`,
        tone_used: 'Urgent & Direct'
      };
    }

    // Default friendly
    return {
      message: `Namaste ${customer_name || 'ji'}! We missed your weekly visit at ${store}. We have reserved a special ${discount || '₹50 OFF'} welcome-back voucher for you on purchases over ₹499. Fresh ${itemsMention} in stock! Pay via Paytm Soundbox to redeem.`,
      reasoning: `Context-specific loyalty recovery draft referencing real customer profile data.`,
      tone_used: 'Friendly & Direct'
    };
  }

  // Case 2: Tuesday Afternoon Slump / Happy Hour
  if (action_type === 'SCHEDULE_FLASH_DEAL') {
    if (tone === 'hinglish') {
      return {
        message: `☕ Gupta General Store Afternoon Special! Har Tuesday dopahar 12 PM se 4 PM paayein 10% OFF sabhi Chai, Biscuits, Maggi aur Namkeen par. Dopahar me aaraam se shopping karein aur bachat karein! Sector 14 market.`,
        reasoning: `Crafted to stimulate idle 12 PM - 4 PM Tuesday afternoon window with tea & snacks promotions.`,
        tone_used: 'Warm Hinglish'
      };
    }

    return {
      message: `☕ Beat the afternoon slump with Gupta General Store! Enjoy flat 10% OFF on all Tea, Biscuits & Evening Snacks every Tuesday between 12:00 PM and 4:00 PM. Fast checkout with Paytm Soundbox. Visit Shop 4, Sector 14!`,
      reasoning: `Targeted promotion addressing the 54% historical Tuesday afternoon revenue dip.`,
      tone_used: 'Friendly & Direct'
    };
  }

  // Case 3: Reorder WhatsApp PO to Supplier
  if (action_type === 'REORDER_STOCK') {
    const itemsList = items.map(i => `• ${i.name || i} (${i.suggested_qty || i.qty || '15-20'} ${i.unit || 'units'})`).join('\n');
    return {
      message: `Namaste ${supplier_name || 'Distributor Ji'},\nPlease confirm urgent stock order for Gupta General Store (Sector 14):\n${itemsList}\nNeed morning delivery by 09:30 AM before peak hours. Payment via Paytm UPI upon delivery. Thank you! - Rajesh Gupta`,
      reasoning: `Formal, itemized WhatsApp purchase order constrained to depleted SKUs and lead times.`,
      tone_used: 'Professional Vendor PO'
    };
  }

  // Case 4: Target Gap Evening Sprint
  if (action_type === 'BROADCAST_FLASH_PROMO') {
    return {
      message: `🌟 Evening Grocery Express at Gupta General Store! Cooking dinner tonight? Fresh Dairy (Amul Butter, Milk), Chakki Atta, and Cooking Oils ready for quick counter pickup or instant neighborhood delivery. Call/WhatsApp 98112-XXXX to order!`,
      reasoning: `Designed for evening neighborhood footfall to close the daily ₹3,720 target gap.`,
      tone_used: 'Neighborhood Express'
    };
  }

  // Generic fallback
  return {
    message: `Namaste from Gupta General Store! Enjoy special savings on your everyday grocery staples today. Pay easily with Paytm Soundbox.`,
    reasoning: `Standard store promotion.`,
    tone_used: 'Standard'
  };
}

/**
 * Generate AI Marketing Copy with Claude API or grounded engine
 */
export async function generateMarketingCopy(params) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_claude_api_key')) {
    return generateContextualMessageFallback(params);
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const systemPrompt = `You are a specialized marketing copywriter for Rajesh Gupta, owner of Gupta General Store (Sector 14, Gurugram), a Paytm kirana merchant.
Generate a high-converting, warm, realistic WhatsApp/SMS message.
Rules:
- NEVER use SaaS jargon or generic copy.
- Explicitly mention the customer's real favorite items or store context provided in the input.
- Keep it under 60-80 words so it fits in a single WhatsApp/SMS.
- Output strictly JSON: { "message": "...", "reasoning": "...", "tone_used": "..." }`;

    const userPrompt = `Generate a ${params.tone || 'friendly Hinglish'} marketing message for action type: ${params.action_type}.
Customer Name: ${params.customer_name || 'Regular Customer'}
Favorite Basket Items: ${JSON.stringify(params.favorite_items || [])}
Discount / Offer: ${params.discount || '₹50 OFF'}
Timing / Slot: ${params.time_slot || 'This Weekend'}
Supplier (if reorder): ${params.supplier_name || 'Mahalaxmi FMCG Distributors'}
Items (if reorder): ${JSON.stringify(params.items || [])}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    });

    const responseText = response.content[0]?.text || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      message: responseText,
      reasoning: `Dynamically composed by Claude API using store context for ${params.customer_name || 'campaign'}.`,
      tone_used: params.tone || 'AI Custom'
    };
  } catch (err) {
    console.warn('Anthropic API failed in marketingGenerator, falling back to grounded engine:', err.message);
    return generateContextualMessageFallback(params);
  }
}
