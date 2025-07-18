import type { Product } from '../types';
import { roundToCurrency, subtractCurrency, multiplyCurrency } from './mathUtils';

/**
 * Get the actual purchase price of a product, preferring the detailed pricing structure
 * over the legacy purchasePrice field
 */
export const getActualPurchasePrice = (product: Product): number => {
  const price = product.pricing?.finalPurchasePrice || product.purchasePrice;
  return roundToCurrency(price);
};

/**
 * Calculate profit per unit for a product
 */
export const getUnitProfit = (product: Product): number => {
  const sellingPrice = roundToCurrency(product.sellingPrice);
  const purchasePrice = getActualPurchasePrice(product);
  return subtractCurrency(sellingPrice, purchasePrice);
};

/**
 * Calculate total inventory value for a product
 */
export const getProductInventoryValue = (product: Product): number => {
  const purchasePrice = getActualPurchasePrice(product);
  return multiplyCurrency(purchasePrice, product.quantity);
};

/**
 * Calculate total potential profit for a product (if all inventory sold)
 */
export const getProductTotalProfit = (product: Product): number => {
  const unitProfit = getUnitProfit(product);
  return multiplyCurrency(unitProfit, product.quantity);
}; 