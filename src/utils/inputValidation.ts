
export const validateEventData = (eventData: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate event title
  if (!eventData.eventTitle || typeof eventData.eventTitle !== 'string') {
    errors.push('Event title is required and must be a string');
  } else if (eventData.eventTitle.length < 3 || eventData.eventTitle.length > 200) {
    errors.push('Event title must be between 3 and 200 characters');
  }

  // Validate dates
  if (eventData.eventDate) {
    const eventDate = new Date(eventData.eventDate);
    if (isNaN(eventDate.getTime())) {
      errors.push('Invalid event date format');
    } else if (eventDate < new Date()) {
      errors.push('Event date cannot be in the past');
    }
  }

  // Validate teams
  if (eventData.homeTeam && typeof eventData.homeTeam !== 'string') {
    errors.push('Home team must be a string');
  }
  if (eventData.awayTeam && typeof eventData.awayTeam !== 'string') {
    errors.push('Away team must be a string');
  }

  // Validate stadium
  if (eventData.stadiumName && typeof eventData.stadiumName !== 'string') {
    errors.push('Stadium name must be a string');
  }

  // Validate description
  if (eventData.description && typeof eventData.description !== 'string') {
    errors.push('Description must be a string');
  } else if (eventData.description && eventData.description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateTierData = (tiers: any[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!Array.isArray(tiers) || tiers.length === 0) {
    errors.push('At least one pricing tier is required');
    return { isValid: false, errors };
  }

  tiers.forEach((tier, index) => {
    if (!tier.tierName || typeof tier.tierName !== 'string') {
      errors.push(`Tier ${index + 1}: Name is required and must be a string`);
    } else if (tier.tierName.length < 2 || tier.tierName.length > 50) {
      errors.push(`Tier ${index + 1}: Name must be between 2 and 50 characters`);
    }

    if (typeof tier.tierPrice !== 'number' || tier.tierPrice < 0) {
      errors.push(`Tier ${index + 1}: Price must be a non-negative number`);
    } else if (tier.tierPrice > 10000) {
      errors.push(`Tier ${index + 1}: Price cannot exceed $10,000`);
    }

    if (typeof tier.tierQuantity !== 'number' || tier.tierQuantity < 1) {
      errors.push(`Tier ${index + 1}: Quantity must be at least 1`);
    } else if (tier.tierQuantity > 10000) {
      errors.push(`Tier ${index + 1}: Quantity cannot exceed 10,000 tickets`);
    }

    if (tier.tierDescription && typeof tier.tierDescription !== 'string') {
      errors.push(`Tier ${index + 1}: Description must be a string`);
    } else if (tier.tierDescription && tier.tierDescription.length > 500) {
      errors.push(`Tier ${index + 1}: Description must be less than 500 characters`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // Remove potentially dangerous characters and normalize whitespace
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets to prevent XSS
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 1000); // Limit length
};

export const validateQRCode = (qrCode: string): boolean => {
  // Basic QR code validation
  if (!qrCode || typeof qrCode !== 'string') return false;
  
  // Check if it's a valid JSON structure or UUID
  try {
    JSON.parse(qrCode);
    return true;
  } catch {
    // Check if it's a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(qrCode);
  }
};
