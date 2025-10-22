"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function SentryExamplePage() {
  useEffect(() => {
    // This will be captured by Sentry on page load
    Sentry.captureMessage("Sentry test page loaded successfully!", "info");
  }, []);

  const throwError = () => {
    throw new Error("This is a test error for Sentry!");
  };

  const captureException = () => {
    try {
      throw new Error("This is a manually captured exception!");
    } catch (error) {
      Sentry.captureException(error);
      alert("Exception captured and sent to Sentry!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Sentry Test Page
        </h1>
        <p className="text-gray-600 mb-8">
          This page is used to test Sentry error tracking integration.
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              ✅ Page Load Event
            </h2>
            <p className="text-blue-700 text-sm">
              A test message was automatically sent to Sentry when this page loaded.
            </p>
          </div>

          <button
            onClick={captureException}
            className="w-full px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors"
          >
            Test Captured Exception
          </button>

          <button
            onClick={throwError}
            className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
          >
            Throw Uncaught Error
          </button>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              How to verify:
            </h3>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Click the buttons above</li>
              <li>Go to your Sentry dashboard</li>
              <li>Check the "Issues" section</li>
              <li>You should see the errors appear within seconds</li>
            </ol>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

