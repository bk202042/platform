import { Lightbulb, MessagesSquare } from 'lucide-react';

export default function AboutPage() {
  const pageContent = {
    mainHeading: 'VinaHome은 베트남에서 당신의 꿈이 현실이 되는 완벽한 공간을 찾아드리는 프리미엄 부동산 플랫폼입니다.',
    introParagraph: '호치민, 하노이, 다낭 등 베트남 주요 도시의 아파트, 주택, 빌라부터 상업용 부동산에 이르기까지 엄선된 최신 매물 정보를 폭넓게 제공하며 각 지역의 생생한 생활 정보와 전문가의 깊이 있는 분석을 더해 최적의 선택을 돕습니다.',
    sections: [
      {
        icon: MessagesSquare,
        title: '건강한 부동산 생태계 조성',
        text: 'VinaHome은 단순한 거래 중개를 넘어, 고객, 파트너 그리고 지역사회와 함께 성장하고 가치를 공유하는 건강한 부동산 생태계를 만들어가는 것을 핵심 철학으로 삼고 있습니다.',
      },
      {
        icon: Lightbulb,
        title: '신뢰와 혁신으로 성공적인 여정',
        text: '신뢰와 혁신을 바탕으로 VinaHome과 함께라면 베트남에서의 부동산 여정이 더욱 풍요롭고 성공적으로 펼쳐질 것입니다.',
      },
    ],
  };

  return (
    <div className='container mx-auto px-4 py-12 md:py-20 bg-white'>
      <header className='text-left max-w-3xl mx-auto mb-10 md:mb-16'>
        <h1 className='text-3xl md:text-4xl text-gray-800 mb-6 text-left'>
          {pageContent.mainHeading}
        </h1>
        <p className='text-gray-700 text-base md:text-lg leading-relaxed text-left'>
          {pageContent.introParagraph}
        </p>
      </header>

      <div className='mx-auto my-8 md:my-12 flex justify-center'>
        <svg width='60' height='60' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'>
          <line x1='20' y1='80' x2='80' y2='20' stroke='currentColor' strokeWidth='2' className='text-gray-500' />
        </svg>
      </div>

      <hr className='my-10 md:my-16 border-gray-200 max-w-4xl mx-auto' />

      <div className='grid md:grid-cols-2 gap-x-12 gap-y-10 max-w-4xl mx-auto'>
        {pageContent.sections.map((section, index) => (
          <div key={index} className='flex flex-col items-start text-left'>
            <div className='mb-4'>
              <section.icon className='w-10 h-10 text-neutral-600' />
            </div>
            <h2 className='text-xl font-semibold text-gray-800 mb-3'>
              {section.title}
            </h2>
            <p className='text-gray-700 leading-relaxed'>
              {section.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
