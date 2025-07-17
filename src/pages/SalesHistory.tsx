import { useState, useMemo } from 'react';
import type { Sale, StandaloneCredit, Payment } from '../types';
import { formatBDT } from '../utils/currency';
import Modal from '../components/Modal';
import AddCreditForm from '../components/AddCreditForm';
import AddPaymentForm from '../components/AddPaymentForm';

interface SalesHistoryProps {
  sales: Sale[];
  standaloneCredits: StandaloneCredit[];
  payments: Payment[];
  onCreateSale?: () => void;
  onDeleteSale?: (id: string) => void;
  onAddCredit: (credit: Omit<StandaloneCredit, 'id'>) => void;
  onAddPayment: (payment: Omit<Payment, 'id'>) => void;
}

const SalesHistory: React.FC<SalesHistoryProps> = ({ 
  sales, 
  standaloneCredits, 
  payments, 
  onCreateSale, 
  onDeleteSale, 
  onAddCredit, 
  onAddPayment 
}) => {
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);
  const [showCreditView, setShowCreditView] = useState(false);
  const [buyerFilter, setBuyerFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-based month
  
  // Credit management states
  const [isAddCreditModalOpen, setIsAddCreditModalOpen] = useState(false);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);

  console.log('SalesHistory received sales:', sales);

  // Credit management handlers
  const handleAddCreditLocal = (credit: Omit<StandaloneCredit, 'id'>) => {
    onAddCredit(credit);
    setIsAddCreditModalOpen(false);
  };

  const handleAddPaymentLocal = (payment: Omit<Payment, 'id'>) => {
    onAddPayment(payment);
    setIsAddPaymentModalOpen(false);
  };

  const toggleDetails = (saleId: string) => {
    setExpandedSaleId(expandedSaleId === saleId ? null : saleId);
  };

  const handleDeleteSale = (sale: Sale) => {
    if (!onDeleteSale) return;
    
    const confirmMessage = `Are you sure you want to delete this sale?\n\nBuyer: ${sale.buyerName}\nDate: ${new Date(sale.date).toLocaleDateString()}\nRevenue: ${formatBDT(sale.totalRevenue)}\n\nThis action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      onDeleteSale(sale.id);
    }
  };

  // Helper functions for time filtering
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day; // Sunday as start of week
    return new Date(d.setDate(diff));
  };



  const isInCurrentWeek = (saleDate: string) => {
    const sale = new Date(saleDate);
    const now = new Date();
    const weekStart = getWeekStart(now);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    return sale >= weekStart && sale < weekEnd;
  };

  const isInSelectedMonth = (saleDate: string, year: number, month: number) => {
    const sale = new Date(saleDate);
    return sale.getFullYear() === year && sale.getMonth() === month;
  };

  const isInSelectedYear = (saleDate: string, year: number) => {
    const sale = new Date(saleDate);
    return sale.getFullYear() === year;
  };

  // Helper functions for navigation
  const getMonthName = (month: number) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month];
  };

  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const goToPreviousYear = () => {
    setSelectedYear(selectedYear - 1);
  };

  const goToNextYear = () => {
    setSelectedYear(selectedYear + 1);
  };

  // Reset to current when switching filter types
  const handleTimeFilterChange = (newFilter: 'all' | 'week' | 'month' | 'year') => {
    setTimeFilter(newFilter);
    if (newFilter === 'month') {
      setSelectedMonth(new Date().getMonth());
      setSelectedYear(new Date().getFullYear());
    } else if (newFilter === 'year') {
      setSelectedYear(new Date().getFullYear());
    }
  };

  const uniqueBuyers = useMemo(() => {
    return Array.from(new Set(sales.map(s => s.buyerName))).sort();
  }, [sales]);

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const matchesBuyer = buyerFilter === 'All' || sale.buyerName === buyerFilter;
      const matchesSearch = sale.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sale.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      let matchesTime = true;
      if (timeFilter === 'week') {
        matchesTime = isInCurrentWeek(sale.date);
      } else if (timeFilter === 'month') {
        matchesTime = isInSelectedMonth(sale.date, selectedYear, selectedMonth);
      } else if (timeFilter === 'year') {
        matchesTime = isInSelectedYear(sale.date, selectedYear);
      }
      
      return matchesBuyer && matchesSearch && matchesTime;
    });
  }, [sales, buyerFilter, searchTerm, timeFilter, selectedYear, selectedMonth]);

  // Calculate net outstanding credit for each buyer
  const calculateOutstandingCredit = useMemo(() => {
    const creditMap = new Map<string, number>();
    
    // Add credit from sales
    sales.forEach(sale => {
      if (sale.creditInfo.creditAmount > 0) {
        const current = creditMap.get(sale.buyerName) || 0;
        creditMap.set(sale.buyerName, current + sale.creditInfo.creditAmount);
      }
    });
    
    // Add standalone credits
    standaloneCredits.forEach(credit => {
      const current = creditMap.get(credit.buyerName) || 0;
      creditMap.set(credit.buyerName, current + credit.creditAmount);
    });
    
    // Subtract payments
    payments.forEach(payment => {
      const current = creditMap.get(payment.buyerName) || 0;
      creditMap.set(payment.buyerName, Math.max(0, current - payment.amount));
    });
    
    return creditMap;
  }, [sales, standaloneCredits, payments]);

  // Create combined credit transactions for display
  const allCreditTransactions = useMemo(() => {
    const transactions: Array<{
      id: string;
      date: string;
      buyerName: string;
      type: 'sale' | 'standalone' | 'payment';
      amount: number;
      description: string;
      items?: string;
      originalData: Sale | StandaloneCredit | Payment;
    }> = [];
    
    // Add sales with credit
    sales.forEach(sale => {
      if (sale.creditInfo.creditAmount > 0) {
        transactions.push({
          id: sale.id,
          date: sale.date,
          buyerName: sale.buyerName,
          type: 'sale',
          amount: sale.creditInfo.creditAmount,
          description: `Sale - ${sale.items.length} item(s)`,
          items: sale.items.map(item => item.productName).join(', '),
          originalData: sale,
        });
      }
    });
    
    // Add standalone credits
    standaloneCredits.forEach(credit => {
      transactions.push({
        id: credit.id,
        date: credit.date,
        buyerName: credit.buyerName,
        type: 'standalone',
        amount: credit.creditAmount,
        description: credit.description,
        originalData: credit,
      });
    });
    
    // Add payments (negative amounts)
    payments.forEach(payment => {
      transactions.push({
        id: payment.id,
        date: payment.date,
        buyerName: payment.buyerName,
        type: 'payment',
        amount: -payment.amount, // Negative because it reduces credit
        description: payment.description || `Payment from ${payment.buyerName}`,
        originalData: payment,
      });
    });
    
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, standaloneCredits, payments]);

  // Filter credit transactions
  const filteredCreditTransactions = useMemo(() => {
    return allCreditTransactions.filter(transaction => {
      const matchesBuyer = buyerFilter === 'All' || transaction.buyerName === buyerFilter;
      const matchesSearch = transaction.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (transaction.items && transaction.items.toLowerCase().includes(searchTerm.toLowerCase()));
      
      let matchesTime = true;
      if (timeFilter === 'week') {
        matchesTime = isInCurrentWeek(transaction.date);
      } else if (timeFilter === 'month') {
        matchesTime = isInSelectedMonth(transaction.date, selectedYear, selectedMonth);
      } else if (timeFilter === 'year') {
        matchesTime = isInSelectedYear(transaction.date, selectedYear);
      }
      
      return matchesBuyer && matchesSearch && matchesTime;
    });
  }, [allCreditTransactions, buyerFilter, searchTerm, timeFilter, selectedYear, selectedMonth]);

  const creditSales = useMemo(() => {
    return filteredSales.filter(sale => sale.creditInfo.creditAmount > 0);
  }, [filteredSales]);

  // Calculate summary statistics for the current period
  const periodStats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalRevenue, 0);
    const totalProfit = filteredSales.reduce((sum, sale) => sum + sale.totalProfit, 0);
    const totalSales = filteredSales.length;
    const avgSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    
    return {
      totalRevenue,
      totalProfit,
      totalSales,
      avgSaleValue,
    };
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
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => toggleDetails(sale.id)}
                      style={buttonStyle}
                      onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb'}
                      onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6'}
                    >
                      {expandedSaleId === sale.id ? '📤 Hide Details' : '📋 View Details'}
                    </button>
                    {onDeleteSale && (
                      <button
                        onClick={() => handleDeleteSale(sale)}
                        style={{
                          ...buttonStyle,
                          backgroundColor: '#dc2626',
                        }}
                        onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#b91c1c'}
                        onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626'}
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
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

  const renderCreditView = () => {
    // Calculate summary stats for filtered transactions
    const totalCreditTransactions = filteredCreditTransactions.filter(t => t.amount > 0).length;
    const totalPaymentTransactions = filteredCreditTransactions.filter(t => t.amount < 0).length;
    const totalCreditAmount = filteredCreditTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const totalPaymentAmount = Math.abs(filteredCreditTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
    
    // Calculate outstanding for filtered buyer or all buyers
    let outstandingAmount = 0;
    if (buyerFilter !== 'All') {
      outstandingAmount = calculateOutstandingCredit.get(buyerFilter) || 0;
    } else {
      outstandingAmount = Array.from(calculateOutstandingCredit.values()).reduce((sum, amount) => sum + amount, 0);
    }

    return (
      <div>
        <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0369a1', marginBottom: '8px' }}>
            📊 Credit Summary {buyerFilter !== 'All' ? `- ${buyerFilter}` : ''}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', fontSize: '14px' }}>
            <div>
              <strong>Credit Transactions:</strong> {totalCreditTransactions}
            </div>
            <div>
              <strong>Payment Transactions:</strong> {totalPaymentTransactions}
            </div>
            <div>
              <strong>Total Credit Given:</strong> {formatBDT(totalCreditAmount)}
            </div>
            <div>
              <strong>Total Payments Received:</strong> {formatBDT(totalPaymentAmount)}
            </div>
          </div>
          <div style={{ 
            marginTop: '12px', 
            padding: '12px', 
            backgroundColor: outstandingAmount > 0 ? '#fef2f2' : '#f0fdf4', 
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            color: outstandingAmount > 0 ? '#dc2626' : '#166534',
            textAlign: 'center',
            border: outstandingAmount > 0 ? '1px solid #fecaca' : '1px solid #bbf7d0'
          }}>
            {buyerFilter !== 'All' 
              ? `${buyerFilter} Outstanding Credit: ${formatBDT(outstandingAmount)}`
              : `Total Outstanding Credit (All Buyers): ${formatBDT(outstandingAmount)}`
            }
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
                }}>Type</th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>Amount</th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>Description</th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>Outstanding</th>
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
              {filteredCreditTransactions.map((transaction) => {
                const outstandingForBuyer = calculateOutstandingCredit.get(transaction.buyerName) || 0;
                return (
                  <tr key={transaction.id} style={{
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
                      {new Date(transaction.date).toLocaleDateString('en-US', {
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
                      {transaction.buyerName}
                    </td>
                    <td style={{
                      padding: '20px 24px',
                      whiteSpace: 'nowrap',
                      fontSize: '14px',
                    }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: 
                          transaction.type === 'sale' ? '#dbeafe' :
                          transaction.type === 'standalone' ? '#fee2e2' :
                          '#dcfce7',
                        color:
                          transaction.type === 'sale' ? '#1e40af' :
                          transaction.type === 'standalone' ? '#b91c1c' :
                          '#166534',
                      }}>
                        {transaction.type === 'sale' ? '💰 Sale' :
                         transaction.type === 'standalone' ? '💳 Credit' :
                         '💸 Payment'}
                      </span>
                    </td>
                    <td style={{
                      padding: '20px 24px',
                      whiteSpace: 'nowrap',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: transaction.amount > 0 ? '#dc2626' : '#059669',
                    }}>
                      {transaction.amount > 0 ? '+' : ''}{formatBDT(Math.abs(transaction.amount))}
                    </td>
                    <td style={{
                      padding: '20px 24px',
                      fontSize: '14px',
                      color: '#6b7280',
                      maxWidth: '200px',
                    }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {transaction.description}
                      </div>
                      {transaction.items && (
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                          {transaction.items}
                        </div>
                      )}
                    </td>
                    <td style={{
                      padding: '20px 24px',
                      whiteSpace: 'nowrap',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: outstandingForBuyer > 0 ? '#dc2626' : '#059669',
                    }}>
                      {formatBDT(outstandingForBuyer)}
                    </td>
                    <td style={{
                      padding: '20px 24px',
                      whiteSpace: 'nowrap',
                      fontSize: '16px',
                      fontWeight: '600',
                    }}>
                      {onDeleteSale && transaction.type === 'sale' && (
                        <button
                          onClick={() => handleDeleteSale(transaction.originalData as Sale)}
                          style={{
                            ...buttonStyle,
                            backgroundColor: '#dc2626',
                            fontSize: '14px',
                            padding: '6px 12px',
                          }}
                          onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#b91c1c'}
                          onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626'}
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {/* Credit Table Footer with Totals */}
          {filteredCreditTransactions.length > 0 && (
            <div style={{
              marginTop: '16px',
              padding: '16px',
              backgroundColor: '#f0f9ff',
              borderRadius: '8px',
              border: '1px solid #bae6fd',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#0369a1',
              }}>
                {buyerFilter !== 'All' 
                  ? `${buyerFilter} Net Outstanding Credit: ${formatBDT(outstandingAmount)}`
                  : `Total Net Outstanding Credit (All Buyers): ${formatBDT(outstandingAmount)}`
                }
              </div>
              <div style={{
                fontSize: '14px',
                color: '#6b7280',
                marginTop: '4px',
              }}>
                {filteredCreditTransactions.length} transaction{filteredCreditTransactions.length !== 1 ? 's' : ''} shown
                {totalPaymentAmount > 0 && ` • ${formatBDT(totalPaymentAmount)} total payments received`}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

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
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setIsAddCreditModalOpen(true)}
                style={{
                  ...addSaleButtonStyle,
                  backgroundColor: '#dc2626',
                }}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#b91c1c'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626'}
              >
                💳 Add Credit
              </button>
              <button
                onClick={() => setIsAddPaymentModalOpen(true)}
                style={{
                  ...addSaleButtonStyle,
                  backgroundColor: '#059669',
                }}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#047857'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#059669'}
              >
                💰 Add Payment
              </button>
            </div>
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
            
            {/* Time Filter Separator */}
            <div style={{ height: '24px', width: '1px', backgroundColor: '#d1d5db', margin: '0 4px' }}></div>
            
            {/* Time Period Dropdown */}
            <select
              value={timeFilter}
              onChange={(e) => handleTimeFilterChange(e.target.value as 'all' | 'week' | 'month' | 'year')}
              style={{
                ...filterStyle,
                minWidth: '120px',
                fontWeight: '600',
              }}
            >
              <option value="all">📅 All Time</option>
              <option value="week">📈 This Week</option>
              <option value="month">📊 Monthly</option>
              <option value="year">📆 Yearly</option>
            </select>

            {/* Month Navigation */}
            {timeFilter === 'month' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={goToPreviousMonth}
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    padding: '6px 12px',
                    fontSize: '14px',
                  }}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb'}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'}
                >
                  ← Prev
                </button>
                <span style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#10b981',
                  minWidth: '150px',
                  textAlign: 'center',
                }}>
                  {getMonthName(selectedMonth)} {selectedYear}
                </span>
                <button
                  onClick={goToNextMonth}
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    padding: '6px 12px',
                    fontSize: '14px',
                  }}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb'}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'}
                >
                  Next →
                </button>
              </div>
            )}

            {/* Year Navigation */}
            {timeFilter === 'year' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={goToPreviousYear}
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    padding: '6px 12px',
                    fontSize: '14px',
                  }}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb'}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'}
                >
                  ← Prev
                </button>
                <span style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#10b981',
                  minWidth: '80px',
                  textAlign: 'center',
                }}>
                  {selectedYear}
                </span>
                <button
                  onClick={goToNextYear}
                  style={{
                    ...buttonStyle,
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    padding: '6px 12px',
                    fontSize: '14px',
                  }}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#e5e7eb'}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6'}
                >
                  Next →
                </button>
              </div>
            )}
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

        {/* Period Summary */}
        {timeFilter !== 'all' && filteredSales.length > 0 && (
          <div style={{
            backgroundColor: '#f0fdf4',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #bbf7d0',
            marginBottom: '24px',
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#166534',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              {timeFilter === 'week' 
                ? '📈 This Week' 
                : timeFilter === 'month' 
                ? `📊 ${getMonthName(selectedMonth)} ${selectedYear}` 
                : `📆 ${selectedYear}`} Summary
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid #bbf7d0',
              }}>
                <div style={{ fontSize: '14px', color: '#166534', fontWeight: '600' }}>Total Sales</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d' }}>
                  {periodStats.totalSales}
                </div>
              </div>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid #bbf7d0',
              }}>
                <div style={{ fontSize: '14px', color: '#166534', fontWeight: '600' }}>Total Revenue</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d' }}>
                  {formatBDT(periodStats.totalRevenue)}
                </div>
              </div>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid #bbf7d0',
              }}>
                <div style={{ fontSize: '14px', color: '#166534', fontWeight: '600' }}>Total Profit</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d' }}>
                  {formatBDT(periodStats.totalProfit)}
                </div>
              </div>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid #bbf7d0',
              }}>
                <div style={{ fontSize: '14px', color: '#166534', fontWeight: '600' }}>Avg Sale Value</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d' }}>
                  {formatBDT(periodStats.avgSaleValue)}
                </div>
              </div>
            </div>
          </div>
        )}

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

      {/* Add Credit Modal */}
      <Modal
        isOpen={isAddCreditModalOpen}
        onClose={() => setIsAddCreditModalOpen(false)}
        title="Add Outstanding Credit"
      >
        <AddCreditForm
          sales={sales}
          onAddCredit={handleAddCreditLocal}
          onCancel={() => setIsAddCreditModalOpen(false)}
        />
      </Modal>

      {/* Add Payment Modal */}
      <Modal
        isOpen={isAddPaymentModalOpen}
        onClose={() => setIsAddPaymentModalOpen(false)}
        title="Record Payment"
      >
        <AddPaymentForm
          sales={sales}
          standaloneCredits={standaloneCredits}
          onAddPayment={handleAddPaymentLocal}
          onCancel={() => setIsAddPaymentModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default SalesHistory; 