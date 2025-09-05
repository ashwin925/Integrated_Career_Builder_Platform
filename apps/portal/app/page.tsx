// apps/portal/app/page.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const AppCard = ({ name, href }: { name: string; href: string }) => (
  <motion.a
    href={href}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.28 }}
    className="block rounded-xl shadow-2xl overflow-hidden p-6 bg-card/70 border border-white/5 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl"
  >
    <div className="text-lg font-semibold">{name}</div>
  </motion.a>
);

export default function Home() {
  const { user } = useAuth();

  const apps = [
    { name: "Student Career Builder (SCB)", href: "http://localhost:3000" },
    { name: "Learning Management System (LMS)", href: "http://localhost:3001" },
    { name: "Job Recommendation (JR)", href: "http://localhost:3002" },
    { name: "Super Admin", href: "/super-admin" },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background dark:bg-gray-900 text-foreground dark:text-gray-100 px-4 py-12">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-8">Unified Portal</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {apps.map((a) => (
            <AppCard key={a.name} name={a.name} href={a.href} />
          ))}
        </div>

        <div className="mt-8 text-center text-muted-foreground">
          <p>Signed in as: {user?.email ?? "Not signed in"}</p>
          <p className="mt-2 text-sm">© {new Date().getFullYear()} Unified Portal. All rights reserved.</p>
        </div>
      </div>
    </main>
  );
}
