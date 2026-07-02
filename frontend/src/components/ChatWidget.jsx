import React from "react";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";
import { API } from "@/lib/api";

const SUGGESTIONS = [
  "I'm a student. Which AI tools should I use?",
  "Recommend tools to start a YouTube channel.",
  "Best free alternative to Midjourney?",
  "How can a freelancer make money with AI?",
];

export default function ChatWidget() {
  const [open, setOpen] = React.useState(false);
  const [messages, setMessages] = React.useState([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const sessionId = React.useRef(localStorage.getItem("session_id") || crypto.randomUUID());
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    localStorage.setItem("session_id", sessionId.current);
  }, []);
  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    setMessages(m => [...m, { role: "user", content: msg }, { role: "assistant", content: "" }]);
    setLoading(true);
    try {
      const res = await fetch(`${API}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId.current, message: msg }),
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.delta) {
              setMessages(m => {
                const copy = [...m];
                copy[copy.length - 1] = { ...copy[copy.length - 1], content: copy[copy.length - 1].content + data.delta };
                return copy;
              });
            } else if (data.error) {
              setMessages(m => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: "⚠ " + data.error };
                return copy;
              });
            }
          } catch { /* ignore parse error */ }
        }
      }
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", content: "Network error. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          data-testid="chat-widget-open"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-black text-white w-14 h-14 flex items-center justify-center border-2 border-white brutal-shadow hover:bg-[var(--signal)] hover:border-black transition-colors"
          aria-label="Open AI assistant"
        >
          <MessageSquare size={22} />
        </button>
      )}

      {open && (
        <div data-testid="chat-widget-panel" className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] h-[600px] max-h-[80vh] bg-white border-2 border-black brutal-shadow-lg flex flex-col">
          <div className="flex items-center justify-between border-b-2 border-black px-4 py-3 bg-[var(--text)] text-[var(--bg)]">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[var(--signal)]" />
              <div className="font-display font-black tracking-tight">TOOLSCOUT</div>
              <div className="font-mono text-[10px] uppercase tracking-widest opacity-60">/ AI ASSISTANT</div>
            </div>
            <button data-testid="chat-widget-close" onClick={() => setOpen(false)} className="hover:text-[var(--signal)]"><X size={18}/></button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--bg)]">
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="font-display text-2xl font-black leading-tight">Hey — I&apos;ll help you find the right AI tool.</div>
                <div className="text-sm text-[var(--text-muted)]">Ask me anything, or try:</div>
                <div className="flex flex-col gap-2 mt-2">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      data-testid={`chat-suggestion-${i}`}
                      onClick={() => send(s)}
                      className="text-left text-sm border-2 border-black px-3 py-2 bg-white hover:bg-black hover:text-white transition-colors"
                    >→ {s}</button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"} data-testid={`chat-msg-${i}`}>
                {m.content || (loading && i === messages.length - 1 ? "▍" : "")}
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="border-t-2 border-black p-3 flex gap-2 bg-white"
          >
            <input
              data-testid="chat-input"
              className="brutal flex-1"
              placeholder="Ask: what tool should I use to..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button data-testid="chat-send" type="submit" disabled={loading || !input.trim()} className="btn-primary disabled:opacity-50">
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
