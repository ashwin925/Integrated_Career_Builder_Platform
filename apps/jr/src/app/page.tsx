
import React from 'react';

export default function JrWelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-center p-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
          Welcome to JR
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          This is the Job Recommendation application.
        </p>
      </div>
    </div>
  );
}
