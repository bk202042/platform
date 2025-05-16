import { Metadata } from "next";
import AgentRegistrationForm from "./_components/AgentRegistrationForm";

export const metadata: Metadata = {
  title: "중개인으로 가입 | VinaHome",
  description:
    "VinaHome과 함께 중개업소의 잠재력을 최대한 발휘하세요. AI 기반 플랫폼으로 매물 홍보, 리드 생성, 거래 성사 속도를 높이세요.",
};

export default function JoinAsAgentPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-12">
        <div className="bg-blue-600 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">
            왜 VinaHome을 선택해야 할까요?
          </h2>
        </div>
        <div className="p-6">
          <ul className="space-y-4">
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 text-blue-600 mr-2">
                ✓
              </span>
              <span>
                <span className="font-semibold">AI 기반 부동산 매칭</span>으로
                적합한 구매자와 매물을 연결합니다
              </span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 text-blue-600 mr-2">
                ✓
              </span>
              <span>
                <span className="font-semibold">고급 CRM 및 리드 관리</span>{" "}
                시스템으로 잠재력이 높은 고객을 우선적으로 관리합니다
              </span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 text-blue-600 mr-2">
                ✓
              </span>
              <span>
                <span className="font-semibold">자동화된 마케팅 캠페인</span>을
                특정 부동산 포트폴리오에 맞게 조정합니다
              </span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 text-blue-600 mr-2">
                ✓
              </span>
              <span>
                <span className="font-semibold">전문 사진 촬영 서비스</span>{" "}
                추가 비용 없이 포함 (월 3개 매물)
              </span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 text-blue-600 mr-2">
                ✓
              </span>
              <span>
                <span className="font-semibold">AI 기반 시장 분석</span>으로
                가격 책정 전략을 최적화합니다
              </span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 text-blue-600 mr-2">
                ✓
              </span>
              <span>
                <span className="font-semibold">
                  종이 없는 문서화로 원활한 거래 추적
                </span>
              </span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-6 w-6 text-blue-600 mr-2">
                ✓
              </span>
              <span>
                <span className="font-semibold">
                  얼리 어답터를 위한 6개월 플랫폼 수수료 면제
                </span>
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="mb-12">
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
