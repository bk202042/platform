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
    <div className="max-w-4xl mx-auto py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      {/* Introductory Section */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
          VinaHome과 함께 부동산 중개업소의 거래 성사율을 최대한 끌어올려
          보세요!
        </h1>
        <p className="text-lg text-gray-600 mb-4 max-w-3xl mx-auto">
          매물 홍보를 효과적으로 하고 싶으신가요? 더 많은 고객을 유치하고,
          빠르게 계약을 체결할 준비가 되셨다면 지금이 기회입니다.
        </p>
        <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
          VinaHome은 최신 AI 기술을 기반으로 운영을 단순화하고 마케팅을 강화해,
          비즈니스를 쉽고 빠르게 성장시킬 수 있도록 돕는 통합 플랫폼입니다.
        </p>
      </div>

      {/* Why VinaHome Section */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-12">
        <div className="bg-blue-600 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">
            왜 VinaHome을 선택해야 할까요?
          </h2>
        </div>
        <div className="p-6">
          <ul className="space-y-4">
            <li className="flex items-start">
              <CheckCircle2 className="flex-shrink-0 h-5 w-5 text-blue-600 mr-3 mt-0.5" />
              <span className="text-base text-gray-700">
                <span className="font-semibold text-gray-800">
                  AI 기반 부동산 매칭
                </span>
                으로 적합한 구매자와 매물을 연결합니다
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="flex-shrink-0 h-5 w-5 text-blue-600 mr-3 mt-0.5" />
              <span className="text-base text-gray-700">
                <span className="font-semibold text-gray-800">
                  고급 CRM 및 리드 관리
                </span>{" "}
                시스템으로 잠재력이 높은 고객을 우선적으로 관리합니다
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="flex-shrink-0 h-5 w-5 text-blue-600 mr-3 mt-0.5" />
              <span className="text-base text-gray-700">
                <span className="font-semibold text-gray-800">
                  자동화된 마케팅 캠페인
                </span>
                을 특정 부동산 포트폴리오에 맞게 조정합니다
              </span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="flex-shrink-0 h-5 w-5 text-blue-600 mr-3 mt-0.5" />
              <span className="text-base text-gray-700">
                <span className="font-semibold text-gray-800">
                  종이 없는 문서화로 원활한 거래 추적
                </span>
              </span>
            </li>
          </ul>
        </div>
      </div>
      {/* Agent Registration Form Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-8">
          중개인으로 등록하세요
        </h2>
        <AgentRegistrationForm />
        <p className="mt-6 text-base text-gray-500 text-center">
          👉{" "}
          <a
            href="https://www.vinahome.cc"
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            www.vinahome.cc
          </a>
          를 방문하시거나{" "}
          <a
            href="mailto:hello@vinahome.cc"
            className="text-blue-600 hover:underline"
          >
            hello@vinahome.cc
          </a>
          로 이메일을 보내주세요.
        </p>
      </div>

      <div className="text-center border-t border-gray-200 pt-8">
        <p className="text-lg font-semibold text-blue-600">
          VinaHome - 부동산 성공을 위한 AI 기반 파트너
        </p>
      </div>
    </div>
  );
}
