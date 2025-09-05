
import React from 'react';

export default function PortalPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-4xl p-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
          Welcome to the Campus Platform
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-12">
          Please select an application to proceed.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AppCard
            href="http://localhost:3000"
            title="SCB (Student Career Builder)"
            description="Build your career roadmap, upload your resume, and get skill recommendations."
          />
          <AppCard
            href="http://localhost:3001"
            title="LMS (Learning Management System)"
            description="Browse courses, manage enrollments, and track your learning progress."
          />
          <AppCard
            href="http://localhost:3002"
            title="JR (Job Recommendation)"
            description="Find job opportunities, import your profile, and track applications."
          />
        </div>
        <div className="mt-16">
           <a
            href="http://localhost:3003"
            className="text-lg font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            Super Admin Portal
          </a>
        </div>
      </div>
    </div>
  );
}

function AppCard({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <a
      href={href}
      className="block p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
      <p className="text-base text-gray-600 dark:text-gray-400">{description}</p>
    </a>
  );
}
