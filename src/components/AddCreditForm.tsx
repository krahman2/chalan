import { useState } from 'react';
import type { StandaloneCredit, Sale, Payment } from '../types';
import { useAllBuyers } from '../hooks/useBuyers';
import { safeParseFloat } from '../utils/mathUtils';

interface AddCreditFormProps {
  sales: Sale[];
  standaloneCredits: StandaloneCredit[];
  payments: Payment[];
  onAddCredit: (credit: Omit<StandaloneCredit, 'id'>) => void;
  onCancel: () => void;
}

const AddCreditForm: React.FC<AddCreditFormProps> = ({ 
  sales, 
  standaloneCredits, 
  payments, 
  onAddCredit, 
  onCancel 
}) => {
  const [buyerName, setBuyerName] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [description, setDescription] = useState('');

  // Use universal buyer hook for consistent buyer suggestions
  const existingBuyers = useAllBuyers(sales, standaloneCredits, payments);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const creditAmountNum = safeParseFloat(creditAmount);
    
    if (!buyerName || !creditAmount || creditAmountNum <= 0) {
      alert('Please fill in all required fields with valid values.');
      return;
    }

    onAddCredit({
      buyerName,
      creditAmount: creditAmountNum,
      description: description || `Outstanding credit for ${buyerName}`,
      date: new Date().toISOString(),
      isStandalone: true,
    });

    // Reset form
    setBuyerName('');
    setCreditAmount('');
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
        {/* Buyer Name */}
        <div>
          <label htmlFor="buyerName" style={labelStyle}>
            Customer Name
          </label>
          <input
            type="text"
            id="buyerName"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            style={inputStyle}
            placeholder="Enter customer name or select from existing"
            list="existingBuyers"
            required
            onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#dc2626'}
            onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#d1d5db'}
          />
          <datalist id="existingBuyers">
            {existingBuyers.map(buyer => (
              <option key={buyer} value={buyer} />
            ))}
          </datalist>
          {existingBuyers.length > 0 && (
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
              Suggestion: Start typing to see existing customers
            </p>
          )}
        </div>

        {/* Credit Amount */}
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
            min="0.01"
            required
            onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#dc2626'}
            onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#d1d5db'}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" style={labelStyle}>
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              ...inputStyle,
              minHeight: '80px',
              resize: 'vertical',
            }}
            placeholder="e.g., Previous purchase payment pending, old outstanding amount, etc."
            onFocus={(e) => (e.target as HTMLTextAreaElement).style.borderColor = '#dc2626'}
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
              backgroundColor: '#dc2626',
              color: 'white',
            }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#b91c1c'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626'}
          >
            💳 Add Credit
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCreditForm; 