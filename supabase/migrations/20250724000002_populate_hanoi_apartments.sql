-- Populate Hanoi Apartments Data
-- Migration to add comprehensive Hanoi apartment listings
-- Created: 2025-07-24

-- First, ensure Hanoi city exists and get its ID
INSERT INTO cities (name, name_en, name_ko, country, timezone, is_major_city)
VALUES ('Hanoi', 'Hanoi', '하노이', 'Vietnam', 'Asia/Ho_Chi_Minh', true)
ON CONFLICT (name) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ko = EXCLUDED.name_ko,
  country = EXCLUDED.country,
  timezone = EXCLUDED.timezone,
  is_major_city = EXCLUDED.is_major_city;

-- Get Hanoi city ID for reference
DO $$
DECLARE
    hanoi_city_id UUID;
BEGIN
    SELECT id INTO hanoi_city_id FROM cities WHERE name = 'Hanoi';

    -- Insert all Hanoi apartments with Korean and English names
    INSERT INTO apartments (
        city_id,
        name,
        name_en,
        name_ko,
        slug,
        district,
        district_en,
        district_ko,
        is_featured
    ) VALUES
    -- Premium/Featured apartments
    (hanoi_city_id, 'Keang Nam', 'Keang Nam', '경남 아파트', 'keang-nam-hanoi', 'Ba Dinh', 'Ba Dinh District', '바딘구', true),
    (hanoi_city_id, 'Vinhomes Sky Lake', 'Vinhomes Sky Lake', '빈홈 스카이레이크', 'vinhomes-sky-lake', 'Pham Hung', 'Pham Hung Area', '팜흥지역', true),
    (hanoi_city_id, 'The Matrix One', 'The Matrix One', '더 매트릭스원', 'the-matrix-one', 'My Dinh', 'My Dinh District', '미딩구', true),
    (hanoi_city_id, 'Daewoo Star Lake', 'Daewoo Star Lake', '대우 스타레이크', 'daewoo-star-lake', 'Nam Tu Liem', 'Nam Tu Liem District', '남뜨리엠구', true),
    (hanoi_city_id, 'Vinhomes West Point', 'Vinhomes West Point', '빈홈 웨스트포인트', 'vinhomes-west-point', 'Do Duc Duc', 'Do Duc Duc Area', '도득득지역', true),
    (hanoi_city_id, 'Vinhomes Metropolis', 'Vinhomes Metropolis', '빈홈 메트로폴리스', 'vinhomes-metropolis', 'Lieu Giai', 'Lieu Giai Street', '리에우자이거리', true),

    -- Mid-range apartments
    (hanoi_city_id, 'CT8 Emerald', 'CT8 Emerald', '미딩 CT8 에메랄드', 'ct8-emerald-my-dinh', 'My Dinh', 'My Dinh District', '미딩구', false),
    (hanoi_city_id, 'Vinhomes D''Capitale', 'Vinhomes D''Capitale', '빈홈 디캐피탈', 'vinhomes-d-capitale', 'Tran Duy Hung', 'Tran Duy Hung Street', '쩐주이흥거리', false),
    (hanoi_city_id, 'Golden Palace', 'Golden Palace', '골든 팰리스', 'golden-palace-hanoi', 'Me Linh', 'Me Linh District', '메린구', false),
    (hanoi_city_id, 'My Dinh Pearl', 'My Dinh Pearl', '미딩 펄', 'my-dinh-pearl', 'My Dinh', 'My Dinh District', '미딩구', false),
    (hanoi_city_id, 'Vinhomes Gardenia', 'Vinhomes Gardenia', '빈홈 가드니아', 'vinhomes-gardenia', 'Ham Nghi', 'Ham Nghi Street', '함응이거리', false),
    (hanoi_city_id, 'Sunshine City', 'Sunshine City', '선샤인 시티', 'sunshine-city-hanoi', 'Ciputra', 'Ciputra Area', '시푸트라지역', false),
    (hanoi_city_id, 'Thang Long Number 1', 'Thang Long Number 1', '탕롱 넘버원', 'thang-long-number-1', 'Hiep Thang', 'Hiep Thang Area', '히엡탕지역', false),
    (hanoi_city_id, 'Mandarin Garden', 'Mandarin Garden', '만다린 가든', 'mandarin-garden-hanoi', 'Hoan Kiem', 'Hoan Kiem District', '호안끼엠구', false),

    -- Affordable/Budget apartments
    (hanoi_city_id, 'Ciputra L Building', 'Ciputra L Building', '시푸차 L동', 'ciputra-l-building', 'Ciputra', 'Ciputra Area', '시푸트라지역', false),
    (hanoi_city_id, 'Vinhomes Smart City', 'Vinhomes Smart City', '빈홈 스마트 시티', 'vinhomes-smart-city', 'Tay Mo', 'Tay Mo Area', '타이모지역', false),
    (hanoi_city_id, 'Iris Garden', 'Iris Garden', '아이리스 가든', 'iris-garden-hanoi', 'My Dinh', 'My Dinh District', '미딩구', false),
    (hanoi_city_id, 'The Zei', 'The Zei', '더 제이', 'the-zei-hanoi', 'My Dinh', 'My Dinh District', '미딩구', false),
    (hanoi_city_id, 'Sunshine Center', 'Sunshine Center', '선샤인 센터', 'sunshine-center-hanoi', 'Cau Giay', 'Cau Giay District', '까우자이구', false),
    (hanoi_city_id, 'My Dinh The Sun', 'My Dinh The Sun', '미딩 더 썬', 'my-dinh-the-sun', 'My Dinh', 'My Dinh District', '미딩구', false)

    ON CONFLICT (slug) DO UPDATE SET
        name_en = EXCLUDED.name_en,
        name_ko = EXCLUDED.name_ko,
        district = EXCLUDED.district,
        district_en = EXCLUDED.district_en,
        district_ko = EXCLUDED.district_ko,
        is_featured = EXCLUDED.is_featured;

END $$;

-- Add some sample coordinates for major apartments (approximate locations in Hanoi)
UPDATE apartments SET
    latitude = 21.0285,
    longitude = 105.8542
WHERE name = 'Keang Nam';

UPDATE apartments SET
    latitude = 21.0245,
    longitude = 105.7812
WHERE name = 'Vinhomes Sky Lake';

UPDATE apartments SET
    latitude = 21.0278,
    longitude = 105.7789
WHERE name = 'The Matrix One';

UPDATE apartments SET
    latitude = 21.0156,
    longitude = 105.7823
WHERE name = 'Daewoo Star Lake';

UPDATE apartments SET
    latitude = 21.0312,
    longitude = 105.7934
WHERE name = 'Vinhomes West Point';

UPDATE apartments SET
    latitude = 21.0334,
    longitude = 105.8234
WHERE name = 'Vinhomes Metropolis';

UPDATE apartments SET
    latitude = 21.0289,
    longitude = 105.7756
WHERE name = 'CT8 Emerald';

UPDATE apartments SET
    latitude = 21.0167,
    longitude = 105.8089
WHERE name = 'Vinhomes D''Capitale';

UPDATE apartments SET
    latitude = 21.0445,
    longitude = 105.7623
WHERE name = 'Golden Palace';

UPDATE apartments SET
    latitude = 21.0234,
    longitude = 105.7734
WHERE name = 'My Dinh Pearl';

UPDATE apartments SET
    latitude = 21.0389,
    longitude = 105.8156
WHERE name = 'Vinhomes Gardenia';

UPDATE apartments SET
    latitude = 21.0456,
    longitude = 105.7589
WHERE name = 'Sunshine City';

UPDATE apartments SET
    latitude = 21.0123,
    longitude = 105.7945
WHERE name = 'Thang Long Number 1';

UPDATE apartments SET
    latitude = 21.0367,
    longitude = 105.8456
WHERE name = 'Mandarin Garden';

UPDATE apartments SET
    latitude = 21.0423,
    longitude = 105.7567
WHERE name = 'Ciputra L Building';

UPDATE apartments SET
    latitude = 21.0089,
    longitude = 105.7456
WHERE name = 'Vinhomes Smart City';

UPDATE apartments SET
    latitude = 21.0267,
    longitude = 105.7723
WHERE name = 'Iris Garden';

UPDATE apartments SET
    latitude = 21.0298,
    longitude = 105.7798
WHERE name = 'The Zei';

UPDATE apartments SET
    latitude = 21.0345,
    longitude = 105.7923
WHERE name = 'Sunshine Center';

UPDATE apartments SET
    latitude = 21.0256,
    longitude = 105.7745
WHERE name = 'My Dinh The Sun';
