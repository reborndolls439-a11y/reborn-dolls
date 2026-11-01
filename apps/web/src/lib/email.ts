import { Resend } from "resend";

// Lazy-initialize so it doesn't throw at build time when env vars aren't set
function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM_EMAIL = process.env.FROM_EMAIL || "Reborn Dolls <hello@reborndolls.com>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@reborndolls.com";

// ─── Order notification to admin ─────────────────────────────────────────────

export async function sendNewOrderEmailToAdmin(order: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  itemCount: number;
  items: { name: string; quantity: number; price: number }[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}) {
  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #F7E6E8;">${item.name}</td>
          <td style="padding:8px 0;border-bottom:1px solid #F7E6E8;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #F7E6E8;text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:'Inter',sans-serif;max-width:600px;margin:0 auto;color:#2D2929;">
      <div style="background:#C86B7A;padding:24px 32px;border-radius:12px 12px 0 0;">
        <h1 style="color:white;margin:0;font-size:22px;font-family:Georgia,serif;">New Order Received!</h1>
        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Order #${order.orderNumber}</p>
      </div>
      <div style="background:#FFFDF9;padding:32px;border:1px solid #F7E6E8;border-top:none;">
        <h2 style="margin:0 0 16px;font-size:16px;font-family:Georgia,serif;">Customer Details</h2>
        <p style="margin:0 0 4px;font-size:14px;"><strong>Name:</strong> ${order.customerName}</p>
        <p style="margin:0 0 20px;font-size:14px;"><strong>Email:</strong> <a href="mailto:${order.customerEmail}" style="color:#C86B7A;">${order.customerEmail}</a></p>

        <h2 style="margin:0 0 16px;font-size:16px;font-family:Georgia,serif;">Order Items</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px;">
          <thead>
            <tr style="border-bottom:2px solid #C86B7A;">
              <th style="text-align:left;padding:8px 0;">Product</th>
              <th style="text-align:center;padding:8px 0;">Qty</th>
              <th style="text-align:right;padding:8px 0;">Subtotal</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:12px 0 0;font-weight:600;font-size:15px;">Total</td>
              <td style="padding:12px 0 0;font-weight:700;font-size:16px;text-align:right;color:#C86B7A;">$${order.total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <h2 style="margin:0 0 12px;font-size:16px;font-family:Georgia,serif;">Ship to</h2>
        <p style="margin:0;font-size:14px;line-height:1.8;">
          ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br/>
          ${order.shippingAddress.line1}<br/>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br/>
          ${order.shippingAddress.country}
        </p>

        <div style="margin-top:28px;padding:16px;background:#F7E6E8;border-radius:8px;text-align:center;">
          <p style="margin:0;font-size:13px;color:#8A7D76;">Log in to your admin dashboard to process this order.</p>
        </div>
      </div>
    </div>
  `;

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New Order #${order.orderNumber} — $${order.total.toFixed(2)}`,
    html,
  });
}

// ─── Order confirmation to customer ──────────────────────────────────────────

export async function sendOrderConfirmationToCustomer(order: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  items: { name: string; quantity: number; price: number; image?: string }[];
}) {
  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:10px 0;border-bottom:1px solid #F7E6E8;font-size:14px;">${item.name}</td>
          <td style="padding:10px 0;border-bottom:1px solid #F7E6E8;font-size:14px;text-align:center;">${item.quantity}</td>
          <td style="padding:10px 0;border-bottom:1px solid #F7E6E8;font-size:14px;text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:'Inter',sans-serif;max-width:600px;margin:0 auto;color:#2D2929;">
      <div style="background:#C86B7A;padding:32px;border-radius:12px 12px 0 0;text-align:center;">
        <div style="width:56px;height:56px;background:white;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
          <span style="font-size:24px;">✓</span>
        </div>
        <h1 style="color:white;margin:0;font-size:24px;font-family:Georgia,serif;">Order Confirmed!</h1>
        <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Order #${order.orderNumber}</p>
      </div>
      <div style="background:#FFFDF9;padding:32px;border:1px solid #F7E6E8;border-top:none;">
        <p style="font-size:15px;margin:0 0 24px;line-height:1.6;">
          Hi ${order.customerName},<br/><br/>
          Thank you for your order! We've received it and will be in touch shortly to confirm details and arrange delivery.
        </p>

        <h2 style="margin:0 0 16px;font-size:16px;font-family:Georgia,serif;">Your Order</h2>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="border-bottom:2px solid #C86B7A;">
              <th style="text-align:left;padding:8px 0;font-size:13px;color:#8A7D76;">Product</th>
              <th style="text-align:center;padding:8px 0;font-size:13px;color:#8A7D76;">Qty</th>
              <th style="text-align:right;padding:8px 0;font-size:13px;color:#8A7D76;">Subtotal</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding:16px 0 0;font-weight:600;font-size:15px;">Total</td>
              <td style="padding:16px 0 0;font-weight:700;font-size:17px;text-align:right;color:#C86B7A;">$${order.total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-top:28px;padding:20px;background:#F7E6E8;border-radius:10px;text-align:center;">
          <p style="margin:0 0 6px;font-size:14px;font-weight:600;">Have questions?</p>
          <p style="margin:0;font-size:13px;color:#8A7D76;">Reply to this email or contact us at <a href="mailto:hello@reborndolls.com" style="color:#C86B7A;">hello@reborndolls.com</a></p>
        </div>
      </div>
      <div style="padding:20px;text-align:center;">
        <p style="margin:0;font-size:12px;color:#8A7D76;">© ${new Date().getFullYear()} Reborn Dolls — Where Artistry Comes to Life.</p>
      </div>
    </div>
  `;

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: order.customerEmail,
    subject: `Your order #${order.orderNumber} is confirmed ✓`,
    html,
  });
}

// ─── Password reset email ─────────────────────────────────────────────────────

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string
) {
  const html = `
    <div style="font-family:'Inter',sans-serif;max-width:600px;margin:0 auto;color:#2D2929;">
      <div style="background:#C86B7A;padding:28px 32px;border-radius:12px 12px 0 0;">
        <h1 style="color:white;margin:0;font-size:20px;font-family:Georgia,serif;">Reset Your Password</h1>
      </div>
      <div style="background:#FFFDF9;padding:32px;border:1px solid #F7E6E8;border-top:none;">
        <p style="font-size:15px;margin:0 0 20px;line-height:1.6;">Hi ${name},<br/><br/>We received a request to reset your password. Click the button below to create a new one.</p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${resetUrl}" style="display:inline-block;background:#C86B7A;color:white;padding:14px 32px;border-radius:50px;text-decoration:none;font-weight:600;font-size:15px;">Reset Password</a>
        </div>
        <p style="font-size:13px;color:#8A7D76;margin:0;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    </div>
  `;

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset your Reborn Dolls password",
    html,
  });
}

// ─── Order status update ──────────────────────────────────────────────────────

export async function sendOrderStatusUpdate(
  email: string,
  name: string,
  orderNumber: string,
  status: string,
  trackingNumber?: string
) {
  const statusMessages: Record<string, string> = {
    PROCESSING: "Your order is being prepared with care.",
    SHIPPED: trackingNumber
      ? `Your order is on its way! Tracking: <strong>${trackingNumber}</strong>`
      : "Your order has been shipped and is on its way!",
    DELIVERED: "Your order has been delivered. We hope you love it!",
    CANCELLED: "Your order has been cancelled. Contact us if you have questions.",
  };

  const message = statusMessages[status] || `Your order status has been updated to: ${status}`;

  const html = `
    <div style="font-family:'Inter',sans-serif;max-width:600px;margin:0 auto;color:#2D2929;">
      <div style="background:#C86B7A;padding:28px 32px;border-radius:12px 12px 0 0;">
        <h1 style="color:white;margin:0;font-size:20px;font-family:Georgia,serif;">Order Update</h1>
        <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px;">Order #${orderNumber}</p>
      </div>
      <div style="background:#FFFDF9;padding:32px;border:1px solid #F7E6E8;border-top:none;">
        <p style="font-size:15px;margin:0 0 16px;">Hi ${name},</p>
        <p style="font-size:15px;margin:0;line-height:1.6;">${message}</p>
        <div style="margin-top:28px;text-align:center;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/account/orders" style="display:inline-block;background:#C86B7A;color:white;padding:12px 28px;border-radius:50px;text-decoration:none;font-weight:600;font-size:14px;">View Order</a>
        </div>
      </div>
    </div>
  `;

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Order #${orderNumber} Update — ${status.replace(/_/g, " ")}`,
    html,
  });
}
