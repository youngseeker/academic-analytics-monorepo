import type { Metadata, Viewport } from "next";
import "./globals.css";
import { UserProvider } from "../src/context/UserContext";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: "My Student OS | Adeyemi Adeniji",
  description: "The unified engine for your academic data.",
  manifest: "/manifest.json",
  icons: {
    icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    apple: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#6c5ce7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider> {/* <-- Wrap children */}
          {children}
        </UserProvider>
      </body>
    </html>
  );
}