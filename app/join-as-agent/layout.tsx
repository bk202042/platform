export default function JoinAsAgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            VinaHome과 함께 부동산 중개업소의 거래 성사율을 최대한 끌어올려
            보세요!
          </h1>
          <p className="text-gray-600 mb-8">
            매물 홍보를 효과적으로 하고 싶으신가요? 더 많은 고객을 유치하고,
            빠르게 계약을 체결할 준비가 되셨다면 지금이 기회입니다.
          </p>
          <p className="text-gray-600 mb-8">
            VinaHome은 최신 AI 기술을 기반으로 운영을 단순화하고 마케팅을
            강화해, 비즈니스를 쉽고 빠르게 성장시킬 수 있도록 돕는 통합
            플랫폼입니다.
          </p>
          {children}
        </div>
      </div>
    </div>
  );
}
