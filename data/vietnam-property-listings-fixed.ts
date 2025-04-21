import { PropertyListing, PropertyType } from "../types/property";

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
    title: "Luxury Apartment in Phu My Hung with River View",
    description:
      "Spacious 3-bedroom apartment in the heart of Phu My Hung with beautiful river views. Walking distance to international schools, Korean supermarkets, and restaurants. 24-hour security and modern amenities.",
    price: 1500, // USD/month for rent
    property_type: "월세", // Monthly rent
    bedrooms: 3,
    bathrooms: 2,
    square_footage: 140,
    location: "POINT(106.7233 10.7292)", // Phu My Hung coordinates
    address: "123 Nguyen Duc Canh, Phu My Hung, District 7",
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
      koreanSupermarket: true,
    },
  },
  {
    title: "Modern Townhouse in Sky Garden, Phu My Hung",
    description:
      "Beautiful 4-bedroom townhouse in the prestigious Sky Garden complex. Fully furnished with high-end appliances and furniture. Close to Korean International School and Korean community.",
    price: 2000, // USD/month for rent
    property_type: "월세", // Monthly rent
    bedrooms: 4,
    bathrooms: 3,
    square_footage: 200,
    location: "POINT(106.7215 10.7276)", // Sky Garden coordinates
    address: "45 Nguyen Van Linh, Sky Garden, Phu My Hung, District 7",
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
      koreanSupermarket: true,
    },
  },
  {
    title: "Luxury Villa for Sale in Phu My Hung",
    description:
      "Exclusive 5-bedroom villa in the most prestigious area of Phu My Hung. Perfect for families looking for space and luxury. Private garden, swimming pool, and parking for 3 cars.",
    price: 1200000, // USD for purchase
    property_type: "매매", // Purchase
    bedrooms: 5,
    bathrooms: 4,
    square_footage: 350,
    location: "POINT(106.7245 10.7265)", // Phu My Hung villa area
    address: "78 Tan Phu, Phu My Hung, District 7",
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
      koreanSupermarket: true,
    },
  },

  // Ho Chi Minh City - Thao Dien (District 2) - Another popular area for Korean expatriates
  {
    title: "Modern Apartment in Thao Dien, District 2",
    description:
      "Beautiful modern apartment in Thao Dien, close to international schools and Korean community. The apartment features high-end finishes, a spacious living area, and a balcony with city views.",
    price: 1200, // USD/month for rent
    property_type: "월세", // Monthly rent
    bedrooms: 3,
    bathrooms: 2,
    square_footage: 120,
    location: "POINT(106.7425 10.8038)", // Thao Dien coordinates
    address: "123 Thao Dien Street, District 2",
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
      koreanSupermarket: true,
    },
  },
  {
    title: "Luxury Penthouse in Masteri Thao Dien",
    description:
      "Exclusive penthouse in the prestigious Masteri Thao Dien complex with panoramic views of the Saigon River. Features high ceilings, premium finishes, and private terrace.",
    price: 3500, // USD/month for rent
    property_type: "월세", // Monthly rent
    bedrooms: 4,
    bathrooms: 3,
    square_footage: 250,
    location: "POINT(106.7432 10.8025)", // Masteri Thao Dien coordinates
    address: "159 Xa Lo Ha Noi, Thao Dien, District 2",
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
      koreanSupermarket: true,
    },
  },

  // Hanoi - Tay Ho District - Popular with Korean expatriates
  {
    title: "Lakeside Villa in Tay Ho District",
    description:
      "Beautiful villa with West Lake views in Tay Ho District, the expat hub of Hanoi. Spacious garden, modern design, and close to international schools and the Korean community.",
    price: 2500, // USD/month for rent
    property_type: "월세", // Monthly rent
    bedrooms: 4,
    bathrooms: 3,
    square_footage: 300,
    location: "POINT(105.8325 21.0664)", // Tay Ho coordinates
    address: "45 To Ngoc Van, Tay Ho District",
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
      koreanSupermarket: true,
    },
  },
  {
    title: "Modern Apartment near Korean Embassy in Hanoi",
    description:
      "Contemporary apartment located just minutes from the Korean Embassy in Hanoi. Ideal for Korean professionals working in diplomatic services or international organizations.",
    price: 1100, // USD/month for rent
    property_type: "월세", // Monthly rent
    bedrooms: 2,
    bathrooms: 2,
    square_footage: 95,
    location: "POINT(105.8119 21.0245)", // Near Korean Embassy in Hanoi
    address: "78 Kim Ma Street, Ba Dinh District",
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
      koreanSupermarket: true,
    },
  },

  // Da Nang - My Khe Beach area - Growing Korean expatriate community
  {
    title: "Beachfront Apartment in My Khe Beach",
    description:
      "Stunning beachfront apartment with panoramic ocean views in My Khe Beach, Da Nang. Walking distance to restaurants, cafes, and the growing Korean community in Da Nang.",
    price: 900, // USD/month for rent
    property_type: "월세", // Monthly rent
    bedrooms: 2,
    bathrooms: 2,
    square_footage: 110,
    location: "POINT(108.2452 16.0544)", // My Khe Beach coordinates
    address: "123 Vo Nguyen Giap, My Khe Beach",
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
      koreanSupermarket: true,
    },
  },
  {
    title: "Luxury Villa for Sale in Da Nang",
    description:
      "Exclusive villa in the premium area of Da Nang, close to the beach and golf courses. Perfect for Korean investors looking for vacation homes or rental properties in Vietnam's growing tourism market.",
    price: 650000, // USD for purchase
    property_type: "매매", // Purchase
    bedrooms: 4,
    bathrooms: 4,
    square_footage: 280,
    location: "POINT(108.2389 16.0477)", // Da Nang premium area
    address: "45 Truong Sa, Ngu Hanh Son District",
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
      koreanSupermarket: false,
    },
  },

  // Nha Trang - Popular tourist destination with growing Korean presence
  {
    title: "Oceanview Condo in Nha Trang City Center",
    description:
      "Beautiful oceanview condominium in the heart of Nha Trang. Perfect for Korean investors looking for vacation rentals or a second home in this popular beach destination.",
    price: 120000, // USD for purchase
    property_type: "매매", // Purchase
    bedrooms: 2,
    bathrooms: 2,
    square_footage: 95,
    location: "POINT(109.1967 12.2388)", // Nha Trang city center
    address: "25 Tran Phu Street, Nha Trang",
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
      koreanSupermarket: false,
    },
  },
];

// Add more properties to reach 50+ listings
// This is just a starter set of 10 properties
// In a real implementation, you would add 40+ more properties
// covering different cities, property types, and price ranges
