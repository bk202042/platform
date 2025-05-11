'use client';

import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';

export default function RegistrationSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-[#007882]/10 rounded-full flex items-center justify-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="#007882"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Registration Successful</h1>
          
          <p className="text-gray-600 mb-6 max-w-md">
            Thank you for your interest in joining VinaHome as an agent. We have received your application and our team will review it shortly. We will contact you soon to discuss next steps.
          </p>
          
          <div className="space-y-4 w-full max-w-xs">
            <Link
              href="/"
              className="flex items-center justify-center text-[#007882] font-semibold hover:text-[#006670] transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Return to homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
