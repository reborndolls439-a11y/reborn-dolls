"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const WA_URL = "https://wa.me/447577304390";

interface Message { role: "user" | "agent"; content: string; time: string; }

function timeNow() {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

type Step = "intro" | "chat";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("intro");

  // Pre-chat fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [firstMsg, setFirstMsg] = useState("");
  const [startError, setStartError] = useState("");
  const [starting, setStarting] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [convId, setConvId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  // Auto-fill from auth store if logged in
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // ─── Start conversation (pre-chat form submit) ──────────────────────────────
  const startConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    setStartError("");

    const guestEmail = user?.email || email.trim();
    const guestName = user?.name || name.trim() || "Visitor";
    const msgText = firstMsg.trim();

    if (!guestEmail) { setStartError("Please enter your email address."); return; }
    if (!msgText) { setStartError("Please type a message first."); return; }
    if (!/\S+@\S+\.\S+/.test(guestEmail)) { setStartError("Please enter a valid email."); return; }

    setStarting(true);
    try {
      const res = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: "Live Chat",
          message: msgText,
          guestName,
          guestEmail,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStartError(data.error || "Failed to send. Please try again.");
        return;
      }

      setConvId(data.conversation?.id ?? null);
      setMessages([
        {
          role: "user",
          content: msgText,
          time: timeNow(),
        },
        {
          role: "agent",
          content: "Thanks for reaching out! We've received your message and will get back to you at " + guestEmail + " as soon as possible. Feel free to continue chatting below.",
          time: timeNow(),
        },
      ]);
      setFirstMsg("");
      setStep("chat");
    } catch {
      setStartError("Network error. Please check your connection and try again.");
    } finally {
      setStarting(false);
    }
  };

  // ─── Send follow-up message ──────────────────────────────────────────────────
  const send = async () => {
    if (!input.trim() || sending || !convId) return;
    const text = input.trim();
    setInput("");
    setSendError("");
    setMessages((m) => [...m, { role: "user", content: text, time: timeNow() }]);
    setSending(true);

    try {
      const res = await fetch(`/api/chat/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      if (!res.ok) {
        const data = await res.json();
        setSendError(data.error || "Message failed to send.");
        return;
      }

      setMessages((m) => [...m, {
        role: "agent",
        content: "Message received! Our team will follow up shortly.",
        time: timeNow(),
      }]);
    } catch {
      setSendError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    // Don't reset step — keep the chat visible if already started
  };

  return (
    <>
      {/* Floating buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* WhatsApp */}
        <a
          href={WA_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="w-12 h-12 rounded-full shadow-elevated flex items-center justify-center transition-transform hover:scale-110"
          style={{ background: "#25D366" }}
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>

        {/* Live chat toggle */}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle live chat"
          className="w-12 h-12 rounded-full shadow-elevated flex items-center justify-center transition-transform hover:scale-110"
          style={{ background: "var(--primary)", color: "var(--primary-text)" }}
        >
          {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
        </button>
      </div>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl shadow-elevated overflow-hidden flex flex-col border"
          style={{ maxHeight: "520px", background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-3 shrink-0" style={{ background: "var(--primary)" }}>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4" style={{ color: "var(--primary-text)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold font-body" style={{ color: "var(--primary-text)" }}>Reborn Dolls Support</p>
              <p className="text-[10px] opacity-70 font-body" style={{ color: "var(--primary-text)" }}>
                {step === "chat" ? "Chat active" : "Typically replies within a few hours"}
              </p>
            </div>
            <button onClick={handleClose} aria-label="Close chat"
              className="p-1 rounded-full opacity-70 hover:opacity-100 transition-opacity"
              style={{ color: "var(--primary-text)" }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── PRE-CHAT FORM ── */}
          {step === "intro" && (
            <form onSubmit={startConversation} className="flex flex-col p-4 gap-3 flex-1 overflow-y-auto">
              <p className="text-sm font-body" style={{ color: "var(--fg)" }}>
                Hi there 👋 — please enter your details and we&apos;ll get back to you shortly.
              </p>

              {/* Name — optional for logged-in users */}
              {!user && (
                <div>
                  <label className="block text-xs font-medium mb-1 font-body" style={{ color: "var(--fg-muted)" }}>
                    Your name <span className="opacity-50">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full h-9 px-3 rounded-xl text-sm font-body focus:outline-none"
                    style={{ background: "var(--surface)", color: "var(--fg)", border: "1px solid var(--border)" }}
                  />
                </div>
              )}

              {/* Email — required for guests */}
              {!user && (
                <div>
                  <label className="block text-xs font-medium mb-1 font-body" style={{ color: "var(--fg-muted)" }}>
                    Email address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full h-9 px-3 rounded-xl text-sm font-body focus:outline-none"
                    style={{ background: "var(--surface)", color: "var(--fg)", border: "1px solid var(--border)" }}
                  />
                </div>
              )}

              {/* Message */}
              <div>
                <label className="block text-xs font-medium mb-1 font-body" style={{ color: "var(--fg-muted)" }}>
                  Your message <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={firstMsg}
                  onChange={(e) => setFirstMsg(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); startConversation(e as unknown as React.FormEvent); } }}
                  placeholder="How can we help you today?"
                  rows={3}
                  required
                  className="w-full px-3 py-2 rounded-xl text-sm font-body focus:outline-none resize-none"
                  style={{ background: "var(--surface)", color: "var(--fg)", border: "1px solid var(--border)" }}
                />
              </div>

              {startError && (
                <p className="text-xs text-red-500 font-body">{startError}</p>
              )}

              <button
                type="submit"
                disabled={starting || !firstMsg.trim() || (!user && !email.trim())}
                className="w-full h-10 rounded-xl text-sm font-semibold font-body transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: "var(--primary)", color: "var(--primary-text)" }}
              >
                {starting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> Send Message</>}
              </button>

              <div className="text-center pt-1">
                <a href={WA_URL} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-body hover:underline" style={{ color: "var(--primary)" }}>
                  💬 Prefer WhatsApp? Click here
                </a>
              </div>
            </form>
          )}

          {/* ── ACTIVE CHAT ── */}
          {step === "chat" && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: "240px" }}>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className="max-w-[82%] rounded-2xl px-3 py-2 text-sm font-body"
                      style={msg.role === "user"
                        ? { background: "var(--primary)", color: "var(--primary-text)", borderBottomRightRadius: "4px" }
                        : { background: "var(--surface)", color: "var(--fg)", borderBottomLeftRadius: "4px" }}
                    >
                      <p className="leading-relaxed">{msg.content}</p>
                      <p className="text-[9px] mt-1 opacity-50">{msg.time}</p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {sendError && (
                <p className="text-xs text-red-500 font-body px-4 pb-1">{sendError}</p>
              )}

              <div className="px-3 py-2 border-t flex gap-2 shrink-0" style={{ borderColor: "var(--border)" }}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Type a message…"
                  className="flex-1 h-9 px-3 rounded-full text-sm font-body focus:outline-none"
                  style={{ background: "var(--surface)", color: "var(--fg)", border: "1px solid var(--border)" }}
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || sending}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity disabled:opacity-40"
                  style={{ background: "var(--primary)", color: "var(--primary-text)" }}
                  aria-label="Send"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
