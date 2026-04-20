import { useState } from "react";
import axios from "axios";

export default function App() {
  const [status, setStatus] = useState("");
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);
    setStatus("Indexing document...");

    const res = await axios.post("http://localhost:3000/upload", form);
    setStatus(`Ready — ${res.data.chunks} chunks indexed`);
  }

  async function handleAsk() {
    if (!query.trim()) return;
    const q = query;
    setQuery("");
    setMessages(prev => [...prev, { role: "user", text: q }]);
    setLoading(true);

    const res = await axios.post("http://localhost:3001/chat", { query: q });
    setMessages(prev => [...prev, { role: "ai", text: res.data.answer }]);
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>RAG Chat</h2>

      <input type="file" accept=".pdf,.txt" onChange={handleUpload} />
      <p>{status}</p>

      <div style={{ border: "1px solid #ccc", padding: 16, minHeight: 300, borderRadius: 8 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 12, textAlign: m.role === "user" ? "right" : "left" }}>
            <span style={{
              background: m.role === "user" ? "#0070f3" : "#f0f0f0",
              color: m.role === "user" ? "white" : "black",
              padding: "8px 12px", borderRadius: 8, display: "inline-block"
            }}>
              {m.text}
            </span>
          </div>
        ))}
        {loading && <p>Thinking...</p>}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          style={{ flex: 1, padding: 8 }}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAsk()}
          placeholder="Ask something about the document..."
        />
        <button onClick={handleAsk}>Ask</button>
      </div>
    </div>
  );
}
