import { useState, useEffect } from 'react';
import ProductTable from './components/ProductTable';
import AddProductForm from './components/AddProductForm';
import SalesHistory from './pages/SalesHistory';
import InventoryAnalysis from './pages/InventoryAnalysis';
import Dashboard from './components/Dashboard';
import Modal from './components/Modal';
import CreateSaleForm from './components/CreateSaleForm';

import { ProductService, SaleService, CreditService, PaymentService } from './services/database';
import type { Product, Sale, SaleItem, CreditInfo, StandaloneCredit, Payment } from './types';
import { useDataConsistency } from './hooks/useDataConsistency';
import { roundToCurrency, multiplyCurrency, ensureNonNegative } from './utils/mathUtils';
import { validateProduct, validateSale, validateStandaloneCredit, validatePayment } from './utils/dataValidation';
import { useOutstandingCredit } from './hooks/useBuyers';
import ImportExportButtons from './components/ImportExportButtons';

function App() {
  const [page, setPage] = useState<'inventory' | 'sales' | 'analysis'>('inventory');
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isCreateSaleModalOpen, setIsCreateSaleModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [standaloneCredits, setStandaloneCredits] = useState<StandaloneCredit[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Data consistency monitoring (in development)
  const consistencyReport = useDataConsistency(sales, standaloneCredits, payments);
  const outstandingCredit = useOutstandingCredit(sales, standaloneCredits, payments);

  // Log consistency issues in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && !consistencyReport.isConsistent) {
      console.warn('Data consistency issues detected:', consistencyReport);
    }
  }, [consistencyReport]);



  // Load initial data from database
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        
        // CRITICAL: Sync localStorage to database FIRST to prevent race conditions
        await SaleService.syncToDatabase();
        
        // Then load fresh data from database
        const loadedProducts = await ProductService.getAllProducts();
        const loadedSales = await SaleService.getAllSales();
        const loadedCredits = await CreditService.getAllStandaloneCredits();
        const loadedPayments = await PaymentService.getAllPayments();
        
        setProducts(loadedProducts);
        setSales(loadedSales);
        setStandaloneCredits(loadedCredits);
        setPayments(loadedPayments);
        
      } catch (error) {
        console.error('Failed to load initial data:', error);
        // Fallback to localStorage or initial data
        const savedProducts = localStorage.getItem('products');
        const savedSales = localStorage.getItem('sales');
        const savedCredits = localStorage.getItem('standaloneCredits');
        const savedPayments = localStorage.getItem('payments');
        
        setProducts(savedProducts ? JSON.parse(savedProducts) : []);
        setSales(savedSales ? JSON.parse(savedSales) : []);
        setStandaloneCredits(savedCredits ? JSON.parse(savedCredits) : []);
        setPayments(savedPayments ? JSON.parse(savedPayments) : []);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      // Validate product before saving
      const validation = validateProduct(product);
      if (!validation.valid) {
        alert('Product validation failed:\n' + validation.errors.join('\n'));
        return;
      }

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
      // VALIDATION: Comprehensive sale validation
      const validation = validateSale(saleItems, buyerName, creditInfo, products);
      if (!validation.valid) {
        alert('Sale validation failed:\n' + validation.errors.join('\n'));
        return;
      }

      const totalRevenue = roundToCurrency(saleItems.reduce((sum, item) => sum + multiplyCurrency(item.sellingPrice, item.quantity), 0));
      const totalProfit = roundToCurrency(saleItems.reduce((sum, item) => sum + multiplyCurrency(item.profit, item.quantity), 0));

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

      // FIXED: Update product quantities atomically to prevent race conditions
      const updatedProducts = products.map(product => {
        const saleItem = saleItems.find(item => item.productId === product.id);
        if (saleItem) {
          return {
            ...product,
            quantity: ensureNonNegative(product.quantity - saleItem.quantity) // Prevent negative quantities with proper math
          };
        }
        return product;
      });

      // Update all products in database
      for (const item of saleItems) {
        const updatedProduct = updatedProducts.find(p => p.id === item.productId);
        if (updatedProduct) {
          await ProductService.updateProduct(updatedProduct);
        }
      }
      
      // Update local state with corrected quantities
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

  // Credit and payment handlers
  const handleAddCredit = async (credit: Omit<StandaloneCredit, 'id'>) => {
    try {
      // Validate credit before saving
      const validation = validateStandaloneCredit(credit);
      if (!validation.valid) {
        alert('Credit validation failed:\n' + validation.errors.join('\n'));
        return;
      }

      const newCredit = await CreditService.createStandaloneCredit(credit);
      setStandaloneCredits(prev => [newCredit, ...prev]);
    } catch (error) {
      console.error('Failed to add credit:', error);
      alert('Failed to add credit. Please try again.');
    }
  };

  const handleAddPayment = async (payment: Omit<Payment, 'id'>) => {
    try {
      // CRITICAL: Validate payment before saving
      const availableCredit = outstandingCredit.get(payment.buyerName) || 0;
      const validation = validatePayment(payment, availableCredit);
      
      if (!validation.valid) {
        alert('Payment validation failed:\n' + validation.errors.join('\n'));
        return;
      }

      const newPayment = await PaymentService.createPayment(payment);
      setPayments(prev => [newPayment, ...prev]);
    } catch (error) {
      console.error('Failed to add payment:', error);
      alert('Failed to add payment. Please try again.');
    }
  };

  // Bulk import products from CSV
  const handleImportProducts = async (importedProducts: Product[]) => {
    try {
      // Validate all products before importing
      const validationErrors: string[] = [];
      
      importedProducts.forEach((product, index) => {
        const validation = validateProduct(product);
        if (!validation.valid) {
          validationErrors.push(`Product ${index + 1} (${product.name}): ${validation.errors.join(', ')}`);
        }
      });
      
      if (validationErrors.length > 0) {
        alert('Import validation failed:\n' + validationErrors.join('\n'));
        return;
      }
      
      // Import products one by one to ensure database consistency
      const successfulImports: Product[] = [];
      
      for (const product of importedProducts) {
        try {
          const newProduct = await ProductService.createProduct(product);
          successfulImports.push(newProduct);
        } catch (error) {
          console.error(`Failed to import product ${product.name}:`, error);
        }
      }
      
      // Update local state with new products
      setProducts(prev => [...successfulImports, ...prev]);
      
      if (successfulImports.length !== importedProducts.length) {
        alert(`Imported ${successfulImports.length} out of ${importedProducts.length} products. Some failed to import.`);
      }
      
    } catch (error) {
      console.error('Failed to import products:', error);
      alert('Failed to import products. Please try again.');
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      await PaymentService.deletePayment(paymentId);
      setPayments(prev => prev.filter(p => p.id !== paymentId));
    } catch (error) {
      console.error('Failed to delete payment:', error);
      alert('Failed to delete payment. Please try again.');
    }
  };

  const handleDeleteCredit = async (creditId: string) => {
    try {
      await CreditService.deleteStandaloneCredit(creditId);
      setStandaloneCredits(prev => prev.filter(c => c.id !== creditId));
    } catch (error) {
      console.error('Failed to delete credit:', error);
      alert('Failed to delete credit. Please try again.');
    }
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
              <button
                onClick={openCreateSaleModal}
                style={actionButtonStyle('#8b5cf6')}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#7c3aed'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#8b5cf6'}
              >
                💰 Add Sale
              </button>
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
            
            {/* Import/Export Controls */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 0',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827',
                margin: 0
              }}>
                Product Inventory
              </h2>
              
              <ImportExportButtons 
                products={products}
                onImportProducts={handleImportProducts}
              />
            </div>
            
            <ProductTable
              products={products}
              onDeleteProduct={deleteProduct}
              onUpdateProduct={updateProduct}
            />
          </div>
        ) : page === 'sales' ? (
                      <SalesHistory 
              sales={sales} 
              standaloneCredits={standaloneCredits}
              payments={payments}
              onDeleteSale={deleteSale}
              onAddCredit={handleAddCredit}
              onAddPayment={handleAddPayment}
              onDeletePayment={handleDeletePayment}
              onDeleteCredit={handleDeleteCredit}
            />
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
          sales={sales}
          standaloneCredits={standaloneCredits}
          payments={payments}
          onSave={recordSale}
          onCancel={() => setIsCreateSaleModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

export default App;
