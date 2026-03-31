"use client";
import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [streamResponse, setStreamResponse] = useState("");

  const handleChat = async () => {
    setLoading(true);
    setResponse("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      setResponse("Error: " + error.message);
    }
    setLoading(false);
  };

  const handleStreamChat = async () => {
    setStreaming(true);
    setStreamResponse("");
    try {
      const res = await fetch("/api/chat-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            setStreamResponse((prev) => prev + (data.content || ""));
          }
        }
      }
    } catch (error) {
      setStreamResponse("Error: " + error.message);
    }
    setStreaming(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0a0a0a;
          color: #e8e2d9;
          font-family: 'DM Mono', monospace;
          min-height: 100vh;
        }

        .page {
          min-height: 100vh;
          display: grid;
          grid-template-rows: auto 1fr auto;
          max-width: 860px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .header {
          padding: 48px 0 40px;
          border-bottom: 1px solid #1e1e1e;
        }

        .eyebrow {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #555;
          margin-bottom: 12px;
        }

        .title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(32px, 5vw, 52px);
          font-weight: 400;
          line-height: 1.1;
          color: #f0ebe3;
          letter-spacing: -0.02em;
        }

        .title em {
          font-style: italic;
          color: #c8a96e;
        }

        .main {
          padding: 40px 0;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .input-area {
          position: relative;
        }

        .input-label {
          display: block;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #444;
          margin-bottom: 10px;
        }

        textarea {
          width: 100%;
          background: #111;
          border: 1px solid #222;
          border-radius: 4px;
          color: #e8e2d9;
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          line-height: 1.7;
          padding: 16px 20px;
          resize: vertical;
          transition: border-color 0.2s;
          outline: none;
          min-height: 120px;
        }

        textarea:focus {
          border-color: #c8a96e;
        }

        textarea::placeholder {
          color: #333;
        }

        .actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .btn {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border: none;
          border-radius: 3px;
          padding: 12px 24px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }

        .btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #c8a96e;
          color: #0a0a0a;
        }

        .btn-primary:hover:not(:disabled) {
          background: #d4b87a;
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: transparent;
          color: #c8a96e;
          border: 1px solid #2a2a2a;
        }

        .btn-secondary:hover:not(:disabled) {
          border-color: #c8a96e;
          transform: translateY(-1px);
        }

        .status-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #c8a96e;
          margin-right: 8px;
          animation: pulse 1.2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }

        .response-block {
          border: 1px solid #1a1a1a;
          border-radius: 4px;
          overflow: hidden;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .response-header {
          background: #111;
          padding: 10px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #1a1a1a;
        }

        .response-label {
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #444;
        }

        .response-tag {
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #c8a96e;
          border: 1px solid #2a2218;
          background: #1a160d;
          padding: 3px 8px;
          border-radius: 2px;
        }

        .response-body {
          padding: 20px;
          font-size: 14px;
          line-height: 1.8;
          color: #c8c2b9;
          white-space: pre-wrap;
          min-height: 80px;
        }

        .stream-cursor {
          display: inline-block;
          width: 2px;
          height: 1em;
          background: #c8a96e;
          margin-left: 2px;
          vertical-align: middle;
          animation: blink 0.8s step-end infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .footer {
          padding: 20px 0;
          border-top: 1px solid #1a1a1a;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer-text {
          font-size: 10px;
          letter-spacing: 0.1em;
          color: #2e2e2e;
          text-transform: uppercase;
        }
      `}</style>

      <div className="page">
        <header className="header">
          <p className="eyebrow">Next.js · Anthropic AI</p>
          <h1 className="title">
            Talk to an <em>intelligence</em>
          </h1>
        </header>

        <main className="main">
          <div className="input-area">
            <label className="input-label" htmlFor="msg">Your message</label>
            <textarea
              id="msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask something..."
              rows={5}
            />
          </div>

          <div className="actions">
            <button
              className="btn btn-primary"
              onClick={handleChat}
              disabled={loading || streaming || !message.trim()}
            >
              {loading ? <><span className="status-dot" />Thinking</> : "Chat"}
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleStreamChat}
              disabled={loading || streaming || !message.trim()}
            >
              {streaming ? <><span className="status-dot" />Streaming</> : "Stream"}
            </button>
          </div>

          {response && (
            <div className="response-block">
              <div className="response-header">
                <span className="response-label">Response</span>
                <span className="response-tag">Standard</span>
              </div>
              <div className="response-body">{response}</div>
            </div>
          )}

          {(streamResponse || streaming) && (
            <div className="response-block">
              <div className="response-header">
                <span className="response-label">Stream</span>
                <span className="response-tag">Live</span>
              </div>
              <div className="response-body">
                {streamResponse}
                {streaming && <span className="stream-cursor" />}
              </div>
            </div>
          )}
        </main>

        <footer className="footer">
          <span className="footer-text">MG API</span>
          <span className="footer-text">Next.js App Router</span>
        </footer>
      </div>
    </>
  );
}