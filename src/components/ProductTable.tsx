import { useState, useMemo } from 'react';
import EditProductForm from './EditProductForm';
import SellProductForm from './SellProductForm';
import type { Product, ProductCategory, ProductBrand, Country } from '../types';
import { formatBDT } from '../utils/currency';

interface ProductTableProps {
  products: Product[];
  onDeleteProduct: (id: string) => void;
  onUpdateProduct: (product: Product) => void;
}

type SortField = 'name' | 'category' | 'brand' | 'country' | 'type' | 'purchasePrice' | 'sellingPrice' | 'quantity' | 'profit';
type SortDirection = 'asc' | 'desc';

const ProductTable: React.FC<ProductTableProps> = ({ products, onDeleteProduct, onUpdateProduct }) => {
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [sellingProduct, setSellingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'All'>('All');
  const [brandFilter, setBrandFilter] = useState<ProductBrand | 'All'>('All');
  const [countryFilter, setCountryFilter] = useState<Country | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<'TATA' | 'Leyland' | 'Bedford' | 'Other' | 'All'>('All');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleEditClick = (id: string) => {
    setEditingProductId(id);
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
  };

  const handleSave = (updatedProduct: Product) => {
    onUpdateProduct(updatedProduct);
    setEditingProductId(null);
  };

  const handleCancelSell = () => {
    setSellingProduct(null);
  };

  const handleConfirmSell = () => {
    if (sellingProduct) {
      setSellingProduct(null);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
      const matchesBrand = brandFilter === 'All' || product.brand === brandFilter;
      const matchesCountry = countryFilter === 'All' || product.country === countryFilter;
      const matchesType = typeFilter === 'All' || product.type === typeFilter;
      
      return matchesSearch && matchesCategory && matchesBrand && matchesCountry && matchesType;
    });

    // Sort the filtered products
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === 'profit') {
        aValue = (a.sellingPrice - a.purchasePrice) * a.quantity;
        bValue = (b.sellingPrice - b.purchasePrice) * b.quantity;
      } else {
        aValue = a[sortField as keyof Product];
        bValue = b[sortField as keyof Product];
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [products, searchTerm, categoryFilter, brandFilter, countryFilter, typeFilter, sortField, sortDirection]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category))).sort();
  }, [products]);

  const uniqueBrands = useMemo(() => {
    return Array.from(new Set(products.map(p => p.brand))).sort();
  }, [products]);

  const getTypeBadgeStyle = (type: string) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px',
    fontSize: '12px',
    fontWeight: '600',
    borderRadius: '12px',
    backgroundColor: 
      type === 'TATA' ? '#dbeafe' :
      type === 'Leyland' ? '#dcfce7' :
      type === 'Bedford' ? '#f3e8ff' :
      '#f3f4f6',
    color:
      type === 'TATA' ? '#1e40af' :
      type === 'Leyland' ? '#166534' :
      type === 'Bedford' ? '#7c3aed' :
      '#374151',
  });

  const getCurrencySymbol = (currency: string): string => {
    switch (currency) {
      case 'USD': return '$';
      case 'INR': return '₹';
      case 'CNY': return '¥';
      case 'BDT': return '৳';
      default: return '৳';
    }
  };

  const buttonStyle = (bgColor: string) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '6px',
    border: 'none',
    color: 'white',
    backgroundColor: bgColor,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  });

  const filterStyle = {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer',
    outline: 'none',
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '⏸️';
    return sortDirection === 'asc' ? '🔼' : '🔽';
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '24px',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#111827',
              margin: 0,
            }}>
              📦 Product Inventory
            </h2>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '12px',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}>
            <span style={{ color: '#9ca3af', fontSize: '16px' }}>🔍</span>
          </div>
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              display: 'block',
              width: '100%',
              paddingLeft: '40px',
              paddingRight: '12px',
              paddingTop: '12px',
              paddingBottom: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#3b82f6'}
            onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#d1d5db'}
          />
        </div>

        {/* Filters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
        }}>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as ProductCategory | 'All')}
            style={filterStyle}
          >
            <option value="All">All Categories</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value as ProductBrand | 'All')}
            style={filterStyle}
          >
            <option value="All">All Brands</option>
            {uniqueBrands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>

          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value as Country | 'All')}
            style={filterStyle}
          >
            <option value="All">All Countries</option>
            <option value="India">India</option>
            <option value="China">China</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'TATA' | 'Leyland' | 'Bedford' | 'Other' | 'All')}
            style={filterStyle}
          >
            <option value="All">All Vehicle Types</option>
            <option value="TATA">TATA</option>
            <option value="Leyland">Leyland</option>
            <option value="Bedford">Bedford</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
          <thead style={{
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e5e7eb',
          }}>
            <tr>
              <th style={{
                padding: '16px 24px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                cursor: 'pointer',
              }}
              onClick={() => handleSort('name')}
              >
                Product {getSortIcon('name')}
              </th>
              <th style={{
                padding: '16px 24px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                cursor: 'pointer',
              }}
              onClick={() => handleSort('category')}
              >
                Category {getSortIcon('category')}
              </th>
              <th style={{
                padding: '16px 24px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                cursor: 'pointer',
              }}
              onClick={() => handleSort('brand')}
              >
                Brand {getSortIcon('brand')}
              </th>
              <th style={{
                padding: '16px 24px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Original Price
              </th>
              <th style={{
                padding: '16px 24px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Exchange Rate
              </th>
              <th style={{
                padding: '16px 24px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Duty
              </th>
              <th style={{
                padding: '16px 24px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                cursor: 'pointer',
              }}
              onClick={() => handleSort('purchasePrice')}
              >
                Cost (BDT) {getSortIcon('purchasePrice')}
              </th>
              <th style={{
                padding: '16px 24px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                cursor: 'pointer',
              }}
              onClick={() => handleSort('sellingPrice')}
              >
                Sell Price {getSortIcon('sellingPrice')}
              </th>
              <th style={{
                padding: '16px 24px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                cursor: 'pointer',
              }}
              onClick={() => handleSort('quantity')}
              >
                Quantity {getSortIcon('quantity')}
              </th>
              <th style={{
                padding: '16px 24px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: '600',
                color: '#059669',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Inventory Value
              </th>
              <th style={{
                padding: '16px 24px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedProducts.map((product) =>
              editingProductId === product.id ? (
                <EditProductForm
                  key={product.id}
                  product={product}
                  onSave={handleSave}
                  onCancel={handleCancelEdit}
                />
              ) : (
                <tr key={product.id} style={{
                  borderBottom: '1px solid #e5e7eb',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent'}
                >
                  <td style={{
                    padding: '20px 24px',
                    whiteSpace: 'nowrap',
                  }}>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#111827',
                    }}>{product.name}</div>
                  </td>
                  <td style={{
                    padding: '20px 24px',
                    whiteSpace: 'nowrap',
                    fontSize: '14px',
                    color: '#374151',
                  }}>
                    {product.category}
                  </td>
                  <td style={{
                    padding: '20px 24px',
                    whiteSpace: 'nowrap',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                  }}>
                    {product.brand}
                  </td>
                  <td style={{
                    padding: '20px 24px',
                    whiteSpace: 'nowrap',
                    fontSize: '14px',
                    color: '#6b7280',
                  }}>
                    {product.pricing?.originalAmount && product.pricing?.currency !== 'BDT' ? 
                      `${getCurrencySymbol(product.pricing.currency)}${product.pricing.originalAmount.toFixed(2)}` : 
                      ''
                    }
                  </td>
                  <td style={{
                    padding: '20px 24px',
                    whiteSpace: 'nowrap',
                    fontSize: '14px',
                    color: '#6b7280',
                  }}>
                    {product.pricing?.exchangeRate && product.pricing?.currency !== 'BDT' ? 
                      `1 ${product.pricing.currency} = ৳${product.pricing.exchangeRate.toFixed(2)}` : 
                      ''
                    }
                  </td>
                  <td style={{
                    padding: '20px 24px',
                    whiteSpace: 'nowrap',
                    fontSize: '14px',
                    color: '#6b7280',
                  }}>
                    {product.pricing?.dutyPerUnit ? formatBDT(product.pricing.dutyPerUnit) : formatBDT(0)}
                  </td>
                  <td style={{
                    padding: '20px 24px',
                    whiteSpace: 'nowrap',
                    fontSize: '16px',
                    color: '#374151',
                  }}>
                    {formatBDT(product.pricing?.finalPurchasePrice || Number(product.purchasePrice))}
                  </td>
                  <td style={{
                    padding: '20px 24px',
                    whiteSpace: 'nowrap',
                    fontSize: '16px',
                    color: '#374151',
                  }}>
                    {formatBDT(Number(product.sellingPrice))}
                  </td>
                  <td style={{
                    padding: '20px 24px',
                    whiteSpace: 'nowrap',
                    fontSize: '16px',
                    color: '#374151',
                  }}>
                    {product.quantity} units
                  </td>
                  <td style={{
                    padding: '20px 24px',
                    whiteSpace: 'nowrap',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#059669',
                  }}>
                    {formatBDT(Number(product.purchasePrice) * Number(product.quantity))}
                  </td>
                  <td style={{
                    padding: '20px 24px',
                    whiteSpace: 'nowrap',
                    fontSize: '16px',
                    fontWeight: '600',
                  }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEditClick(product.id)}
                        style={buttonStyle('#3b82f6')}
                        onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
                        onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6'}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => onDeleteProduct(product.id)}
                        style={buttonStyle('#dc2626')}
                        onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#b91c1c'}
                        onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626'}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
      
      {filteredAndSortedProducts.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '8px',
          }}>No products found</h3>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            margin: 0,
          }}>Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      )}

      {sellingProduct && (
        <SellProductForm
          product={sellingProduct}
          onSell={handleConfirmSell}
          onCancel={handleCancelSell}
        />
      )}
    </div>
  );
};

export default ProductTable; 