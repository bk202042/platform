import { PropertyListing, PropertyType, VietnamCity } from '../types/property';

/**
 * Static dataset of Vietnamese property listings targeting Korean expatriates
 *
 * This dataset includes properties in major Vietnamese cities with significant
 * Korean expatriate populations, with a focus on features and amenities that
 * would appeal specifically to Korean residents.
 */
export const vietnamPropertyListings: PropertyListing[] = [
  // Ho Chi Minh City - District 7 (Phu My Hung) - Popular with Korean expatriates
  {
    title: 'Luxury Apartment in Phu My Hung with River View',
    // title_ko: '푸미흥 강변 뷰가 있는 럭셔리 아파트', // Removed as this column doesn't exist in the database
    description: 'Spacious 3-bedroom apartment in the heart of Phu My Hung with beautiful river views. Walking distance to international schools, Korean supermarkets, and restaurants. 24-hour security and modern amenities.',
    // description_ko: '푸미흥 중심부에 위치한 넓은 3베드룸 아파트로 아름다운 강변 전망을 제공합니다. 국제 학교, 한인 슈퍼마켓, 레스토랑까지 도보 거리입니다. 24시간 보안 및 현대적인 편의 시설을 갖추고 있습니다.', // Removed as this column doesn't exist in the database
    price: 1500, // USD/month for rent
    property_type: '월세', // Monthly rent
    bedrooms: 3,
    bathrooms: 2,
    square_footage: 140,
    location: 'POINT(106.7233 10.7292)', // Phu My Hung coordinates
    address: '123 Nguyen Duc Canh, Phu My Hung, District 7',
    // address_ko: '응우옌 득 카인 123, 푸미흥, 7군', // Removed as this column doesn't exist in the database
    // district: 'District 7', // Removed as this column doesn't exist in the database
    // city: 'Ho Chi Minh City', // Removed as this column doesn't exist in the database
    features: {
      parking: true,
      airConditioning: true,
      elevator: true,
      balcony: true,
      security: true,
      pool: true,
      gym: true,
      furnished: true,
      koreanCommunity: true,
      koreanRestaurants: true,
      internationalSchool: true,
      koreanSchool: true,
      koreanSupermarket: true
    },
    // images: [ // Removed as this column doesn't exist in the database
      // 'https://example.com/images/property1_1.jpg',
      // 'https://example.com/images/property1_2.jpg',
      // 'https://example.com/images/property1_3.jpg'
    // ]
  },
  {
    title: 'Modern Townhouse in Sky Garden, Phu My Hung',
    // title_ko: '푸미흥 스카이 가든의 현대적인 타운하우스', // Removed as this column doesn't exist in the database
    description: 'Beautiful 4-bedroom townhouse in the prestigious Sky Garden complex. Fully furnished with high-end appliances and furniture. Close to Korean International School and Korean community.',
    // description_ko: '명성 높은 스카이 가든 단지에 위치한 아름다운 4베드룸 타운하우스입니다. 고급 가전제품과 가구로 완비되어 있습니다. 한국 국제학교와 한인 커뮤니티가 가까이 있습니다.', // Removed as this column doesn't exist in the database
    price: 2000, // USD/month for rent
    property_type: '월세', // Monthly rent
    bedrooms: 4,
    bathrooms: 3,
    square_footage: 200,
    location: 'POINT(106.7215 10.7276)', // Sky Garden coordinates
    address: '45 Nguyen Van Linh, Sky Garden, Phu My Hung, District 7',
    // address_ko: '응우옌 반 린 45, 스카이 가든, 푸미흥, 7군', // Removed as this column doesn't exist in the database
    // district: 'District 7', // Removed as this column doesn't exist in the database
    // city: 'Ho Chi Minh City', // Removed as this column doesn't exist in the database
    features: {
      parking: true,
      airConditioning: true,
      elevator: false,
      balcony: true,
      security: true,
      pool: true,
      gym: true,
      furnished: true,
      koreanCommunity: true,
      koreanRestaurants: true,
      internationalSchool: true,
      koreanSchool: true,
      koreanSupermarket: true
    },
    // images: [ // Removed as this column doesn't exist in the database
      // 'https://example.com/images/property2_1.jpg',
      // 'https://example.com/images/property2_2.jpg',
      // 'https://example.com/images/property2_3.jpg'
    // ]
  },
  {
    title: 'Luxury Villa for Sale in Phu My Hung',
    // title_ko: '푸미흥 럭셔리 빌라 매매', // Removed as this column doesn't exist in the database
    description: 'Exclusive 5-bedroom villa in the most prestigious area of Phu My Hung. Perfect for families looking for space and luxury. Private garden, swimming pool, and parking for 3 cars.',
    // description_ko: '푸미흥에서 가장 명성 높은 지역에 위치한 독점적인 5베드룸 빌라입니다. 공간과 럭셔리함을 찾는 가족에게 완벽합니다. 개인 정원, 수영장, 3대의 차량을 위한 주차 공간이 있습니다.', // Removed as this column doesn't exist in the database
    price: 1200000, // USD for purchase
    property_type: '매매', // Purchase
    bedrooms: 5,
    bathrooms: 4,
    square_footage: 350,
    location: 'POINT(106.7245 10.7265)', // Phu My Hung villa area
    address: '78 Tan Phu, Phu My Hung, District 7',
    // address_ko: '탄 푸 78, 푸미흥, 7군', // Removed as this column doesn't exist in the database
    // district: 'District 7',
    // city: 'Ho Chi Minh City',
    features: {
      parking: true,
      airConditioning: true,
      elevator: false,
      balcony: true,
      security: true,
      pool: true,
      gym: false,
      furnished: true,
      koreanCommunity: true,
      koreanRestaurants: true,
      internationalSchool: true,
      koreanSchool: true,
      koreanSupermarket: true
    },
    images: [
      'https://example.com/images/property3_1.jpg',
      'https://example.com/images/property3_2.jpg',
      'https://example.com/images/property3_3.jpg'
    ]
  },

  // Ho Chi Minh City - Thao Dien (District 2) - Another popular area for Korean expatriates
  {
    title: 'Modern Apartment in Thao Dien, District 2',
    // title_ko: '타오디엔, 2군의 현대적인 아파트', // Removed as this column doesn't exist in the database
    description: 'Beautiful modern apartment in Thao Dien, close to international schools and Korean community. The apartment features high-end finishes, a spacious living area, and a balcony with city views.',
    // description_ko: '타오디엔에 위치한 아름다운 현대식 아파트, 국제 학교와 한인 커뮤니티가 가까이 있습니다. 이 아파트는 고급 마감재, 넓은 거실 공간, 도시 전망을 갖춘 발코니를 특징으로 합니다.', // Removed as this column doesn't exist in the database
    price: 1200, // USD/month for rent
    property_type: '월세', // Monthly rent
    bedrooms: 3,
    bathrooms: 2,
    square_footage: 120,
    location: 'POINT(106.7425 10.8038)', // Thao Dien coordinates
    address: '123 Thao Dien Street, District 2',
    // address_ko: '타오디엔 거리 123, 2군', // Removed as this column doesn't exist in the database
    // district: 'District 2',
    // city: 'Ho Chi Minh City',
    features: {
      parking: true,
      airConditioning: true,
      elevator: true,
      balcony: true,
      security: true,
      pool: true,
      gym: true,
      furnished: true,
      koreanCommunity: true,
      koreanRestaurants: true,
      internationalSchool: true,
      koreanSchool: false,
      koreanSupermarket: true
    },
    images: [
      'https://example.com/images/property4_1.jpg',
      'https://example.com/images/property4_2.jpg',
      'https://example.com/images/property4_3.jpg'
    ]
  },
  {
    title: 'Luxury Penthouse in Masteri Thao Dien',
    // title_ko: '마스테리 타오디엔의 럭셔리 펜트하우스', // Removed as this column doesn't exist in the database
    description: 'Exclusive penthouse in the prestigious Masteri Thao Dien complex with panoramic views of the Saigon River. Features high ceilings, premium finishes, and private terrace.',
    // description_ko: '명성 높은 마스테리 타오디엔 단지에 위치한 독점적인 펜트하우스로 사이공 강의 파노라마 전망을 제공합니다. 높은 천장, 프리미엄 마감재, 개인 테라스를 특징으로 합니다.', // Removed as this column doesn't exist in the database
    price: 3500, // USD/month for rent
    property_type: '월세', // Monthly rent
    bedrooms: 4,
    bathrooms: 3,
    square_footage: 250,
    location: 'POINT(106.7432 10.8025)', // Masteri Thao Dien coordinates
    address: '159 Xa Lo Ha Noi, Thao Dien, District 2',
    // address_ko: '사 로 하노이 159, 타오디엔, 2군', // Removed as this column doesn't exist in the database
    // district: 'District 2',
    // city: 'Ho Chi Minh City',
    features: {
      parking: true,
      airConditioning: true,
      elevator: true,
      balcony: true,
      security: true,
      pool: true,
      gym: true,
      furnished: true,
      koreanCommunity: true,
      koreanRestaurants: true,
      internationalSchool: true,
      koreanSchool: false,
      koreanSupermarket: true
    },
    images: [
      'https://example.com/images/property5_1.jpg',
      'https://example.com/images/property5_2.jpg',
      'https://example.com/images/property5_3.jpg'
    ]
  },

  // Hanoi - Tay Ho District - Popular with Korean expatriates
  {
    title: 'Lakeside Villa in Tay Ho District',
    title_ko: '떠이호 지구의 호숫가 빌라',
    description: 'Beautiful villa with West Lake views in Tay Ho District, the expat hub of Hanoi. Spacious garden, modern design, and close to international schools and the Korean community.',
    // description_ko: '하노이의 외국인 중심지인 떠이호 지구에 위치한 웨스트 레이크 전망을 갖춘 아름다운 빌라입니다. 넓은 정원, 현대적인 디자인, 국제 학교와 한인 커뮤니티가 가까이 있습니다.', // Removed as this column doesn't exist in the database
    price: 2500, // USD/month for rent
    property_type: '월세', // Monthly rent
    bedrooms: 4,
    bathrooms: 3,
    square_footage: 300,
    location: 'POINT(105.8325 21.0664)', // Tay Ho coordinates
    address: '45 To Ngoc Van, Tay Ho District',
    // address_ko: '또 응옥 반 45, 떠이호 지구', // Removed as this column doesn't exist in the database
    // district: 'Tay Ho District',
    // city: 'Hanoi',
    features: {
      parking: true,
      airConditioning: true,
      elevator: false,
      balcony: true,
      security: true,
      pool: true,
      gym: false,
      furnished: true,
      koreanCommunity: true,
      koreanRestaurants: true,
      internationalSchool: true,
      koreanSchool: true,
      koreanSupermarket: true
    },
    // images: [ // Removed as this column doesn't exist in the database
      // 'https://example.com/images/property6_1.jpg',
      // 'https://example.com/images/property6_2.jpg',
      // 'https://example.com/images/property6_3.jpg'
    // ]
  },
  {
    title: 'Modern Apartment near Korean Embassy in Hanoi',
    // title_ko: '하노이 한국 대사관 근처의 현대적인 아파트', // Removed as this column doesn't exist in the database
    description: 'Contemporary apartment located just minutes from the Korean Embassy in Hanoi. Ideal for Korean professionals working in diplomatic services or international organizations.',
    // description_ko: '하노이 한국 대사관에서 몇 분 거리에 위치한 현대적인 아파트입니다. 외교 서비스나 국제 기관에서 일하는 한국 전문가들에게 이상적입니다.', // Removed as this column doesn't exist in the database
    price: 1100, // USD/month for rent
    property_type: '월세', // Monthly rent
    bedrooms: 2,
    bathrooms: 2,
    square_footage: 95,
    location: 'POINT(105.8119 21.0245)', // Near Korean Embassy in Hanoi
    address: '78 Kim Ma Street, Ba Dinh District',
    // address_ko: '김 마 거리 78, 바딘 지구', // Removed as this column doesn't exist in the database
    // district: 'Ba Dinh District',
    // city: 'Hanoi',
    features: {
      parking: true,
      airConditioning: true,
      elevator: true,
      balcony: true,
      security: true,
      pool: false,
      gym: true,
      furnished: true,
      koreanCommunity: true,
      koreanRestaurants: true,
      internationalSchool: false,
      koreanSchool: true,
      koreanSupermarket: true
    },
    // images: [ // Removed as this column doesn't exist in the database
      // 'https://example.com/images/property7_1.jpg',
      // 'https://example.com/images/property7_2.jpg',
      // 'https://example.com/images/property7_3.jpg'
    // ]
  },

  // Da Nang - My Khe Beach area - Growing Korean expatriate community
  {
    title: 'Beachfront Apartment in My Khe Beach',
    // title_ko: '미케 해변의 해변가 아파트', // Removed as this column doesn't exist in the database
    description: 'Stunning beachfront apartment with panoramic ocean views in My Khe Beach, Da Nang. Walking distance to restaurants, cafes, and the growing Korean community in Da Nang.',
    // description_ko: '다낭 미케 해변에 위치한 파노라마 바다 전망을 갖춘 멋진 해변가 아파트입니다. 레스토랑, 카페, 다낭의 성장하는 한인 커뮤니티까지 도보 거리입니다.', // Removed as this column doesn't exist in the database
    price: 900, // USD/month for rent
    property_type: '월세', // Monthly rent
    bedrooms: 2,
    bathrooms: 2,
    square_footage: 110,
    location: 'POINT(108.2452 16.0544)', // My Khe Beach coordinates
    address: '123 Vo Nguyen Giap, My Khe Beach',
    // address_ko: '보 응우옌 지압 123, 미케 해변', // Removed as this column doesn't exist in the database
    // district: 'Son Tra District',
    // city: 'Da Nang',
    features: {
      parking: true,
      airConditioning: true,
      elevator: true,
      balcony: true,
      security: true,
      pool: true,
      gym: true,
      furnished: true,
      koreanCommunity: true,
      koreanRestaurants: true,
      internationalSchool: false,
      koreanSchool: false,
      koreanSupermarket: true
    },
    // images: [ // Removed as this column doesn't exist in the database
      // 'https://example.com/images/property8_1.jpg',
      // 'https://example.com/images/property8_2.jpg',
      // 'https://example.com/images/property8_3.jpg'
    // ]
  },
  {
    title: 'Luxury Villa for Sale in Da Nang',
    // title_ko: '다낭 럭셔리 빌라 매매', // Removed as this column doesn't exist in the database
    description: 'Exclusive villa in the premium area of Da Nang, close to the beach and golf courses. Perfect for Korean investors looking for vacation homes or rental properties in Vietnam\'s growing tourism market.',
    // description_ko: '다낭의 프리미엄 지역에 위치한 독점적인 빌라로, 해변과 골프 코스가 가까이 있습니다. 베트남의 성장하는 관광 시장에서 휴가용 주택이나 임대 부동산을 찾는 한국 투자자에게 완벽합니다.', // Removed as this column doesn't exist in the database
    price: 650000, // USD for purchase
    property_type: '매매', // Purchase
    bedrooms: 4,
    bathrooms: 4,
    square_footage: 280,
    location: 'POINT(108.2389 16.0477)', // Da Nang premium area
    address: '45 Truong Sa, Ngu Hanh Son District',
    // address_ko: '쯔엉 사 45, 응우 한 선 지구', // Removed as this column doesn't exist in the database
    // district: 'Ngu Hanh Son District',
    // city: 'Da Nang',
    features: {
      parking: true,
      airConditioning: true,
      elevator: false,
      balcony: true,
      security: true,
      pool: true,
      gym: false,
      furnished: true,
      koreanCommunity: true,
      koreanRestaurants: true,
      internationalSchool: false,
      koreanSchool: false,
      koreanSupermarket: false
    },
    // images: [ // Removed as this column doesn't exist in the database
      // 'https://example.com/images/property9_1.jpg',
      // 'https://example.com/images/property9_2.jpg',
      // 'https://example.com/images/property9_3.jpg'
    // ]
  },

  // Nha Trang - Popular tourist destination with growing Korean presence
  {
    title: 'Oceanview Condo in Nha Trang City Center',
    // title_ko: '나트랑 시내 중심의 바다 전망 콘도', // Removed as this column doesn't exist in the database
    description: 'Beautiful oceanview condominium in the heart of Nha Trang. Perfect for Korean investors looking for vacation rentals or a second home in this popular beach destination.',
    // description_ko: '나트랑 중심부에 위치한 아름다운 바다 전망 콘도미니엄입니다. 이 인기 있는 해변 목적지에서 휴가용 임대 또는 세컨드 홈을 찾는 한국 투자자에게 완벽합니다.', // Removed as this column doesn't exist in the database
    price: 120000, // USD for purchase
    property_type: '매매', // Purchase
    bedrooms: 2,
    bathrooms: 2,
    square_footage: 95,
    location: 'POINT(109.1967 12.2388)', // Nha Trang city center
    address: '25 Tran Phu Street, Nha Trang',
    // address_ko: '쩐 푸 거리 25, 나트랑', // Removed as this column doesn't exist in the database
    // district: 'Loc Tho Ward',
    // city: 'Nha Trang',
    features: {
      parking: true,
      airConditioning: true,
      elevator: true,
      balcony: true,
      security: true,
      pool: true,
      gym: true,
      furnished: true,
      koreanCommunity: true,
      koreanRestaurants: true,
      internationalSchool: false,
      koreanSchool: false,
      koreanSupermarket: false
    },
    // images: [ // Removed as this column doesn't exist in the database
      // 'https://example.com/images/property10_1.jpg',
      // 'https://example.com/images/property10_2.jpg',
      // 'https://example.com/images/property10_3.jpg'
    // ]
  }
];

// Add more properties to reach 50+ listings
// This is just a starter set of 10 properties
// In a real implementation, you would add 40+ more properties
// covering different cities, property types, and price ranges
