
import React from 'react';

export default function ScbWelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-center p-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
          Welcome to SCB
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          This is the Student Career Builder application.
        </p>
      </div>
    </div>
  );
}
