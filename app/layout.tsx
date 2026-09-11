import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "One-Time Secure Notes",
  description: "Encrypted messages that can only be viewed once.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
