"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  const apps = [
    { name: "Student Career Builder (SCB)", href: "http://localhost:3000", color: "from-pink-500 to-rose-500" },
    { name: "Learning Management System (LMS)", href: "http://localhost:3001", color: "from-blue-500 to-indigo-500" },
    { name: "Job Recommendation (JR)", href: "http://localhost:3002", color: "from-green-500 to-emerald-500" },
    { name: "Super Admin", href: "/super-admin", color: "from-yellow-500 to-orange-500" },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white px-6 py-12">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl sm:text-5xl font-extrabold mb-12 text-center"
      >
        Unified Portal
      </motion.h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl w-full">
        {apps.map((app, idx) => (
          <motion.div
            key={app.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className={`rounded-2xl shadow-lg bg-gradient-to-br ${app.color} p-6 flex items-center justify-center`}
          >
            <Link href={app.href} className="text-lg sm:text-xl font-semibold text-white text-center">
              {app.name}
            </Link>
          </motion.div>
        ))}
      </div>

      <footer className="mt-12 text-sm text-gray-400 text-center">
        © {new Date().getFullYear()} Unified Portal. All rights reserved.
      </footer>
    </main>
  );
}
