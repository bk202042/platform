"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

// Extract the error message part into a separate component with useSearchParams
function ErrorMessage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  
  return (
    <p className="text-[#D32F2F] text-base leading-relaxed">
      {error || "An error occurred during authentication"}
    </p>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg">
        <h1 className="text-4xl font-bold text-[#2A2A33] text-center tracking-tight mb-2">
          Authentication Error
        </h1>
        <p className="text-lg text-center text-[#54545A] mb-8">
          There was a problem with your authentication
        </p>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="bg-[#FDE7E7] rounded-lg p-6 mb-6">
            <h3 className="text-[#B71C1C] text-xl font-semibold mb-3">
              Error Details
            </h3>
            {/* Wrap the component using useSearchParams in a Suspense boundary */}
            <Suspense fallback={<p className="text-[#D32F2F] text-base leading-relaxed">Loading error details...</p>}>
              <ErrorMessage />
            </Suspense>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <Link
              href="/auth/sign-in"
              className="block w-full bg-[#006AFF] hover:bg-[#0053C6] text-white font-semibold py-3 px-4 rounded-lg text-center transition duration-150"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
