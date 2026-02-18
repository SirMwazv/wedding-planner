import type { Metadata } from "next";
import "./globals.css";

export const runtime = 'edge';

export const metadata: Metadata = {
  title: "Roora — Cultural Wedding Planning",
  description: "A wedding operating system for African and multi-ceremony weddings. Manage lobola, traditional weddings, kitchen parties, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
