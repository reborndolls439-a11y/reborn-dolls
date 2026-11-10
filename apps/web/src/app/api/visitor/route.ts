import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

function getResend() { return new Resend(process.env.RESEND_API_KEY); }
const FROM_EMAIL = process.env.FROM_EMAIL || "Reborn Dolls <hello@ukreborndolls.co.uk>";
// Visitor alerts go to the specified Gmail address
const ALERT_EMAIL = "reborndolls439@gmail.com";

// Simple in-memory dedup — prevents alerting on every page navigation.
// Resets on each serverless cold start (good enough — prevents spam).
const recentIPs = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    // Get visitor IP
    const ip =
      request.headers.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";

    // Skip if we already alerted for this IP recently (within this instance's lifetime)
    if (ip === "unknown" || ip === "127.0.0.1" || ip === "::1" || recentIPs.has(ip)) {
      return NextResponse.json({ ok: true });
    }

    // Mark as seen immediately to prevent duplicate sends
    recentIPs.add(ip);
    // Keep the set small
    if (recentIPs.size > 500) recentIPs.clear();

    // Look up geo + ISP via ipapi.co (free tier — 1,000 req/day, no key needed)
    let country = "Unknown";
    let region = "";
    let city = "";
    let isp = "Unknown";
    let flag = "";

    try {
      const geo = await fetch(`https://ipapi.co/${ip}/json/`, {
        headers: { "User-Agent": "reborndolls-visitor-tracker/1.0" },
        signal: AbortSignal.timeout(4000),
      });
      if (geo.ok) {
        const d = await geo.json();
        country = d.country_name || "Unknown";
        region  = d.region || "";
        city    = d.city || "";
        isp     = d.org || d.isp || "Unknown";
        flag    = d.country_code
          ? String.fromCodePoint(...[...d.country_code].map((c) => 0x1F1E0 + c.charCodeAt(0) - 65))
          : "";
      }
    } catch { /* geo lookup failed — still send with what we have */ }

    const location = [city, region, country].filter(Boolean).join(", ");
    const page = request.headers.get("referer") || "unknown page";
    const ua   = request.headers.get("user-agent") || "";
    const time = new Date().toLocaleString("en-GB", { timeZone: "Europe/London" });

    // Fire-and-forget — don't block the response
    getResend().emails.send({
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
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // Always return 200 — don't expose errors
  }
}
