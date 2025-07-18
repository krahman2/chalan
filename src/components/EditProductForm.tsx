import { useState } from 'react';
import type { Product, ProductCategory, ProductBrand } from '../types';
import { formatBDT } from '../utils/currency';
import { roundToCurrency, addCurrency, multiplyCurrency, safeParseFloat, safeParseInt } from '../utils/mathUtils';

interface EditProductFormProps {
  product: Product;
  onSave: (updatedProduct: Product) => void;
  onCancel: () => void;
}

const EditProductForm: React.FC<EditProductFormProps> = ({ product, onSave, onCancel }) => {
  const [name, setName] = useState(product.name);
  const [category, setCategory] = useState<ProductCategory>(product.category);
  const [brand, setBrand] = useState<ProductBrand>(product.brand);
  const [purchasePrice, setPurchasePrice] = useState(product.purchasePrice);
  const [sellingPrice, setSellingPrice] = useState(product.sellingPrice);
  const [quantity, setQuantity] = useState(product.quantity);
  const [dutyPerUnit, setDutyPerUnit] = useState(product.pricing?.dutyPerUnit || 0);
  const [exchangeRate, setExchangeRate] = useState(product.pricing?.exchangeRate || 1);
  const [originalAmount, setOriginalAmount] = useState(product.pricing?.originalAmount || 0);

  const getCurrencySymbol = (currency: string): string => {
    switch (currency) {
      case 'USD': return '$';
      case 'INR': return '₹';
      case 'CNY': return '¥';
      case 'BDT': return '৳';
      default: return '৳';
    }
  };

  const categories: ProductCategory[] = [
    'Clutch & Pressure', 'Brake / Brake Lining', 'Propeller Shaft', 'Steering / Suspension',
    'Gears', 'Pipes', 'Bearings', 'Water Pump', 'Rubber Items / Mountings',
    'Electrical / Wiring / Switches', 'Filter', 'Compressor Head', 'Cabin Parts / Brake Cabin',
    'Power Steering Pump', 'Cable', 'Control / Controller', 'Horn', 'Grease Gun',
    'Tools / Spanner / Hardware', 'Layparts Items', 'Others / Miscellaneous'
  ];

  const brands: ProductBrand[] = [
    'TARGET', 'D.D', 'Telco', 'Luk', 'LAP', 'LIPE', 'Eicher', 'C/A', 'S+B', 'S+S',
    'MANISH', 'ABC', 'CALEX', 'KMP', 'DIN', 'KKK', 'BULL', 'HARISH', 'TVS', 'Mahindra',
    'VICTOR', 'NPN', 'J---6', 'LUCUS', 'PAYEN', 'KANSAI', 'BOSS', 'M.C.', 'Layparts',
    'Prizol', 'Daewoo', 'MOD', 'TKL', 'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate new final purchase price including duty with precise math
    const basePrice = originalAmount && exchangeRate 
      ? multiplyCurrency(originalAmount, exchangeRate)
      : roundToCurrency(originalAmount || purchasePrice);
    
    const newFinalPrice = addCurrency(basePrice, dutyPerUnit);
    
    // Update the pricing structure with new original amount, duty and exchange rate
    const updatedPricing = product.pricing ? {
      ...product.pricing,
      originalAmount: originalAmount,
      exchangeRate: product.pricing.currency !== 'BDT' ? exchangeRate : undefined,
      dutyPerUnit: dutyPerUnit,
      finalPurchasePrice: newFinalPrice,
    } : {
      originalAmount: originalAmount || purchasePrice,
      currency: 'BDT' as const,
      exchangeRate: undefined,
      dutyPerUnit: dutyPerUnit,
      finalPurchasePrice: newFinalPrice,
    };
    
    onSave({
      ...product,
      name,
      type: product.type,
      category,
      brand,
      country: product.country,
      purchasePrice: newFinalPrice, // Update legacy field to match calculated price
      sellingPrice: sellingPrice,
      quantity: quantity,
      pricing: {
        ...updatedPricing,
        finalPurchasePrice: newFinalPrice, // Ensure pricing structure is also updated
      },
    });
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
  };

  const buttonStyle = {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  };

  return (
    <tr style={{ backgroundColor: '#f9fafb' }}>
      <td style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
          required
        />
      </td>
      <td style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ProductCategory)}
          style={inputStyle}
          required
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </td>
      <td style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value as ProductBrand)}
          style={inputStyle}
          required
        >
          {brands.map(brand => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </td>
      <td style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <input
          type="number"
          value={originalAmount}
          onChange={(e) => setOriginalAmount(safeParseFloat(e.target.value))}
          style={inputStyle}
          step="0.01"
          min="0"
          placeholder="0.00"
          disabled={!product.pricing?.currency || product.pricing?.currency === 'BDT'}
        />
        {product.pricing?.currency && product.pricing?.currency !== 'BDT' && (
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
            {getCurrencySymbol(product.pricing.currency)} {product.pricing.currency}
          </div>
        )}
      </td>
      <td style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <input
          type="number"
          value={exchangeRate}
          onChange={(e) => setExchangeRate(safeParseFloat(e.target.value))}
          style={inputStyle}
          step="0.01"
          min="0.01"
          placeholder="1.00"
          disabled={!product.pricing?.currency || product.pricing?.currency === 'BDT'}
        />
      </td>
      <td style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <input
          type="number"
          value={dutyPerUnit}
          onChange={(e) => setDutyPerUnit(safeParseFloat(e.target.value))}
          style={inputStyle}
          step="0.01"
          min="0"
          placeholder="0.00"
        />
      </td>
      <td style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <input
          type="number"
          value={purchasePrice}
          onChange={(e) => setPurchasePrice(safeParseFloat(e.target.value))}
          style={inputStyle}
          step="0.01"
          min="0"
          required
        />
      </td>
      <td style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <input
          type="number"
          value={sellingPrice}
          onChange={(e) => setSellingPrice(safeParseFloat(e.target.value))}
          style={inputStyle}
          step="0.01"
          min="0"
          required
        />
      </td>
      <td style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(safeParseInt(e.target.value))}
          style={inputStyle}
          min="0"
          required
        />
      </td>
      <td style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#059669' }}>
          {formatBDT((() => {
            const basePrice = originalAmount && exchangeRate 
              ? multiplyCurrency(originalAmount, exchangeRate)
              : roundToCurrency(originalAmount || purchasePrice);
            const finalPrice = addCurrency(basePrice, dutyPerUnit);
            return multiplyCurrency(finalPrice, quantity);
          })())}
        </div>
      </td>
      <td style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleSubmit}
            style={{
              ...buttonStyle,
              backgroundColor: '#10b981',
              color: 'white',
            }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#059669'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#10b981'}
          >
            ✅ Save
          </button>
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
            ❌ Cancel
          </button>
        </div>
      </td>
    </tr>
  );
};

export default EditProductForm; 