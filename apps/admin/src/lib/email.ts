// Re-export from web app's email lib pattern — standalone for admin
import { Resend } from "resend";

// Lazy-initialize so it doesn't throw at build time when env vars aren't set
function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM_EMAIL = process.env.FROM_EMAIL || "Reborn Dolls <hello@reborndolls.com>";

export async function sendOrderStatusUpdate(email: string, name: string, orderNumber: string, status: string, trackingNumber?: string) {
  const statusMessages: Record<string, string> = {
    PROCESSING: "Your order is being carefully prepared.",
    SHIPPED: trackingNumber ? `Great news — your order is on its way! Tracking number: <strong>${trackingNumber}</strong>` : "Your order has shipped!",
    DELIVERED: "Your order has been delivered. We hope you love it!",
    CANCELLED: "Your order has been cancelled. Please contact us if you have questions.",
  };
  const message = statusMessages[status] || `Your order status has been updated to: ${status}.`;
  const siteUrl = process.env.NEXT_PUBLIC_STORE_URL || "http://localhost:3000";

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Order #${orderNumber} Update`,
    html: `<div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;color:#2D2929;">
      <div style="background:#C86B7A;padding:28px 32px;border-radius:12px 12px 0 0;">
        <h1 style="color:white;margin:0;font-size:20px;">Order Update — #${orderNumber}</h1>
      </div>
      <div style="background:#FFFDF9;padding:32px;border:1px solid #F7E6E8;border-top:none;">
        <p style="font-size:15px;margin:0 0 16px;">Hi ${name},</p>
        <p style="font-size:15px;line-height:1.6;">${message}</p>
        <div style="margin-top:28px;text-align:center;">
          <a href="${siteUrl}/account/orders" style="display:inline-block;background:#C86B7A;color:white;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:600;font-size:14px;">View Order</a>
        </div>
      </div>
    </div>`,
  });
}
