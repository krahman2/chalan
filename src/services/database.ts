import { supabase } from '../lib/supabase'
import type { Product, Sale } from '../types'

// Products Service
export class ProductService {
  static async getAllProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.warn('Failed to fetch products from database, using localStorage:', error)
      // Fallback to localStorage
      const saved = localStorage.getItem('products')
      return saved ? JSON.parse(saved) : []
    }
  }

  static async createProduct(product: Omit<Product, 'id'>): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single()
      
      if (error) throw error
      
      // Also save to localStorage as backup
      const products = await this.getAllProducts()
      localStorage.setItem('products', JSON.stringify([...products, data]))
      
      return data
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
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', product.id)
        .select()
        .single()
      
      if (error) throw error
      
      // Also update localStorage
      const products = await this.getAllProducts()
      const updatedProducts = products.map(p => p.id === product.id ? data : p)
      localStorage.setItem('products', JSON.stringify(updatedProducts))
      
      return data
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
      return data || []
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
        date: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('sales')
        .insert([newSale])
        .select()
        .single()
      
      if (error) throw error
      
      // Also save to localStorage as backup
      const sales = await this.getAllSales()
      localStorage.setItem('sales', JSON.stringify([data, ...sales]))
      
      return data
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

  static async syncToDatabase(): Promise<void> {
    try {
      // Sync products from localStorage to database
      const localProducts = localStorage.getItem('products')
      if (localProducts) {
        const products: Product[] = JSON.parse(localProducts)
        for (const product of products) {
          await supabase
            .from('products')
            .upsert(product, { onConflict: 'id' })
        }
      }

      // Sync sales from localStorage to database
      const localSales = localStorage.getItem('sales')
      if (localSales) {
        const sales: Sale[] = JSON.parse(localSales)
        for (const sale of sales) {
          await supabase
            .from('sales')
            .upsert(sale, { onConflict: 'id' })
        }
      }
    } catch (error) {
      console.warn('Failed to sync data to database:', error)
    }
  }
} 