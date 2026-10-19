import type { Metadata } from "next";
import { Geist, Geist_Mono, Bad_Script, Alex_Brush, Cantora_One, Oleo_Script, Fredoka } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const badScript = Bad_Script({ variable: "--font-bad-script", weight: "400", subsets: ["latin"] });
const alexBrush = Alex_Brush({ variable: "--font-alex-brush", weight: "400", subsets: ["latin"] });
const cantoraOne = Cantora_One({ variable: "--font-cantora-one", weight: "400", subsets: ["latin"] });
const oleoScript = Oleo_Script({ variable: "--font-oleo-script", weight: "400", subsets: ["latin"] });
const fredoka = Fredoka({ variable: "--font-fredoka", weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Phoniex-Admin",
  description: "Admin dashboard for Phoenix Medical.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${badScript.variable} ${alexBrush.variable} ${cantoraOne.variable} ${oleoScript.variable} ${fredoka.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-blue-50">{children}</body>
    </html>
  );
}