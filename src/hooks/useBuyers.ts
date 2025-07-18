import { useMemo } from 'react';
import type { Sale, StandaloneCredit, Payment } from '../types';
import { addCurrency, subtractCurrency, ensureNonNegative } from '../utils/mathUtils';

/**
 * Hook to get all unique buyers from sales, standalone credits, and payments
 * This ensures consistent buyer lists across all components
 */
export const useAllBuyers = (
  sales: Sale[], 
  standaloneCredits: StandaloneCredit[], 
  payments: Payment[]
) => {
  return useMemo(() => {
    const allBuyers = new Set<string>();
    
    // Add buyers from sales
    sales.forEach(sale => allBuyers.add(sale.buyerName));
    
    // Add buyers from standalone credits
    standaloneCredits.forEach(credit => allBuyers.add(credit.buyerName));
    
    // Add buyers from payments
    payments.forEach(payment => allBuyers.add(payment.buyerName));
    
    return Array.from(allBuyers).sort();
  }, [sales, standaloneCredits, payments]);
};

/**
 * Hook to calculate outstanding credit for each buyer
 * This ensures consistent credit calculations across all components
 */
export const useOutstandingCredit = (
  sales: Sale[], 
  standaloneCredits: StandaloneCredit[], 
  payments: Payment[]
) => {
  return useMemo(() => {
    const creditMap = new Map<string, number>();
    
    // Add credit from sales with precise math
    sales.forEach(sale => {
      if (sale.creditInfo.creditAmount > 0) {
        const current = creditMap.get(sale.buyerName) || 0;
        creditMap.set(sale.buyerName, addCurrency(current, sale.creditInfo.creditAmount));
      }
    });
    
    // Add standalone credits with precise math
    standaloneCredits.forEach(credit => {
      const current = creditMap.get(credit.buyerName) || 0;
      creditMap.set(credit.buyerName, addCurrency(current, credit.creditAmount));
    });
    
    // Subtract payments with precise math
    payments.forEach(payment => {
      const current = creditMap.get(payment.buyerName) || 0;
      creditMap.set(payment.buyerName, ensureNonNegative(subtractCurrency(current, payment.amount)));
    });
    
    return creditMap;
  }, [sales, standaloneCredits, payments]);
};

/**
 * Hook to get buyers with outstanding credit amounts
 * Used specifically for payment forms
 */
export const useBuyersWithCredit = (
  sales: Sale[], 
  standaloneCredits: StandaloneCredit[], 
  payments: Payment[]
) => {
  const outstandingCredit = useOutstandingCredit(sales, standaloneCredits, payments);
  
  return useMemo(() => {
    return Array.from(outstandingCredit.entries())
      .filter(([_, amount]) => amount > 0) // Only buyers with outstanding credit
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [outstandingCredit]);
}; 