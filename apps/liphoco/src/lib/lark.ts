// ============================================================
// LARK NOTIFICATION — Webhook + Approval Bot
// Chỉ dùng cho notification & approval, không phải UI chính
// ============================================================

type LarkWebhookType = 'ceo_alert' | 'ai_costing' | 'crm_rfq' | 'email_market';

const WEBHOOKS: Record<LarkWebhookType, string> = {
  ceo_alert: process.env.LARK_WEBHOOK_CEO_ALERT || '',
  ai_costing: process.env.LARK_WEBHOOK_AI_COSTING || '',
  crm_rfq: process.env.LARK_WEBHOOK_CRM_RFQ || '',
  email_market: process.env.LARK_WEBHOOK_EMAIL_MARKET || '',
};

interface LarkMessage {
  title: string;
  content: string;
  fields?: { key: string; value: string }[];
  actionUrl?: string;
}

/** Gửi rich card message qua Lark webhook */
export async function sendLarkNotification(
  webhook: LarkWebhookType,
  message: LarkMessage
): Promise<{ ok: boolean; error?: string }> {
  const url = WEBHOOKS[webhook];
  if (!url) return { ok: false, error: `Webhook ${webhook} not configured` };

  const fieldsContent = message.fields
    ?.map((f) => `**${f.key}:** ${f.value}`)
    .join('\n') || '';

  const body = {
    msg_type: 'interactive',
    card: {
      header: {
        title: { tag: 'plain_text', content: message.title },
        template: 'blue',
      },
      elements: [
        {
          tag: 'markdown',
          content: `${message.content}\n\n${fieldsContent}`,
        },
        ...(message.actionUrl
          ? [
              {
                tag: 'action',
                actions: [
                  {
                    tag: 'button',
                    text: { tag: 'plain_text', content: 'Xem chi tiết' },
                    url: message.actionUrl,
                    type: 'primary',
                  },
                ],
              },
            ]
          : []),
      ],
    },
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return { ok: data.code === 0 };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// ─── Pre-built notification templates ───────────────────────

export const larkTemplates = {
  /** Thông báo Work Order mới cho xưởng */
  newWorkOrder: (woNo: string, itemName: string, qty: number) =>
    sendLarkNotification('ceo_alert', {
      title: `🏭 Lệnh SX mới: ${woNo}`,
      content: 'Lệnh sản xuất mới đã được tạo',
      fields: [
        { key: 'Sản phẩm', value: itemName },
        { key: 'Số lượng', value: String(qty) },
      ],
      actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/work-orders`,
    }),

  /** Thông báo YCMH cần duyệt cho Lệ */
  prNeedApproval: (prNo: string, requestedBy: string) =>
    sendLarkNotification('ceo_alert', {
      title: `📋 YCMH cần duyệt: ${prNo}`,
      content: `Yêu cầu mua hàng từ **${requestedBy}** đang chờ phê duyệt`,
      fields: [{ key: 'Mã YCMH', value: prNo }],
      actionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/purchase-requests`,
    }),

  /** Thông báo báo giá mới cho CRM */
  newQuotation: (quoteNo: string, customer: string, usd: number) =>
    sendLarkNotification('crm_rfq', {
      title: `💰 Báo giá mới: ${quoteNo}`,
      content: `Báo giá cho **${customer}** đã được tạo`,
      fields: [
        { key: 'Khách hàng', value: customer },
        { key: 'Giá USD', value: `$${usd.toLocaleString()}` },
      ],
    }),

  /** Cảnh báo tồn kho thấp */
  lowStock: (itemCode: string, itemName: string, qty: number) =>
    sendLarkNotification('ceo_alert', {
      title: `⚠️ Tồn kho thấp: ${itemCode}`,
      content: `Vật tư **${itemName}** sắp hết hàng`,
      fields: [
        { key: 'Mã NVL', value: itemCode },
        { key: 'Tồn hiện tại', value: String(qty) },
      ],
    }),
};
