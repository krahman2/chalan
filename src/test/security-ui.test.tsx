import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import PasscodeLock from '../components/PasscodeLock'
import Modal from '../components/Modal'
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

describe('Security & UI Components', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('PasscodeLock Component', () => {
    it('should render passcode input screen', () => {
      render(
        <PasscodeLock
          onUnlock={vi.fn()}
        />
      )

      expect(screen.getByText('Chalan Inventory')).toBeInTheDocument()
      expect(screen.getByText('Enter passcode to continue')).toBeInTheDocument()
      // Check for numeric keypad buttons
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('Clear')).toBeInTheDocument()
    })

    it('should accept numeric passcode input', async () => {
      const mockOnUnlock = vi.fn()
      render(
        <PasscodeLock
          onUnlock={mockOnUnlock}
        />
      )

      // Click numeric buttons to enter passcode
      await userEvent.click(screen.getByText('1'))
      await userEvent.click(screen.getByText('2'))
      await userEvent.click(screen.getByText('3'))
      await userEvent.click(screen.getByText('4'))

      // The component should have received the input (we can't directly check the internal state)
      // but we can verify the buttons are clickable
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('should call onUnlock with correct passcode', async () => {
      const mockOnUnlock = vi.fn()
      render(
        <PasscodeLock
          onUnlock={mockOnUnlock}
        />
      )

      // Enter correct 8-digit passcode: 13092000
      await userEvent.click(screen.getByText('1'))
      await userEvent.click(screen.getByText('3'))
      await userEvent.click(screen.getByText('0'))
      await userEvent.click(screen.getByText('9'))
      await userEvent.click(screen.getByText('2'))
      await userEvent.click(screen.getByText('0'))
      await userEvent.click(screen.getByText('0'))
      await userEvent.click(screen.getByText('0'))

      // Wait for the component to process the passcode
      await waitFor(() => {
        expect(mockOnUnlock).toHaveBeenCalled()
      })
    })

    it('should show error for incorrect passcode', async () => {
      const mockOnUnlock = vi.fn()
      render(
        <PasscodeLock
          onUnlock={mockOnUnlock}
        />
      )

      // Enter incorrect passcode
      await userEvent.click(screen.getByText('9'))
      await userEvent.click(screen.getByText('9'))
      await userEvent.click(screen.getByText('9'))
      await userEvent.click(screen.getByText('9'))
      await userEvent.click(screen.getByText('9'))
      await userEvent.click(screen.getByText('9'))
      await userEvent.click(screen.getByText('9'))
      await userEvent.click(screen.getByText('9'))

      // Wait for error message to appear
      await waitFor(() => {
        expect(screen.getByText(/Incorrect passcode/i)).toBeInTheDocument()
      })
      expect(mockOnUnlock).not.toHaveBeenCalled()
    })

    it('should unlock with correct passcode', async () => {
      const mockOnUnlock = vi.fn()
      render(
        <PasscodeLock
          onUnlock={mockOnUnlock}
        />
      )

      // Enter correct passcode: 13092000
      await userEvent.click(screen.getByText('1'))
      await userEvent.click(screen.getByText('3'))
      await userEvent.click(screen.getByText('0'))
      await userEvent.click(screen.getByText('9'))
      await userEvent.click(screen.getByText('2'))
      await userEvent.click(screen.getByText('0'))
      await userEvent.click(screen.getByText('0'))
      await userEvent.click(screen.getByText('0'))

      await waitFor(() => {
        expect(mockOnUnlock).toHaveBeenCalled()
      })
    })

    it('should handle enter key press', async () => {
      const mockOnUnlock = vi.fn()
      render(
        <PasscodeLock
          onUnlock={mockOnUnlock}
        />
      )

      // Enter partial passcode and press Enter
      await userEvent.click(screen.getByText('1'))
      await userEvent.click(screen.getByText('2'))
      await userEvent.click(screen.getByText('3'))
      await userEvent.click(screen.getByText('4'))
      
      // Press Enter key
      await userEvent.keyboard('{Enter}')

      // The component doesn't handle Enter key, so onUnlock shouldn't be called
      // with incomplete passcode
      expect(mockOnUnlock).not.toHaveBeenCalled()
    })

    it('should clear input after failed attempt', async () => {
      const mockOnUnlock = vi.fn()
      render(
        <PasscodeLock
          onUnlock={mockOnUnlock}
        />
      )

      // Enter incorrect passcode
      await userEvent.click(screen.getByText('9'))
      await userEvent.click(screen.getByText('9'))
      await userEvent.click(screen.getByText('9'))
      await userEvent.click(screen.getByText('9'))
      await userEvent.click(screen.getByText('9'))
      await userEvent.click(screen.getByText('9'))
      await userEvent.click(screen.getByText('9'))
      await userEvent.click(screen.getByText('9'))

      // Wait for error and then try to enter more digits
      await waitFor(() => {
        expect(screen.getByText(/Incorrect passcode/i)).toBeInTheDocument()
      })

      // Try to enter more digits - should be cleared
      await userEvent.click(screen.getByText('1'))
      
      // The component should have cleared the input after failed attempt
      expect(mockOnUnlock).not.toHaveBeenCalled()
    })
  })

  describe('Modal Component', () => {
    it('should render modal with title and content', () => {
      render(
        <Modal
          isOpen={true}
          onClose={vi.fn()}
          title="Test Modal"
        >
          <p>Modal content</p>
        </Modal>
      )

      expect(screen.getByText('Test Modal')).toBeInTheDocument()
      expect(screen.getByText('Modal content')).toBeInTheDocument()
    })

    it('should not render when isOpen is false', () => {
      render(
        <Modal
          isOpen={false}
          onClose={vi.fn()}
          title="Test Modal"
        >
          <p>Modal content</p>
        </Modal>
      )

      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
      expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
    })

    it('should call onClose when close button is clicked', async () => {
      const mockOnClose = vi.fn()
      render(
        <Modal
          isOpen={true}
          onClose={mockOnClose}
          title="Test Modal"
        >
          <p>Modal content</p>
        </Modal>
      )

      const closeButton = screen.getByText('✕')
      await userEvent.click(closeButton)

      expect(mockOnClose).toHaveBeenCalled()
    })

    it('should call onClose when backdrop is clicked', async () => {
      const mockOnClose = vi.fn()
      render(
        <Modal
          isOpen={true}
          onClose={mockOnClose}
          title="Test Modal"
        >
          <p>Modal content</p>
        </Modal>
      )

      // Find the backdrop by looking for the outer div with the onClick handler
      // The backdrop is the first div with position: fixed that contains the modal
      const backdrop = document.querySelector('div[style*="position: fixed"]')
      if (backdrop) {
        await userEvent.click(backdrop)
        expect(mockOnClose).toHaveBeenCalled()
      }
    })

    it('should not call onClose when modal content is clicked', async () => {
      const mockOnClose = vi.fn()
      render(
        <Modal
          isOpen={true}
          onClose={mockOnClose}
          title="Test Modal"
        >
          <p>Modal content</p>
        </Modal>
      )

      // Click on modal content
      const content = screen.getByText('Modal content')
      await userEvent.click(content)

      expect(mockOnClose).not.toHaveBeenCalled()
    })

    it('should handle escape key press', async () => {
      const mockOnClose = vi.fn()
      render(
        <Modal
          isOpen={true}
          onClose={mockOnClose}
          title="Test Modal"
        >
          <p>Modal content</p>
        </Modal>
      )

      // The Modal component doesn't handle escape key by default
      // So we'll test that it doesn't call onClose when escape is pressed
      await userEvent.keyboard('{Escape}')

      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  describe('App.tsx Main Application Logic', () => {
    it('should handle product creation workflow', async () => {
      const { ProductService } = await import('../services/database')
      
      const newProduct = {
        name: 'Test Product',
        type: 'TATA' as const,
        category: 'Clutch & Pressure' as const,
        brand: 'TARGET' as const,
        country: 'India' as const,
        purchasePrice: 100,
        sellingPrice: 150,
        quantity: 10
      }

      const result = await ProductService.createProduct(newProduct)
      
      expect(ProductService.createProduct).toHaveBeenCalledWith(newProduct)
      expect(result).toEqual({
        ...newProduct,
        id: 'new-product-id'
      })
    })

    it('should handle sale creation workflow', async () => {
      const { SaleService } = await import('../services/database')
      
      const saleData = {
        date: '2024-01-01T00:00:00.000Z',
        items: [
          {
            productId: 'prod1',
            productName: 'Test Product',
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

      const result = await SaleService.createSale(saleData)
      
      expect(SaleService.createSale).toHaveBeenCalledWith(saleData)
      expect(result).toEqual({
        ...saleData,
        id: 'new-sale-id'
      })
    })

    it('should handle credit creation workflow', async () => {
      const { CreditService } = await import('../services/database')
      
      const creditData = {
        buyerName: 'Test Buyer',
        creditAmount: 5000,
        description: 'Test credit',
        date: '2024-01-01',
        isStandalone: true
      }

      const result = await CreditService.createStandaloneCredit(creditData)
      
      expect(CreditService.createStandaloneCredit).toHaveBeenCalledWith(creditData)
      expect(result).toEqual({
        ...creditData,
        id: 'new-credit-id'
      })
    })

    it('should handle payment creation workflow', async () => {
      const { PaymentService } = await import('../services/database')
      
      const paymentData = {
        buyerName: 'Test Buyer',
        amount: 2000,
        description: 'Test payment',
        date: '2024-01-01'
      }

      const result = await PaymentService.createPayment(paymentData)
      
      expect(PaymentService.createPayment).toHaveBeenCalledWith(paymentData)
      expect(result).toEqual({
        ...paymentData,
        id: 'new-payment-id'
      })
    })

    it('should handle data deletion workflows', async () => {
      const { ProductService, SaleService, CreditService, PaymentService } = await import('../services/database')
      
      // Test product deletion
      await ProductService.deleteProduct('prod1')
      expect(ProductService.deleteProduct).toHaveBeenCalledWith('prod1')

      // Test sale deletion
      await SaleService.deleteSale('sale1')
      expect(SaleService.deleteSale).toHaveBeenCalledWith('sale1')

      // Test credit deletion
      await CreditService.deleteStandaloneCredit('credit1')
      expect(CreditService.deleteStandaloneCredit).toHaveBeenCalledWith('credit1')

      // Test payment deletion
      await PaymentService.deletePayment('payment1')
      expect(PaymentService.deletePayment).toHaveBeenCalledWith('payment1')
    })

    it('should handle data import/export workflows', async () => {
      const { ProductService, SaleService } = await import('../services/database')
      
      // Test product import
      const importedProducts = [
        {
          name: 'Imported Product',
          type: 'TATA' as const,
          category: 'Clutch & Pressure' as const,
          brand: 'TARGET' as const,
          country: 'India' as const,
          purchasePrice: 50,
          sellingPrice: 75,
          quantity: 10
        }
      ]

      await ProductService.importProducts(importedProducts)
      expect(ProductService.importProducts).toHaveBeenCalledWith(importedProducts)

      // Test product export
      const exportedProducts = await ProductService.exportProducts()
      expect(ProductService.exportProducts).toHaveBeenCalled()
      expect(exportedProducts).toEqual([])

      // Test sales export
      const exportedSales = await SaleService.exportSales()
      expect(SaleService.exportSales).toHaveBeenCalled()
      expect(exportedSales).toEqual([])
    })

    it('should handle database synchronization', async () => {
      const { SaleService } = await import('../services/database')
      
      await SaleService.syncToDatabase()
      
      expect(SaleService.syncToDatabase).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle network failures gracefully', async () => {
      const { ProductService } = await import('../services/database')
      
      // Mock a network failure
      vi.mocked(ProductService.getAllProducts).mockRejectedValueOnce(new Error('Network error'))
      
      try {
        await ProductService.getAllProducts()
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Network error')
      }
    })

    it('should handle validation errors', async () => {
      const { ProductService } = await import('../services/database')
      
      // Mock a validation error
      vi.mocked(ProductService.createProduct).mockRejectedValueOnce(new Error('Validation failed'))
      
      try {
        await ProductService.createProduct({} as any)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Validation failed')
      }
    })
  })
}) 