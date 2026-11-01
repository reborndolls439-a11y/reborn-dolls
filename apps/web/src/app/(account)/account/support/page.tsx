"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, Plus } from "lucide-react";
import { Button, EmptyState } from "@reborn/ui";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";

interface Message { id: string; senderType: string; senderName: string; content: string; createdAt: string; }
interface Conversation { id: string; subject?: string; status: string; lastMessage?: string; lastMessageAt?: string; messages?: Message[]; }

export default function SupportPage() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [showNew, setShowNew] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const data = await api.get<{ conversations: Conversation[] }>("/chat/conversations");
      setConversations(data.conversations || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openConversation = async (conv: Conversation) => {
    try {
      const data = await api.get<{ conversation: Conversation }>(`/chat/conversations/${conv.id}/messages`);
      setActive(data.conversation);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch { setActive(conv); }
  };

  const sendMessage = async () => {
    if (!message.trim() || !active || sending) return;
    setSending(true);
    try {
      await api.post(`/chat/conversations/${active.id}/messages`, { content: message.trim() });
      setMessage("");
      await openConversation(active);
    } catch { /* ignore */ }
    finally { setSending(false); }
  };

  const startConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const data = await api.post<{ conversation: Conversation }>("/chat/conversations", { subject: newSubject, message: newMessage });
      setShowNew(false); setNewSubject(""); setNewMessage("");
      await load();
      openConversation(data.conversation);
    } catch { /* ignore */ }
    finally { setSending(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-charcoal">Support Messages</h1>
        <Button size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => { setShowNew(true); setActive(null); }}>New Message</Button>
      </div>

      {/* New conversation form */}
      {showNew && (
        <div className="bg-white rounded-2xl border border-charcoal-100 p-5">
          <h2 className="font-heading text-base font-semibold text-charcoal mb-4">New Support Request</h2>
          <form onSubmit={startConversation} className="space-y-3">
            <input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="Subject (optional)" className="w-full h-11 px-4 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose" />
            <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)} rows={4} required placeholder="How can we help you?" className="w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose resize-none" />
            <div className="flex gap-2">
              <Button type="submit" variant="primary" size="sm" loading={sending}>Send Message</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowNew(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4">
        {/* Conversation list */}
        <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
          {loading && <p className="text-sm text-taupe font-body p-4">Loading…</p>}
          {!loading && conversations.length === 0 && (
            <EmptyState icon={<MessageCircle />} title="No messages yet" description="Start a conversation with our support team." size="sm" />
          )}
          <div className="divide-y divide-charcoal-50">
            {conversations.map((conv) => (
              <button key={conv.id} onClick={() => openConversation(conv)} className={`w-full text-left px-4 py-3.5 hover:bg-charcoal-50 transition-colors ${active?.id === conv.id ? "bg-soft-blush-50 border-l-2 border-bloom-rose" : ""}`}>
                <p className="text-sm font-semibold text-charcoal font-body line-clamp-1">{conv.subject || "Support Request"}</p>
                {conv.lastMessage && <p className="text-xs text-taupe font-body mt-0.5 line-clamp-1">{conv.lastMessage}</p>}
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${conv.status === "OPEN" ? "bg-amber-100 text-amber-700" : conv.status === "RESOLVED" ? "bg-green-100 text-green-700" : "bg-charcoal-100 text-taupe"}`}>{conv.status}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        {active ? (
          <div className="bg-white rounded-2xl border border-charcoal-100 flex flex-col h-[480px]">
            <div className="px-5 py-4 border-b border-charcoal-100 shrink-0">
              <p className="font-heading text-sm font-semibold text-charcoal">{active.subject || "Support Request"}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(active.messages || []).map((msg) => {
                const isMe = msg.senderType === "CUSTOMER";
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm font-body ${isMe ? "bg-bloom-rose text-white rounded-br-sm" : "bg-charcoal-50 text-charcoal rounded-bl-sm"}`}>
                      <p className="leading-relaxed">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? "text-white/60 text-right" : "text-taupe"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            {active.status !== "CLOSED" && (
              <div className="px-4 py-3 border-t border-charcoal-100 flex gap-2 shrink-0">
                <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="Type a message…" className="flex-1 h-10 px-4 rounded-full border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose" />
                <button onClick={sendMessage} disabled={!message.trim() || sending} className="w-10 h-10 bg-bloom-rose text-white rounded-full flex items-center justify-center hover:bg-bloom-rose-600 disabled:opacity-40 transition-colors" aria-label="Send">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-charcoal-100 flex items-center justify-center h-[480px]">
            <EmptyState icon={<MessageCircle />} title="Select a conversation" description="Choose a message thread from the left to view it." size="sm" />
          </div>
        )}
      </div>
    </div>
  );
}
