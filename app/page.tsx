"use client";

import { useState } from "react";

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export default function Home() {
  const [note, setNote] = useState("");
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function createNote() {
    if (!note.trim() || loading) return;

    setLoading(true);
    setLink("");

    try {
      // Generate encryption key entirely in the browser.
      const key = await crypto.subtle.generateKey(
        {
          name: "AES-GCM",
          length: 256,
        },
        true,
        ["encrypt", "decrypt"]
      );

      const iv = crypto.getRandomValues(new Uint8Array(12));

      const encrypted = await crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv,
        },
        key,
        new TextEncoder().encode(note)
      );

      // The server receives ONLY encrypted data.
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          iv: bytesToBase64Url(iv),
          ciphertext: bytesToBase64Url(
            new Uint8Array(encrypted)
          ),
        }),
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to create note");
      }

      const { token } = await response.json();

      // Export the AES key only after the encrypted note
      // has been successfully stored.
      const rawKey = new Uint8Array(
        await crypto.subtle.exportKey("raw", key)
      );

      // IMPORTANT:
      // The key is placed in the URL fragment (#).
      // Browsers do not send the fragment to the server.
      const secureLink =
        `${window.location.origin}/view/${token}#` +
        bytesToBase64Url(rawKey);

      setLink(secureLink);
      setNote("");
    } catch (error) {
      console.error(error);
      alert("Could not create the secure note.");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!link) return;

    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      alert("Could not copy the link.");
    }
  }

  return (
    <main>
      <section className="card">
        <div className="badge">
          ZERO-KNOWLEDGE • ONE-TIME
        </div>

        <h1>
          Send a secret.
          <br />
          <span>One time only.</span>
        </h1>

        <p className="sub">
          Write an encrypted note and share a link. The
          recipient can open it only once.
        </p>

        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Write your secret message…"
          maxLength={5000}
          disabled={loading}
        />

        <button
          onClick={createNote}
          disabled={loading || !note.trim()}
        >
          {loading
            ? "Encrypting…"
            : "Encrypt & create link"}
        </button>

        {link && (
          <div className="result">
            <label>One-time secure link</label>

            <input
              value={link}
              readOnly
              onFocus={(event) => event.currentTarget.select()}
            />

            <button onClick={copyLink}>
              {copied ? "Copied ✓" : "Copy link"}
            </button>

            <small>
              The encryption key stays in the URL fragment
              and is never sent to the server.
            </small>
          </div>
        )}

        <div className="footer">
          AES-256-GCM in your browser · Atomic one-time retrieval
        </div>
      </section>
    </main>
  );
}
