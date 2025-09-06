"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";

const AppCard = ({ name, href }: { name: string; href: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    transition={{ duration: 0.25, ease: "easeOut" }}
    className="card"
  >
    <Link href={href} className="block w-full h-full">
      <div className="text-lg font-semibold">{name}</div>
    </Link>
  </motion.div>
);

export default function Home() {
  const { user } = useAuth();

  // ✅ useMemo to avoid re-creating on each render
  const apps = useMemo(
    () => [
      { name: "Student Career Builder (SCB)", href: "http://localhost:3000" },
      { name: "Learning Management System (LMS)", href: "http://localhost:3001" },
      { name: "Job Recommendation (JR)", href: "http://localhost:3002" },
      { name: "Super Admin", href: "/super-admin" },
    ],
    []
  );

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-portal">
      <div className="max-w-5xl w-full">
        <h1 className="title mb-10 text-center">Unified Portal</h1>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {apps.map((a) => (
            <AppCard key={a.name} name={a.name} href={a.href} />
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-10 text-center text-muted">
          <p>Signed in as: {user?.email ?? "Not signed in"}</p>
          <p className="mt-2 text-xs">
            © {new Date().getFullYear()} Unified Portal. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}
