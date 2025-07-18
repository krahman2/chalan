/**
 * Mathematical utility functions for precise business calculations
 * Prevents floating point precision errors that could affect accounting
 */

/**
 * Round a number to 2 decimal places for currency calculations
 * Uses proper rounding to avoid floating point precision issues
 */
export const roundToCurrency = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

/**
 * Add two currency amounts with proper precision
 */
export const addCurrency = (a: number, b: number): number => {
  return roundToCurrency(a + b);
};

/**
 * Subtract two currency amounts with proper precision
 */
export const subtractCurrency = (a: number, b: number): number => {
  return roundToCurrency(a - b);
};

/**
 * Multiply currency amount with proper precision
 */
export const multiplyCurrency = (amount: number, multiplier: number): number => {
  return roundToCurrency(amount * multiplier);
};

/**
 * Check if two currency amounts are equal within tolerance
 * Uses 0.005 tolerance (half a cent) for business calculations
 */
export const currencyEquals = (a: number, b: number): boolean => {
  return Math.abs(a - b) < 0.005;
};

/**
 * Ensure a number is not negative (for quantities/amounts)
 */
export const ensureNonNegative = (num: number): number => {
  return Math.max(0, roundToCurrency(num));
};

/**
 * Calculate percentage with proper rounding
 */
export const calculatePercentage = (part: number, total: number): number => {
  if (total === 0) return 0;
  return roundToCurrency((part / total) * 100);
};

/**
 * Convert string input to safe number for calculations
 * Returns 0 for invalid inputs to prevent NaN in calculations
 */
export const safeParseFloat = (input: string | number): number => {
  if (typeof input === 'number') return isNaN(input) ? 0 : input;
  const parsed = parseFloat(input);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Convert string input to safe integer for quantities
 * Returns 0 for invalid inputs
 */
export const safeParseInt = (input: string | number): number => {
  if (typeof input === 'number') return isNaN(input) ? 0 : Math.floor(input);
  const parsed = parseInt(input, 10);
  return isNaN(parsed) ? 0 : parsed;
}; 