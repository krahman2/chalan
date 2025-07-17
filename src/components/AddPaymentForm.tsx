import { useState, useMemo } from 'react';
import type { Payment, Sale, StandaloneCredit } from '../types';
import { formatBDT } from '../utils/currency';

interface AddPaymentFormProps {
  sales: Sale[];
  standaloneCredits: StandaloneCredit[];
  onAddPayment: (payment: Omit<Payment, 'id'>) => void;
  onCancel: () => void;
}

const AddPaymentForm: React.FC<AddPaymentFormProps> = ({ 
  sales, 
  standaloneCredits, 
  onAddPayment, 
  onCancel 
}) => {
  const [buyerName, setBuyerName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // Get buyers with outstanding credit amounts
  const buyersWithCredit = useMemo(() => {
    const creditSummary = new Map<string, number>();
    
    // Add credit from sales
    sales.forEach(sale => {
      if (sale.creditInfo.creditAmount > 0) {
        const current = creditSummary.get(sale.buyerName) || 0;
        creditSummary.set(sale.buyerName, current + sale.creditInfo.creditAmount);
      }
    });
    
    // Add standalone credits
    standaloneCredits.forEach(credit => {
      const current = creditSummary.get(credit.buyerName) || 0;
      creditSummary.set(credit.buyerName, current + credit.creditAmount);
    });
    
    return Array.from(creditSummary.entries())
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [sales, standaloneCredits]);

  const selectedBuyerCredit = buyersWithCredit.find(b => b.name === buyerName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!buyerName || !amount || parseFloat(amount) <= 0) {
      alert('Please fill in all required fields with valid values.');
      return;
    }

    const paymentAmount = parseFloat(amount);
    const availableCredit = selectedBuyerCredit?.amount || 0;

    if (paymentAmount > availableCredit) {
      alert(`Payment amount cannot exceed outstanding credit of ${formatBDT(availableCredit)}`);
      return;
    }

    onAddPayment({
      buyerName,
      amount: paymentAmount,
      date: new Date().toISOString(),
      description: description || `Payment received from ${buyerName}`,
    });

    // Reset form
    setBuyerName('');
    setAmount('');
    setDescription('');
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

  return (
    <div style={{ padding: '0' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Buyer Selection */}
        <div>
          <label htmlFor="buyerName" style={labelStyle}>
            Customer Name
          </label>
          <select
            id="buyerName"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            style={{
              ...inputStyle,
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
            required
            onFocus={(e) => (e.target as HTMLSelectElement).style.borderColor = '#059669'}
            onBlur={(e) => (e.target as HTMLSelectElement).style.borderColor = '#d1d5db'}
          >
            <option value="">Select customer with outstanding credit</option>
            {buyersWithCredit.map(buyer => (
              <option key={buyer.name} value={buyer.name}>
                {buyer.name} - Outstanding: {formatBDT(buyer.amount)}
              </option>
            ))}
          </select>
          {buyersWithCredit.length === 0 && (
            <p style={{ fontSize: '12px', color: '#dc2626', margin: '4px 0 0 0' }}>
              No customers with outstanding credit found.
            </p>
          )}
        </div>

        {/* Payment Amount */}
        <div>
          <label htmlFor="amount" style={labelStyle}>
            Payment Amount (৳)
            {selectedBuyerCredit && (
              <span style={{ color: '#6b7280', fontWeight: '400' }}>
                {' '}(Max: {formatBDT(selectedBuyerCredit.amount)})
              </span>
            )}
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={inputStyle}
            placeholder="0.00"
            step="0.01"
            min="0.01"
            max={selectedBuyerCredit?.amount || undefined}
            required
            disabled={!buyerName}
            onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#059669'}
            onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#d1d5db'}
          />
          {selectedBuyerCredit && (
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setAmount((Math.round(selectedBuyerCredit.amount / 2 * 100) / 100).toString())}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                }}
              >
                Half ({formatBDT(selectedBuyerCredit.amount / 2)})
              </button>
              <button
                type="button"
                onClick={() => setAmount((Math.round(selectedBuyerCredit.amount * 100) / 100).toString())}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                }}
              >
                Full ({formatBDT(selectedBuyerCredit.amount)})
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" style={labelStyle}>
            Payment Note (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              ...inputStyle,
              minHeight: '60px',
              resize: 'vertical',
            }}
            placeholder="e.g., Cash payment, bank transfer, partial payment, etc."
            onFocus={(e) => (e.target as HTMLTextAreaElement).style.borderColor = '#059669'}
            onBlur={(e) => (e.target as HTMLTextAreaElement).style.borderColor = '#d1d5db'}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button
            type="button"
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
            type="submit"
            style={{
              ...buttonStyle,
              backgroundColor: '#059669',
              color: 'white',
            }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#047857'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#059669'}
          >
            💰 Record Payment
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPaymentForm; 