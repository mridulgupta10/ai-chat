"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [streaming, setStreaming] = useState("");
  const [loading, setLoading] = useState("");
  const [streamResponse, setStreamResponse] = useState("");

  const handleChat = async () => {
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
        headers: {
          "Content-Type": "application/json",
        },
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
          const data = JSON.parse(line.slice(6)); // store the parsed JSON
          setStreamResponse((prev) => prev + (data.content || "")); // append safely
        }
      }

      }
    } catch (error) {
      setStreamResponse("Error: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      <h1>Get started with Next.js and AI</h1>
      <div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message"
          rows={4}
          style={{ width: "100%", marginBottom: "10px" }}
        />
      </div>
      <div>
        <button
          onClick={handleChat}
          style={{
            padding: "10px 20px",
            backgroundColor: "orange",
            border: "none",
            borderRadius: "6px",
          }}
        >
          {loading ? "Loading..." : "Chat"}
        </button>
        <button
          onClick={handleStreamChat}
          style={{
            padding: "10px 20px",
            backgroundColor: "green",
            border: "none",
            borderRadius: "6px",
            margin: "10px",
          }}
        >
          {loading ? "Loading..." : "stream chat"}
        </button>
      </div>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          whiteSpace: "pre-wrap",
          fontSize: "24px",
        }}
      >
        {response}
      </div>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          whiteSpace: "pre-wrap",
          fontSize: "24px",
        }}
      >
        {streamResponse}
      </div>
    </div>
  );
}
