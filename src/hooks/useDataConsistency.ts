import { useMemo } from 'react';
import type { Sale, StandaloneCredit, Payment } from '../types';
import { addCurrency, subtractCurrency, ensureNonNegative } from '../utils/mathUtils';

interface ConsistencyReport {
  isConsistent: boolean;
  warnings: string[];
  errors: string[];
  buyerMismatches: string[];
  negativeCredits: string[];
  duplicateTransactions: string[];
}

/**
 * Hook to validate data consistency across sales, credits, and payments
 * Helps detect synchronization issues and data integrity problems
 */
export const useDataConsistency = (
  sales: Sale[],
  standaloneCredits: StandaloneCredit[],
  payments: Payment[]
): ConsistencyReport => {
  return useMemo(() => {
    const warnings: string[] = [];
    const errors: string[] = [];
    const buyerMismatches: string[] = [];
    const negativeCredits: string[] = [];
    const duplicateTransactions: string[] = [];

    // Check for negative credit balances
    const creditMap = new Map<string, number>();
    
    // Add credits from sales with precise math
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
    
    // Subtract payments and check for negatives with precise math
    payments.forEach(payment => {
      const current = creditMap.get(payment.buyerName) || 0;
      const newBalance = subtractCurrency(current, payment.amount);
      
      if (newBalance < 0) {
        negativeCredits.push(
          `${payment.buyerName}: Payment of ৳${payment.amount} exceeds credit balance of ৳${current}`
        );
      }
      
      creditMap.set(payment.buyerName, ensureNonNegative(newBalance));
    });

    // Check for buyer name inconsistencies (case sensitivity, typos)
    const allBuyerNames = new Set<string>();
    const buyerVariations = new Map<string, Set<string>>();
    
    [...sales.map(s => s.buyerName), ...standaloneCredits.map(c => c.buyerName), ...payments.map(p => p.buyerName)]
      .forEach(name => {
        allBuyerNames.add(name);
        const lowerName = name.toLowerCase().trim();
        
        if (!buyerVariations.has(lowerName)) {
          buyerVariations.set(lowerName, new Set());
        }
        buyerVariations.get(lowerName)!.add(name);
      });
    
    // Find potential name variations
    buyerVariations.forEach((variations, lowerName) => {
      if (variations.size > 1) {
        buyerMismatches.push(
          `Potential name variations for "${lowerName}": ${Array.from(variations).join(', ')}`
        );
      }
    });

    // Check for duplicate transaction IDs
    const transactionIds = new Set<string>();
    const duplicateIds = new Set<string>();
    
    [...sales.map(s => s.id), ...standaloneCredits.map(c => c.id), ...payments.map(p => p.id)]
      .forEach(id => {
        if (transactionIds.has(id)) {
          duplicateIds.add(id);
        }
        transactionIds.add(id);
      });
    
    duplicateIds.forEach(id => {
      duplicateTransactions.push(`Duplicate transaction ID: ${id}`);
    });

    // Check for orphaned payments (payments without corresponding credits)
    payments.forEach(payment => {
      const hasCredit = sales.some(s => s.buyerName === payment.buyerName && s.creditInfo.creditAmount > 0) ||
                       standaloneCredits.some(c => c.buyerName === payment.buyerName);
      
      if (!hasCredit) {
        warnings.push(
          `Payment from ${payment.buyerName} (৳${payment.amount}) has no corresponding credit record`
        );
      }
    });

    // Check for timestamp consistency
    const now = new Date();
    [...sales, ...standaloneCredits, ...payments].forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      if (transactionDate > now) {
        warnings.push(
          `Future-dated transaction: ${transaction.id} dated ${transactionDate.toLocaleDateString()}`
        );
      }
    });

    // Add errors for critical issues
    if (negativeCredits.length > 0) {
      errors.push(`${negativeCredits.length} payment(s) exceed available credit`);
    }
    
    if (duplicateTransactions.length > 0) {
      errors.push(`${duplicateTransactions.length} duplicate transaction ID(s) found`);
    }

    // Add warnings for potential issues
    if (buyerMismatches.length > 0) {
      warnings.push(`${buyerMismatches.length} potential buyer name variation(s) detected`);
    }

    const isConsistent = errors.length === 0 && negativeCredits.length === 0;

    return {
      isConsistent,
      warnings,
      errors,
      buyerMismatches,
      negativeCredits,
      duplicateTransactions,
    };
  }, [sales, standaloneCredits, payments]);
};

/**
 * Hook to get summary statistics for debugging
 */
export const useDataSummary = (
  sales: Sale[],
  standaloneCredits: StandaloneCredit[],
  payments: Payment[]
) => {
  return useMemo(() => {
    const totalSalesCredit = sales.reduce((sum, sale) => sum + sale.creditInfo.creditAmount, 0);
    const totalStandaloneCredit = standaloneCredits.reduce((sum, credit) => sum + credit.creditAmount, 0);
    const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const netOutstanding = totalSalesCredit + totalStandaloneCredit - totalPayments;
    
    const uniqueBuyers = new Set([
      ...sales.map(s => s.buyerName),
      ...standaloneCredits.map(c => c.buyerName),
      ...payments.map(p => p.buyerName)
    ]).size;

    return {
      totalSalesCredit,
      totalStandaloneCredit,
      totalPayments,
      netOutstanding,
      uniqueBuyers,
      transactionCounts: {
        sales: sales.length,
        credits: standaloneCredits.length,
        payments: payments.length,
      }
    };
  }, [sales, standaloneCredits, payments]);
};