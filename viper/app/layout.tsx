import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "viper",
  description: "viper tasking frontend prototype"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
