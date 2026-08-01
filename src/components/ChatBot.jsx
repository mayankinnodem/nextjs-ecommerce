"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MessageCircle, X, Send, Bot, Loader2 } from "lucide-react";
import { useLocale } from "@/context/LocaleContext";

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br />");
}

export default function ChatBot() {
  const pathname = usePathname();
  const { t, language } = useLocale();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const hiddenPages = ["/admin-dashboard", "/admin-login"];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  useEffect(() => {
    if (!open) return;
    setMessages([{ id: "welcome", role: "bot", text: t("chatbot.greeting") }]);
    setSuggestions([
      t("chatbot.suggestTrack"),
      t("chatbot.suggestShipping"),
      t("chatbot.suggestReturns"),
      t("chatbot.suggestProducts"),
      t("chatbot.suggestContact"),
    ]);
  }, [open, language, t]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg = { id: Date.now() + "-u", role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSuggestions([]);
    setLoading(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, language }),
      });
      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + "-b",
            role: "bot",
            text: data.reply,
            links: data.links || [],
          },
        ]);
        if (data.suggestions?.length) setSuggestions(data.suggestions);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + "-e", role: "bot", text: t("chatbot.error") },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + "-e", role: "bot", text: t("chatbot.error") },
      ]);
    }

    setLoading(false);
  };

  if (hiddenPages.some((p) => pathname?.startsWith(p))) return null;

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[380px] h-[min(520px,calc(100vh-8rem))] bg-white rounded-2xl shadow-2xl border border-gray-200 z-[60] flex flex-col overflow-hidden animate-fadeIn"
          role="dialog"
          aria-label={t("chatbot.title")}
        >
          {/* Header */}
          <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div>
                <p className="font-semibold text-sm">{t("chatbot.title")}</p>
                <p className="text-xs text-indigo-200">{t("chatbot.subtitle")}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition"
              aria-label={t("chatbot.close")}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-md"
                      : "bg-white text-gray-800 border shadow-sm rounded-bl-md"
                  }`}
                >
                  <div
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(msg.text),
                    }}
                  />
                  {msg.links?.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {msg.links.map((link, i) => (
                        <Link
                          key={i}
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className="block text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition truncate"
                        >
                          {link.image && (
                            <img
                              src={link.image}
                              alt=""
                              className="w-8 h-8 rounded object-cover inline-block mr-2 align-middle"
                            />
                          )}
                          {link.label}
                          {link.price ? ` — ₹${link.price}` : ""} →
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 size={16} className="animate-spin text-indigo-600" />
                  {t("chatbot.typing")}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          {suggestions.length > 0 && !loading && (
            <div className="px-3 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t bg-white shrink-0">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => sendMessage(s)}
                  className="shrink-0 text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition whitespace-nowrap"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="p-3 border-t bg-white flex gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("chatbot.placeholder")}
              className="input-field py-2 text-sm flex-1"
              maxLength={500}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="btn-primary p-2.5 rounded-xl disabled:opacity-50 shrink-0"
              aria-label={t("chatbot.send")}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`fixed bottom-6 right-4 sm:right-6 z-[60] w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 ${
          open ? "bg-gray-700" : "bg-indigo-600 hover:bg-indigo-700"
        } text-white`}
        aria-label={open ? t("chatbot.close") : t("chatbot.open")}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </>
  );
}
