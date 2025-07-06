"use client";

import Link from "next/link";

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg">
        <h1 className="text-4xl font-bold text-[#2A2A33] text-center tracking-tight mb-2">
          이메일을 확인하세요
        </h1>
        <p className="text-lg text-center text-[#54545A] mb-8">
          등록을 완료하기 위한 확인 링크를 이메일로 보냈습니다
        </p>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="bg-[#E6F4EA] rounded-lg p-6 mb-6">
            <h3 className="text-[#1B5E20] text-xl font-semibold mb-3">
              등록 성공
            </h3>
            <p className="text-[#2E7D32] text-base leading-relaxed">
              등록을 완료하려면 이메일에서 확인 링크를 확인하세요. 보이지 않으면 스팸 폴더를 확인하세요.
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
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
                로그인으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
