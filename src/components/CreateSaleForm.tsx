import { useState, useMemo } from 'react';
import type { Product, Sale, SaleItem, CreditInfo } from '../types';
import { formatBDT } from '../utils/currency';

interface CreateSaleFormProps {
  products: Product[];
  sales: Sale[];
  onSave: (saleItems: SaleItem[], buyerName: string, creditInfo: CreditInfo) => void;
  onCancel: () => void;
}

const CreateSaleForm: React.FC<CreateSaleFormProps> = ({ products, sales, onSave, onCancel }) => {
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [creditAmount, setCreditAmount] = useState('');

  // Get unique buyer names from existing sales for autocomplete
  const existingBuyers = useMemo(() => {
    return Array.from(new Set(sales.map(s => s.buyerName))).sort();
  }, [sales]);

  // Style definitions
  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  };

  const buttonStyle = {
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    border: 'none',
  };

  const cardStyle = {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #e5e7eb',
  };

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return [];
    return products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !saleItems.some(si => si.productId === p.id)
    );
  }, [searchTerm, products, saleItems]);

  const addProductToSale = (product: Product) => {
    setSaleItems([...saleItems, {
      productId: product.id,
      productName: product.name,
      quantity: 1,
      profit: product.sellingPrice - product.purchasePrice,
      sellingPrice: product.sellingPrice,
    }]);
    setSearchTerm('');
  };

  const removeProductFromSale = (productId: string) => {
    setSaleItems(saleItems.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    setSaleItems(saleItems.map(item =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

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

  const totalRevenue = saleItems.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
  const totalProfit = saleItems.reduce((sum, item) => sum + item.profit * item.quantity, 0);
  const totalCost = totalRevenue - totalProfit;

  const cashAmountNum = parseFloat(cashAmount) || 0;
  const creditAmountNum = parseFloat(creditAmount) || 0;
  const totalAmount = cashAmountNum + creditAmountNum;

  const handleSave = () => {
    if (saleItems.length === 0) {
      alert('Please add at least one item to the sale');
      return;
    }
    if (!buyerName.trim()) {
      alert('Please enter buyer name');
      return;
    }
    if (Math.abs(totalAmount - totalRevenue) > 0.01) {
      alert(`Total payment (${formatBDT(totalAmount)}) must equal total revenue (${formatBDT(totalRevenue)})`);
      return;
    }

    const creditInfo: CreditInfo = {
      cashAmount: cashAmountNum,
      creditAmount: creditAmountNum,
      totalAmount: totalAmount,
    };

    onSave(saleItems, buyerName, creditInfo);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Buyer Information */}
      <div>
        <label htmlFor="buyerName" style={labelStyle}>
          Buyer Name *
        </label>
        <input
          type="text"
          id="buyerName"
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
          style={inputStyle}
          placeholder="Enter buyer/company name or select from existing"
          list="existingBuyers"
          required
          onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#3b82f6'}
          onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#d1d5db'}
        />
        <datalist id="existingBuyers">
          {existingBuyers.map(buyer => (
            <option key={buyer} value={buyer} />
          ))}
        </datalist>
        {existingBuyers.length > 0 && (
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
            💡 Start typing to see existing customers ({existingBuyers.length} found)
          </p>
        )}
      </div>

      {/* Search Section */}
      <div>
        <label htmlFor="search" style={labelStyle}>
          Search for a product
        </label>
        <input
          type="text"
          id="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={inputStyle}
          placeholder="Start typing to search products..."
          onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#3b82f6'}
          onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#d1d5db'}
        />
        {filteredProducts.length > 0 && (
          <div style={{
            marginTop: '8px',
            maxHeight: '200px',
            overflowY: 'auto',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            backgroundColor: 'white',
          }}>
            {filteredProducts.map(p => (
              <div
                key={p.id}
                onClick={() => addProductToSale(p)}
                style={{
                  padding: '12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f3f4f6',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.target as HTMLDivElement).style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => (e.target as HTMLDivElement).style.backgroundColor = 'white'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      <span style={getTypeBadgeStyle(p.type)}>
                        {p.type}
                      </span>
                      {p.quantity} in stock | {p.category} | {p.brand}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '600', fontSize: '16px' }}>
                      {formatBDT(p.sellingPrice)}
                    </div>
                    <div style={{ fontSize: '14px', color: '#16a34a' }}>
                      +{formatBDT(p.sellingPrice - p.purchasePrice)} profit
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Products Section */}
      {saleItems.length > 0 && (
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
            Selected Items ({saleItems.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {saleItems.map(item => {
              const product = products.find(p => p.id === item.productId);
              const itemCost = item.sellingPrice - item.profit;
              const itemRevenue = item.sellingPrice * item.quantity;
              const itemProfit = item.profit * item.quantity;
              const itemTotalCost = itemCost * item.quantity;

              return (
                <div key={item.productId} style={{
                  ...cardStyle,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                        {item.productName}
                      </span>
                      {product && (
                        <span style={{ ...getTypeBadgeStyle(product.type), marginLeft: '8px' }}>
                          {product.type}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                      Cost: {formatBDT(itemTotalCost)} | Revenue: {formatBDT(itemRevenue)} | Profit: {formatBDT(itemProfit)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        Quantity:
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.productId, Math.max(1, parseInt(e.target.value) || 1))}
                        style={{
                          padding: '6px 8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          width: '80px',
                          fontSize: '14px'
                        }}
                        min="1"
                        max={product?.quantity || 999}
                      />
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>
                        (Max: {product?.quantity || 'N/A'})
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeProductFromSale(item.productId)}
                    style={{
                      ...buttonStyle,
                      backgroundColor: '#dc2626',
                      color: 'white',
                      padding: '8px 12px',
                      fontSize: '14px',
                    }}
                    onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#b91c1c'}
                    onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626'}
                  >
                    🗑️ Remove
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment Information */}
      {saleItems.length > 0 && (
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>
            Payment Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label htmlFor="cashAmount" style={labelStyle}>
                Cash Amount (৳)
              </label>
              <input
                type="number"
                id="cashAmount"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                style={inputStyle}
                placeholder="0.00"
                step="0.01"
                min="0"
                onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#3b82f6'}
                onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#d1d5db'}
              />
            </div>
            <div>
              <label htmlFor="creditAmount" style={labelStyle}>
                Credit Amount (৳)
              </label>
              <input
                type="number"
                id="creditAmount"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                style={inputStyle}
                placeholder="0.00"
                step="0.01"
                min="0"
                onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#3b82f6'}
                onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#d1d5db'}
              />
            </div>
          </div>
          
          <div style={{
            backgroundColor: '#f0f9ff',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #bae6fd',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
              <div>
                <strong>Total Cost:</strong> {formatBDT(totalCost)}
              </div>
              <div>
                <strong>Total Revenue:</strong> {formatBDT(totalRevenue)}
              </div>
              <div style={{ color: '#16a34a' }}>
                <strong>Total Profit:</strong> {formatBDT(totalProfit)}
              </div>
              <div style={{ color: totalAmount === totalRevenue ? '#16a34a' : '#dc2626' }}>
                <strong>Total Payment:</strong> {formatBDT(totalAmount)}
              </div>
            </div>
            {Math.abs(totalAmount - totalRevenue) > 0.01 && (
              <div style={{ 
                marginTop: '8px', 
                padding: '8px', 
                backgroundColor: '#fef2f2', 
                border: '1px solid #fecaca',
                borderRadius: '4px',
                color: '#dc2626',
                fontSize: '14px'
              }}>
                ⚠️ Payment total must equal revenue total
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: '12px',
        paddingTop: '16px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <button
          onClick={onCancel}
          style={{
            ...buttonStyle,
            backgroundColor: '#6b7280',
            color: 'white',
          }}
          onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#4b5563'}
          onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#6b7280'}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saleItems.length === 0 || !buyerName.trim() || Math.abs(totalAmount - totalRevenue) > 0.01}
          style={{
            ...buttonStyle,
            backgroundColor: saleItems.length === 0 || !buyerName.trim() || Math.abs(totalAmount - totalRevenue) > 0.01 ? '#9ca3af' : '#10b981',
            color: 'white',
            cursor: saleItems.length === 0 || !buyerName.trim() || Math.abs(totalAmount - totalRevenue) > 0.01 ? 'not-allowed' : 'pointer',
          }}
          onMouseEnter={(e) => {
            if (saleItems.length > 0 && buyerName.trim() && Math.abs(totalAmount - totalRevenue) <= 0.01) {
              (e.target as HTMLButtonElement).style.backgroundColor = '#059669';
            }
          }}
          onMouseLeave={(e) => {
            if (saleItems.length > 0 && buyerName.trim() && Math.abs(totalAmount - totalRevenue) <= 0.01) {
              (e.target as HTMLButtonElement).style.backgroundColor = '#10b981';
            }
          }}
        >
          💰 Create Sale
        </button>
      </div>
    </div>
  );
};

export default CreateSaleForm; 