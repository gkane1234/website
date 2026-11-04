"use client";

import { useChat } from "ai/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function AssistantChat({ aiEnabled }: { aiEnabled: boolean }) {
  if (aiEnabled) return <StreamingChat />;
  return <LocalChat />;
}

function StreamingChat() {
  const router = useRouter();
  const chat = useChat({
    api: "/api/chat",
    onFinish: () => router.refresh(),
  });

  return (
    <ChatShell
      mode="Streaming with the Vercel AI SDK."
      messages={chat.messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        tools: message.toolInvocations?.map((tool) =>
          tool.state === "result" ? `${tool.toolName}: ${summarize(tool.result)}` : `${tool.toolName}…`,
        ),
      }))}
      input={chat.input}
      pending={chat.isLoading}
      error={chat.error?.message}
      onChange={chat.handleInputChange}
      onSubmit={chat.handleSubmit}
    />
  );
}

function LocalChat() {
  const router = useRouter();
  const [messages, setMessages] = useState<{ id: string; role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || pending) return;
    const history = [...messages, { id: crypto.randomUUID(), role: "user", content: text }];
    setMessages(history);
    setInput("");
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
      });
      const data = (await response.json()) as { content?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "The assistant could not reply");
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "assistant", content: data.content || "No reply." },
      ]);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The assistant could not reply");
    } finally {
      setPending(false);
    }
  }

  return (
    <ChatShell
      mode="Local commands. Set OPENAI_API_KEY for full chat."
      messages={messages}
      input={input}
      pending={pending}
      error={error}
      placeholder="create task: …  ·  list tasks  ·  propose a daily plan"
      onChange={(event) => setInput(event.target.value)}
      onSubmit={onSubmit}
    />
  );
}

function ChatShell({
  mode,
  messages,
  input,
  pending,
  error,
  placeholder,
  onChange,
  onSubmit,
}: {
  mode: string;
  messages: { id: string; role: string; content: string; tools?: string[] }[];
  input: string;
  pending: boolean;
  error?: string | null;
  placeholder?: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <div className="flex min-h-[32rem] flex-col rounded-3xl border border-line bg-card shadow-card">
      <div className="border-b border-line px-5 py-4">
        <p className="eyebrow">Assistant</p>
        <p className="mt-1 text-sm text-muted">{mode}</p>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {messages.length === 0 ? (
          <p className="max-w-md text-sm leading-6 text-muted">
            Ask for tasks, projects, or a plan. Changes are proposals until you approve them. Without an API key, try
            “create task: call the print shop”, “list tasks”, or “propose a daily plan”.
          </p>
        ) : null}
        {messages.map((message) => (
          <div key={message.id} className={message.role === "user" ? "ml-8" : "mr-8"}>
            <p className="eyebrow">{message.role === "user" ? "You" : "Assistant"}</p>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink">{message.content}</p>
            {message.tools?.map((tool) => (
              <p key={tool} className="mt-2 rounded-xl bg-sand px-3 py-2 text-xs text-muted">
                {tool}
              </p>
            ))}
          </div>
        ))}
        {error ? <p className="text-sm text-clay">{error}</p> : null}
      </div>
      <form onSubmit={onSubmit} className="border-t border-line p-4">
        <textarea
          className="field min-h-20 resize-y"
          value={input}
          placeholder={placeholder ?? "Ask for a plan, or propose a task."}
          onChange={onChange}
          rows={3}
        />
        <div className="mt-3 flex justify-end">
          <button
            className="rounded-full bg-ink px-4 py-2 text-sm text-paper disabled:opacity-50"
            type="submit"
            disabled={pending || !input.trim()}
          >
            {pending ? "Sending…" : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}

function summarize(value: unknown) {
  try {
    const text = JSON.stringify(value);
    return text.length > 180 ? `${text.slice(0, 180)}…` : text;
  } catch {
    return "done";
  }
}
