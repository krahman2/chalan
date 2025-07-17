import { useState, useEffect } from 'react';
import ProductTable from './components/ProductTable';
import AddProductForm from './components/AddProductForm';
import SalesHistory from './pages/SalesHistory';
import Dashboard from './components/Dashboard';
import Modal from './components/Modal';
import CreateSaleForm from './components/CreateSaleForm';
import { products as initialProducts } from './data/products';
import type { Product, Sale, SaleItem, CreditInfo } from './types';

function App() {
  const [page, setPage] = useState('inventory');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isCreateSaleModalOpen, setIsCreateSaleModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const [sales, setSales] = useState<Sale[]>(() => {
    const savedSales = localStorage.getItem('sales');
    return savedSales ? JSON.parse(savedSales) : [];
  });

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('sales', JSON.stringify(sales));
  }, [sales]);

  const addProduct = (product: Omit<Product, 'id'>) => {
    setProducts([
      ...products,
      {
        ...product,
        id: (products.length + 1).toString(),
      },
    ]);
    setIsAddProductModalOpen(false);
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter((product) => product.id !== id));
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(
      products.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

  const recordSale = (saleItems: SaleItem[], buyerName: string, creditInfo: CreditInfo) => {
    const totalRevenue = saleItems.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
    const totalProfit = saleItems.reduce((sum, item) => sum + item.profit * item.quantity, 0);

    const sale: Sale = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      items: saleItems,
      totalProfit: totalProfit,
      totalRevenue: totalRevenue,
      buyerName: buyerName,
      creditInfo: creditInfo,
    };

    console.log('Recording sale:', sale);
    console.log('Current sales before update:', sales);
    
    // Update sales state
    setSales(prev => {
      const newSales = [...prev, sale];
      console.log('New sales array:', newSales);
      return newSales;
    });

    // Update product quantities
    saleItems.forEach(item => {
      setProducts(prev => prev.map(product => 
        product.id === item.productId 
          ? { ...product, quantity: product.quantity - item.quantity }
          : product
      ));
    });

    setIsCreateSaleModalOpen(false);
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

  const actionButtonStyle = (bgColor: string, hoverColor: string) => ({
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
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {page === 'inventory' && (
                <button
                  onClick={openCreateSaleModal}
                  style={actionButtonStyle('#8b5cf6', '#7c3aed')}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#7c3aed'}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#8b5cf6'}
                >
                  💰 Add Sale
                </button>
              )}
              <button
                onClick={openAddProductModal}
                style={actionButtonStyle('#10b981', '#059669')}
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
        {page === 'inventory' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Dashboard products={products} />
            <ProductTable
              products={products}
              onDeleteProduct={deleteProduct}
              onUpdateProduct={updateProduct}
            />
          </div>
        ) : (
          <SalesHistory sales={sales} onCreateSale={openCreateSaleModal} />
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
