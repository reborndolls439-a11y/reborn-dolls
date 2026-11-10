"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const WA_URL = "https://wa.me/447577304390";

interface Message { role: "user" | "agent"; content: string; time: string; }

function timeNow() {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"chat" | "whatsapp">("chat");
  const [messages, setMessages] = useState<Message[]>([
    { role: "agent", content: "Hi! Welcome to Reborn Dolls. How can we help you today?", time: timeNow() },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [convId, setConvId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text, time: timeNow() }]);
    setSending(true);
    try {
      if (!convId) {
        // Start a new conversation
        const res = await fetch("/api/chat/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject: "Live chat", message: text }),
        });
        if (res.ok) {
          const data = await res.json();
          setConvId(data.conversation?.id ?? null);
        }
      } else {
        await fetch(`/api/chat/conversations/${convId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text }),
        });
      }
      setMessages((m) => [...m, {
        role: "agent",
        content: "Thanks for your message! Our team will get back to you as soon as possible. You can also reach us on WhatsApp for a faster response.",
        time: timeNow(),
      }]);
    } catch { /* ignore */ }
    finally { setSending(false); }
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
          {/* WhatsApp SVG icon */}
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>

        {/* Live chat toggle */}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle live chat"
          className="w-12 h-12 rounded-full shadow-elevated flex items-center justify-center transition-transform hover:scale-110 bg-[var(--primary)]"
          style={{ color: "var(--primary-text)" }}
        >
          {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
        </button>
      </div>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl shadow-elevated overflow-hidden flex flex-col border border-[var(--border)]" style={{ maxHeight: "480px", background: "var(--bg-card)" }}>
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-3" style={{ background: "var(--primary)" }}>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white font-body">Reborn Dolls Support</p>
              <p className="text-[10px] text-white/70 font-body">Typically replies within a few hours</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setTab("chat")} className={`text-[10px] px-2 py-0.5 rounded-full font-body transition-colors ${tab === "chat" ? "bg-white/30 text-white" : "text-white/60 hover:text-white"}`}>Chat</button>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="text-[10px] px-2 py-0.5 rounded-full font-body text-white/60 hover:text-white hover:bg-white/30 transition-colors">WhatsApp</a>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: "240px" }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm font-body ${
                  msg.role === "user"
                    ? "text-white rounded-br-sm"
                    : "rounded-bl-sm"
                }`}
                style={msg.role === "user"
                  ? { background: "var(--primary)", color: "var(--primary-text)" }
                  : { background: "var(--surface)", color: "var(--fg)" }}>
                  <p className="leading-relaxed">{msg.content}</p>
                  <p className="text-[9px] mt-1 opacity-60">{msg.time}</p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-2 border-t flex gap-2" style={{ borderColor: "var(--border)" }}>
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
              className="w-9 h-9 rounded-full flex items-center justify-center transition-colors disabled:opacity-40"
              style={{ background: "var(--primary)", color: "var(--primary-text)" }}
              aria-label="Send"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
