"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function RegistrationSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 sm:py-28 bg-gradient-to-b from-white to-gray-50 rounded-xl">
      <div className="bg-white p-8 rounded-lg shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] border border-gray-100">
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="#1e40af"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            신청해 주셔서 감사합니다!
          </h1>

          <p className="text-lg text-gray-700 mb-8 max-w-md leading-relaxed">
            VinaHome 중개인 프로그램에 관심을 가져주셔서 진심으로 감사드립니다.
          </p>

          <div className="text-left bg-gray-50 p-6 rounded-lg w-full max-w-lg mb-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              무엇을 기대해야 할까요?
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="leading-relaxed">
                  귀하의 신청서가 성공적으로 접수되었습니다.
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="leading-relaxed">
                  저희 팀에서 귀하의 정보를 신중히 검토할 것입니다.
                </span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="leading-relaxed">
                  일반적으로 2-3 영업일 이내에 다음 단계에 대해 안내해 드리기
                  위해 연락드립니다.
                </span>
              </li>
            </ul>
          </div>

          <Link href="/" passHref>
            <Button className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              홈페이지로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
