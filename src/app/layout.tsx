import type { Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getUserSession } from "@/lib/auth";

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "The Margin — an independent journal about reading, craft, and quiet software",
  description:
    "Slow reading for a fast internet. Essays on typography, attention and the craft of making things worth finishing.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserSession();

  return (
    <html
      lang="en"
      className={`${dmSerifDisplay.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F8F7F3] text-[#211E1A] selection:bg-[#DDD9D0] selection:text-[#211E1A]">
        <Navbar user={user} />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
