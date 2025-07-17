import { useState, useEffect } from 'react';
import ProductTable from './components/ProductTable';
import AddProductForm from './components/AddProductForm';
import SalesHistory from './pages/SalesHistory';
import InventoryAnalysis from './pages/InventoryAnalysis';
import Dashboard from './components/Dashboard';
import Modal from './components/Modal';
import CreateSaleForm from './components/CreateSaleForm';

import { ProductService, SaleService } from './services/database';
import type { Product, Sale, SaleItem, CreditInfo } from './types';

function App() {
  const [page, setPage] = useState<'inventory' | 'sales' | 'analysis'>('inventory');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isCreateSaleModalOpen, setIsCreateSaleModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data from database
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Load products
        const loadedProducts = await ProductService.getAllProducts();
        setProducts(loadedProducts);
        
        // Load sales
        const loadedSales = await SaleService.getAllSales();
        setSales(loadedSales);
        
        // Sync any existing localStorage data to database
        await SaleService.syncToDatabase();
        
      } catch (error) {
        console.error('Failed to load initial data:', error);
        // Fallback to localStorage or initial data
        const savedProducts = localStorage.getItem('products');
        const savedSales = localStorage.getItem('sales');
        
        setProducts(savedProducts ? JSON.parse(savedProducts) : []);
        setSales(savedSales ? JSON.parse(savedSales) : []);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const newProduct = await ProductService.createProduct(product);
      setProducts([...products, newProduct]);
      setIsAddProductModalOpen(false);
    } catch (error) {
      console.error('Failed to add product:', error);
      alert('Failed to add product. Please try again.');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await ProductService.deleteProduct(id);
      setProducts(products.filter((product) => product.id !== id));
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    try {
      const updated = await ProductService.updateProduct(updatedProduct);
      setProducts(
        products.map((product) =>
          product.id === updatedProduct.id ? updated : product
        )
      );
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('Failed to update product. Please try again.');
    }
  };

  const deleteSale = async (id: string) => {
    try {
      await SaleService.deleteSale(id);
      setSales(sales.filter((sale) => sale.id !== id));
    } catch (error) {
      console.error('Failed to delete sale:', error);
      alert('Failed to delete sale. Please try again.');
    }
  };

  const recordSale = async (saleItems: SaleItem[], buyerName: string, creditInfo: CreditInfo) => {
    try {
      const totalRevenue = saleItems.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
      const totalProfit = saleItems.reduce((sum, item) => sum + item.profit * item.quantity, 0);

      const saleData = {
        date: new Date().toISOString(),
        items: saleItems,
        totalProfit: totalProfit,
        totalRevenue: totalRevenue,
        buyerName: buyerName,
        creditInfo: creditInfo,
      };

      console.log('Recording sale:', saleData);
      
      // Create sale in database
      const newSale = await SaleService.createSale(saleData);
      
      // Update sales state
      setSales(prev => [newSale, ...prev]);

      // Update product quantities in database and local state
      for (const item of saleItems) {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const updatedProduct = {
            ...product,
            quantity: product.quantity - item.quantity
          };
          await ProductService.updateProduct(updatedProduct);
        }
      }
      
      // Refresh products from database to ensure consistency
      const updatedProducts = await ProductService.getAllProducts();
      setProducts(updatedProducts);

      setIsCreateSaleModalOpen(false);
    } catch (error) {
      console.error('Failed to record sale:', error);
      alert('Failed to record sale. Please try again.');
    }
  };

  const openAddProductModal = () => {
    setIsAddProductModalOpen(true);
  };

  const openCreateSaleModal = () => {
    setIsCreateSaleModalOpen(true);
  };

  const navButtonStyle = (isActive: boolean) => ({
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '16px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: isActive ? '#3b82f6' : 'transparent',
    color: isActive ? 'white' : '#6b7280',
    boxShadow: isActive ? '0 2px 4px rgba(59, 130, 246, 0.2)' : 'none',
  });

  const actionButtonStyle = (bgColor: string) => ({
    backgroundColor: bgColor,
    color: 'white',
    fontWeight: '600',
    fontSize: '16px',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  });

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
    }}>
      {/* Navigation */}
      <nav style={{
        backgroundColor: 'white',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 16px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '80px',
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setPage('inventory')} 
                style={navButtonStyle(page === 'inventory')}
                onMouseEnter={(e) => {
                  if (page !== 'inventory') {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#f0f9ff';
                    (e.target as HTMLButtonElement).style.color = '#3b82f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (page !== 'inventory') {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                    (e.target as HTMLButtonElement).style.color = '#6b7280';
                  }
                }}
              >
                📦 Inventory
              </button>
              <button 
                onClick={() => setPage('sales')} 
                style={navButtonStyle(page === 'sales')}
                onMouseEnter={(e) => {
                  if (page !== 'sales') {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#f0f9ff';
                    (e.target as HTMLButtonElement).style.color = '#3b82f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (page !== 'sales') {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                    (e.target as HTMLButtonElement).style.color = '#6b7280';
                  }
                }}
              >
                📊 Sales History
              </button>
              <button 
                onClick={() => setPage('analysis')} 
                style={navButtonStyle(page === 'analysis')}
                onMouseEnter={(e) => {
                  if (page !== 'analysis') {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#f0f9ff';
                    (e.target as HTMLButtonElement).style.color = '#3b82f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (page !== 'analysis') {
                    (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                    (e.target as HTMLButtonElement).style.color = '#6b7280';
                  }
                }}
              >
                🔍 Analysis
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {(page === 'inventory' || page === 'analysis') && (
                <button
                  onClick={openCreateSaleModal}
                  style={actionButtonStyle('#8b5cf6')}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#7c3aed'}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#8b5cf6'}
                >
                  💰 Add Sale
                </button>
              )}
              <button
                onClick={openAddProductModal}
                style={actionButtonStyle('#10b981')}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#059669'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#10b981'}
              >
                ➕ Add Product
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '32px 16px',
      }}>
        {isLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px',
            fontSize: '18px',
            color: '#6b7280',
          }}>
            Loading your data...
          </div>
        ) : page === 'inventory' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Dashboard products={products} sales={sales} />
            <ProductTable
              products={products}
              onDeleteProduct={deleteProduct}
              onUpdateProduct={updateProduct}
            />
          </div>
        ) : page === 'sales' ? (
          <SalesHistory sales={sales} onCreateSale={openCreateSaleModal} onDeleteSale={deleteSale} />
        ) : (
          <InventoryAnalysis products={products} />
        )}
      </main>

      <Modal
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        title="Add New Product"
      >
        <AddProductForm onAddProduct={addProduct} onDone={() => setIsAddProductModalOpen(false)} />
      </Modal>

      <Modal
        isOpen={isCreateSaleModalOpen}
        onClose={() => setIsCreateSaleModalOpen(false)}
        title="Create New Sale"
      >
        <CreateSaleForm
          products={products}
          onSave={recordSale}
          onCancel={() => setIsCreateSaleModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

export default App;
