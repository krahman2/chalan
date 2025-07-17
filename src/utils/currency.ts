// Currency formatting utilities for Bangladeshi Taka with lac system

/**
 * Formats a number in the Bangladeshi lac system (x,xx,xx,xxx)
 * @param amount - The amount to format
 * @param currency - Whether to include currency symbol (default: true)
 * @returns Formatted string with BDT currency and lac formatting
 */
export const formatBDT = (amount: number, currency: boolean = true): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return currency ? '৳0' : '0';
  }

  // Convert to string and handle decimals
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const [integerPart, decimalPart] = absAmount.toFixed(2).split('.');
  
  // Apply lac formatting for numbers >= 1000
  let formattedInteger = '';
  
  if (integerPart.length <= 3) {
    // Numbers less than 1000, no special formatting needed
    formattedInteger = integerPart;
  } else {
    // Apply lac system formatting
    const reversed = integerPart.split('').reverse();
    let formatted = '';
    
    for (let i = 0; i < reversed.length; i++) {
      if (i === 3 || (i > 3 && (i - 3) % 2 === 0)) {
        formatted = ',' + formatted;
      }
      formatted = reversed[i] + formatted;
    }
    formattedInteger = formatted;
  }
  
  // Combine integer and decimal parts
  const fullAmount = decimalPart && decimalPart !== '00' 
    ? `${formattedInteger}.${decimalPart}`
    : formattedInteger;
  
  // Add negative sign and currency symbol
  const sign = isNegative ? '-' : '';
  const currencySymbol = currency ? '৳' : '';
  
  return `${sign}${currencySymbol}${fullAmount}`;
};

/**
 * Formats a number for input fields (without currency symbol)
 * @param amount - The amount to format
 * @returns Formatted string without currency symbol
 */
export const formatBDTInput = (amount: number): string => {
  return formatBDT(amount, false);
};

/**
 * Parse a formatted BDT string back to number
 * @param formattedAmount - The formatted string to parse
 * @returns The numeric value
 */
export const parseBDT = (formattedAmount: string): number => {
  if (!formattedAmount) return 0;
  
  // Remove currency symbol and spaces
  const cleaned = formattedAmount.replace(/[৳\s]/g, '');
  
  // Remove commas and parse
  const number = parseFloat(cleaned.replace(/,/g, ''));
  
  return isNaN(number) ? 0 : number;
}; 