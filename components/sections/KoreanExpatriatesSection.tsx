"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function KoreanExpatriatesSection() {
  return (
    <section className="bg-muted py-12 px-4 rounded-lg mb-16">
      <div className="container mx-auto">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          베트남에 있는 한국인 거주자들을 위한 서비스
        </h2>
        <p className="text-muted-foreground mb-6 text-center max-w-2xl mx-auto">
          저희 플랫폼은 한인 커뮤니티, 국제학교, 한국인 편의시설 근처의 부동산을
          전문으로 합니다
        </p>
        <div className="flex justify-center">
          <Link href="/search">
            <Button size="lg">검색 시작하기</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
