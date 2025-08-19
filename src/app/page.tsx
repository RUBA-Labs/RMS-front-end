"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
import Link from "next/link"; // Import Link from Next.js

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8  transition-colors duration-500 text-center">
      {/* Theme toggle in the top-right corner */}
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <div className="space-y-6 max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
          Welcome to the <span className="text-primary">RMS</span>
        </h1>
        <p className="mt-2 text-xl md:text-2xl font-light text-muted-foreground">
          Resource Management System
        </p>

        <p className="text-lg leading-relaxed text-foreground mt-8">
          The Resource Management System (RMS) is a web-based platform designed to streamline resource allocation and scheduling within the Arts Faculty. It provides an intuitive interface for managing lab allocations, creating and organizing timetables, and handling exam payment claims for lecturers. The system ensures efficient coordination between students, lecturers, and administrators, improving accessibility and reducing administrative workload.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-8">
          {/* Login Button using asChild with Next.js Link */}
          <Button asChild variant="outline" className="w-full md:w-auto px-8 py-6 text-xl font-semibold rounded-full shadow-lg transition-transform  text-amber-50 ">
            <Link href="/login">Log In</Link>
          </Button>
          {/* Sign Up Button using asChild with Next.js Link */}
          <Button asChild variant="ghost" className="w-full md:w-auto px-8 py-6 text-xl font-semibold rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
