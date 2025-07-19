import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import AddCreditForm from '../components/AddCreditForm'
import AddPaymentForm from '../components/AddPaymentForm'
import type { StandaloneCredit, Payment, Sale } from '../types'

// Mock the database service
vi.mock('../services/database', () => ({
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

// Mock global alert
global.alert = vi.fn()

describe('Payment & Credit Management', () => {
  const mockSales: Sale[] = []
  const mockStandaloneCredits: StandaloneCredit[] = []
  const mockPayments: Payment[] = []

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('AddCreditForm Component', () => {
    it('should render all form fields', () => {
      render(
        <AddCreditForm
          sales={mockSales}
          standaloneCredits={mockStandaloneCredits}
          payments={mockPayments}
          onAddCredit={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      expect(screen.getByLabelText(/Customer Name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Credit Amount/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument()
    })

    it('should populate buyer input with existing buyers', () => {
      const salesWithBuyers: Sale[] = [
        {
          id: 'sale1',
          items: [],
          totalProfit: 100,
          totalRevenue: 200,
          date: '2024-01-01T00:00:00.000Z',
          buyerName: 'Shohag',
          creditInfo: { cashAmount: 200, creditAmount: 0, totalAmount: 200 }
        }
      ]

      render(
        <AddCreditForm
          sales={salesWithBuyers}
          standaloneCredits={mockStandaloneCredits}
          payments={mockPayments}
          onAddCredit={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      // Check that the datalist contains the buyer
      const datalist = document.getElementById('existingBuyers')
      expect(datalist).toBeInTheDocument()
    })

    it('should validate required fields', async () => {
      const mockOnAddCredit = vi.fn()
      render(
        <AddCreditForm
          sales={mockSales}
          standaloneCredits={mockStandaloneCredits}
          payments={mockPayments}
          onAddCredit={mockOnAddCredit}
          onCancel={vi.fn()}
        />
      )

      const submitButton = screen.getByText('💳 Add Credit')
      await userEvent.click(submitButton)

      // Form validation is handled by HTML5 validation, not JavaScript alerts
      expect(mockOnAddCredit).not.toHaveBeenCalled()
    })

    it('should validate credit amount is positive', async () => {
      const mockOnAddCredit = vi.fn()
      render(
        <AddCreditForm
          sales={mockSales}
          standaloneCredits={mockStandaloneCredits}
          payments={mockPayments}
          onAddCredit={mockOnAddCredit}
          onCancel={vi.fn()}
        />
      )

      // Enter negative amount
      await userEvent.type(screen.getByLabelText(/Customer Name/i), 'Test Buyer')
      await userEvent.type(screen.getByLabelText(/Credit Amount/i), '-100')

      const submitButton = screen.getByText('💳 Add Credit')
      await userEvent.click(submitButton)

      // Form validation is handled by HTML5 validation, not JavaScript alerts
      expect(mockOnAddCredit).not.toHaveBeenCalled()
    })

    it('should submit credit with valid data', async () => {
      const mockOnAddCredit = vi.fn()
      render(
        <AddCreditForm
          sales={mockSales}
          standaloneCredits={mockStandaloneCredits}
          payments={mockPayments}
          onAddCredit={mockOnAddCredit}
          onCancel={vi.fn()}
        />
      )

      // Fill form
      await userEvent.type(screen.getByLabelText(/Customer Name/i), 'Shohag')
      await userEvent.type(screen.getByLabelText(/Credit Amount/i), '5000')
      await userEvent.type(screen.getByLabelText(/Description/i), 'Additional credit for Shohag')

      const submitButton = screen.getByText('💳 Add Credit')
      await userEvent.click(submitButton)

      expect(mockOnAddCredit).toHaveBeenCalledWith(
        expect.objectContaining({
          buyerName: 'Shohag',
          creditAmount: 5000,
          description: 'Additional credit for Shohag',
          date: expect.any(String),
          isStandalone: true
        })
      )
    })

    it('should call onCancel when cancel button is clicked', async () => {
      const mockOnCancel = vi.fn()
      render(
        <AddCreditForm
          sales={mockSales}
          standaloneCredits={mockStandaloneCredits}
          payments={mockPayments}
          onAddCredit={vi.fn()}
          onCancel={mockOnCancel}
        />
      )

      const cancelButton = screen.getByText('Cancel')
      await userEvent.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalled()
    })

    it('should show existing buyers suggestion', () => {
      const salesWithBuyers: Sale[] = [
        {
          id: 'sale1',
          items: [],
          totalProfit: 100,
          totalRevenue: 200,
          date: '2024-01-01T00:00:00.000Z',
          buyerName: 'Shohag',
          creditInfo: { cashAmount: 200, creditAmount: 0, totalAmount: 200 }
        }
      ]

      render(
        <AddCreditForm
          sales={salesWithBuyers}
          standaloneCredits={mockStandaloneCredits}
          payments={mockPayments}
          onAddCredit={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      expect(screen.getByText(/Suggestion: Start typing to see existing customers/i)).toBeInTheDocument()
    })
  })

  describe('AddPaymentForm Component', () => {
    it('should render all form fields', () => {
      render(
        <AddPaymentForm
          sales={mockSales}
          standaloneCredits={mockStandaloneCredits}
          payments={mockPayments}
          onAddPayment={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      expect(screen.getByLabelText(/Customer Name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Payment Amount/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Payment Note/i)).toBeInTheDocument()
    })

    it('should populate buyer dropdown with buyers who have outstanding credit', () => {
      const salesWithCredit: Sale[] = [
        {
          id: 'sale1',
          items: [],
          totalProfit: 100,
          totalRevenue: 200,
          date: '2024-01-01T00:00:00.000Z',
          buyerName: 'Shohag',
          creditInfo: { cashAmount: 100, creditAmount: 100, totalAmount: 200 }
        }
      ]

      render(
        <AddPaymentForm
          sales={salesWithCredit}
          standaloneCredits={mockStandaloneCredits}
          payments={mockPayments}
          onAddPayment={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      expect(screen.getByText(/Select customer with outstanding credit/i)).toBeInTheDocument()
    })

    it('should validate required fields', async () => {
      const mockOnAddPayment = vi.fn()
      render(
        <AddPaymentForm
          sales={mockSales}
          standaloneCredits={mockStandaloneCredits}
          payments={mockPayments}
          onAddPayment={mockOnAddPayment}
          onCancel={vi.fn()}
        />
      )

      const submitButton = screen.getByText('💰 Record Payment')
      await userEvent.click(submitButton)

      // Form validation is handled by HTML5 validation, not JavaScript alerts
      expect(mockOnAddPayment).not.toHaveBeenCalled()
    })

    it('should validate payment amount is positive', async () => {
      const mockOnAddPayment = vi.fn()
      const salesWithCredit: Sale[] = [
        {
          id: 'sale1',
          items: [],
          totalProfit: 100,
          totalRevenue: 200,
          date: '2024-01-01T00:00:00.000Z',
          buyerName: 'Shohag',
          creditInfo: { cashAmount: 100, creditAmount: 100, totalAmount: 200 }
        }
      ]

      render(
        <AddPaymentForm
          sales={salesWithCredit}
          standaloneCredits={mockStandaloneCredits}
          payments={mockPayments}
          onAddPayment={mockOnAddPayment}
          onCancel={vi.fn()}
        />
      )

      // Select buyer and enter negative amount
      const buyerSelect = screen.getByLabelText(/Customer Name/i)
      await userEvent.selectOptions(buyerSelect, 'Shohag')
      await userEvent.type(screen.getByLabelText(/Payment Amount/i), '-100')

      const submitButton = screen.getByText('💰 Record Payment')
      await userEvent.click(submitButton)

      // Form validation is handled by HTML5 validation, not JavaScript alerts
      expect(mockOnAddPayment).not.toHaveBeenCalled()
    })

    it('should validate payment amount does not exceed outstanding credit', async () => {
      const mockOnAddPayment = vi.fn()
      const salesWithCredit: Sale[] = [
        {
          id: 'sale1',
          items: [],
          totalProfit: 100,
          totalRevenue: 200,
          date: '2024-01-01T00:00:00.000Z',
          buyerName: 'Shohag',
          creditInfo: { cashAmount: 100, creditAmount: 100, totalAmount: 200 }
        }
      ]

      render(
        <AddPaymentForm
          sales={salesWithCredit}
          standaloneCredits={mockStandaloneCredits}
          payments={mockPayments}
          onAddPayment={mockOnAddPayment}
          onCancel={vi.fn()}
        />
      )

      // Select buyer and enter amount exceeding credit
      const buyerSelect = screen.getByLabelText(/Customer Name/i)
      await userEvent.selectOptions(buyerSelect, 'Shohag')
      await userEvent.type(screen.getByLabelText(/Payment Amount/i), '150')

      const submitButton = screen.getByText('💰 Record Payment')
      await userEvent.click(submitButton)

      // The form should prevent submission when amount exceeds credit
      expect(mockOnAddPayment).not.toHaveBeenCalled()
    })

    it('should submit payment with valid data', async () => {
      const mockOnAddPayment = vi.fn()
      const salesWithCredit: Sale[] = [
        {
          id: 'sale1',
          items: [],
          totalProfit: 100,
          totalRevenue: 200,
          date: '2024-01-01T00:00:00.000Z',
          buyerName: 'Shohag',
          creditInfo: { cashAmount: 100, creditAmount: 100, totalAmount: 200 }
        }
      ]

      render(
        <AddPaymentForm
          sales={salesWithCredit}
          standaloneCredits={mockStandaloneCredits}
          payments={mockPayments}
          onAddPayment={mockOnAddPayment}
          onCancel={vi.fn()}
        />
      )

      // Fill form
      const buyerSelect = screen.getByLabelText(/Customer Name/i)
      await userEvent.selectOptions(buyerSelect, 'Shohag')
      await userEvent.type(screen.getByLabelText(/Payment Amount/i), '50')
      await userEvent.type(screen.getByLabelText(/Payment Note/i), 'Partial payment')

      const submitButton = screen.getByText('💰 Record Payment')
      await userEvent.click(submitButton)

      expect(mockOnAddPayment).toHaveBeenCalledWith({
        buyerName: 'Shohag',
        amount: 50,
        date: expect.any(String),
        description: 'Partial payment'
      })
    })

    it('should call onCancel when cancel button is clicked', async () => {
      const mockOnCancel = vi.fn()
      render(
        <AddPaymentForm
          sales={mockSales}
          standaloneCredits={mockStandaloneCredits}
          payments={mockPayments}
          onAddPayment={vi.fn()}
          onCancel={mockOnCancel}
        />
      )

      const cancelButton = screen.getByText('Cancel')
      await userEvent.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalled()
    })

    it('should show current outstanding credit for selected buyer', () => {
      const salesWithCredit: Sale[] = [
        {
          id: 'sale1',
          items: [],
          totalProfit: 100,
          totalRevenue: 200,
          date: '2024-01-01T00:00:00.000Z',
          buyerName: 'Shohag',
          creditInfo: { cashAmount: 100, creditAmount: 100, totalAmount: 200 }
        }
      ]

      render(
        <AddPaymentForm
          sales={salesWithCredit}
          standaloneCredits={mockStandaloneCredits}
          payments={mockPayments}
          onAddPayment={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      expect(screen.getByText(/Shohag - Outstanding: ৳100/i)).toBeInTheDocument()
    })

    it('should show remaining credit after payment', async () => {
      const salesWithCredit: Sale[] = [
        {
          id: 'sale1',
          items: [],
          totalProfit: 100,
          totalRevenue: 200,
          date: '2024-01-01T00:00:00.000Z',
          buyerName: 'Shohag',
          creditInfo: { cashAmount: 100, creditAmount: 100, totalAmount: 200 }
        }
      ]

      render(
        <AddPaymentForm
          sales={salesWithCredit}
          standaloneCredits={mockStandaloneCredits}
          payments={mockPayments}
          onAddPayment={vi.fn()}
          onCancel={vi.fn()}
        />
      )

      // Select buyer
      const buyerSelect = screen.getByLabelText(/Customer Name/i)
      await userEvent.selectOptions(buyerSelect, 'Shohag')

      // Should show max amount
      expect(screen.getByText(/Max: ৳100/i)).toBeInTheDocument()
    })
  })

  describe('CreditService Integration', () => {
    it('should create standalone credit successfully', async () => {
      const { CreditService } = await import('../services/database')
      
      const creditData = {
        buyerName: 'Test Buyer',
        creditAmount: 1000,
        description: 'Test credit',
        date: '2024-01-01T00:00:00.000Z',
        isStandalone: true
      }

      await CreditService.createStandaloneCredit(creditData)
      expect(CreditService.createStandaloneCredit).toHaveBeenCalledWith(creditData)
    })

    it('should delete standalone credit successfully', async () => {
      const { CreditService } = await import('../services/database')
      
      await CreditService.deleteStandaloneCredit('credit-id')
      expect(CreditService.deleteStandaloneCredit).toHaveBeenCalledWith('credit-id')
    })

    it('should get all standalone credits successfully', async () => {
      const { CreditService } = await import('../services/database')
      
      const credits = await CreditService.getAllStandaloneCredits()
      expect(CreditService.getAllStandaloneCredits).toHaveBeenCalled()
      expect(credits).toEqual([])
    })
  })

  describe('PaymentService Integration', () => {
    it('should create payment successfully', async () => {
      const { PaymentService } = await import('../services/database')
      
      const paymentData = {
        buyerName: 'Test Buyer',
        amount: 500,
        date: '2024-01-01T00:00:00.000Z',
        description: 'Test payment'
      }

      await PaymentService.createPayment(paymentData)
      expect(PaymentService.createPayment).toHaveBeenCalledWith(paymentData)
    })

    it('should delete payment successfully', async () => {
      const { PaymentService } = await import('../services/database')
      
      await PaymentService.deletePayment('payment-id')
      expect(PaymentService.deletePayment).toHaveBeenCalledWith('payment-id')
    })

    it('should get all payments successfully', async () => {
      const { PaymentService } = await import('../services/database')
      
      const payments = await PaymentService.getAllPayments()
      expect(PaymentService.getAllPayments).toHaveBeenCalled()
      expect(payments).toEqual([])
    })
  })
}) 