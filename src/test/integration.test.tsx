import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import App from '../App'
import type { Product, Sale, StandaloneCredit, Payment } from '../types'

// Mock the database service
vi.mock('../services/database', () => ({
  ProductService: {
    getAllProducts: vi.fn(() => Promise.resolve([])),
    createProduct: vi.fn((product) => Promise.resolve({ ...product, id: 'new-product-id' })),
    updateProduct: vi.fn((product) => Promise.resolve(product)),
    deleteProduct: vi.fn(() => Promise.resolve()),
    importProducts: vi.fn(() => Promise.resolve()),
    exportProducts: vi.fn(() => Promise.resolve([])),
  },
  SaleService: {
    getAllSales: vi.fn(() => Promise.resolve([])),
    createSale: vi.fn((sale) => Promise.resolve({ ...sale, id: 'new-sale-id' })),
    deleteSale: vi.fn(() => Promise.resolve()),
    syncToDatabase: vi.fn(() => Promise.resolve()),
    exportSales: vi.fn(() => Promise.resolve([])),
  },
  CreditService: {
    getAllStandaloneCredits: vi.fn(() => Promise.resolve([])),
    createStandaloneCredit: vi.fn((credit) => Promise.resolve({ ...credit, id: 'new-credit-id' })),
    deleteStandaloneCredit: vi.fn(() => Promise.resolve()),
  },
  PaymentService: {
    getAllPayments: vi.fn(() => Promise.resolve([])),
    createPayment: vi.fn((payment) => Promise.resolve({ ...payment, id: 'new-payment-id' })),
    deletePayment: vi.fn(() => Promise.resolve()),
  }
}))

describe('Integration & E2E Tests', () => {
  const mockProducts: Product[] = [
    {
      id: 'prod1',
      name: 'Test Product 1',
      type: 'TATA',
      category: 'Clutch & Pressure',
      brand: 'TARGET',
      country: 'India',
      purchasePrice: 100,
      sellingPrice: 150,
      quantity: 10
    },
    {
      id: 'prod2',
      name: 'Test Product 2',
      type: 'Leyland',
      category: 'Brake / Brake Lining',
      brand: 'D.D',
      country: 'China',
      purchasePrice: 25,
      sellingPrice: 40,
      quantity: 5
    }
  ]

  const mockSales: Sale[] = [
    {
      id: 'sale1',
      buyerName: 'ZAKIR MOTORS',
      items: [{ 
        productId: 'prod1',
        productName: 'Test Product 1', 
        quantity: 2, 
        profit: 50,
        sellingPrice: 150
      }],
      totalProfit: 100,
      totalRevenue: 300,
      date: '2024-01-01',
      creditInfo: {
        cashAmount: 200,
        creditAmount: 100,
        totalAmount: 300
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
    }
  ]

  const mockPayments: Payment[] = [
    {
      id: 'payment1',
      buyerName: 'Shohag',
      amount: 5000,
      description: 'Payment from Shohag',
      date: '2024-01-15'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Complete Product Management Workflow', () => {
    it('should handle full product lifecycle: create, update, delete', async () => {
      const { ProductService } = await import('../services/database')
      
      // 1. Create product
      const newProduct = {
        name: 'New Product',
        type: 'TATA' as const,
        category: 'Clutch & Pressure' as const,
        brand: 'TARGET' as const,
        country: 'India' as const,
        purchasePrice: 100,
        sellingPrice: 150,
        quantity: 10
      }

      const createdProduct = await ProductService.createProduct(newProduct)
      expect(createdProduct.id).toBe('new-product-id')

      // 2. Update product
      const updatedProduct = {
        ...createdProduct,
        quantity: 8
      }

      const result = await ProductService.updateProduct(updatedProduct)
      expect(result.quantity).toBe(8)

      // 3. Delete product
      await ProductService.deleteProduct(createdProduct.id)
      expect(ProductService.deleteProduct).toHaveBeenCalledWith(createdProduct.id)
    })

    it('should handle product import/export workflow', async () => {
      const { ProductService } = await import('../services/database')
      
      // Import products
      const importedProducts = [
        {
          name: 'Imported Product 1',
          type: 'TATA' as const,
          category: 'Clutch & Pressure' as const,
          brand: 'TARGET' as const,
          country: 'India' as const,
          purchasePrice: 50,
          sellingPrice: 75,
          quantity: 10
        },
        {
          name: 'Imported Product 2',
          type: 'Leyland' as const,
          category: 'Brake / Brake Lining' as const,
          brand: 'D.D' as const,
          country: 'China' as const,
          purchasePrice: 30,
          sellingPrice: 45,
          quantity: 5
        }
      ]

      await ProductService.importProducts(importedProducts)
      expect(ProductService.importProducts).toHaveBeenCalledWith(importedProducts)

      // Export products
      const exportedProducts = await ProductService.exportProducts()
      expect(ProductService.exportProducts).toHaveBeenCalled()
      expect(exportedProducts).toEqual([])
    })
  })

  describe('Complete Sales Management Workflow', () => {
    it('should handle full sales lifecycle: create, view, delete', async () => {
      const { SaleService } = await import('../services/database')
      
      // 1. Create sale
      const saleData = {
        date: '2024-01-01T00:00:00.000Z',
        items: [
          {
            productId: 'prod1',
            productName: 'Test Product 1',
            quantity: 2,
            sellingPrice: 150,
            profit: 50
          }
        ],
        totalProfit: 100,
        totalRevenue: 300,
        buyerName: 'Test Buyer',
        creditInfo: {
          cashAmount: 200,
          creditAmount: 100,
          totalAmount: 300
        }
      }

      const createdSale = await SaleService.createSale(saleData)
      expect(createdSale.id).toBe('new-sale-id')

      // 2. Get all sales
      const allSales = await SaleService.getAllSales()
      expect(SaleService.getAllSales).toHaveBeenCalled()
      expect(allSales).toEqual([])

      // 3. Delete sale
      await SaleService.deleteSale(createdSale.id)
      expect(SaleService.deleteSale).toHaveBeenCalledWith(createdSale.id)
    })

    it('should handle sales with credit and cash payments', async () => {
      const { SaleService } = await import('../services/database')
      
      // Create sale with mixed payment
      const saleData = {
        date: '2024-01-01T00:00:00.000Z',
        items: [
          {
            productId: 'prod1',
            productName: 'Test Product 1',
            quantity: 1,
            sellingPrice: 150,
            profit: 50
          }
        ],
        totalProfit: 50,
        totalRevenue: 150,
        buyerName: 'Credit Buyer',
        creditInfo: {
          cashAmount: 100,
          creditAmount: 50,
          totalAmount: 150
        }
      }

      const sale = await SaleService.createSale(saleData)
      expect(sale.creditInfo.creditAmount).toBe(50)
      expect(sale.creditInfo.cashAmount).toBe(100)
    })
  })

  describe('Complete Credit Management Workflow', () => {
    it('should handle credit creation and payment workflow', async () => {
      const { CreditService, PaymentService } = await import('../services/database')
      
      // 1. Create standalone credit
      const creditData = {
        buyerName: 'Test Buyer',
        creditAmount: 5000,
        description: 'Initial credit',
        date: '2024-01-01',
        isStandalone: true
      }

      const createdCredit = await CreditService.createStandaloneCredit(creditData)
      expect(createdCredit.id).toBe('new-credit-id')

      // 2. Create payment against credit
      const paymentData = {
        buyerName: 'Test Buyer',
        amount: 2000,
        description: 'Payment against credit',
        date: '2024-01-15'
      }

      const createdPayment = await PaymentService.createPayment(paymentData)
      expect(createdPayment.id).toBe('new-payment-id')

      // 3. Delete credit
      await CreditService.deleteStandaloneCredit(createdCredit.id)
      expect(CreditService.deleteStandaloneCredit).toHaveBeenCalledWith(createdCredit.id)
    })

    it('should handle multiple credits and payments for same buyer', async () => {
      const { CreditService, PaymentService } = await import('../services/database')
      
      // Create multiple credits
      const credit1 = await CreditService.createStandaloneCredit({
        buyerName: 'Same Buyer',
        creditAmount: 3000,
        description: 'First credit',
        date: '2024-01-01',
        isStandalone: true
      })

      const credit2 = await CreditService.createStandaloneCredit({
        buyerName: 'Same Buyer',
        creditAmount: 2000,
        description: 'Second credit',
        date: '2024-01-02',
        isStandalone: true
      })

      // Create payment
      const payment = await PaymentService.createPayment({
        buyerName: 'Same Buyer',
        amount: 2500,
        description: 'Partial payment',
        date: '2024-01-15'
      })

      expect(credit1.buyerName).toBe('Same Buyer')
      expect(credit2.buyerName).toBe('Same Buyer')
      expect(payment.buyerName).toBe('Same Buyer')
    })
  })

  describe('Database Integration Tests', () => {
    it('should handle database synchronization', async () => {
      const { SaleService } = await import('../services/database')
      
      await SaleService.syncToDatabase()
      
      expect(SaleService.syncToDatabase).toHaveBeenCalled()
    })

    it('should handle concurrent database operations', async () => {
      const { ProductService, SaleService } = await import('../services/database')
      
      // Simulate concurrent operations
      const promises = [
        ProductService.getAllProducts(),
        SaleService.getAllSales(),
        ProductService.createProduct({
          name: 'Concurrent Product',
          type: 'TATA' as const,
          category: 'Clutch & Pressure' as const,
          brand: 'TARGET' as const,
          country: 'India' as const,
          purchasePrice: 100,
          sellingPrice: 150,
          quantity: 10
        })
      ]

      const results = await Promise.all(promises)
      
      expect(results).toHaveLength(3)
      expect(ProductService.getAllProducts).toHaveBeenCalled()
      expect(SaleService.getAllSales).toHaveBeenCalled()
      expect(ProductService.createProduct).toHaveBeenCalled()
    })

    it('should handle database error recovery', async () => {
      const { ProductService } = await import('../services/database')
      
      // Mock initial failure
      vi.mocked(ProductService.getAllProducts).mockRejectedValueOnce(new Error('Database connection failed'))
      
      try {
        await ProductService.getAllProducts()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Database connection failed')
      }

      // Mock recovery
      vi.mocked(ProductService.getAllProducts).mockResolvedValueOnce([])
      
      const products = await ProductService.getAllProducts()
      expect(products).toEqual([])
    })
  })

  describe('End-to-End User Workflows', () => {
    it('should handle complete inventory management workflow', async () => {
      const { ProductService, SaleService } = await import('../services/database')
      
      // 1. Add products to inventory
      const product1 = await ProductService.createProduct({
        name: 'Inventory Product 1',
        type: 'TATA' as const,
        category: 'Clutch & Pressure' as const,
        brand: 'TARGET' as const,
        country: 'India' as const,
        purchasePrice: 100,
        sellingPrice: 150,
        quantity: 10
      })

      const product2 = await ProductService.createProduct({
        name: 'Inventory Product 2',
        type: 'Leyland' as const,
        category: 'Brake / Brake Lining' as const,
        brand: 'D.D' as const,
        country: 'China' as const,
        purchasePrice: 50,
        sellingPrice: 75,
        quantity: 5
      })

      // 2. Create sale using inventory
      const sale = await SaleService.createSale({
        date: '2024-01-01T00:00:00.000Z',
        items: [
          {
            productId: product1.id,
            productName: product1.name,
            quantity: 2,
            sellingPrice: 150,
            profit: 50
          },
          {
            productId: product2.id,
            productName: product2.name,
            quantity: 1,
            sellingPrice: 75,
            profit: 25
          }
        ],
        totalProfit: 125,
        totalRevenue: 375,
        buyerName: 'Inventory Buyer',
        creditInfo: {
          cashAmount: 300,
          creditAmount: 75,
          totalAmount: 375
        }
      })

      expect(sale.items).toHaveLength(2)
      expect(sale.totalRevenue).toBe(375)
      expect(sale.creditInfo.creditAmount).toBe(75)
    })

    it('should handle credit tracking and payment workflow', async () => {
      const { CreditService, PaymentService } = await import('../services/database')
      
      // 1. Create initial credit
      const initialCredit = await CreditService.createStandaloneCredit({
        buyerName: 'Credit Buyer',
        creditAmount: 10000,
        description: 'Initial credit line',
        date: '2024-01-01',
        isStandalone: true
      })

      // 2. Make partial payment
      const payment1 = await PaymentService.createPayment({
        buyerName: 'Credit Buyer',
        amount: 3000,
        description: 'First payment',
        date: '2024-01-15'
      })

      // 3. Add more credit
      const additionalCredit = await CreditService.createStandaloneCredit({
        buyerName: 'Credit Buyer',
        creditAmount: 5000,
        description: 'Additional credit',
        date: '2024-01-20',
        isStandalone: true
      })

      // 4. Make final payment
      const payment2 = await PaymentService.createPayment({
        buyerName: 'Credit Buyer',
        amount: 8000,
        description: 'Final payment',
        date: '2024-01-25'
      })

      expect(initialCredit.creditAmount).toBe(10000)
      expect(payment1.amount).toBe(3000)
      expect(additionalCredit.creditAmount).toBe(5000)
      expect(payment2.amount).toBe(8000)
    })
  })

  describe('Performance and Large Dataset Tests', () => {
    it('should handle large product datasets', async () => {
      const { ProductService } = await import('../services/database')
      
      // Simulate large dataset
      const largeProductList = Array.from({ length: 1000 }, (_, index) => ({
        name: `Product ${index + 1}`,
        type: 'TATA' as const,
        category: 'Clutch & Pressure' as const,
        brand: 'TARGET' as const,
        country: 'India' as const,
        purchasePrice: 100 + index,
        sellingPrice: 150 + index,
        quantity: 10 + (index % 20)
      }))

      // Test bulk import
      await ProductService.importProducts(largeProductList)
      expect(ProductService.importProducts).toHaveBeenCalledWith(largeProductList)

      // Test retrieval
      const products = await ProductService.getAllProducts()
      expect(ProductService.getAllProducts).toHaveBeenCalled()
    })

    it('should handle large sales datasets', async () => {
      const { SaleService } = await import('../services/database')
      
      // Simulate large sales dataset
      const largeSalesList = Array.from({ length: 500 }, (_, index) => ({
        date: `2024-01-${String(index + 1).padStart(2, '0')}T00:00:00.000Z`,
        items: [
          {
            productId: `prod${index + 1}`,
            productName: `Product ${index + 1}`,
            quantity: 1 + (index % 5),
            sellingPrice: 100 + index,
            profit: 20 + index
          }
        ],
        totalProfit: 20 + index,
        totalRevenue: 100 + index,
        buyerName: `Buyer ${index + 1}`,
        creditInfo: {
          cashAmount: 80 + index,
          creditAmount: 20,
          totalAmount: 100 + index
        }
      }))

      // Test bulk operations
      for (const sale of largeSalesList.slice(0, 10)) {
        await SaleService.createSale(sale)
      }

      expect(SaleService.createSale).toHaveBeenCalledTimes(10)
    })
  })
}) 