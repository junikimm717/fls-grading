import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import Navbar from "./components/Navbar";

const robotoSans = Roboto({
  variable: "--font-roboto-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "6.S913 Grading",
  description: "Internal site for 6.S913 Logistics and Grading",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <html lang="en">
        <body
          className={`${robotoSans.variable} ${robotoMono.variable} antialiased`}
        >
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </body>
      </html>
    </SessionProvider>
  );
}
