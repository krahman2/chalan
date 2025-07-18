import type { Product, Sale, StandaloneCredit, Payment, SaleItem } from '../types';
import { roundToCurrency, safeParseFloat, safeParseInt, currencyEquals } from './mathUtils';

/**
 * Validation utilities to ensure data integrity before database operations
 */

/**
 * Validate a product before saving to database
 */
export const validateProduct = (product: Omit<Product, 'id'>): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!product.name || product.name.trim().length === 0) {
    errors.push('Product name is required');
  }

  if (!product.type) {
    errors.push('Product type is required');
  }

  if (!product.category) {
    errors.push('Product category is required');
  }

  if (!product.brand) {
    errors.push('Product brand is required');
  }

  if (!product.country) {
    errors.push('Product country is required');
  }

  const purchasePrice = safeParseFloat(product.purchasePrice);
  if (purchasePrice <= 0) {
    errors.push('Purchase price must be greater than 0');
  }

  const sellingPrice = safeParseFloat(product.sellingPrice);
  if (sellingPrice <= 0) {
    errors.push('Selling price must be greater than 0');
  }

  const quantity = safeParseInt(product.quantity);
  if (quantity < 0) {
    errors.push('Quantity cannot be negative');
  }

  // Validate pricing structure if present
  if (product.pricing) {
    const originalAmount = safeParseFloat(product.pricing.originalAmount);
    if (originalAmount <= 0) {
      errors.push('Original amount in pricing must be greater than 0');
    }

    if (product.pricing.exchangeRate !== undefined) {
      const exchangeRate = safeParseFloat(product.pricing.exchangeRate);
      if (exchangeRate <= 0) {
        errors.push('Exchange rate must be greater than 0');
      }
    }

    const dutyPerUnit = safeParseFloat(product.pricing.dutyPerUnit);
    if (dutyPerUnit < 0) {
      errors.push('Duty per unit cannot be negative');
    }

    const finalPurchasePrice = safeParseFloat(product.pricing.finalPurchasePrice);
    if (finalPurchasePrice <= 0) {
      errors.push('Final purchase price must be greater than 0');
    }

    // Ensure pricing calculation is consistent
    const expectedFinalPrice = product.pricing.exchangeRate 
      ? roundToCurrency((originalAmount * product.pricing.exchangeRate) + dutyPerUnit)
      : roundToCurrency(originalAmount + dutyPerUnit);
    
    if (!currencyEquals(finalPurchasePrice, expectedFinalPrice)) {
      errors.push('Final purchase price calculation is inconsistent');
    }
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Validate a sale before saving to database
 */
export const validateSale = (
  saleItems: SaleItem[], 
  buyerName: string, 
  creditInfo: any,
  availableProducts: Product[]
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!buyerName || buyerName.trim().length === 0) {
    errors.push('Buyer name is required');
  }

  if (!saleItems || saleItems.length === 0) {
    errors.push('At least one sale item is required');
  }

  // Validate each sale item
  saleItems.forEach((item, index) => {
    const product = availableProducts.find(p => p.id === item.productId);
    
    if (!product) {
      errors.push(`Product not found for item ${index + 1}: ${item.productName}`);
      return;
    }

    const quantity = safeParseInt(item.quantity);
    if (quantity <= 0) {
      errors.push(`Invalid quantity for ${item.productName}: must be greater than 0`);
    }

    if (quantity > product.quantity) {
      errors.push(`Insufficient inventory for ${item.productName}: requested ${quantity}, available ${product.quantity}`);
    }

    const sellingPrice = safeParseFloat(item.sellingPrice);
    if (sellingPrice <= 0) {
      errors.push(`Invalid selling price for ${item.productName}: must be greater than 0`);
    }

    const profit = safeParseFloat(item.profit);
    // Profit can be negative (selling at a loss) but should be reasonable
    const maxLoss = sellingPrice; // Can't lose more than the selling price
    if (profit < -maxLoss) {
      errors.push(`Unreasonable loss for ${item.productName}: profit cannot be less than -${maxLoss}`);
    }
  });

  // Validate credit info
  const cashAmount = safeParseFloat(creditInfo.cashAmount);
  const creditAmount = safeParseFloat(creditInfo.creditAmount);
  const totalAmount = safeParseFloat(creditInfo.totalAmount);

  if (cashAmount < 0) {
    errors.push('Cash amount cannot be negative');
  }

  if (creditAmount < 0) {
    errors.push('Credit amount cannot be negative');
  }

  const expectedTotal = roundToCurrency(cashAmount + creditAmount);
  if (!currencyEquals(totalAmount, expectedTotal)) {
    errors.push('Total amount does not match cash + credit amounts');
  }

  // Validate that payment equals revenue
  const totalRevenue = roundToCurrency(saleItems.reduce((sum, item) => 
    sum + (safeParseFloat(item.sellingPrice) * safeParseInt(item.quantity)), 0));
  
  if (!currencyEquals(totalAmount, totalRevenue)) {
    errors.push('Total payment must equal total revenue');
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Validate a standalone credit before saving
 */
export const validateStandaloneCredit = (credit: Omit<StandaloneCredit, 'id'>): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!credit.buyerName || credit.buyerName.trim().length === 0) {
    errors.push('Buyer name is required');
  }

  const creditAmount = safeParseFloat(credit.creditAmount);
  if (creditAmount <= 0) {
    errors.push('Credit amount must be greater than 0');
  }

  if (!credit.description || credit.description.trim().length === 0) {
    errors.push('Description is required');
  }

  if (!credit.date) {
    errors.push('Date is required');
  } else {
    const date = new Date(credit.date);
    if (isNaN(date.getTime())) {
      errors.push('Invalid date format');
    }
    
    // CRITICAL: Prevent future-dated credits (business rule)
    const now = new Date();
    if (date > now) {
      errors.push('Credit date cannot be in the future');
    }
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Validate a payment before saving
 */
export const validatePayment = (
  payment: Omit<Payment, 'id'>,
  availableCredit: number
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!payment.buyerName || payment.buyerName.trim().length === 0) {
    errors.push('Buyer name is required');
  }

  const amount = safeParseFloat(payment.amount);
  if (amount <= 0) {
    errors.push('Payment amount must be greater than 0');
  }

  if (amount > availableCredit) {
    errors.push(`Payment amount (${amount}) exceeds available credit (${availableCredit})`);
  }

  if (!payment.date) {
    errors.push('Date is required');
  } else {
    const date = new Date(payment.date);
    if (isNaN(date.getTime())) {
      errors.push('Invalid date format');
    }
    
    // CRITICAL: Prevent future-dated payments (business rule)
    const now = new Date();
    if (date > now) {
      errors.push('Payment date cannot be in the future');
    }
  }

  return { valid: errors.length === 0, errors };
}; 