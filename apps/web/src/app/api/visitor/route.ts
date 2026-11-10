import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

// Use the same verified sender as order emails, or fall back to Resend sandbox
const FROM_EMAIL = process.env.FROM_EMAIL || "UK Reborn Dolls <hello@ukreborndolls.co.uk>";
const ALERT_EMAIL = "reborndolls439@gmail.com";

const recentIPs = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";

    if (ip === "unknown" || ip === "127.0.0.1" || ip === "::1" || recentIPs.has(ip)) {
      return NextResponse.json({ ok: true });
    }

    recentIPs.add(ip);
    if (recentIPs.size > 500) recentIPs.clear();

    // Look up geo + ISP
    let country = "Unknown";
    let region = "";
    let city = "";
    let isp = "Unknown";
    let flag = "";

    try {
      const geo = await fetch(`https://ipapi.co/${ip}/json/`, {
        headers: { "User-Agent": "reborndolls-visitor-tracker/1.0" },
        signal: AbortSignal.timeout(5000),
      });
      if (geo.ok) {
        const d = await geo.json();
        if (!d.error) {
          country = d.country_name || "Unknown";
          region  = d.region || "";
          city    = d.city || "";
          isp     = d.org || d.isp || "Unknown";
          flag    = d.country_code
            ? String.fromCodePoint(...[...d.country_code].map((c) => 0x1F1E6 + c.charCodeAt(0) - 65))
            : "";
        }
      }
    } catch (e) { console.error("[VISITOR] Geo lookup failed:", e); }

    const location = [city, region, country].filter(Boolean).join(", ");
    const page = request.headers.get("referer") || "unknown page";
    const ua   = request.headers.get("user-agent") || "";
    const time = new Date().toLocaleString("en-GB", { timeZone: "Europe/London" });

    // Send email — log errors instead of swallowing
    const resend = getResend();
    if (!resend) {
      console.error("[VISITOR] RESEND_API_KEY not set — cannot send visitor alert");
      return NextResponse.json({ ok: true });
    }

    const emailResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: ALERT_EMAIL,
      subject: `${flag} New visitor — ${location || ip}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;color:#02182B;">
          <div style="background:#2FE6DE;padding:16px 24px;border-radius:10px 10px 0 0;">
            <h2 style="margin:0;font-size:16px;color:#02182B;">${flag} New Visitor — UK Reborn Dolls</h2>
          </div>
          <div style="background:#f7fbfe;padding:20px 24px;border:1px solid #cddceb;border-top:none;border-radius:0 0 10px 10px;font-size:14px;line-height:1.9;">
            <p style="margin:0"><strong>Time (UK):</strong> ${time}</p>
            <p style="margin:0"><strong>IP Address:</strong> ${ip}</p>
            <p style="margin:0"><strong>Location:</strong> ${location || "Unknown"}</p>
            <p style="margin:0"><strong>ISP / Org:</strong> ${isp}</p>
            <p style="margin:0"><strong>Page:</strong> ${page}</p>
            <p style="margin:0;color:#5a7a8a;font-size:12px;margin-top:8px;">${ua.slice(0, 120)}</p>
          </div>
        </div>`,
    });

    if (emailResult.error) {
      console.error("[VISITOR] Resend error:", emailResult.error);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[VISITOR] Error:", e);
    return NextResponse.json({ ok: true });
  }
}
