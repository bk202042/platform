import { PropertyListing, PropertyType, ValidationResult } from '@/types/property';

/**
 * Validates a property listing
 * @param property The property listing to validate
 * @returns Validation result with errors if any
 */
export function validatePropertyListing(property: Partial<PropertyListing>): ValidationResult {
  const errors: string[] = [];
  
  // Required fields
  if (!property.title) errors.push('Title is required');
  if (!property.description) errors.push('Description is required');
  if (property.price === undefined) errors.push('Price is required');
  if (!property.property_type) errors.push('Property type is required');
  if (!property.location) errors.push('Location is required');
  if (!property.address) errors.push('Address is required');
  
  // Property type validation
  if (property.property_type && !['월세', '매매'].includes(property.property_type as PropertyType)) {
    errors.push('Property type must be either 월세 (Monthly rent) or 매매 (Purchase)');
  }
  
  // Numeric field validation
  if (property.price !== undefined && (isNaN(property.price) || property.price <= 0)) {
    errors.push('Price must be a positive number');
  }
  
  if (property.bedrooms !== undefined && (isNaN(property.bedrooms) || property.bedrooms < 0)) {
    errors.push('Bedrooms must be a non-negative number');
  }
  
  if (property.bathrooms !== undefined && (isNaN(property.bathrooms) || property.bathrooms < 0)) {
    errors.push('Bathrooms must be a non-negative number');
  }
  
  if (property.square_footage !== undefined && (isNaN(property.square_footage) || property.square_footage <= 0)) {
    errors.push('Square footage must be a positive number');
  }
  
  // Location validation
  if (property.location) {
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
  
  return {
    valid: errors.length === 0,
    errors
  };
}
