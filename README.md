🔐 One-Time Secure Notes

<p align="center">
  <strong>Send a secret. One time only.</strong><br>
  End-to-end encrypted notes with one-time retrieval.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Encryption-AES--256--GCM-7c5cff?style=for-the-badge" alt="AES-256-GCM">
  <img src="https://img.shields.io/badge/Retrieval-One--Time-111827?style=for-the-badge" alt="One-Time">
  <img src="https://img.shields.io/badge/Next.js-App%20Router-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-Strict-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
</p>

✨ Overview

One-Time Secure Notes is a privacy-focused web application for sharing sensitive text through a disposable link.

The message is encrypted inside the browser before it is sent to the server. The encryption key is placed in the URL fragment (#...), which is not included in normal HTTP requests.

When the recipient opens the link, the encrypted note is retrieved and immediately consumed. Opening the same link again will not reveal the note.

Created by BRKE

🌐 Live Demo

<p align="center">
  <a href="https://one-time-secure-notes-krcqbkaxu-blz2.vercel.app/">
    <strong>🚀 Open One-Time Secure Notes</strong>
  </a>
</p>

Main website: https://one-time-secure-notes-krcqbkaxu-blz2.vercel.app/

🚀 Features

🔒 AES-256-GCM encryption in the browser

🧠 Client-side encryption — plaintext is not sent to the API

🔑 URL-fragment key — the decryption key stays on the client side

💥 One-time retrieval using atomic Redis GETDEL

⏳ Automatic expiration after 24 hours

🛡️ No plaintext storage on the server

📋 One-click copy for secure links

📱 Responsive dark UI

⚡ Next.js App Router

☁️ Vercel-ready

🗄️ Upstash Redis for serverless storage

🔐 How It Works

                 SENDER
                    │
                    ▼
            ┌───────────────┐
            │ Write message │
            └───────┬───────┘
                    │
                    ▼
          ┌───────────────────┐
          │ Browser generates │
          │ AES-256-GCM key   │
          └─────────┬─────────┘
                    │
                    ▼
          ┌───────────────────┐
          │ Encrypt in browser│
          └─────────┬─────────┘
                    │
              ciphertext + IV
                    │
                    ▼
            ┌───────────────┐
            │ Upstash Redis │
            └───────────────┘
                    │
                    │
        key stays in URL fragment
                    │
                    ▼
             ┌───────────┐
             │ Secure URL│
             └─────┬─────┘
                   │
                   ▼
               RECIPIENT
                   │
                   ▼
          ┌───────────────────┐
          │ Retrieve + delete │
          │ note atomically   │
          └─────────┬─────────┘
                    │
                    ▼
          ┌───────────────────┐
          │ Decrypt in browser│
          └─────────┬─────────┘
                    │
                    ▼
              SECRET SHOWN
                    │
                    ▼
              LINK CONSUMED

🧩 Tech Stack

Technology

Purpose

Next.js

Web application and API routes

React

User interface

TypeScript

Type-safe application code

Web Crypto API

AES-256-GCM encryption/decryption

Upstash Redis

Temporary encrypted note storage

Vercel

Deployment and hosting

📁 Project Structure

one-time-secure-notes/
├── app/
│   ├── api/
│   │   └── notes/
│   │       └── route.ts
│   ├── view/
│   │   └── [token]/
│   │       └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── package.json
└── tsconfig.json

🛠️ Run Locally

1. Clone the repository

git clone https://github.com/BRKE123/one-time-secure-notes.git
cd one-time-secure-notes

2. Install dependencies

npm install

3. Configure environment variables

Create a .env.local file:

KV_REST_API_URL=your_upstash_redis_rest_url
KV_REST_API_TOKEN=your_upstash_redis_rest_token

Never commit your real credentials to GitHub.

4. Start the development server

npm run dev

Open http://localhost:3000.

☁️ Deploy to Vercel

Import this repository into Vercel.

Connect your Upstash Redis database.

Make sure these environment variables are available:

KV_REST_API_URL
KV_REST_API_TOKEN

Deploy.

🧪 Testing

Create a secure note.

Copy the generated link.

Open it in another browser or private window.

Confirm the message is displayed.

Open the same link again.

The note should be unavailable.

🔒 Security Model

The application is designed around these principles:

Plaintext is encrypted before being sent to the server.

The server stores the encrypted payload and IV, not the plaintext.

The AES key is stored in the URL fragment.

URL fragments are not normally sent as part of HTTP requests.

Note retrieval uses Redis GETDEL, making get-and-delete atomic.

Notes automatically expire after 24 hours.

Important

No web application should be described as absolutely secure. Users should avoid sharing extremely sensitive credentials through any third-party service unless they understand and accept the security model.

🎨 Branding

Created by BRKE

This project is built and maintained as a BRKE project.

📜 License

This project currently has no explicit open-source license.

If you plan to allow others to reuse, modify, or redistribute the code, add a license that matches your intended terms.

<p align="center">
  <strong>🔐 Private by design. Disposable by default.</strong>
  <br><br>
  <sub>Created by BRKE</sub>
</p>
