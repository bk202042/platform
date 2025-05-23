import { Metadata } from "next";
import AgentRegistrationForm from "./_components/AgentRegistrationForm";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "중개인으로 가입 | VinaHome",
  description:
    "VinaHome과 함께 중개업소의 잠재력을 최대한 발휘하세요. AI 기반 플랫폼으로 매물 홍보, 리드 생성, 거래 성사 속도를 높이세요.",
};

export default function JoinAsAgentPage() {
  return (
    <div className="max-w-4xl mx-auto py-24 sm:py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50 rounded-xl">
      {/* Introductory Section (Content Removed by User Request) */}
      <div className="text-center">
        {" "}
        {/* mb-12 class removed */}
        {/* Content removed as per user request */}
      </div>

      {/* Why VinaHome Section */}
      <div className="bg-white rounded-lg overflow-hidden mb-24 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
          <h2 className="text-xl font-semibold text-white">
            왜 VinaHome을 선택해야 할까요?
          </h2>
        </div>
        <div className="p-8">
          <ul className="space-y-6">
            <li className="flex items-start">
              <CheckCircle2 className="flex-shrink-0 h-5 w-5 text-blue-600 mr-3 mt-0.5" />
              <span className="text-base text-gray-700 leading-relaxed">
                <span className="font-bold text-gray-900">
                  AI 기반 부동산 매칭
                </span>
                으로 적합한 구매자와 매물을 연결합니다
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="flex-shrink-0 h-5 w-5 text-blue-600 mr-3 mt-0.5" />
              <span className="text-base text-gray-700 leading-relaxed">
                <span className="font-bold text-gray-900">
                  고급 CRM 및 리드 관리
                </span>{" "}
                시스템으로 잠재력이 높은 고객을 우선적으로 관리합니다
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="flex-shrink-0 h-5 w-5 text-blue-600 mr-3 mt-0.5" />
              <span className="text-base text-gray-700 leading-relaxed">
                <span className="font-bold text-gray-900">
                  자동화된 마케팅 캠페인
                </span>
                을 특정 부동산 포트폴리오에 맞게 조정합니다
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="flex-shrink-0 h-5 w-5 text-blue-600 mr-3 mt-0.5" />
              <span className="text-base text-gray-700 leading-relaxed">
                <span className="font-bold text-gray-900">
                  종이 없는 문서화로 원활한 거래 추적
                </span>
              </span>
            </li>
          </ul>
        </div>
      </div>
      {/* Agent Registration Form Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
          중개인으로 등록하세요
        </h2>
        <AgentRegistrationForm />
        <div className="mt-12 text-base text-gray-600 text-center max-w-xl mx-auto bg-gray-50 p-4 rounded-lg border border-gray-100">
          <p className="mb-3 font-medium">문의가 있으신가요?</p>
          <div className="flex items-center justify-center space-x-6">
            <a
              href="https://www.vinahome.cc"
              className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              웹사이트 방문
            </a>
            <a
              href="mailto:hello@vinahome.cc"
              className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              이메일 문의
            </a>
          </div>
        </div>
      </div>

      <div className="text-center border-t border-gray-200 pt-16">
        <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full">
          <p className="text-lg font-bold text-blue-700">
            VinaHome - 부동산 성공을 위한 AI 기반 파트너
          </p>
        </div>
      </div>
    </div>
  );
}
