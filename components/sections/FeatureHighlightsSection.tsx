import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Search, MapPin } from "lucide-react";
import Link from "next/link";

interface FeatureHighlight {
  icon: React.ElementType;
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
}

const features: FeatureHighlight[] = [
  {
    icon: Home,
    title: "집 찾기",
    description:
      "다양한 매물 목록과 상세 정보를 통해 완벽한 집이나 아파트를 찾아보세요.",
    ctaText: "집 검색",
    ctaLink: "/search", // Adjust link as needed
  },
  {
    icon: Search,
    title: "고급 검색",
    description:
      "강력한 필터와 맞춤 검색을 사용하여 원하는 옵션을 빠르고 쉽게 찾아보세요.",
    ctaText: "검색 세분화",
    ctaLink: "/search", // Adjust link as needed
  },
  {
    icon: MapPin,
    title: "지역 탐색",
    description:
      "지역 정보, 편의 시설 및 관심 장소와 함께 다양한 동네를 발견해보세요.",
    ctaText: "더 알아보기",
    ctaLink: "#", // Placeholder link, adjust as needed
  },
];

export function FeatureHighlightsSection() {
  return (
    <section className="py-16 bg-[#f7f9fa]">
      <div className="container mx-auto px-4">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 mb-4">
          <h2 className="text-2xl font-semibold text-center mb-8">
            저희가 어떻게 도와드릴 수 있는지 확인해보세요
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <CardHeader className="items-center pb-2">
                  <feature.icon className="h-10 w-10 text-primary mb-3" />
                  <CardTitle className="text-lg font-semibold">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6 text-sm">
                    {feature.description}
                  </p>
                  <Button
                    asChild
                    variant="default"
                    className="rounded-lg font-medium"
                  >
                    <Link href={feature.ctaLink}>{feature.ctaText}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
