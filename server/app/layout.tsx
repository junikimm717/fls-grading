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
          <main className="py-6 px-4 mx-auto max-w-6xl">{children}</main>
          <footer className="mx-auto max-w-6xl text-sm text-center text-gray-600 py-6">
            Please check the{" "}
            <a
              href="https://github.com/junikimm717/fls-grading"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800 underline-offset-4"
            >
              source code
            </a>{" "}
            for development details.
            <br />
            &copy; 2026-{new Date().getFullYear()} Juni Kim
          </footer>
        </body>
      </html>
    </SessionProvider>
  );
}
