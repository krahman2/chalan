import { describe, it, expect } from 'vitest'
import { 
  roundToCurrency, 
  multiplyCurrency, 
  addCurrency, 
  subtractCurrency, 
  ensureNonNegative, 
  currencyEquals 
} from '../utils/mathUtils'
import { 
  validateProduct, 
  validateSale, 
  validateStandaloneCredit, 
  validatePayment 
} from '../utils/dataValidation'
import type { Product, SaleItem } from '../types'

describe('Math Utilities', () => {
  describe('roundToCurrency', () => {
    it('should round to 2 decimal places', () => {
      expect(roundToCurrency(123.456)).toBe(123.46)
      expect(roundToCurrency(123.454)).toBe(123.45)
    })

    it('should handle zero and negative values', () => {
      expect(roundToCurrency(0)).toBe(0)
      expect(roundToCurrency(-123.456)).toBe(-123.46)
    })
  })

  describe('multiplyCurrency', () => {
    it('should multiply and round correctly', () => {
      expect(multiplyCurrency(10.5, 3)).toBe(31.5)
      expect(multiplyCurrency(10.555, 2)).toBe(21.11)
    })

    it('should handle zero and negative values', () => {
      expect(multiplyCurrency(10, 0)).toBe(0)
      expect(multiplyCurrency(10, -2)).toBe(-20)
    })
  })

  describe('addCurrency', () => {
    it('should add and round correctly', () => {
      expect(addCurrency(10.5, 20.3)).toBe(30.8)
      expect(addCurrency(10.555, 20.444)).toBe(31.0)
    })

    it('should handle negative values', () => {
      expect(addCurrency(10, -5)).toBe(5)
      expect(addCurrency(-10, -5)).toBe(-15)
    })
  })

  describe('subtractCurrency', () => {
    it('should subtract and round correctly', () => {
      expect(subtractCurrency(20.5, 10.3)).toBe(10.2)
      expect(subtractCurrency(20.555, 10.444)).toBe(10.11)
    })

    it('should handle negative results', () => {
      expect(subtractCurrency(10, 15)).toBe(-5)
    })
  })

  describe('ensureNonNegative', () => {
    it('should return positive values as is', () => {
      expect(ensureNonNegative(10.5)).toBe(10.5)
      expect(ensureNonNegative(0)).toBe(0)
    })

    it('should return 0 for negative values', () => {
      expect(ensureNonNegative(-10.5)).toBe(0)
      expect(ensureNonNegative(-0.01)).toBe(0)
    })
  })

  describe('currencyEquals', () => {
    it('should compare currency values with tolerance', () => {
      expect(currencyEquals(10.5, 10.5)).toBe(true)
      expect(currencyEquals(10.501, 10.5)).toBe(true)
      expect(currencyEquals(10.51, 10.5)).toBe(false)
    })

    it('should handle zero values', () => {
      expect(currencyEquals(0, 0)).toBe(true)
      expect(currencyEquals(0.001, 0)).toBe(true)
    })
  })
})

describe('Data Validation', () => {
  const mockProducts: Product[] = [
    {
      id: 'prod1',
      name: 'Test Product',
      type: 'TATA',
      category: 'Clutch & Pressure',
      brand: 'TARGET',
      country: 'India',
      purchasePrice: 100,
      sellingPrice: 150,
      quantity: 10
    }
  ]

  const validSaleItems: SaleItem[] = [
    {
      productId: 'prod1',
      productName: 'Test Product',
      quantity: 2,
      profit: 50,
      sellingPrice: 150
    }
  ]

  const validCreditInfo = {
    cashAmount: 200,
    creditAmount: 100,
    totalAmount: 300
  }

  const validPayment = {
    buyerName: 'Test Buyer',
    amount: 100,
    date: '2024-01-01',
    description: 'Test payment'
  }

  describe('validateProduct', () => {
    it('should validate a correct product', () => {
      const validProduct = {
        name: 'Test Product',
        type: 'TATA' as const,
        category: 'Clutch & Pressure' as const,
        brand: 'TARGET' as const,
        country: 'India' as const,
        purchasePrice: 100,
        sellingPrice: 150,
        quantity: 10
      }

      const result = validateProduct(validProduct)
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject product with empty name', () => {
      const invalidProduct = {
        name: '',
        type: 'TATA' as const,
        category: 'Clutch & Pressure' as const,
        brand: 'TARGET' as const,
        country: 'India' as const,
        purchasePrice: 100,
        sellingPrice: 150,
        quantity: 10
      }

      const result = validateProduct(invalidProduct)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Product name is required')
    })

    it('should reject product with negative prices', () => {
      const invalidProduct = {
        name: 'Test Product',
        type: 'TATA' as const,
        category: 'Clutch & Pressure' as const,
        brand: 'TARGET' as const,
        country: 'India' as const,
        purchasePrice: -100,
        sellingPrice: 150,
        quantity: 10
      }

      const result = validateProduct(invalidProduct)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Purchase price must be greater than 0')
    })

    it('should reject product with negative quantity', () => {
      const invalidProduct = {
        name: 'Test Product',
        type: 'TATA' as const,
        category: 'Clutch & Pressure' as const,
        brand: 'TARGET' as const,
        country: 'India' as const,
        purchasePrice: 100,
        sellingPrice: 150,
        quantity: -10
      }

      const result = validateProduct(invalidProduct)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Quantity cannot be negative')
    })
  })

  describe('validateSale', () => {
    it('should validate a correct sale', () => {
      const result = validateSale(validSaleItems, 'Test Buyer', validCreditInfo, mockProducts)
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject sale with empty buyer name', () => {
      const result = validateSale(validSaleItems, '', validCreditInfo, mockProducts)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Buyer name is required')
    })

    it('should reject sale with no items', () => {
      const result = validateSale([], 'Test Buyer', validCreditInfo, mockProducts)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('At least one sale item is required')
    })

    it('should reject sale with mismatched total amounts', () => {
      const invalidCreditInfo = {
        cashAmount: 200,
        creditAmount: 100,
        totalAmount: 400 // Should be 300
      }
      const result = validateSale(validSaleItems, 'Test Buyer', invalidCreditInfo, mockProducts)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Total payment must equal total revenue')
    })
  })

  describe('validateStandaloneCredit', () => {
    it('should validate a correct credit', () => {
      const validCredit = {
        buyerName: 'Test Buyer',
        creditAmount: 1000,
        description: 'Test credit',
        date: '2024-01-01',
        isStandalone: true as const
      }

      const result = validateStandaloneCredit(validCredit)
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject credit with empty buyer name', () => {
      const invalidCredit = {
        buyerName: '',
        creditAmount: 1000,
        description: 'Test credit',
        date: '2024-01-01',
        isStandalone: true as const
      }

      const result = validateStandaloneCredit(invalidCredit)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Buyer name is required')
    })

    it('should reject credit with negative amount', () => {
      const invalidCredit = {
        buyerName: 'Test Buyer',
        creditAmount: -1000,
        description: 'Test credit',
        date: '2024-01-01',
        isStandalone: true as const
      }

      const result = validateStandaloneCredit(invalidCredit)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Credit amount must be greater than 0')
    })
  })

  describe('validatePayment', () => {
    it('should validate a correct payment', () => {
      const result = validatePayment(validPayment, 1000)
      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject payment with empty buyer name', () => {
      const invalidPayment = { ...validPayment, buyerName: '' }
      const result = validatePayment(invalidPayment, 1000)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Buyer name is required')
    })

    it('should reject payment exceeding available credit', () => {
      const result = validatePayment(validPayment, 50) // Available credit: 50, payment: 100
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Payment amount (100) exceeds available credit (50)')
    })

    it('should reject payment with negative amount', () => {
      const invalidPayment = { ...validPayment, amount: -100 }
      const result = validatePayment(invalidPayment, 1000)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Payment amount must be greater than 0')
    })
  })
}) 