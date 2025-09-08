"use client";

import Link from "next/link";

interface FeatureCardProps {
  title: string;
  description: string;
  href: string;
}

export default function FeatureCard({ title, description, href }: FeatureCardProps) {
  return (
    <Link href={href}>
      <div className="p-6 rounded-xl shadow-md bg-white dark:bg-gray-800 hover:shadow-lg hover:-translate-y-1 transition transform cursor-pointer">
        <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </Link>
  );
}
