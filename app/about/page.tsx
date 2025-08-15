import { Lightbulb, MessagesSquare } from "lucide-react";

export default function AboutPage() {
  const pageContent = {
    mainHeading:
      "비나홈(VinaHome) 은 베트남에서의 새로운 삶과 기회를 연결하는 커뮤니티 기반 프리미엄 부동산 플랫폼입니다.",
    introParagraph:
      "호치민, 하노이, 다낭 등 주요 도시의 아파트, 주택, 빌라, 상업용 부동산까지 폭넓게 제공하며, 단순한 매물 정보뿐 아니라 지역 주민과 전문가가 함께 나누는 생활 정보, 투자 인사이트, 실거주 후기를 통해 더욱 신뢰할 수 있는 선택을 돕습니다.",
    sections: [
      {
        icon: MessagesSquare,
        title: "함께 만드는 건강한 부동산 생태계",
        text: "비나홈은 단순한 거래 중개를 넘어, 고객·파트너·지역사회가 서로 연결되고 성장하는 커뮤니티를 지향합니다. 회원들이 자유롭게 의견을 나누고 경험을 공유하며, 부동산 시장의 투명성과 지속가능성을 높이는 건강한 생태계를 만들어 갑니다.",
      },
      {
        icon: Lightbulb,
        title: "신뢰와 혁신, 그리고 사람 중심",
        text: "비나홈은 신뢰를 바탕으로 한 안전한 거래 환경과, 최신 기술을 활용한 혁신적인 서비스를 통해, 베트남 부동산 여정을 더욱 풍요롭고 성공적으로 만들어 드립니다. 비나홈 커뮤니티와 함께라면, 당신의 부동산 여정은 혼자가 아닙니다.",
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 bg-white">
      <header className="text-left max-w-3xl mx-auto mb-10">
        <h1 className="text-3xl md:text-4xl text-gray-800 mb-6 text-left">
          {pageContent.mainHeading}
        </h1>
        <p className="text-gray-700 text-base md:text-lg leading-relaxed text-left">
          {pageContent.introParagraph}
        </p>
      </header>

      <div className="mx-auto my-6 flex justify-center mb-8">
        <svg
          width="60"
          height="60"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            x1="20"
            y1="80"
            x2="80"
            y2="20"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-500"
          />
        </svg>
      </div>

      <hr className="border-gray-200 max-w-4xl mx-auto mb-8 mt-8" />

      <div className="grid md:grid-cols-2 gap-x-12 gap-y-10 max-w-4xl mx-auto items-start">
        {pageContent.sections.map((section, index) => (
          <div key={index} className="flex flex-col items-start text-left">
            <div className="mb-4">
              <section.icon className="w-10 h-10 text-neutral-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              {section.title}
            </h2>
            <p className="text-gray-700 leading-relaxed">{section.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
