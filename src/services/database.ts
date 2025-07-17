import { supabase } from '../lib/supabase'
import type { Product, Sale } from '../types'

// Helper functions to convert between camelCase and snake_case
const convertProductFromDb = (dbProduct: any): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  type: dbProduct.type,
  category: dbProduct.category,
  brand: dbProduct.brand,
  country: dbProduct.country,
  purchasePrice: Number(dbProduct.purchase_price),
  sellingPrice: Number(dbProduct.selling_price),
  quantity: dbProduct.quantity,
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
});

const convertSaleFromDb = (dbSale: any): Sale => ({
  id: dbSale.id,
  date: dbSale.date,
  buyerName: dbSale.buyer_name,
  totalProfit: Number(dbSale.total_profit),
  totalRevenue: Number(dbSale.total_revenue),
  items: dbSale.items,
  creditInfo: dbSale.credit_info,
});

const convertSaleToDb = (sale: Omit<Sale, 'id'> & { id?: string }) => ({
  id: sale.id || Date.now().toString(),
  date: sale.date,
  buyer_name: sale.buyerName,
  total_profit: sale.totalProfit,
  total_revenue: sale.totalRevenue,
  items: sale.items,
  credit_info: sale.creditInfo,
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
        id: Date.now().toString(),
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
        id: Date.now().toString(),
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
        id: Date.now().toString(),
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
        id: Date.now().toString(),
        date: new Date().toISOString(),
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
    } catch (error) {
      console.warn('Failed to sync data to database:', error)
    }
  }
} 