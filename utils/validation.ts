import { PropertyListing, ValidationResult, PropertyType, VietnamCity } from '../types/property';

/**
 * Validates a property listing for the Vietnamese market
 * @param property The property listing to validate
 * @returns Validation result with errors if any
 */
export function validatePropertyListing(property: PropertyListing): ValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!property.title) errors.push('Title is required');
  if (!property.description) errors.push('Description is required');

  // Price validation
  if (property.price === undefined || property.price === null) {
    errors.push('Price is required');
  } else if (property.price <= 0) {
    errors.push('Price must be a positive number');
  }

  // Property type validation
  if (!property.property_type) {
    errors.push('Property type is required');
  } else if (!['월세', '매매'].includes(property.property_type)) {
    errors.push('Property type must be either 월세 (monthly rent) or 매매 (purchase)');
  }

  // Bedrooms and bathrooms validation
  if (property.bedrooms === undefined || property.bedrooms === null) {
    errors.push('Number of bedrooms is required');
  } else if (property.bedrooms < 0) {
    errors.push('Number of bedrooms cannot be negative');
  }

  if (property.bathrooms === undefined || property.bathrooms === null) {
    errors.push('Number of bathrooms is required');
  } else if (property.bathrooms < 0) {
    errors.push('Number of bathrooms cannot be negative');
  }

  // Square footage validation
  if (property.square_footage === undefined || property.square_footage === null) {
    errors.push('Square footage is required');
  } else if (property.square_footage <= 0) {
    errors.push('Square footage must be a positive number');
  }

  // Location validation
  if (!property.location) {
    errors.push('Location is required');
  } else {
    // Check if location is in the format 'POINT(longitude latitude)'
    const pointRegex = /^POINT\((\d+\.\d+) (\d+\.\d+)\)$/;
    const match = property.location.match(pointRegex);

    if (!match) {
      errors.push('Location must be in the format "POINT(longitude latitude)"');
    } else {
      const longitude = parseFloat(match[1]);
      const latitude = parseFloat(match[2]);

      // Vietnam longitude range: approximately 102° to 110° E
      // Vietnam latitude range: approximately 8° to 24° N
      if (longitude < 102 || longitude > 110) {
        errors.push('Longitude must be within Vietnam (approximately 102° to 110° E)');
      }

      if (latitude < 8 || latitude > 24) {
        errors.push('Latitude must be within Vietnam (approximately 8° to 24° N)');
      }
    }
  }

  // Address validation
  if (!property.address) errors.push('Address is required');

  // Features validation
  if (!property.features) {
    errors.push('Features object is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validates search parameters for property listings
 * @param params The search parameters to validate
 * @returns Validation result with errors if any
 */
export function validateSearchParams(params: any): ValidationResult {
  const errors: string[] = [];

  // Price range validation
  if (params.minPrice !== undefined && params.minPrice < 0) {
    errors.push('Minimum price cannot be negative');
  }

  if (params.maxPrice !== undefined && params.maxPrice < 0) {
    errors.push('Maximum price cannot be negative');
  }

  if (params.minPrice !== undefined && params.maxPrice !== undefined && params.minPrice > params.maxPrice) {
    errors.push('Minimum price cannot be greater than maximum price');
  }

  // Property type validation
  if (params.propertyType !== undefined && !['월세', '매매'].includes(params.propertyType)) {
    errors.push('Property type must be either 월세 (monthly rent) or 매매 (purchase)');
  }

  // Bedrooms and bathrooms validation
  if (params.minBedrooms !== undefined && params.minBedrooms < 0) {
    errors.push('Minimum bedrooms cannot be negative');
  }

  if (params.minBathrooms !== undefined && params.minBathrooms < 0) {
    errors.push('Minimum bathrooms cannot be negative');
  }

  // Location validation
  if ((params.lat !== undefined && params.lng === undefined) ||
      (params.lat === undefined && params.lng !== undefined)) {
    errors.push('Both latitude and longitude must be provided for location-based search');
  }

  if (params.radiusMeters !== undefined && params.radiusMeters <= 0) {
    errors.push('Radius must be a positive number');
  }

  // Pagination validation
  if (params.limit !== undefined && params.limit <= 0) {
    errors.push('Limit must be a positive number');
  }

  if (params.offset !== undefined && params.offset < 0) {
    errors.push('Offset cannot be negative');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
