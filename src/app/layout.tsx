import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "the distance",
  description: "A platform for text collaboration. Measuring the distance of progress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
