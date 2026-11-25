import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "wealth-ui",
  description: "Starter scaffold for the wealth UI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
