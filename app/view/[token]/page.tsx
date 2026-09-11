"use client";

import { useEffect, useState } from "react";

function base64ToBytes(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

export default function ViewNote({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [message, setMessage] = useState("Opening secure note…");
  const [error, setError] = useState(false);

  useEffect(() => {
    async function openNote() {
      try {
        const { token } = await params;

        const keyText = window.location.hash.slice(1);

        if (!keyText) {
          throw new Error("Missing encryption key");
        }

        const response = await fetch(
          `/api/notes?token=${encodeURIComponent(token)}`,
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error("Note unavailable");
        }

        const { iv, ciphertext } = await response.json();

        const key = await crypto.subtle.importKey(
          "raw",
          base64ToBytes(keyText),
          { name: "AES-GCM" },
          false,
          ["decrypt"]
        );

        const decrypted = await crypto.subtle.decrypt(
          {
            name: "AES-GCM",
            iv: base64ToBytes(iv),
          },
          key,
          base64ToBytes(ciphertext)
        );

        const text = new TextDecoder().decode(decrypted);

        setMessage(text);

        // Remove the key from the visible URL after it has been used.
        window.history.replaceState(
          null,
          "",
          window.location.pathname
        );
      } catch {
        setError(true);
        setMessage("This secure note has already been opened or has expired.");
      }
    }

    openNote();
  }, [params]);

  return (
    <main>
      <section className="card">
        <div className="badge">ZERO-KNOWLEDGE • ONE-TIME</div>

        {error ? (
          <>
            <h1>Note unavailable.</h1>
            <p className="sub">{message}</p>
          </>
        ) : (
          <>
            <h1>Your secret</h1>
            <div className="note">{message}</div>
            <p className="sub">
              This note has been consumed and cannot be opened again.
            </p>
          </>
        )}

        <div className="footer">
          AES-256-GCM · One-time retrieval
        </div>
      </section>
    </main>
  );
}
