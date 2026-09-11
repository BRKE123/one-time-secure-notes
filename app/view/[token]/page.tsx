"use client";

import { useEffect, useRef, useState } from "react";

function base64UrlToBytes(value: string) {
  const base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padded =
    base64 + "=".repeat((4 - (base64.length % 4)) % 4);

  const binary = atob(padded);
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
  const [message, setMessage] = useState(
    "Opening secure note…"
  );
  const [error, setError] = useState(false);

  // Prevent accidental duplicate requests in development.
  const opened = useRef(false);

  useEffect(() => {
    if (opened.current) return;

    opened.current = true;

    async function openNote() {
      try {
        const { token } = await params;

        // The encryption key is in the URL fragment.
        const keyText = window.location.hash.slice(1);

        if (!keyText) {
          throw new Error("Missing encryption key");
        }

        // Retrieve AND consume the note.
        const response = await fetch(
          `/api/notes?token=${encodeURIComponent(token)}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Note unavailable");
        }

        const { iv, ciphertext } =
          await response.json();

        // Import the key locally in the browser.
        const key = await crypto.subtle.importKey(
          "raw",
          base64UrlToBytes(keyText),
          {
            name: "AES-GCM",
          },
          false,
          ["decrypt"]
        );

        // Decrypt locally.
        const decrypted =
          await crypto.subtle.decrypt(
            {
              name: "AES-GCM",
              iv: base64UrlToBytes(iv),
            },
            key,
            base64UrlToBytes(ciphertext)
          );

        const text = new TextDecoder().decode(decrypted);

        setMessage(text);

        // Remove the key from the visible URL.
        window.history.replaceState(
          null,
          "",
          window.location.pathname
        );
      } catch (error) {
        console.error(error);

        setError(true);
        setMessage(
          "This secure note has already been opened or has expired."
        );
      }
    }

    openNote();
  }, [params]);

  return (
    <main>
      <section className="card">
        <div className="badge">
          ZERO-KNOWLEDGE • ONE-TIME
        </div>

        {error ? (
          <>
            <h1>Note unavailable.</h1>

            <p className="sub">
              {message}
            </p>
          </>
        ) : (
          <>
            <h1>Your secret</h1>

            <div className="note">
              {message}
            </div>

            <p className="sub">
              This note has been consumed and cannot
              be opened again.
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
