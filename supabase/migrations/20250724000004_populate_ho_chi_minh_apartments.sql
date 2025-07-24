-- Populate Ho Chi Minh City Apartments Data
-- Migration to add comprehensive Ho Chi Minh City apartment listings
-- Created: 2025-07-24

-- First, ensure Ho Chi Minh City exists and get its ID
INSERT INTO cities (name, name_en, name_ko, country, timezone, is_major_city)
VALUES ('Ho Chi Minh', 'Ho Chi Minh City', '호치민시', 'Vietnam', 'Asia/Ho_Chi_Minh', true)
ON CONFLICT (name) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ko = EXCLUDED.name_ko,
  country = EXCLUDED.country,
  timezone = EXCLUDED.timezone,
  is_major_city = EXCLUDED.is_major_city;

-- Get Ho Chi Minh City ID for reference
DO $$
DECLARE
    hcmc_city_id UUID;
BEGIN
    SELECT id INTO hcmc_city_id FROM cities WHERE name = 'Ho Chi Minh';

    -- Insert all Ho Chi Minh City apartments with Korean and English names
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
    -- Premium/Luxury apartments
    (hcmc_city_id, 'Landmark 81', 'Landmark 81', '랜드마크 81', 'landmark-81-hcmc', 'Binh Thanh', 'Binh Thanh District', '빈탄구', true),
    (hcmc_city_id, 'Vinhomes Central Park', 'Vinhomes Central Park', '빈홈 센트럴파크', 'vinhomes-central-park', 'Binh Thanh', 'Binh Thanh District', '빈탄구', true),
    (hcmc_city_id, 'Masteri Thao Dien', 'Masteri Thao Dien', '마스터리 타오디엔', 'masteri-thao-dien', 'District 2', 'District 2 (Thu Duc)', '2군(투득시)', true),
    (hcmc_city_id, 'd''Edge', 'd''Edge', '디엣지', 'd-edge-hcmc', 'District 2', 'District 2 (Thu Duc)', '2군(투득시)', true),
    (hcmc_city_id, 'Sunwah Pearl', 'Sunwah Pearl', '선와 펄', 'sunwah-pearl-hcmc', 'Binh Thanh', 'Binh Thanh District', '빈탄구', true),

    -- Additional premium apartments from user request
    (hcmc_city_id, 'Vinhomes Golden River', 'Vinhomes Golden River', '빈홈 골든리버', 'vinhomes-golden-river', 'District 1', 'District 1', '1군', true),
    (hcmc_city_id, 'Saigon Royal', 'Saigon Royal', '사이공 로얄', 'saigon-royal', 'District 4', 'District 4', '4군', true),
    (hcmc_city_id, 'The Metropole Thu Thiem', 'The Metropole Thu Thiem', '더 메트로폴 투티엠', 'metropole-thu-thiem', 'District 2', 'District 2 (Thu Duc)', '2군(투득시)', true),
    (hcmc_city_id, 'Gateway Thao Dien', 'Gateway Thao Dien', '게이트웨이 타오디엔', 'gateway-thao-dien', 'District 2', 'District 2 (Thu Duc)', '2군(투득시)', false),
    (hcmc_city_id, 'The Ascent Thao Dien', 'The Ascent Thao Dien', '디 어센트 타오디엔', 'ascent-thao-dien', 'District 2', 'District 2 (Thu Duc)', '2군(투득시)', false),
    (hcmc_city_id, 'Estella Heights', 'Estella Heights', '에스텔라 하이츠', 'estella-heights', 'District 2', 'District 2 (Thu Duc)', '2군(투득시)', false),
    (hcmc_city_id, 'Diamond Island', 'Diamond Island', '다이아몬드 아일랜드', 'diamond-island', 'District 2', 'District 2 (Thu Duc)', '2군(투득시)', false),
    (hcmc_city_id, 'Feliz En Vista', 'Feliz En Vista', '펠리즈 엔 비스타', 'feliz-en-vista', 'District 2', 'District 2 (Thu Duc)', '2군(투득시)', false)

    ON CONFLICT (slug) DO UPDATE SET
        name_en = EXCLUDED.name_en,
        name_ko = EXCLUDED.name_ko,
        district = EXCLUDED.district,
        district_en = EXCLUDED.district_en,
        district_ko = EXCLUDED.district_ko,
        is_featured = EXCLUDED.is_featured;

END $$;

-- Add coordinates for Ho Chi Minh City apartments (approximate locations)
UPDATE apartments SET
    latitude = 10.7951,
    longitude = 106.7218
WHERE name = 'Landmark 81';

UPDATE apartments SET
    latitude = 10.7879,
    longitude = 106.7198
WHERE name = 'Vinhomes Central Park';

UPDATE apartments SET
    latitude = 10.8067,
    longitude = 106.7345
WHERE name = 'Masteri Thao Dien';

UPDATE apartments SET
    latitude = 10.8123,
    longitude = 106.7389
WHERE name = 'd''Edge';

UPDATE apartments SET
    latitude = 10.7923,
    longitude = 106.7234
WHERE name = 'Sunwah Pearl';

-- Add address information for Ho Chi Minh City apartments
UPDATE apartments SET
    address = '720A Dien Bien Phu, Ward 22, Binh Thanh District',
    address_en = '720A Dien Bien Phu Street, Ward 22, Binh Thanh District',
    address_ko = '빈탄구 22동 디엔비엔푸거리 720A'
WHERE name = 'Landmark 81';

UPDATE apartments SET
    address = '208 Nguyen Huu Canh, Ward 22, Binh Thanh District',
    address_en = '208 Nguyen Huu Canh Street, Ward 22, Binh Thanh District',
    address_ko = '빈탄구 22동 응우옌후칸거리 208'
WHERE name = 'Vinhomes Central Park';

UPDATE apartments SET
    address = '159 Ha Noi Highway, Thao Dien Ward, District 2',
    address_en = '159 Ha Noi Highway, Thao Dien Ward, District 2',
    address_ko = '2군 타오디엔동 하노이고속도로 159'
WHERE name = 'Masteri Thao Dien';

UPDATE apartments SET
    address = '25 Nguyen Uu Di, Thao Dien Ward, District 2',
    address_en = '25 Nguyen Uu Di Street, Thao Dien Ward, District 2',
    address_ko = '2군 타오디엔동 응우옌우디거리 25'
WHERE name = 'd''Edge';

UPDATE apartments SET
    address = '90 Nguyen Huu Canh, Ward 22, Binh Thanh District',
    address_en = '90 Nguyen Huu Canh Street, Ward 22, Binh Thanh District',
    address_ko = '빈탄구 22동 응우옌후칸거리 90'
WHERE name = 'Sunwah Pearl';

-- Add coordinates and addresses for additional apartments
UPDATE apartments SET
    latitude = 10.7723,
    longitude = 106.7025,
    address = '136 Nguyen Hue, Ben Nghe Ward, District 1',
    address_en = '136 Nguyen Hue Boulevard, Ben Nghe Ward, District 1',
    address_ko = '1군 벤응에동 응우옌후에대로 136'
WHERE name = 'Vinhomes Golden River';

UPDATE apartments SET
    latitude = 10.7589,
    longitude = 106.7034,
    address = '34-35 Ben Van Don, Ward 12, District 4',
    address_en = '34-35 Ben Van Don Street, Ward 12, District 4',
    address_ko = '4군 12동 벤반돈거리 34-35'
WHERE name = 'Saigon Royal';

UPDATE apartments SET
    latitude = 10.8034,
    longitude = 106.7456,
    address = '16 Song Hanh, An Phu Ward, District 2',
    address_en = '16 Song Hanh Street, An Phu Ward, District 2',
    address_ko = '2군 안푸동 송한거리 16'
WHERE name = 'The Metropole Thu Thiem';

UPDATE apartments SET
    latitude = 10.8089,
    longitude = 106.7378,
    address = '11 Dang Tran Con, Thao Dien Ward, District 2',
    address_en = '11 Dang Tran Con Street, Thao Dien Ward, District 2',
    address_ko = '2군 타오디엔동 당찬콘거리 11'
WHERE name = 'Gateway Thao Dien';

UPDATE apartments SET
    latitude = 10.8067,
    longitude = 106.7389,
    address = '133 Nguyen Van Huong, Thao Dien Ward, District 2',
    address_en = '133 Nguyen Van Huong Street, Thao Dien Ward, District 2',
    address_ko = '2군 타오디엔동 응우옌반흐엉거리 133'
WHERE name = 'The Ascent Thao Dien';

UPDATE apartments SET
    latitude = 10.8123,
    longitude = 106.7423,
    address = '88 Song Hanh, An Phu Ward, District 2',
    address_en = '88 Song Hanh Street, An Phu Ward, District 2',
    address_ko = '2군 안푸동 송한거리 88'
WHERE name = 'Estella Heights';

UPDATE apartments SET
    latitude = 10.7945,
    longitude = 106.7234,
    address = '92 Nguyen Huu Canh, Ward 22, Binh Thanh District',
    address_en = '92 Nguyen Huu Canh Street, Ward 22, Binh Thanh District',
    address_ko = '빈탄구 22동 응우옌후칸거리 92'
WHERE name = 'Diamond Island';

UPDATE apartments SET
    latitude = 10.8156,
    longitude = 106.7445,
    address = '628 Ha Noi Highway, Thao Dien Ward, District 2',
    address_en = '628 Ha Noi Highway, Thao Dien Ward, District 2',
    address_ko = '2군 타오디엔동 하노이고속도로 628'
WHERE name = 'Feliz En Vista';
