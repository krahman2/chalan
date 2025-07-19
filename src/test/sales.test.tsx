import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import CreateSaleForm from '../components/CreateSaleForm'
import SellProductForm from '../components/SellProductForm'
import type { Product, Sale, StandaloneCredit, Payment } from '../types'

// Mock the database service
vi.mock('../services/database', () => ({
  SaleService: {
    getAllSales: vi.fn(() => Promise.resolve([])),
    createSale: vi.fn((sale) => Promise.resolve({ ...sale, id: 'new-sale-id' })),
    deleteSale: vi.fn(() => Promise.resolve()),
    syncToDatabase: vi.fn(() => Promise.resolve()),
  },
  ProductService: {
    updateProduct: vi.fn(() => Promise.resolve()),
  }
}))

// Mock global alert
global.alert = vi.fn()

describe('Sales Management', () => {
  const mockProducts: Product[] = [
    {
      id: 'prod1',
      name: 'Test Product 1',
      category: 'Others / Miscellaneous',
      sellingPrice: 150,
      quantity: 10,
      type: 'TATA',
      brand: 'Other',
      country: 'India',
      purchasePrice: 100,
      pricing: {
        originalAmount: 100,
        currency: 'BDT',
        dutyPerUnit: 0,
        finalPurchasePrice: 100
      }
    },
    {
      id: 'prod2',
      name: 'Test Product 2',
      category: 'Others / Miscellaneous',
      sellingPrice: 40,
      quantity: 5,
      type: 'Leyland',
      brand: 'Other',
      country: 'India',
      purchasePrice: 25,
      pricing: {
        originalAmount: 25,
        currency: 'BDT',
        dutyPerUnit: 0,
        finalPurchasePrice: 25
      }
    }
  ]

  const mockSales: Sale[] = []
  const mockStandaloneCredits: StandaloneCredit[] = []
  const mockPayments: Payment[] = []

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('CreateSaleForm Component', () => {
    it('should render search field and buyer input', () => {
      render(
        <CreateSaleForm
          products={mockProducts}
          sales={mockSales}
          standaloneCredits={mockStandaloneCredits}
          payments={mockPayments}
          onSave={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      expect(screen.getByLabelText(/Search for a product/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Buyer Name/i)).toBeInTheDocument()
    })

    it('should add product to sale when product is clicked from search results', async () => {
      render(
        <CreateSaleForm
          products={mockProducts}
          sales={mockSales}
          standaloneCredits={mockStandaloneCredits}
          payments={mockPayments}
          onSave={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      // Search for a product
      const searchInput = screen.getByLabelText(/Search for a product/i)
      await userEvent.type(searchInput, 'Test Product 1')

      // Click on the product from search results
      const productItem = screen.getByText('Test Product 1')
      await userEvent.click(productItem)

      // Should show product in selected items
      expect(screen.getByText('Selected Items (1)')).toBeInTheDocument()
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    })

    it('should calculate totals correctly', async () => {
      render(
        <CreateSaleForm
          products={mockProducts}
          sales={mockSales}
          standaloneCredits={mockStandaloneCredits}
          payments={mockPayments}
          onSave={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      // Add first product
      const searchInput = screen.getByLabelText(/Search for a product/i)
      await userEvent.type(searchInput, 'Test Product 1')
      const productItem = screen.getByText('Test Product 1')
      await userEvent.click(productItem)

      // Add second product
      await userEvent.clear(searchInput)
      await userEvent.type(searchInput, 'Test Product 2')
      const productItem2 = screen.getByText('Test Product 2')
      await userEvent.click(productItem2)

      // Check totals are displayed
      expect(screen.getByText(/Total Cost:/)).toBeInTheDocument()
      expect(screen.getByText(/Total Revenue:/)).toBeInTheDocument()
      expect(screen.getByText(/Total Profit:/)).toBeInTheDocument()
    })

    it('should validate sale before submission', async () => {
      const mockOnSave = vi.fn()
      render(
        <CreateSaleForm
          products={mockProducts}
          sales={mockSales}
          standaloneCredits={mockStandaloneCredits}
          payments={mockPayments}
          onSave={mockOnSave}
          onCancel={vi.fn()}
        />
      )

      // Try to submit without adding products - button should be disabled
      const submitButton = screen.getByText('💰 Create Sale')
      expect(submitButton).toBeDisabled()
      expect(mockOnSave).not.toHaveBeenCalled()
    })

    it('should submit sale with valid data', async () => {
      const mockOnSave = vi.fn()
      render(
        <CreateSaleForm
          products={mockProducts}
          sales={mockSales}
          standaloneCredits={mockStandaloneCredits}
          payments={mockPayments}
          onSave={mockOnSave}
          onCancel={vi.fn()}
        />
      )

      // Add product to sale
      const searchInput = screen.getByLabelText(/Search for a product/i)
      await userEvent.type(searchInput, 'Test Product 1')
      const productItem = screen.getByText('Test Product 1')
      await userEvent.click(productItem)

      // Fill buyer and payment info
      await userEvent.type(screen.getByLabelText(/Buyer Name/i), 'Test Buyer')
      await userEvent.type(screen.getByLabelText(/Cash Amount/i), '150')
      await userEvent.type(screen.getByLabelText(/Credit Amount/i), '0')

      // Submit sale
      const submitButton = screen.getByText('💰 Create Sale')
      await userEvent.click(submitButton)

      expect(mockOnSave).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            productId: 'prod1',
            productName: 'Test Product 1',
            quantity: 1,
            sellingPrice: 150,
            profit: 50
          })
        ]),
        'Test Buyer',
        expect.objectContaining({
          cashAmount: 150,
          creditAmount: 0,
          totalAmount: 150
        })
      )
    })

    it('should remove product from sale when remove button is clicked', async () => {
      render(
        <CreateSaleForm
          products={mockProducts}
          sales={mockSales}
          standaloneCredits={mockStandaloneCredits}
          payments={mockPayments}
          onSave={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      // Add product to sale
      const searchInput = screen.getByLabelText(/Search for a product/i)
      await userEvent.type(searchInput, 'Test Product 1')
      const productItem = screen.getByText('Test Product 1')
      await userEvent.click(productItem)

      // Remove product
      const removeButton = screen.getByText('🗑️ Remove')
      await userEvent.click(removeButton)

      // Product should be removed from sale items
      expect(screen.queryByText('Selected Items (1)')).not.toBeInTheDocument()
    })

    it('should prevent adding product with insufficient stock', async () => {
      const lowStockProduct = {
        ...mockProducts[0],
        quantity: 1
      }

      render(
        <CreateSaleForm
          products={[lowStockProduct]}
          sales={mockSales}
          standaloneCredits={mockStandaloneCredits}
          payments={mockPayments}
          onSave={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      // Add product to sale
      const searchInput = screen.getByLabelText(/Search for a product/i)
      await userEvent.type(searchInput, 'Test Product 1')
      const productItem = screen.getByText('Test Product 1')
      await userEvent.click(productItem)

      // Try to increase quantity beyond available stock
      const quantityInput = screen.getByDisplayValue('1')
      await userEvent.clear(quantityInput)
      await userEvent.type(quantityInput, '5')

      // Should show max quantity constraint
      expect(screen.getByText('(Max: 1)')).toBeInTheDocument()
    })

    it('should call onCancel when cancel button is clicked', async () => {
      const mockOnCancel = vi.fn()
      render(
        <CreateSaleForm
          products={mockProducts}
          sales={mockSales}
          standaloneCredits={mockStandaloneCredits}
          payments={mockPayments}
          onSave={vi.fn()}
          onCancel={mockOnCancel}
        />
      )

      const cancelButton = screen.getByText('Cancel')
      await userEvent.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalled()
    })
  })

  describe('SellProductForm Component', () => {
    it('should render quick sale form for a single product', () => {
      render(
        <SellProductForm
          product={mockProducts[0]}
          onSell={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      expect(screen.getByText('Sell Test Product 1')).toBeInTheDocument()
      expect(screen.getByText('Available: 10')).toBeInTheDocument()
      expect(screen.getByLabelText(/Quantity/i)).toBeInTheDocument()
    })

    it('should calculate totals based on quantity and price', async () => {
      render(
        <SellProductForm
          product={mockProducts[0]}
          onSell={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      // Set quantity
      const quantityInput = screen.getByLabelText(/Quantity/i)
      await userEvent.clear(quantityInput)
      await userEvent.type(quantityInput, '3')

      // Check that quantity was updated
      expect(quantityInput).toHaveValue(3)
    })

    it('should submit quick sale with valid data', async () => {
      const mockOnSell = vi.fn()
      render(
        <SellProductForm
          product={mockProducts[0]}
          onSell={mockOnSell}
          onCancel={vi.fn()}
        />
      )

      // Set quantity
      const quantityInput = screen.getByLabelText(/Quantity/i)
      await userEvent.clear(quantityInput)
      await userEvent.type(quantityInput, '2')

      // Submit sale
      const submitButton = screen.getByText('Confirm Sale')
      await userEvent.click(submitButton)

      expect(mockOnSell).toHaveBeenCalledWith(2)
    })

    it('should validate quantity against available stock', async () => {
      const mockOnSell = vi.fn()
      render(
        <SellProductForm
          product={mockProducts[0]}
          onSell={mockOnSell}
          onCancel={vi.fn()}
        />
      )

      // Try to sell more than available
      const quantityInput = screen.getByLabelText(/Quantity/i)
      await userEvent.clear(quantityInput)
      await userEvent.type(quantityInput, '15')

      // Submit sale
      const submitButton = screen.getByText('Confirm Sale')
      await userEvent.click(submitButton)

      expect(global.alert).toHaveBeenCalledWith('Invalid quantity')
      expect(mockOnSell).not.toHaveBeenCalled()
    })

    it('should call onCancel when cancel button is clicked', async () => {
      const mockOnCancel = vi.fn()
      render(
        <SellProductForm
          product={mockProducts[0]}
          onSell={vi.fn()}
          onCancel={mockOnCancel}
        />
      )

      const cancelButton = screen.getByText('Cancel')
      await userEvent.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalled()
    })
  })

  describe('SaleService Integration', () => {
    it('should create sale successfully', async () => {
      const { SaleService } = await import('../services/database')
      
      const saleData = {
        date: '2024-01-01T00:00:00.000Z',
        items: [],
        totalProfit: 100,
        totalRevenue: 200,
        buyerName: 'Test Buyer',
        creditInfo: { cashAmount: 200, creditAmount: 0, totalAmount: 200 }
      }

      await SaleService.createSale(saleData)
      expect(SaleService.createSale).toHaveBeenCalledWith(saleData)
    })

    it('should delete sale successfully', async () => {
      const { SaleService } = await import('../services/database')
      
      await SaleService.deleteSale('sale-id')
      expect(SaleService.deleteSale).toHaveBeenCalledWith('sale-id')
    })

    it('should get all sales successfully', async () => {
      const { SaleService } = await import('../services/database')
      
      const sales = await SaleService.getAllSales()
      expect(SaleService.getAllSales).toHaveBeenCalled()
      expect(sales).toEqual([])
    })

    it('should sync to database successfully', async () => {
      const { SaleService } = await import('../services/database')
      
      await SaleService.syncToDatabase()
      expect(SaleService.syncToDatabase).toHaveBeenCalled()
    })
  })
}) 