import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "One-Time Secure Notes",
  description:
    "Send encrypted notes that can only be opened once.",
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
