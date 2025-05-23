"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function RegistrationSuccessPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:py-20">
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

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            신청해 주셔서 감사합니다!
          </h1>

          <p className="text-lg text-gray-700 mb-8 max-w-md">
            VinaHome 중개인 프로그램에 관심을 가져주셔서 진심으로 감사드립니다.
          </p>

          <div className="text-left bg-gray-50 p-6 rounded-lg w-full max-w-lg mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              무엇을 기대해야 할까요?
            </h2>
            <ul className="space-y-2 text-gray-600 list-disc list-inside">
              <li>귀하의 신청서가 성공적으로 접수되었습니다.</li>
              <li>저희 팀에서 귀하의 정보를 신중히 검토할 것입니다.</li>
              <li>
                일반적으로 2-3 영업일 이내에 다음 단계에 대해 안내해 드리기 위해
                연락드립니다.
              </li>
            </ul>
          </div>

          <Link href="/" passHref>
            <Button variant="outline" className="w-full max-w-xs">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              홈페이지로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
