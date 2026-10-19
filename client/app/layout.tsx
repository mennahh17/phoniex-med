import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import {Bad_Script} from "next/font/google";
import { Alex_Brush } from "next/font/google";
import Footer from "@/components/Footer";
import { Cantora_One } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import CartToast from "@/components/CartToast";
import { Oleo_Script } from "next/font/google";
import { Fredoka } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const badScript = Bad_Script({
  variable :"--font-bad-script",
  weight : "400",
  subsets : ["latin"],
});

const alexBrush =Alex_Brush({
  weight : "400",
  variable : "--font-alex-brush",
  subsets : ["latin"],
});

const cantoraOne = Cantora_One ({
  variable:"--font-cantora-one",
  weight :"400",
  subsets:["latin"],
});

const oleoScript = Oleo_Script ({
  variable:"--font-oleo-script",
  weight :"400",
  subsets:["latin"],
});

const fredoka = Fredoka ({
  variable : "--font-fredoka",
  weight :"400",
  subsets :["latin"],
});

export const metadata: Metadata = {
  title: "Phoniex Medical",
  description: "Buy and sell new and used medical equipment, spare parts, and healthcare technology from trusted suppliers and sellers.",
};


export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
  lang="en"
  className={`${geistSans.variable} ${geistMono.variable} ${badScript.variable} ${alexBrush.variable} ${cantoraOne.variable} ${oleoScript.variable} ${fredoka.variable} h-full antialiased`}
>
  <body className="min-h-screen flex flex-col">
  <CartProvider>
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
    <CartToast />
  </CartProvider>
</body>
    </html>
  );
}