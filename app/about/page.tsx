import { Lightbulb, MessagesSquare, Users, Shield, Home, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
        features: ["커뮤니티 중심", "투명한 거래", "경험 공유"]
      },
      {
        icon: Lightbulb,
        title: "신뢰와 혁신, 그리고 사람 중심",
        text: "비나홈은 신뢰를 바탕으로 한 안전한 거래 환경과, 최신 기술을 활용한 혁신적인 서비스를 통해, 베트남 부동산 여정을 더욱 풍요롭고 성공적으로 만들어 드립니다. 비나홈 커뮤니티와 함께라면, 당신의 부동산 여정은 혼자가 아닙니다.",
        features: ["안전한 거래", "혁신 서비스", "전문 지원"]
      },
    ],
    highlights: [
      {
        icon: Home,
        title: "주요 도시 매물",
        description: "호치민·하노이·다낭"
      },
      {
        icon: Users,
        title: "커뮤니티 기반",
        description: "실거주자 후기 & 정보"
      },
      {
        icon: Shield,
        title: "신뢰할 수 있는",
        description: "검증된 매물 정보"
      },
      {
        icon: TrendingUp,
        title: "투자 인사이트",
        description: "시장 동향 & 전문 분석"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50">
      <div className="container mx-auto px-4 py-16 md:py-24 max-w-6xl">
        {/* Hero Section */}
        <header className="text-center mb-16">
          <div className="mb-6">
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
              🇻🇳 베트남 프리미엄 부동산 플랫폼
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-8 leading-tight max-w-4xl mx-auto">
            {pageContent.mainHeading}
          </h1>
          <p className="text-lg md:text-xl text-zinc-600 leading-relaxed max-w-3xl mx-auto font-medium mb-8">
            {pageContent.introParagraph}
          </p>
          
          {/* Subtle feature highlights */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-500 max-w-4xl mx-auto">
            {pageContent.highlights.map((highlight, index) => (
              <div key={index} className="flex items-center gap-2 group">
                <highlight.icon className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                <span className="font-medium">{highlight.title}</span>
                <span className="text-zinc-400">·</span>
                <span className="text-zinc-500">{highlight.description}</span>
              </div>
            ))}
          </div>
        </header>

        <Separator className="mb-16 bg-zinc-200" />

        {/* Main Features Section */}
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
          {pageContent.sections.map((section, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-xl hover:shadow-zinc-200/40 transition-all duration-500 border-zinc-200/60 bg-white/90 backdrop-blur-sm hover:-translate-y-1"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-4 bg-gradient-to-br from-zinc-100 to-zinc-50 rounded-xl group-hover:from-zinc-200 group-hover:to-zinc-100 transition-all duration-300">
                    <section.icon className="w-8 h-8 text-zinc-700" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl md:text-2xl font-bold text-zinc-900 leading-tight">
                      {section.title}
                    </CardTitle>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {section.features.map((feature, featureIndex) => (
                    <Badge 
                      key={featureIndex} 
                      variant="outline" 
                      className="text-xs bg-zinc-50 border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-zinc-600 leading-relaxed text-base md:text-lg">
                  {section.text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-20 text-center">
          <Card className="bg-gradient-to-r from-zinc-900 to-zinc-800 border-zinc-700 shadow-2xl shadow-zinc-900/20">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                베트남에서의 새로운 시작을 함께하세요
              </h2>
              <p className="text-zinc-300 text-lg mb-6 max-w-2xl mx-auto">
                비나홈 커뮤니티와 함께라면 당신의 베트남 부동산 여정이 더욱 안전하고 성공적일 것입니다.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Badge className="bg-white text-zinc-900 hover:bg-zinc-100 px-4 py-2">
                  프리미엄 서비스
                </Badge>
                <Badge className="bg-white text-zinc-900 hover:bg-zinc-100 px-4 py-2">
                  전문가 상담
                </Badge>
                <Badge className="bg-white text-zinc-900 hover:bg-zinc-100 px-4 py-2">
                  커뮤니티 지원
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
