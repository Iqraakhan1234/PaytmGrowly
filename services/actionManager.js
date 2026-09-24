const executedActionsLog = [];

export function getActionHistory() {
  return executedActionsLog;
}

export function executeAction(actionData) {
  const { action_id, type, details, custom_message } = actionData;
  const timestamp = new Date().toISOString();
  const executionId = `EXEC-${Date.now().toString().slice(-6)}`;

  let executionResult = {
    execution_id: executionId,
    action_id,
    type,
    timestamp,
    status: 'SUCCESS',
    channel: 'Simulated Paytm Merchant Gateway',
    summary: '',
    updated_entities: {}
  };

  switch (type) {
    case 'REORDER_STOCK':
      executionResult.summary = `WhatsApp Purchase Order dispatched to ${details?.supplier_name || 'Mahalaxmi FMCG Distributors'}.`;
      executionResult.details = {
        supplier: details?.supplier_name || 'Mahalaxmi FMCG Distributors',
        contact: details?.supplier_contact || '+91 98110 44211',
        items_ordered: details?.items || [
          { name: 'Fortune Sunlite Sunflower Oil (1L)', qty: '20 pouches' },
          { name: 'Amul Butter Pasteurized (500g)', qty: '15 packs' }
        ],
        est_delivery: 'Tomorrow morning, 09:30 AM',
        payment_mode: 'Paytm UPI on Delivery'
      };
      executionResult.message_sent = custom_message || details?.default_message;
      break;

    case 'SEND_PROMO_OFFER':
      executionResult.summary = `₹50 Retention Voucher sent to lapsed regular customers via SMS / WhatsApp.`;
      executionResult.details = {
        voucher_code: `MISSYOU50-${Math.floor(1000 + Math.random() * 9000)}`,
        recipients: details?.recipients || ['Priya Verma (+91 99104 11982)', 'Vikas Mehra (+91 98108 55430)'],
        validity: 'Valid for next 5 days on bills ₹500+'
      };
      executionResult.message_sent = custom_message || details?.default_message;
      break;

    case 'SCHEDULE_FLASH_DEAL':
      executionResult.summary = `Tuesday Afternoon Happy Hour (10% OFF Tea & Snacks) activated.`;
      executionResult.details = {
        slot: 'Tuesdays 12:00 PM - 04:00 PM',
        discount: '10% OFF on Tea, Biscuits & Snacks',
        status: 'SCHEDULED'
      };
      executionResult.message_sent = custom_message || details?.default_message;
      break;

    case 'BROADCAST_FLASH_PROMO':
      executionResult.summary = `Evening Flash Notification broadcast to 45 active regulars.`;
      executionResult.details = {
        recipient_count: 45,
        target_radius: '1.5 km (Sector 14 Gurugram)',
        estimated_incremental_orders: '4 to 6 orders (₹1,500 - ₹2,200)'
      };
      executionResult.message_sent = custom_message || details?.default_message;
      break;

    default:
      executionResult.summary = `Action ${action_id} executed successfully.`;
      executionResult.details = details || {};
      executionResult.message_sent = custom_message;
      break;
  }

  // Prepend to history log
  executedActionsLog.unshift(executionResult);

  return executionResult;
}
