import { useState } from "react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState(""); // ❌ yahan key hardcode mat karo
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! Flight booking mein help chahiye? 😊" },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!msg.trim() || !apiKey.trim()) return;

    const userText = msg.trim();
    const userMsg = { from: "user", text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setMsg("");
    setLoading(true);

    try {
      const chatMessages = [
        {
          role: "system",
          content:
            "You are an AI assistant for a B2B flight booking portal. " +
            "Help users in simple Hinglish with queries like how to search flights, " +
            "select fares, fill passenger details, and complete ticket booking.",
        },
        ...messages.map((m) => ({
          role: m.from === "user" ? "user" : "assistant",
          content: m.text,
        })),
        { role: "user", content: userText },
      ];

      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages: chatMessages,
        }),
      });

      const data = await resp.json();

      const reply =
        data?.choices?.[0]?.message?.content ??
        "Sorry, mujhe response samajh nahi aaya.";

      setMessages((prev) => [...prev, { from: "bot", text: reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Sorry, kuch error aa gaya. Baad me try karo." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 👉 apna WhatsApp number yahan daalo (with country code, without +)
  const whatsappNumber = "919818701404";
  const whatsappText = encodeURIComponent(
    "Hi! I need help with flight booking on your B2B portal."
  );
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappText}`;

  return (
    <>
      {/* 🔼 WhatsApp button (upar) */}
      <a
  href={whatsappLink}
  target="_blank"
  rel="noopener noreferrer"
  className="fixed bottom-24 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600"
  title="Chat on WhatsApp"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 32 32"
    className="h-7 w-7"
    aria-hidden="true"
  >
    <path
      fill="currentColor"
      d="M16.04 5.333c-5.88 0-10.667 4.74-10.667 10.58 0 1.865.52 3.68 1.5 5.28l-1.6 5.84 6-1.57c1.54.84 3.28 1.28 5.07 1.28h.01c5.88 0 10.66-4.74 10.66-10.58 0-2.83-1.12-5.49-3.16-7.49-2.05-2-4.77-3.14-7.88-3.14Zm-.01 2.134c2.36 0 4.57.9 6.24 2.54 1.67 1.64 2.59 3.8 2.59 6.12 0 4.77-3.9 8.446-8.7 8.446-1.53 0-3.03-.4-4.35-1.16l-.31-.18-3.55.93.95-3.45-.2-.35c-.88-1.45-1.34-3.12-1.34-4.93 0-4.72 3.9-8.45 8.6-8.45Zm-3.07 3.32c-.17-.39-.35-.4-.51-.41-.13-.01-.28-.01-.43-.01-.15 0-.4.06-.61.29-.21.23-.8.78-.8 1.9 0 1.12.82 2.2.93 2.35.11.15 1.62 2.6 3.98 3.54 1.97.78 2.37.63 2.8.59.43-.04 1.38-.56 1.58-1.11.2-.55.2-1.02.14-1.11-.06-.09-.22-.15-.46-.27-.24-.12-1.38-.68-1.6-.76-.22-.08-.38-.12-.54.12-.16.23-.62.76-.76.92-.14.16-.28.18-.52.06-.24-.12-1.02-.38-1.94-1.21-.72-.64-1.21-1.43-1.36-1.67-.14-.24-.01-.37.11-.49.11-.11.24-.29.36-.43.12-.15.16-.23.24-.39.08-.16.04-.3-.02-.42-.06-.12-.53-1.3-.73-1.77Z"
    />
  </svg>
</a>


      {/* 🔽 AI chat button (neeche) */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg"
        title="AI Travel Assistant"
      >
        💬
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-5 z-40 flex w-80 flex-col rounded-md border border-gray-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-3 py-2">
            <div className="text-sm font-semibold">Travel AI Assistant</div>
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-gray-500"
            >
              ✕
            </button>
          </div>

          {/* API key input */}
          <div className="border-b bg-gray-50 px-3 py-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full rounded-md border px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="OpenAI API key (testing only, don't share)"
            />
          </div>

          {/* Messages */}
          <div className="flex max-h-80 flex-1 flex-col gap-2 overflow-y-auto px-3 py-2 text-sm">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${
                  m.from === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-md px-3 py-2 ${
                    m.from === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-xs text-gray-400">Assistant typing…</div>
            )}
          </div>

          {/* Input box */}
          <div className="flex items-center gap-2 border-t px-2 py-2">
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 rounded-md border px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Ask about flight booking…"
            />
            <button
              onClick={sendMessage}
              className="rounded-md bg-blue-600 px-3 py-1 text-xs text-white disabled:opacity-50"
              disabled={!apiKey || !msg.trim() || loading}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
