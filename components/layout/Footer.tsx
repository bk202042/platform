"use client";

import Link from "next/link";

const footerSections = [
  {
    title: "인기 검색",
    links: [
      { name: "내 주변 아파트", href: "/search?type=apartment" },
      { name: "판매용 주택", href: "/search?type=house&sale=true" },
      { name: "임대용 콘도", href: "/search?type=condo&rent=true" },
    ],
  },
  {
    title: "탐색",
    links: [
      { name: "도시", href: "/search" },
      { name: "자주 묻는 질문", href: "#" },
      { name: "매물", href: "/search?sale=true" },
    ],
  },
  {
    title: "회사 소개",
    links: [
      { name: "회사 소개", href: "/about" },
      { name: "중개인으로 가입", href: "/join-as-agent" },
    ],
  },
  {
    title: "법적 고지",
    links: [
      { name: "이용약관", href: "/terms-of-use" },
      { name: "개인정보처리방침", href: "/privacy-policy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between">
          {footerSections.map((section) => (
            <div key={section.title} className="mb-6 w-1/2 md:w-auto md:mb-0">
              <h3 className="text-sm font-semibold text-gray-600">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} 비나홈(VinaHome). 모든 권리 보유. 공평
            주택 기회.
          </p>
          <p className="mt-1 text-[10px]">
            비나홈은 베트남에서의 새로운 삶과 기회를 연결하는 커뮤니티 기반 프리미엄 부동산 플랫폼으로,
            신뢰와 혁신을 바탕으로 모든 사용자에게 안전하고 투명한 부동산 거래 환경을 제공합니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
