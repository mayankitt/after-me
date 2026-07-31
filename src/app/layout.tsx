import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "After Me - Digital Legacy Vault",
  description: "Secure digital vault for important documents for your loved ones",
  manifest: "/manifest.json",
  themeColor: "#1f2937",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  icons: {
    icon: "/icon-192x192.png",
    apple: "/icon-192x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1f2937" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="After Me" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body
        className="antialiased bg-gray-900 text-white"
      >
        {children}
      </body>
    </html>
  );
}
