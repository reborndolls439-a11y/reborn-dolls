"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, CheckCheck, User, X } from "lucide-react";
import { Button } from "@reborn/ui";
import { cn } from "@reborn/ui";

interface Message { id: string; senderType: string; senderName: string; content: string; createdAt: string; isRead: boolean; }
interface Conversation { id: string; status: string; subject?: string; guestName?: string; guestEmail?: string; user?: { name?: string; email?: string }; messages: Message[]; }

const statusOpts = ["OPEN", "PENDING", "RESOLVED", "CLOSED"];

export default function ChatDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [conv, setConv] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchConversation = useCallback(async () => {
    const res = await fetch(`/api/admin/chat/${id}`);
    if (res.ok) {
      const data = await res.json();
      setConv(data.conversation);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchConversation();
    // Poll every 5 seconds for new messages
    pollRef.current = setInterval(fetchConversation, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conv?.messages.length]);

  const sendMessage = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/chat/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message.trim() }),
      });
      if (res.ok) {
        setMessage("");
        await fetchConversation();
      }
    } catch { /* ignore */ }
    finally { setSending(false); }
  };

  const updateStatus = async (status: string) => {
    await fetch(`/api/admin/chat/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setConv((c) => c ? { ...c, status } : c);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  if (loading) return <div className="flex-1 flex items-center justify-center"><p className="text-taupe font-body">Loading…</p></div>;
  if (!conv) return <div className="flex-1 flex items-center justify-center"><p className="text-taupe font-body">Conversation not found.</p></div>;

  const customerName = conv.user?.name || conv.guestName || "Guest";
  const customerEmail = conv.user?.email || conv.guestEmail;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-14 bg-white border-b border-charcoal-100 flex items-center gap-4 px-6 shrink-0">
        <button onClick={() => router.push("/chat")} className="text-taupe hover:text-charcoal transition-colors"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-full bg-bloom-rose-100 flex items-center justify-center shrink-0">
            <span className="text-bloom-rose text-xs font-semibold">{customerName.charAt(0).toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-charcoal font-body text-sm">{customerName}</p>
            {customerEmail && <a href={`mailto:${customerEmail}`} className="text-xs text-bloom-rose hover:underline">{customerEmail}</a>}
          </div>
        </div>
        <select value={conv.status} onChange={(e) => updateStatus(e.target.value)} className="h-8 px-3 rounded-lg border border-charcoal-200 text-xs font-body focus:outline-none focus:border-bloom-rose bg-white">
          {statusOpts.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-charcoal-50">
        {conv.messages.map((msg) => {
          const isAdmin = msg.senderType === "ADMIN";
          return (
            <div key={msg.id} className={cn("flex", isAdmin ? "justify-end" : "justify-start")}>
              {!isAdmin && (
                <div className="w-7 h-7 rounded-full bg-bloom-rose-100 flex items-center justify-center mr-2 shrink-0 self-end">
                  <User className="w-3.5 h-3.5 text-bloom-rose" />
                </div>
              )}
              <div className={cn("max-w-[70%] rounded-2xl px-4 py-3 text-sm font-body", isAdmin ? "bg-bloom-rose text-white rounded-br-sm" : "bg-white text-charcoal border border-charcoal-100 rounded-bl-sm shadow-sm")}>
                <p className="leading-relaxed">{msg.content}</p>
                <div className={cn("flex items-center gap-1 mt-1", isAdmin ? "justify-end" : "justify-start")}>
                  <span className={cn("text-[10px]", isAdmin ? "text-white/60" : "text-taupe")}>
                    {new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" }).format(new Date(msg.createdAt))}
                  </span>
                  {isAdmin && <CheckCheck className="w-3 h-3 text-white/60" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {conv.status !== "CLOSED" && (
        <div className="bg-white border-t border-charcoal-100 p-4 shrink-0">
          <div className="flex gap-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message… (Enter to send)"
              rows={2}
              className="flex-1 px-4 py-3 rounded-2xl border border-charcoal-200 text-sm font-body focus:outline-none focus:border-bloom-rose resize-none"
            />
            <Button variant="primary" size="icon-lg" onClick={sendMessage} loading={sending} disabled={!message.trim()} aria-label="Send">
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-taupe font-body mt-1.5 text-center">Enter to send · Shift+Enter for new line</p>
        </div>
      )}
      {conv.status === "CLOSED" && (
        <div className="bg-charcoal-50 border-t border-charcoal-100 px-6 py-3 text-center">
          <p className="text-sm text-taupe font-body">This conversation is closed.</p>
          <button onClick={() => updateStatus("OPEN")} className="text-xs text-bloom-rose hover:underline font-body mt-1">Reopen conversation</button>
        </div>
      )}
    </div>
  );
}
