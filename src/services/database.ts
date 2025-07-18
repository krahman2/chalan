import { supabase } from '../lib/supabase'
import type { Product, Sale, StandaloneCredit, Payment } from '../types'
import { generateProductId, generateSaleId, generateCreditId, generatePaymentId } from '../utils/idGenerator'
import { safeParseFloat, safeParseInt } from '../utils/mathUtils'

// Helper functions to convert between camelCase and snake_case
const convertProductFromDb = (dbProduct: any): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  type: dbProduct.type,
  category: dbProduct.category,
  brand: dbProduct.brand,
  country: dbProduct.country,
  purchasePrice: safeParseFloat(dbProduct.purchase_price), // Safe precision conversion
  sellingPrice: safeParseFloat(dbProduct.selling_price), // Safe precision conversion
  quantity: safeParseInt(dbProduct.quantity), // Safe integer conversion
  pricing: dbProduct.pricing ? dbProduct.pricing : undefined,
});

const convertProductToDb = (product: Product) => ({
  id: product.id,
  name: product.name,
  type: product.type,
  category: product.category,
  brand: product.brand,
  country: product.country,
  purchase_price: product.purchasePrice,
  selling_price: product.sellingPrice,
  quantity: product.quantity,
  pricing: product.pricing || null,
});

const convertSaleFromDb = (dbSale: any): Sale => ({
  id: dbSale.id,
  date: dbSale.date,
  buyerName: dbSale.buyer_name,
  totalProfit: safeParseFloat(dbSale.total_profit), // Safe precision conversion
  totalRevenue: safeParseFloat(dbSale.total_revenue), // Safe precision conversion
  items: dbSale.items,
  creditInfo: dbSale.credit_info,
});

const convertSaleToDb = (sale: Omit<Sale, 'id'> & { id?: string }) => ({
  id: sale.id || generateSaleId(), // Use collision-safe ID generation
  date: sale.date,
  buyer_name: sale.buyerName,
  total_profit: sale.totalProfit,
  total_revenue: sale.totalRevenue,
  items: sale.items,
  credit_info: sale.creditInfo,
});

const convertStandaloneCreditFromDb = (dbCredit: any): StandaloneCredit => ({
  id: dbCredit.id,
  buyerName: dbCredit.buyer_name,
  creditAmount: safeParseFloat(dbCredit.credit_amount), // Safe precision conversion
  description: dbCredit.description,
  date: dbCredit.date,
  isStandalone: dbCredit.is_standalone,
});

const convertStandaloneCreditToDb = (credit: Omit<StandaloneCredit, 'id'> & { id?: string }) => ({
  id: credit.id || generateCreditId(), // Use collision-safe ID generation
  buyer_name: credit.buyerName,
  credit_amount: credit.creditAmount,
  description: credit.description,
  date: credit.date,
  is_standalone: credit.isStandalone,
});

const convertPaymentFromDb = (dbPayment: any): Payment => ({
  id: dbPayment.id,
  buyerName: dbPayment.buyer_name,
  amount: safeParseFloat(dbPayment.amount), // Safe precision conversion
  date: dbPayment.date,
  description: dbPayment.description,
  relatedSaleId: dbPayment.related_sale_id,
  relatedCreditId: dbPayment.related_credit_id,
});

const convertPaymentToDb = (payment: Omit<Payment, 'id'> & { id?: string }) => ({
  id: payment.id || generatePaymentId(), // Use collision-safe ID generation
  buyer_name: payment.buyerName,
  amount: payment.amount,
  date: payment.date,
  description: payment.description,
  related_sale_id: payment.relatedSaleId,
  related_credit_id: payment.relatedCreditId,
});

// Products Service
export class ProductService {
  static async getAllProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name')
      
      if (error) throw error
      return (data || []).map(convertProductFromDb)
    } catch (error) {
      console.warn('Failed to fetch products from database, using localStorage:', error)
      // Fallback to localStorage
      const saved = localStorage.getItem('products')
      return saved ? JSON.parse(saved) : []
    }
  }

  static async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    try {
      const newProduct: Product = {
        ...product,
        id: generateProductId(), // Use collision-safe ID generation
      };
      
      const dbProduct = convertProductToDb(newProduct);

      const { data, error } = await supabase
        .from('products')
        .insert([dbProduct])
        .select()
        .single()
      
      if (error) throw error
      
      const convertedProduct = convertProductFromDb(data);
      
      // Also save to localStorage as backup
      const products = await this.getAllProducts()
      localStorage.setItem('products', JSON.stringify([...products, convertedProduct]))
      
      return convertedProduct
    } catch (error) {
      console.warn('Failed to create product in database, using localStorage:', error)
      // Fallback to localStorage
      const products = await this.getAllProducts()
      const newProduct: Product = {
        ...product,
        id: generateProductId(), // Use collision-safe ID generation
      }
      const updatedProducts = [...products, newProduct]
      localStorage.setItem('products', JSON.stringify(updatedProducts))
      return newProduct
    }
  }

  static async updateProduct(product: Product): Promise<Product> {
    try {
      const dbProduct = convertProductToDb(product);
      
      const { data, error } = await supabase
        .from('products')
        .update(dbProduct)
        .eq('id', product.id)
        .select()
        .single()
      
      if (error) throw error
      
      const convertedProduct = convertProductFromDb(data);
      
      // Also update localStorage
      const products = await this.getAllProducts()
      const updatedProducts = products.map(p => p.id === product.id ? convertedProduct : p)
      localStorage.setItem('products', JSON.stringify(updatedProducts))
      
      return convertedProduct
    } catch (error) {
      console.warn('Failed to update product in database, using localStorage:', error)
      // Fallback to localStorage
      const products = await this.getAllProducts()
      const updatedProducts = products.map(p => p.id === product.id ? product : p)
      localStorage.setItem('products', JSON.stringify(updatedProducts))
      return product
    }
  }

  static async deleteProduct(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      // Also remove from localStorage
      const products = await this.getAllProducts()
      const updatedProducts = products.filter(p => p.id !== id)
      localStorage.setItem('products', JSON.stringify(updatedProducts))
    } catch (error) {
      console.warn('Failed to delete product from database, using localStorage:', error)
      // Fallback to localStorage
      const products = await this.getAllProducts()
      const updatedProducts = products.filter(p => p.id !== id)
      localStorage.setItem('products', JSON.stringify(updatedProducts))
    }
  }
}

// Sales Service
export class SaleService {
  static async getAllSales(): Promise<Sale[]> {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('date', { ascending: false })
      
      if (error) throw error
      return (data || []).map(convertSaleFromDb)
    } catch (error) {
      console.warn('Failed to fetch sales from database, using localStorage:', error)
      // Fallback to localStorage
      const saved = localStorage.getItem('sales')
      return saved ? JSON.parse(saved) : []
    }
  }

  static async createSale(sale: Omit<Sale, 'id'>): Promise<Sale> {
    try {
      const newSale = {
        ...sale,
        id: generateSaleId(), // Use collision-safe ID generation
      }

      const dbSale = convertSaleToDb(newSale);

      const { data, error } = await supabase
        .from('sales')
        .insert([dbSale])
        .select()
        .single()
      
      if (error) throw error
      
      const convertedSale = convertSaleFromDb(data);
      
      // Also save to localStorage as backup
      const sales = await this.getAllSales()
      localStorage.setItem('sales', JSON.stringify([convertedSale, ...sales]))
      
      return convertedSale
    } catch (error) {
      console.warn('Failed to create sale in database, using localStorage:', error)
      // Fallback to localStorage
      const sales = await this.getAllSales()
      const newSale: Sale = {
        ...sale,
        id: generateSaleId(), // Use collision-safe ID generation
        date: sale.date || new Date().toISOString(), // Preserve original date if available
      }
      const updatedSales = [newSale, ...sales]
      localStorage.setItem('sales', JSON.stringify(updatedSales))
      return newSale
    }
  }

  static async deleteSale(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      // Also remove from localStorage
      const sales = await this.getAllSales()
      const updatedSales = sales.filter(s => s.id !== id)
      localStorage.setItem('sales', JSON.stringify(updatedSales))
    } catch (error) {
      console.warn('Failed to delete sale from database, using localStorage:', error)
      // Fallback to localStorage
      const sales = await this.getAllSales()
      const updatedSales = sales.filter(s => s.id !== id)
      localStorage.setItem('sales', JSON.stringify(updatedSales))
    }
  }

  static async syncToDatabase(): Promise<void> {
    try {
      // Sync products from localStorage to database
      const localProducts = localStorage.getItem('products')
      if (localProducts) {
        const products: Product[] = JSON.parse(localProducts)
        for (const product of products) {
          const dbProduct = convertProductToDb(product);
          await supabase
            .from('products')
            .upsert(dbProduct, { onConflict: 'id' })
        }
      }

      // Sync sales from localStorage to database
      const localSales = localStorage.getItem('sales')
      if (localSales) {
        const sales: Sale[] = JSON.parse(localSales)
        for (const sale of sales) {
          const dbSale = convertSaleToDb(sale);
          await supabase
            .from('sales')
            .upsert(dbSale, { onConflict: 'id' })
        }
      }

      // Sync standalone credits from localStorage to database
      const localCredits = localStorage.getItem('standaloneCredits')
      if (localCredits) {
        const credits: StandaloneCredit[] = JSON.parse(localCredits)
        for (const credit of credits) {
          const dbCredit = convertStandaloneCreditToDb(credit);
          await supabase
            .from('standalone_credits')
            .upsert(dbCredit, { onConflict: 'id' })
        }
      }

      // Sync payments from localStorage to database
      const localPayments = localStorage.getItem('payments')
      if (localPayments) {
        const payments: Payment[] = JSON.parse(localPayments)
        for (const payment of payments) {
          const dbPayment = convertPaymentToDb(payment);
          await supabase
            .from('payments')
            .upsert(dbPayment, { onConflict: 'id' })
        }
      }

      console.log('Successfully synced all data to database')
    } catch (error) {
      console.warn('Failed to sync data to database:', error)
    }
  }
}

// Standalone Credits Service
export const CreditService = {
  async getAllStandaloneCredits(): Promise<StandaloneCredit[]> {
    try {
      const { data, error } = await supabase
        .from('standalone_credits')
        .select('*')
        .order('date', { ascending: false })
      
      if (error) throw error
      
      return data ? data.map(convertStandaloneCreditFromDb) : []
    } catch (error) {
      console.error('Failed to fetch standalone credits from database:', error)
      // Fallback to localStorage
      const savedCredits = localStorage.getItem('standaloneCredits')
      return savedCredits ? JSON.parse(savedCredits) : []
    }
  },

  async createStandaloneCredit(credit: Omit<StandaloneCredit, 'id'>): Promise<StandaloneCredit> {
    try {
      console.log('Creating standalone credit with data:', credit)
      const dbCredit = convertStandaloneCreditToDb(credit)
      console.log('Converted to DB format:', dbCredit)
      
      const { data, error } = await supabase
        .from('standalone_credits')
        .insert([dbCredit])
        .select()
        .single()
      
      console.log('Supabase response:', { data, error })
      
      if (error) {
        console.error('Supabase error details:', error)
        throw error
      }
      
      const createdCredit = convertStandaloneCreditFromDb(data)
      
      // Also save to localStorage as backup
      const credits = await this.getAllStandaloneCredits()
      const updatedCredits = [createdCredit, ...credits.filter(c => c.id !== createdCredit.id)]
      localStorage.setItem('standaloneCredits', JSON.stringify(updatedCredits))
      
      return createdCredit
    } catch (error) {
      console.error('Failed to create standalone credit in database:', error)
      throw error
    }
  },

  async deleteStandaloneCredit(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('standalone_credits')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      // Also remove from localStorage
      const credits = await this.getAllStandaloneCredits()
      const updatedCredits = credits.filter(c => c.id !== id)
      localStorage.setItem('standaloneCredits', JSON.stringify(updatedCredits))
    } catch (error) {
      console.error('Failed to delete standalone credit from database:', error)
      throw error
    }
  }
}

// Payments Service
export const PaymentService = {
  async getAllPayments(): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('date', { ascending: false })
      
      if (error) throw error
      
      return data ? data.map(convertPaymentFromDb) : []
    } catch (error) {
      console.error('Failed to fetch payments from database:', error)
      // Fallback to localStorage
      const savedPayments = localStorage.getItem('payments')
      return savedPayments ? JSON.parse(savedPayments) : []
    }
  },

  async createPayment(payment: Omit<Payment, 'id'>): Promise<Payment> {
    try {
      const dbPayment = convertPaymentToDb(payment)
      
      const { data, error } = await supabase
        .from('payments')
        .insert([dbPayment])
        .select()
        .single()
      
      if (error) throw error
      
      const createdPayment = convertPaymentFromDb(data)
      
      // Also save to localStorage as backup
      const payments = await this.getAllPayments()
      const updatedPayments = [createdPayment, ...payments.filter(p => p.id !== createdPayment.id)]
      localStorage.setItem('payments', JSON.stringify(updatedPayments))
      
      return createdPayment
    } catch (error) {
      console.error('Failed to create payment in database:', error)
      throw error
    }
  },

  async deletePayment(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      // Also remove from localStorage
      const payments = await this.getAllPayments()
      const updatedPayments = payments.filter(p => p.id !== id)
      localStorage.setItem('payments', JSON.stringify(updatedPayments))
    } catch (error) {
      console.error('Failed to delete payment from database:', error)
      throw error
    }
  }
} 