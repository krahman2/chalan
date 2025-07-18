/**
 * Robust ID generation system to prevent collisions
 * Uses combination of timestamp, random, and counter for guaranteed uniqueness
 */

let idCounter = 0;

/**
 * Generate a unique ID using timestamp + random + counter
 * Format: {timestamp}-{random}-{counter}
 * Prevents collisions even if called multiple times in same millisecond
 */
export const generateUniqueId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9); // 9 char random string
  const counter = (++idCounter).toString(36).padStart(3, '0'); // Base36 counter
  
  return `${timestamp}-${random}-${counter}`;
};

/**
 * Generate ID with specific prefix for easier debugging
 */
export const generateProductId = (): string => {
  return `prod_${generateUniqueId()}`;
};

export const generateSaleId = (): string => {
  return `sale_${generateUniqueId()}`;
};

export const generateCreditId = (): string => {
  return `credit_${generateUniqueId()}`;
};

export const generatePaymentId = (): string => {
  return `payment_${generateUniqueId()}`;
};

/**
 * Validate that an ID follows our expected format
 */
export const isValidId = (id: string): boolean => {
  // Check if ID has our expected format
  const idPattern = /^[a-z]+_\d+-[a-z0-9]+-[a-z0-9]+$/;
  return idPattern.test(id);
}; 