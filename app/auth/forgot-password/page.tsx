"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg">
        <h1 className="text-4xl font-bold text-[#2A2A33] text-center tracking-tight mb-2">
          Reset your password
        </h1>
        <p className="text-lg text-center text-[#54545A] mb-8">
          Enter your email address and we&apos;ll send you instructions
        </p>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {success ? (
            <div className="bg-[#E6F4EA] rounded-lg p-6">
              <h3 className="text-[#1B5E20] text-xl font-semibold mb-3">
                Check your email
              </h3>
              <p className="text-[#2E7D32] text-base leading-relaxed">
                We&apos;ve sent password reset instructions to your email
                address.
              </p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-[#2A2A33] text-sm font-semibold mb-2"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#006AFF] focus:ring-[#006AFF] focus:ring-opacity-50 focus:outline-none transition duration-150"
                  placeholder="Enter your email"
                />
              </div>

              {error && (
                <div className="bg-[#FDE7E7] rounded-lg p-6">
                  <p className="text-[#B71C1C] text-base">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#006AFF] hover:bg-[#0053C6] text-white font-semibold py-3 px-4 rounded-lg transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending..." : "Send reset instructions"}
              </button>
            </form>
          )}

          <div className="border-t border-gray-200 mt-6 pt-6">
            <div className="flex justify-center">
              <Link
                href="/auth/sign-in"
                className="inline-flex items-center text-[#006AFF] hover:text-[#0053C6] font-semibold"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
