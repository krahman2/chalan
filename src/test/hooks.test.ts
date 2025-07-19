import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useAllBuyers, useActiveBuyers, useOutstandingCredit, useBuyersWithCredit } from '../hooks/useBuyers'
import type { Sale, StandaloneCredit, Payment } from '../types'

// Mock the database service
vi.mock('../services/database', () => ({
  getSales: vi.fn(() => Promise.resolve([])),
  getStandaloneCredits: vi.fn(() => Promise.resolve([])),
  getPayments: vi.fn(() => Promise.resolve([]))
}))

describe('Buyer Hooks', () => {
  const mockSales: Sale[] = [
    {
      id: 'sale1',
      buyerName: 'ZAKIR MOTORS',
      items: [{ 
        productId: 'prod1',
        productName: 'Product 1', 
        quantity: 2, 
        profit: 500,
        sellingPrice: 1000
      }],
      totalProfit: 500,
      totalRevenue: 1000,
      date: '2024-01-01',
      creditInfo: {
        cashAmount: 0,
        creditAmount: 1000,
        totalAmount: 1000
      }
    },
    {
      id: 'sale2',
      buyerName: 'Test Buyer 1',
      items: [{ 
        productId: 'prod2',
        productName: 'Product 2', 
        quantity: 1, 
        profit: 200,
        sellingPrice: 500
      }],
      totalProfit: 200,
      totalRevenue: 500,
      date: '2024-01-02',
      creditInfo: {
        cashAmount: 500,
        creditAmount: 0,
        totalAmount: 500
      }
    }
  ]

  const mockStandaloneCredits: StandaloneCredit[] = [
    {
      id: 'credit1',
      buyerName: 'Shohag',
      creditAmount: 20000,
      description: 'Outstanding credit for Shohag',
      date: '2024-01-01',
      isStandalone: true
    },
    {
      id: 'credit2', 
      buyerName: 'Kashem',
      creditAmount: 5000,
      description: 'Credit for Kashem',
      date: '2024-01-02',
      isStandalone: true
    }
  ]

  const mockPayments: Payment[] = [
    {
      id: 'payment1',
      buyerName: 'ZAKIR MOTORS',
      amount: 500,
      date: '2024-01-03',
      description: 'Payment from ZAKIR MOTORS'
    }
  ]

  describe('useAllBuyers', () => {
    it('should return all unique buyers from sales, credits, and payments', () => {
      const { result } = renderHook(() => useAllBuyers(mockSales, mockStandaloneCredits, mockPayments))

      // The hook sorts the results alphabetically
      expect(result.current).toEqual(['Kashem', 'Shohag', 'Test Buyer 1', 'ZAKIR MOTORS'])
    })

    it('should handle empty data', () => {
      const { result } = renderHook(() => useAllBuyers([], [], []))

      expect(result.current).toEqual([])
    })

    it('should remove duplicates', () => {
      const duplicateSales = [
        { ...mockSales[0] },
        { ...mockSales[0], id: 'sale3' }
      ]
      const { result } = renderHook(() => useAllBuyers(duplicateSales, mockStandaloneCredits, mockPayments))

      // Should only include unique buyers, sorted alphabetically
      expect(result.current).toEqual(['Kashem', 'Shohag', 'ZAKIR MOTORS'])
    })
  })

  describe('useActiveBuyers', () => {
    it('should return only buyers with active sales, credits, or outstanding balances', () => {
      const { result } = renderHook(() => useActiveBuyers(mockSales, mockStandaloneCredits, mockPayments))

      // Should include: ZAKIR MOTORS (has sales), Shohag (has standalone credit), Kashem (has standalone credit), Test Buyer 1 (has sales)
      // The hook includes ALL buyers with sales records, regardless of credit
      // Results are sorted alphabetically
      expect(result.current).toEqual(['Kashem', 'Shohag', 'Test Buyer 1', 'ZAKIR MOTORS'])
    })

    it('should include buyers with outstanding credit even if no recent activity', () => {
      const { result } = renderHook(() => useActiveBuyers([], mockStandaloneCredits, []))

      // Results are sorted alphabetically
      expect(result.current).toEqual(['Kashem', 'Shohag'])
    })
  })

  describe('useOutstandingCredit', () => {
    it('should calculate outstanding credit correctly', () => {
      const { result } = renderHook(() => useOutstandingCredit(mockSales, mockStandaloneCredits, mockPayments))

      const creditMap = result.current

      // ZAKIR MOTORS: 1000 (credit from sale) - 500 (payment) = 500
      expect(creditMap.get('ZAKIR MOTORS')).toBe(500)
      
      // Shohag: 20000 (standalone credit) - 0 (no payments) = 20000
      expect(creditMap.get('Shohag')).toBe(20000)
      
      // Kashem: 5000 (standalone credit) - 0 (no payments) = 5000
      expect(creditMap.get('Kashem')).toBe(5000)
      
      // Test Buyer 1: not in map (no credit)
      expect(creditMap.get('Test Buyer 1')).toBeUndefined()
    })

    it('should handle negative credit (overpayment)', () => {
      const overpayment: Payment[] = [
        {
          id: 'payment2',
          buyerName: 'ZAKIR MOTORS',
          amount: 2000,
          date: '2024-01-04',
          description: 'Overpayment'
        }
      ]
      const { result } = renderHook(() => useOutstandingCredit(mockSales, mockStandaloneCredits, overpayment))

      // ZAKIR MOTORS: 1000 (credit) - 2000 (overpayment) = 0 (ensureNonNegative prevents negative)
      expect(result.current.get('ZAKIR MOTORS')).toBe(0)
    })
  })

  describe('useBuyersWithCredit', () => {
    it('should return only buyers with outstanding credit', () => {
      const { result } = renderHook(() => useBuyersWithCredit(mockSales, mockStandaloneCredits, mockPayments))

      // Returns objects with name and amount, sorted alphabetically
      expect(result.current).toEqual([
        { name: 'Kashem', amount: 5000 },
        { name: 'Shohag', amount: 20000 },
        { name: 'ZAKIR MOTORS', amount: 500 }
      ])
    })

    it('should exclude buyers with zero or negative credit', () => {
      const { result } = renderHook(() => useBuyersWithCredit([], [], []))

      expect(result.current).toEqual([])
    })
  })
}) 