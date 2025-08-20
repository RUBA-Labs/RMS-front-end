import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { TypographyMuted } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RMS UOP ART",
  description: "The Resource Management System (RMS) is a web-based platform designed to streamline resource allocation and scheduling within the Arts Faculty. It provides an intuitive interface for managing lab allocations, creating and organizing timetables, and handling exam payment claims for lecturers. The system ensures efficient coordination between students, lecturers, and administrators, improving accessibility and reducing administrative workload.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body suppressHydrationWarning={true}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >


          {children}




        </ThemeProvider>
      </body>
    </html>
  );
}
