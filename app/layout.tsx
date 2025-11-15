import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "ElecticaOS Control Center",
  description: "AI battery intelligence and energy orchestration dashboard"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <div className="bg-animated" />
        {children}
      </body>
    </html>
  );
}
