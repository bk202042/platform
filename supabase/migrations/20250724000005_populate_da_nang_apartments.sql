-- Populate Da Nang Apartments Data
-- Migration to add comprehensive Da Nang apartment listings
-- Created: 2025-07-24

-- First, ensure Da Nang city exists and get its ID
INSERT INTO cities (name, name_en, name_ko, country, timezone, is_major_city)
VALUES ('Da Nang', 'Da Nang', '다낭', 'Vietnam', 'Asia/Ho_Chi_Minh', true)
ON CONFLICT (name) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ko = EXCLUDED.name_ko,
  country = EXCLUDED.country,
  timezone = EXCLUDED.timezone,
  is_major_city = EXCLUDED.is_major_city;

-- Get Da Nang city ID for reference
DO $
DECLARE
    danang_city_id UUID;
BEGIN
    SELECT id INTO danang_city_id FROM cities WHERE name = 'Da Nang';

    -- Insert all Da Nang apartments with Korean and English names
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
    -- Premium/Luxury apartments in Da Nang
    (danang_city_id, 'Muong Thanh Grand Da Nang', 'Muong Thanh Grand Da Nang', '무옹탄 그랜드 다낭', 'muong-thanh-grand-danang', 'Hai Chau', 'Hai Chau District', '하이쩌우구', true),
    (danang_city_id, 'Azura Da Nang', 'Azura Da Nang', '아주라 다낭', 'azura-danang', 'Ngu Hanh Son', 'Ngu Hanh Son District', '응우한선구', true),
    (danang_city_id, 'Vinpearl Condotel Riverfront', 'Vinpearl Condotel Riverfront', '빈펄 콘도텔 리버프론트', 'vinpearl-condotel-riverfront', 'Hai Chau', 'Hai Chau District', '하이쩌우구', true),
    (danang_city_id, 'Monarchy Riverside', 'Monarchy Riverside', '모나키 리버사이드', 'monarchy-riverside-danang', 'Hai Chau', 'Hai Chau District', '하이쩌우구', true),
    (danang_city_id, 'Sailing Club Villas', 'Sailing Club Villas', '세일링 클럽 빌라', 'sailing-club-villas', 'Ngu Hanh Son', 'Ngu Hanh Son District', '응우한선구', true),

    -- Mid-range apartments
    (danang_city_id, 'Indochina Riverside', 'Indochina Riverside', '인도차이나 리버사이드', 'indochina-riverside', 'Hai Chau', 'Hai Chau District', '하이쩌우구', false),
    (danang_city_id, 'Green Dragon Water Palace', 'Green Dragon Water Palace', '그린 드래곤 워터 팰리스', 'green-dragon-water-palace', 'Ngu Hanh Son', 'Ngu Hanh Son District', '응우한선구', false),
    (danang_city_id, 'Sealink Beachfront', 'Sealink Beachfront', '씨링크 비치프론트', 'sealink-beachfront', 'Ngu Hanh Son', 'Ngu Hanh Son District', '응우한선구', false),
    (danang_city_id, 'Danang Golden Bay', 'Danang Golden Bay', '다낭 골든베이', 'danang-golden-bay', 'Son Tra', 'Son Tra District', '선짜구', false),
    (danang_city_id, 'Ocean Vista', 'Ocean Vista', '오션 비스타', 'ocean-vista-danang', 'Ngu Hanh Son', 'Ngu Hanh Son District', '응우한선구', false),

    -- Affordable apartments
    (danang_city_id, 'Danang Center', 'Danang Center', '다낭 센터', 'danang-center', 'Hai Chau', 'Hai Chau District', '하이쩌우구', false),
    (danang_city_id, 'Riverside Garden', 'Riverside Garden', '리버사이드 가든', 'riverside-garden-danang', 'Hai Chau', 'Hai Chau District', '하이쩌우구', false),
    (danang_city_id, 'Beach View Apartments', 'Beach View Apartments', '비치뷰 아파트', 'beach-view-apartments', 'Ngu Hanh Son', 'Ngu Hanh Son District', '응우한선구', false),
    (danang_city_id, 'City Center Plaza', 'City Center Plaza', '시티센터 플라자', 'city-center-plaza-danang', 'Hai Chau', 'Hai Chau District', '하이쩌우구', false),
    (danang_city_id, 'Danang Bay View', 'Danang Bay View', '다낭 베이뷰', 'danang-bay-view', 'Son Tra', 'Son Tra District', '선짜구', false)

    ON CONFLICT (slug) DO UPDATE SET
        name_en = EXCLUDED.name_en,
        name_ko = EXCLUDED.name_ko,
        district = EXCLUDED.district,
        district_en = EXCLUDED.district_en,
        district_ko = EXCLUDED.district_ko,
        is_featured = EXCLUDED.is_featured;

END $;

-- Add coordinates for Da Nang apartments (approximate locations)
UPDATE apartments SET
    latitude = 16.0544,
    longitude = 108.2022
WHERE name = 'Muong Thanh Grand Da Nang';

UPDATE apartments SET
    latitude = 16.0134,
    longitude = 108.2489
WHERE name = 'Azura Da Nang';

UPDATE apartments SET
    latitude = 16.0678,
    longitude = 108.2156
WHERE name = 'Vinpearl Condotel Riverfront';

UPDATE apartments SET
    latitude = 16.0589,
    longitude = 108.2089
WHERE name = 'Monarchy Riverside';

UPDATE apartments SET
    latitude = 16.0089,
    longitude = 108.2534
WHERE name = 'Sailing Club Villas';

UPDATE apartments SET
    latitude = 16.0623,
    longitude = 108.2134
WHERE name = 'Indochina Riverside';

UPDATE apartments SET
    latitude = 16.0156,
    longitude = 108.2456
WHERE name = 'Green Dragon Water Palace';

UPDATE apartments SET
    latitude = 16.0234,
    longitude = 108.2567
WHERE name = 'Sealink Beachfront';

UPDATE apartments SET
    latitude = 16.1023,
    longitude = 108.2345
WHERE name = 'Danang Golden Bay';

UPDATE apartments SET
    latitude = 16.0178,
    longitude = 108.2478
WHERE name = 'Ocean Vista';

UPDATE apartments SET
    latitude = 16.0567,
    longitude = 108.2123
WHERE name = 'Danang Center';

UPDATE apartments SET
    latitude = 16.0634,
    longitude = 108.2167
WHERE name = 'Riverside Garden';

UPDATE apartments SET
    latitude = 16.0267,
    longitude = 108.2523
WHERE name = 'Beach View Apartments';

UPDATE apartments SET
    latitude = 16.0578,
    longitude = 108.2145
WHERE name = 'City Center Plaza';

UPDATE apartments SET
    latitude = 16.0945,
    longitude = 108.2289
WHERE name = 'Danang Bay View';

-- Add address information for Da Nang apartments
UPDATE apartments SET
    address = '36 Bach Dang, Hai Chau 1 Ward, Hai Chau District',
    address_en = '36 Bach Dang Street, Hai Chau 1 Ward, Hai Chau District',
    address_ko = '하이쩌우구 하이쩌우1동 박당거리 36'
WHERE name = 'Muong Thanh Grand Da Nang';

UPDATE apartments SET
    address = 'Vo Nguyen Giap, Khue My Ward, Ngu Hanh Son District',
    address_en = 'Vo Nguyen Giap Street, Khue My Ward, Ngu Hanh Son District',
    address_ko = '응우한선구 쿠에미동 보응우옌잡거리'
WHERE name = 'Azura Da Nang';

UPDATE apartments SET
    address = '36 Bach Dang, Hai Chau 1 Ward, Hai Chau District',
    address_en = '36 Bach Dang Street, Hai Chau 1 Ward, Hai Chau District',
    address_ko = '하이쩌우구 하이쩌우1동 박당거리 36'
WHERE name = 'Vinpearl Condotel Riverfront';

UPDATE apartments SET
    address = '12 Tran Phu, Thach Thang Ward, Hai Chau District',
    address_en = '12 Tran Phu Street, Thach Thang Ward, Hai Chau District',
    address_ko = '하이쩌우구 탁탕동 찬푸거리 12'
WHERE name = 'Monarchy Riverside';

UPDATE apartments SET
    address = '5 Truong Sa, Hoa Hai Ward, Ngu Hanh Son District',
    address_en = '5 Truong Sa Street, Hoa Hai Ward, Ngu Hanh Son District',
    address_ko = '응우한선구 호아하이동 쯔엉사거리 5'
WHERE name = 'Sailing Club Villas';

UPDATE apartments SET
    address = '28 Bach Dang, Hai Chau 1 Ward, Hai Chau District',
    address_en = '28 Bach Dang Street, Hai Chau 1 Ward, Hai Chau District',
    address_ko = '하이쩌우구 하이쩌우1동 박당거리 28'
WHERE name = 'Indochina Riverside';

UPDATE apartments SET
    address = '33 Duong Dinh Nghe, Hoa Cuong Nam Ward, Hai Chau District',
    address_en = '33 Duong Dinh Nghe Street, Hoa Cuong Nam Ward, Hai Chau District',
    address_ko = '하이쩌우구 호아쿠엉남동 즈엉딘응에거리 33'
WHERE name = 'Green Dragon Water Palace';

UPDATE apartments SET
    address = 'An Thuong 4, My An Ward, Ngu Hanh Son District',
    address_en = 'An Thuong 4 Street, My An Ward, Ngu Hanh Son District',
    address_ko = '응우한선구 미안동 안투엉4거리'
WHERE name = 'Sealink Beachfront';

UPDATE apartments SET
    address = 'Bai Bac, Son Tra District',
    address_en = 'Bai Bac Beach, Son Tra District',
    address_ko = '선짜구 바이박해변'
WHERE name = 'Danang Golden Bay';

UPDATE apartments SET
    address = 'Vo Nguyen Giap, My Khe Ward, Ngu Hanh Son District',
    address_en = 'Vo Nguyen Giap Street, My Khe Ward, Ngu Hanh Son District',
    address_ko = '응우한선구 미케동 보응우옌잡거리'
WHERE name = 'Ocean Vista';

UPDATE apartments SET
    address = '158 Le Thanh Ton, Hai Chau 1 Ward, Hai Chau District',
    address_en = '158 Le Thanh Ton Street, Hai Chau 1 Ward, Hai Chau District',
    address_ko = '하이쩌우구 하이쩌우1동 레탄톤거리 158'
WHERE name = 'Danang Center';

UPDATE apartments SET
    address = '40 Bach Dang, Hai Chau 1 Ward, Hai Chau District',
    address_en = '40 Bach Dang Street, Hai Chau 1 Ward, Hai Chau District',
    address_ko = '하이쩌우구 하이쩌우1동 박당거리 40'
WHERE name = 'Riverside Garden';

UPDATE apartments SET
    address = 'An Thuong 26, My An Ward, Ngu Hanh Son District',
    address_en = 'An Thuong 26 Street, My An Ward, Ngu Hanh Son District',
    address_ko = '응우한선구 미안동 안투엉26거리'
WHERE name = 'Beach View Apartments';

UPDATE apartments SET
    address = '125 Hung Vuong, Hai Chau 1 Ward, Hai Chau District',
    address_en = '125 Hung Vuong Street, Hai Chau 1 Ward, Hai Chau District',
    address_ko = '하이쩌우구 하이쩌우1동 흥브엉거리 125'
WHERE name = 'City Center Plaza';

UPDATE apartments SET
    address = 'Bai Bac, Son Tra District',
    address_en = 'Bai Bac Beach, Son Tra District',
    address_ko = '선짜구 바이박해변'
WHERE name = 'Danang Bay View';
