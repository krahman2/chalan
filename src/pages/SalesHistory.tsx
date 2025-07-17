import { useState, useMemo } from 'react';
import type { Sale } from '../types';
import { formatBDT } from '../utils/currency';

interface SalesHistoryProps {
  sales: Sale[];
  onCreateSale?: () => void;
}

const SalesHistory: React.FC<SalesHistoryProps> = ({ sales, onCreateSale }) => {
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);
  const [showCreditView, setShowCreditView] = useState(false);
  const [buyerFilter, setBuyerFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  console.log('SalesHistory received sales:', sales);

  const toggleDetails = (saleId: string) => {
    setExpandedSaleId(expandedSaleId === saleId ? null : saleId);
  };

  const uniqueBuyers = useMemo(() => {
    return Array.from(new Set(sales.map(s => s.buyerName))).sort();
  }, [sales]);

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const matchesBuyer = buyerFilter === 'All' || sale.buyerName === buyerFilter;
      const matchesSearch = sale.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sale.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesBuyer && matchesSearch;
    });
  }, [sales, buyerFilter, searchTerm]);

  const creditSales = useMemo(() => {
    return filteredSales.filter(sale => sale.creditInfo.creditAmount > 0);
  }, [filteredSales]);

  const buttonStyle = {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#3b82f6',
    color: 'white',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  };

  const addSaleButtonStyle = {
    backgroundColor: '#8b5cf6',
    color: 'white',
    fontWeight: '600',
    fontSize: '16px',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  };

  const toggleButtonStyle = {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '6px',
    border: '2px solid #3b82f6',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginRight: '8px',
  };

  const filterStyle = {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer',
    outline: 'none',
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

  const renderMainView = () => (
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
            }}>Date</th>
            <th style={{
              padding: '16px 24px',
              textAlign: 'left',
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>Buyer</th>
            <th style={{
              padding: '16px 24px',
              textAlign: 'left',
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>Items</th>
            <th style={{
              padding: '16px 24px',
              textAlign: 'left',
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>Revenue</th>
            <th style={{
              padding: '16px 24px',
              textAlign: 'left',
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>Profit</th>
            <th style={{
              padding: '16px 24px',
              textAlign: 'left',
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>Payment</th>
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
          {filteredSales.map((sale) => (
            <>
              <tr key={sale.id} style={{
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
                  color: '#374151',
                }}>
                  {new Date(sale.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td style={{
                  padding: '20px 24px',
                  whiteSpace: 'nowrap',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#374151',
                }}>
                  {sale.buyerName}
                </td>
                <td style={{
                  padding: '20px 24px',
                  whiteSpace: 'nowrap',
                  fontSize: '16px',
                  color: '#374151',
                }}>
                  {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
                </td>
                <td style={{
                  padding: '20px 24px',
                  whiteSpace: 'nowrap',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                }}>
                  {formatBDT(sale.totalRevenue)}
                </td>
                <td style={{
                  padding: '20px 24px',
                  whiteSpace: 'nowrap',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#059669',
                }}>
                  {formatBDT(sale.totalProfit)}
                </td>
                <td style={{
                  padding: '20px 24px',
                  whiteSpace: 'nowrap',
                  fontSize: '14px',
                  color: '#374151',
                }}>
                  <div>
                    Cash: {formatBDT(sale.creditInfo.cashAmount)}
                  </div>
                  {sale.creditInfo.creditAmount > 0 && (
                    <div style={{ color: '#dc2626', fontWeight: '600' }}>
                      Credit: {formatBDT(sale.creditInfo.creditAmount)}
                    </div>
                  )}
                </td>
                <td style={{
                  padding: '20px 24px',
                  whiteSpace: 'nowrap',
                  fontSize: '16px',
                  fontWeight: '600',
                }}>
                  <button
                    onClick={() => toggleDetails(sale.id)}
                    style={buttonStyle}
                    onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
                    onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6'}
                  >
                    {expandedSaleId === sale.id ? '📤 Hide Details' : '📋 View Details'}
                  </button>
                </td>
              </tr>
              {expandedSaleId === sale.id && (
                <tr style={{
                  borderBottom: '1px solid #e5e7eb',
                  backgroundColor: '#f9fafb',
                }}>
                  <td colSpan={7} style={{
                    padding: '24px',
                  }}>
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '20px',
                      border: '1px solid #e5e7eb',
                    }}>
                      <h4 style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#111827',
                        marginBottom: '16px',
                      }}>
                        Sale Details - {sale.buyerName}
                      </h4>
                      <div style={{
                        display: 'grid',
                        gap: '12px',
                      }}>
                        {sale.items.map((item, index) => (
                          <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb',
                          }}>
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                            }}>
                              <span style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#111827',
                              }}>
                                {item.productName}
                              </span>
                              <span style={{
                                fontSize: '14px',
                                color: '#6b7280',
                              }}>
                                Quantity: {item.quantity} @ {formatBDT(item.sellingPrice)} each
                              </span>
                            </div>
                            <div style={{
                              textAlign: 'right',
                            }}>
                              <div style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#059669',
                              }}>
                                {formatBDT(item.profit * item.quantity)} profit
                              </div>
                              <div style={{
                                fontSize: '14px',
                                color: '#6b7280',
                              }}>
                                {formatBDT(item.sellingPrice * item.quantity)} revenue
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{
                        marginTop: '16px',
                        padding: '16px',
                        backgroundColor: '#f0f9ff',
                        borderRadius: '8px',
                        border: '1px solid #bae6fd',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                      }}>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                            Total Revenue: {formatBDT(sale.totalRevenue)}
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#059669' }}>
                            Total Profit: {formatBDT(sale.totalProfit)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '14px', color: '#374151' }}>
                            Cash Payment: {formatBDT(sale.creditInfo.cashAmount)}
                          </div>
                          {sale.creditInfo.creditAmount > 0 && (
                            <div style={{ fontSize: '14px', color: '#dc2626', fontWeight: '600' }}>
                              Credit Amount: {formatBDT(sale.creditInfo.creditAmount)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderCreditView = () => (
    <div>
      <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #f59e0b' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
          📊 Credit Summary
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', fontSize: '14px' }}>
          <div>
            <strong>Total Credit Sales:</strong> {creditSales.length}
          </div>
          <div>
            <strong>Total Credit Amount:</strong> {formatBDT(creditSales.reduce((sum, sale) => sum + sale.creditInfo.creditAmount, 0))}
          </div>
          <div>
            <strong>Avg Credit per Sale:</strong> {formatBDT(creditSales.length > 0 ? (creditSales.reduce((sum, sale) => sum + sale.creditInfo.creditAmount, 0) / creditSales.length) : 0)}
          </div>
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
              }}>Date</th>
              <th style={{
                padding: '16px 24px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>Buyer</th>
              <th style={{
                padding: '16px 24px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>Total Amount</th>
              <th style={{
                padding: '16px 24px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>Cash Paid</th>
              <th style={{
                padding: '16px 24px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>Credit Outstanding</th>
              <th style={{
                padding: '16px 24px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>Items</th>
            </tr>
          </thead>
          <tbody>
            {creditSales.map((sale) => (
              <tr key={sale.id} style={{
                borderBottom: '1px solid #e5e7eb',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => (e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent'}
              >
                <td style={{
                  padding: '20px 24px',
                  whiteSpace: 'nowrap',
                  fontSize: '14px',
                  color: '#374151',
                }}>
                  {new Date(sale.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
                <td style={{
                  padding: '20px 24px',
                  whiteSpace: 'nowrap',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#374151',
                }}>
                  {sale.buyerName}
                </td>
                <td style={{
                  padding: '20px 24px',
                  whiteSpace: 'nowrap',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                }}>
                  {formatBDT(sale.totalRevenue)}
                </td>
                <td style={{
                  padding: '20px 24px',
                  whiteSpace: 'nowrap',
                  fontSize: '16px',
                  color: '#059669',
                }}>
                  {formatBDT(sale.creditInfo.cashAmount)}
                </td>
                <td style={{
                  padding: '20px 24px',
                  whiteSpace: 'nowrap',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#dc2626',
                }}>
                  {formatBDT(sale.creditInfo.creditAmount)}
                </td>
                <td style={{
                  padding: '20px 24px',
                  whiteSpace: 'nowrap',
                  fontSize: '14px',
                  color: '#6b7280',
                }}>
                  {sale.items.map(item => item.productName).join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

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
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#111827',
              margin: '0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <span style={{
                fontSize: '32px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                borderRadius: '12px',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                📊
              </span>
              Sales History
            </h1>
            {onCreateSale && (
              <button
                onClick={onCreateSale}
                style={addSaleButtonStyle}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#7c3aed'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#8b5cf6'}
              >
                💰 Add Sale
              </button>
            )}
          </div>

          {/* View Toggle and Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
            <button
              onClick={() => setShowCreditView(false)}
              style={{
                ...toggleButtonStyle,
                backgroundColor: !showCreditView ? '#3b82f6' : 'white',
                color: !showCreditView ? 'white' : '#3b82f6',
              }}
            >
              📋 All Sales
            </button>
            <button
              onClick={() => setShowCreditView(true)}
              style={{
                ...toggleButtonStyle,
                backgroundColor: showCreditView ? '#3b82f6' : 'white',
                color: showCreditView ? 'white' : '#3b82f6',
              }}
            >
              💳 Credit Tracking ({creditSales.length})
            </button>

            <select
              value={buyerFilter}
              onChange={(e) => setBuyerFilter(e.target.value)}
              style={filterStyle}
            >
              <option value="All">All Buyers</option>
              {uniqueBuyers.map(buyer => (
                <option key={buyer} value={buyer}>{buyer}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Search buyer or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                ...inputStyle,
                width: '250px',
                padding: '8px 12px',
              }}
              onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#3b82f6'}
              onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#d1d5db'}
            />
          </div>

          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: '0',
            fontWeight: '500',
          }}>
            {showCreditView ? 'Track outstanding credit amounts and payment details' : 'Track your sales performance and revenue'}
          </p>
        </div>

        {sales.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '64px 24px',
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px',
            }}>
              📈
            </div>
            <p style={{
              color: '#6b7280',
              fontSize: '20px',
              fontWeight: '500',
              marginBottom: '8px',
            }}>
              No sales recorded yet.
            </p>
            <p style={{
              color: '#9ca3af',
              fontSize: '16px',
              margin: '0',
            }}>
              Create your first sale to start tracking your revenue!
            </p>
          </div>
        ) : showCreditView ? renderCreditView() : renderMainView()}
      </div>
    </div>
  );
};

export default SalesHistory; 