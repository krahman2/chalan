import { useState, useMemo } from 'react';
import type { Product, ProductCategory, ProductBrand, Country } from '../types';
import { formatBDT } from '../utils/currency';
import { getProductInventoryValue } from '../utils/productCalculations';

interface InventoryAnalysisProps {
  products: Product[];
}

const InventoryAnalysis: React.FC<InventoryAnalysisProps> = ({ products }) => {
  // Filter states
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<'TATA' | 'Leyland' | 'Bedford' | 'Other' | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'All'>('All');
  const [countryFilter, setCountryFilter] = useState<Country | 'All'>('All');
  const [brandFilter, setBrandFilter] = useState<ProductBrand | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Style definitions
  const filterStyle = {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer',
    outline: 'none',
    minWidth: '120px',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  };

  // Get unique values for filter options
  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category))).sort();
  }, [products]);

  const uniqueBrands = useMemo(() => {
    return Array.from(new Set(products.map(p => p.brand))).sort();
  }, [products]);

  const uniqueCountries = useMemo(() => {
    return Array.from(new Set(products.map(p => p.country))).sort();
  }, [products]);

  const uniqueVehicleTypes = useMemo(() => {
    return Array.from(new Set(products.map(p => p.type))).sort();
  }, [products]);

  // Filter products based on all criteria
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesVehicleType = vehicleTypeFilter === 'All' || product.type === vehicleTypeFilter;
      const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
      const matchesCountry = countryFilter === 'All' || product.country === countryFilter;
      const matchesBrand = brandFilter === 'All' || product.brand === brandFilter;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesVehicleType && matchesCategory && matchesCountry && matchesBrand && matchesSearch;
    });
  }, [products, vehicleTypeFilter, categoryFilter, countryFilter, brandFilter, searchTerm]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalQuantity = filteredProducts.reduce((sum, product) => sum + product.quantity, 0);
    const totalCost = filteredProducts.reduce((sum, product) => sum + getProductInventoryValue(product), 0);
    const totalValue = filteredProducts.reduce((sum, product) => sum + (product.sellingPrice * product.quantity), 0);
    const totalProfit = totalValue - totalCost;
    const productCount = filteredProducts.length;
    const avgCostPerItem = productCount > 0 ? totalCost / productCount : 0;
    const avgValuePerItem = productCount > 0 ? totalValue / productCount : 0;

    return {
      totalQuantity,
      totalCost,
      totalValue,
      totalProfit,
      productCount,
      avgCostPerItem,
      avgValuePerItem,
    };
  }, [filteredProducts]);

  // Clear all filters
  const clearAllFilters = () => {
    setVehicleTypeFilter('All');
    setCategoryFilter('All');
    setCountryFilter('All');
    setBrandFilter('All');
    setSearchTerm('');
  };

  // Check if any filters are active
  const hasActiveFilters = vehicleTypeFilter !== 'All' || categoryFilter !== 'All' || 
                          countryFilter !== 'All' || brandFilter !== 'All' || searchTerm !== '';

  const getCountryBadgeStyle = (country: string) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    fontSize: '12px',
    fontWeight: '600',
    borderRadius: '12px',
    backgroundColor: country === 'India' ? '#fef3c7' : '#fee2e2',
    color: country === 'India' ? '#92400e' : '#991b1b',
  });

  const getTypeBadgeStyle = (type: string) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 6px',
    fontSize: '10px',
    fontWeight: '600',
    borderRadius: '12px',
    marginRight: '8px',
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

  return (
    <div style={{
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '16px',
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#111827',
            margin: '0 0 8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <span style={{
              fontSize: '32px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              borderRadius: '12px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              🔍
            </span>
            Inventory Analysis
          </h1>
        </div>

        {/* Filters */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              margin: '0',
            }}>
              Filter Inventory
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                style={{
                  padding: '6px 12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'white';
                }}
              >
                🔄 Clear All
              </button>
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '16px',
          }}>
            {/* Vehicle Type Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px',
              }}>
                Vehicle Type
              </label>
              <select
                value={vehicleTypeFilter}
                onChange={(e) => setVehicleTypeFilter(e.target.value as any)}
                style={filterStyle}
              >
                <option value="All">All Types</option>
                {uniqueVehicleTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px',
              }}>
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                style={filterStyle}
              >
                <option value="All">All Categories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Country Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px',
              }}>
                Country
              </label>
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value as any)}
                style={filterStyle}
              >
                <option value="All">All Countries</option>
                {uniqueCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px',
              }}>
                Brand
              </label>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value as any)}
                style={filterStyle}
              >
                <option value="All">All Brands</option>
                {uniqueBrands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px',
            }}>
              Search Products
              <span style={{
                fontSize: '12px',
                fontWeight: '400',
                color: '#6b7280',
                marginLeft: '8px',
              }}>
                ({totals.productCount} found)
              </span>
            </label>
            <input
              type="text"
              placeholder="Search by product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                ...inputStyle,
                maxWidth: '400px',
              }}
              onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#8b5cf6'}
              onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#d1d5db'}
            />
          </div>
        </div>

        {/* Results Summary */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
          }}>
            <div style={cardStyle}>
              <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>Total Quantity</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#059669' }}>
                {totals.totalQuantity}
              </div>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>Total Cost</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
                {formatBDT(totals.totalCost)}
              </div>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>Total Value</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
                {formatBDT(totals.totalValue)}
              </div>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>Potential Profit</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                {formatBDT(totals.totalProfit)}
              </div>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div style={{ padding: '24px' }}>
          {filteredProducts.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '64px 24px',
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '16px',
              }}>
                🔍
              </div>
              <p style={{
                color: '#6b7280',
                fontSize: '20px',
                fontWeight: '500',
                marginBottom: '8px',
              }}>
                No products match your filters
              </p>
              <p style={{
                color: '#9ca3af',
                fontSize: '16px',
                margin: '0',
              }}>
                Try adjusting your filter criteria or search terms
              </p>
            </div>
          ) : (
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
                    }}>Product</th>
                    <th style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>Category</th>
                    <th style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>Brand</th>
                    <th style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>Country</th>
                    <th style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>Quantity</th>
                    <th style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>Unit Cost</th>
                    <th style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>Unit Price</th>
                    <th style={{
                      padding: '16px 24px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#6b7280',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
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
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#111827',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={getTypeBadgeStyle(product.type)}>
                            {product.type}
                          </span>
                          {product.name}
                        </div>
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
                        color: '#374151',
                      }}>
                        {product.brand}
                      </td>
                      <td style={{
                        padding: '20px 24px',
                        whiteSpace: 'nowrap',
                        fontSize: '14px',
                        color: '#374151',
                      }}>
                        <span style={getCountryBadgeStyle(product.country)}>
                          {product.country}
                        </span>
                      </td>
                      <td style={{
                        padding: '20px 24px',
                        whiteSpace: 'nowrap',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#059669',
                      }}>
                        {product.quantity}
                      </td>
                      <td style={{
                        padding: '20px 24px',
                        whiteSpace: 'nowrap',
                        fontSize: '16px',
                        color: '#374151',
                      }}>
                        {formatBDT(product.purchasePrice)}
                      </td>
                      <td style={{
                        padding: '20px 24px',
                        whiteSpace: 'nowrap',
                        fontSize: '16px',
                        color: '#374151',
                      }}>
                        {formatBDT(product.sellingPrice)}
                      </td>
                      <td style={{
                        padding: '20px 24px',
                        whiteSpace: 'nowrap',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#059669',
                      }}>
                        {formatBDT(product.sellingPrice * product.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryAnalysis; 