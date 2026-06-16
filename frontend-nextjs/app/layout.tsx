import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Student OS | Adeyemi Adeniji",
  description: "The ultimate GPA Calculator and Student Operating System for Global Universities. Built by Adeyemi Adeniji.",
  manifest: "/manifest.json",
  icons: {
    icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    apple: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#6c5ce7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}