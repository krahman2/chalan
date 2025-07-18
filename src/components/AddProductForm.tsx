import { useState } from 'react';
import type { Product, ProductCategory, ProductBrand, Country, Currency, PurchasePricing } from '../types';
import { useDynamicCategories, useDynamicBrands } from '../hooks/useDynamicOptions';
import { roundToCurrency, addCurrency, multiplyCurrency, safeParseFloat, safeParseInt } from '../utils/mathUtils';


interface AddProductFormProps {
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onDone: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onAddProduct, onDone }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'TATA' | 'Leyland' | 'Bedford' | 'Other'>('TATA');
  const [category, setCategory] = useState<ProductCategory>('Others / Miscellaneous');
  const [brand, setBrand] = useState<ProductBrand>('Other');
  const [country, setCountry] = useState<Country>('India');
  
  // Dynamic categories and brands
  const { categories, addCategory } = useDynamicCategories();
  const { brands, addBrand } = useDynamicBrands();
  
  // States for adding new categories/brands
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [newBrand, setNewBrand] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Purchase pricing fields
  const [originalAmount, setOriginalAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('BDT');
  const [exchangeRate, setExchangeRate] = useState('');
  const [dutyPerUnit, setDutyPerUnit] = useState('');
  
  const [sellingPrice, setSellingPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  // Handler functions for adding new categories/brands
  const handleAddCategory = () => {
    if (newCategory.trim()) {
      const success = addCategory(newCategory.trim());
      if (success) {
        setCategory(newCategory.trim() as ProductCategory);
        setNewCategory('');
        setShowAddCategory(false);
      } else {
        alert('Category already exists or is invalid');
      }
    }
  };

  const handleAddBrand = () => {
    if (newBrand.trim()) {
      const success = addBrand(newBrand.trim());
      if (success) {
        setBrand(newBrand.trim() as ProductBrand);
        setNewBrand('');
        setShowAddBrand(false);
      } else {
        alert('Brand already exists or is invalid');
      }
    }
  };

  // Calculate final purchase price with precise math
  const calculateFinalPrice = (): number => {
    const amount = safeParseFloat(originalAmount);
    const rate = currency === 'BDT' ? 1 : safeParseFloat(exchangeRate);
    const duty = safeParseFloat(dutyPerUnit);
    
    const convertedAmount = multiplyCurrency(amount, rate);
    return addCurrency(convertedAmount, duty);
  };

  const finalPurchasePrice = calculateFinalPrice();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent double submission
    
    const originalAmountNum = safeParseFloat(originalAmount);
    const exchangeRateNum = safeParseFloat(exchangeRate);
    
    if (!originalAmount || originalAmountNum <= 0) {
      alert('Please enter a valid purchase price');
      return;
    }
    
    if (currency !== 'BDT' && (!exchangeRate || exchangeRateNum <= 0)) {
      alert('Please enter a valid exchange rate for non-BDT currencies');
      return;
    }

    setIsSubmitting(true); // Set loading state

    try {
      const pricing: PurchasePricing = {
        originalAmount: originalAmountNum,
        currency,
        exchangeRate: currency === 'BDT' ? undefined : exchangeRateNum,
        dutyPerUnit: safeParseFloat(dutyPerUnit),
        finalPurchasePrice,
      };

      await onAddProduct({
        name,
        type,
        category,
        brand,
        country,
        purchasePrice: finalPurchasePrice, // Legacy field
        pricing, // New detailed pricing
        sellingPrice: safeParseFloat(sellingPrice),
        quantity: safeParseInt(quantity),
      });
      
      // Reset form only if submission succeeds
      setName('');
      setType('TATA');
      setCategory('Others / Miscellaneous');
      setBrand('Other');
      setCountry('India');
      setOriginalAmount('');
      setCurrency('BDT');
      setExchangeRate('');
      setDutyPerUnit('');
      setSellingPrice('');
      setQuantity('');
    } catch (error) {
      console.error('Failed to add product:', error);
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
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

  const getCurrencySymbol = (curr: Currency): string => {
    switch (curr) {
      case 'USD': return '$';
      case 'INR': return '₹';
      case 'CNY': return '¥';
      case 'BDT': return '৳';
      default: return '৳';
    }
  };

  return (
    <div style={{ padding: '0' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Product Name */}
        <div>
          <label htmlFor="name" style={labelStyle}>
            Product Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
            placeholder="Enter product name"
            required
            onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#3b82f6'}
            onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#d1d5db'}
          />
        </div>

        {/* Two-column layout for dropdowns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Vehicle Type */}
          <div>
            <label htmlFor="type" style={labelStyle}>
              Vehicle Type
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as 'TATA' | 'Leyland' | 'Bedford' | 'Other')}
              style={{
                ...inputStyle,
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
              required
              onFocus={(e) => (e.target as HTMLSelectElement).style.borderColor = '#3b82f6'}
              onBlur={(e) => (e.target as HTMLSelectElement).style.borderColor = '#d1d5db'}
            >
              <option value="TATA">TATA</option>
              <option value="Leyland">Leyland</option>
              <option value="Bedford">Bedford</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" style={labelStyle}>
              Country of Origin
            </label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value as Country)}
              style={{
                ...inputStyle,
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
              required
              onFocus={(e) => (e.target as HTMLSelectElement).style.borderColor = '#3b82f6'}
              onBlur={(e) => (e.target as HTMLSelectElement).style.borderColor = '#d1d5db'}
            >
              <option value="India">India</option>
              <option value="China">China</option>
            </select>
          </div>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" style={labelStyle}>
            Product Category
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ProductCategory)}
              style={{
                ...inputStyle,
                backgroundColor: 'white',
                cursor: 'pointer',
                flex: 1,
              }}
              required
              onFocus={(e) => (e.target as HTMLSelectElement).style.borderColor = '#3b82f6'}
              onBlur={(e) => (e.target as HTMLSelectElement).style.borderColor = '#d1d5db'}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowAddCategory(true)}
              style={{
                padding: '12px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              + Add
            </button>
          </div>
          {showAddCategory && (
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter new category name"
                style={{
                  ...inputStyle,
                  flex: 1,
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <button
                type="button"
                onClick={handleAddCategory}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddCategory(false);
                  setNewCategory('');
                }}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Brand */}
        <div>
          <label htmlFor="brand" style={labelStyle}>
            Brand
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value as ProductBrand)}
              style={{
                ...inputStyle,
                backgroundColor: 'white',
                cursor: 'pointer',
                flex: 1,
              }}
              required
              onFocus={(e) => (e.target as HTMLSelectElement).style.borderColor = '#3b82f6'}
              onBlur={(e) => (e.target as HTMLSelectElement).style.borderColor = '#d1d5db'}
            >
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowAddBrand(true)}
              style={{
                padding: '12px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              + Add
            </button>
          </div>
          {showAddBrand && (
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                placeholder="Enter new brand name"
                style={{
                  ...inputStyle,
                  flex: 1,
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleAddBrand()}
              />
              <button
                type="button"
                onClick={handleAddBrand}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddBrand(false);
                  setNewBrand('');
                }}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        
        {/* Purchase Pricing Section */}
        <div style={{
          padding: '16px',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: '#f9fafb',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: '0 0 16px 0' }}>
            Purchase Pricing Details
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
            {/* Original Amount */}
            <div>
              <label htmlFor="originalAmount" style={labelStyle}>
                Purchase Price ({getCurrencySymbol(currency)})
              </label>
              <input
                type="number"
                id="originalAmount"
                value={originalAmount}
                onChange={(e) => setOriginalAmount(e.target.value)}
                style={inputStyle}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#3b82f6'}
                onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#d1d5db'}
              />
            </div>

            {/* Currency */}
            <div>
              <label htmlFor="currency" style={labelStyle}>
                Currency
              </label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value as Currency);
                  if (e.target.value === 'BDT') {
                    setExchangeRate('');
                  }
                }}
                style={{
                  ...inputStyle,
                  backgroundColor: 'white',
                  cursor: 'pointer',
                }}
                onFocus={(e) => (e.target as HTMLSelectElement).style.borderColor = '#3b82f6'}
                onBlur={(e) => (e.target as HTMLSelectElement).style.borderColor = '#d1d5db'}
              >
                <option value="BDT">🇧🇩 BDT (৳)</option>
                <option value="USD">🇺🇸 USD ($)</option>
                <option value="INR">🇮🇳 INR (₹)</option>
                <option value="CNY">🇨🇳 CNY (¥)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Exchange Rate */}
            {currency !== 'BDT' && (
              <div>
                <label htmlFor="exchangeRate" style={labelStyle}>
                  Exchange Rate (1 {currency} = ? BDT)
                </label>
                <input
                  type="number"
                  id="exchangeRate"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  style={inputStyle}
                  placeholder="e.g., 125.00"
                  step="0.01"
                  min="0"
                  required
                  onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#3b82f6'}
                  onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#d1d5db'}
                />
              </div>
            )}

            {/* Duty Per Unit */}
            <div>
              <label htmlFor="dutyPerUnit" style={labelStyle}>
                Duty Per Unit (৳)
              </label>
              <input
                type="number"
                id="dutyPerUnit"
                value={dutyPerUnit}
                onChange={(e) => setDutyPerUnit(e.target.value)}
                style={inputStyle}
                placeholder="0.00"
                step="0.01"
                min="0"
                onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#3b82f6'}
                onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#d1d5db'}
              />
            </div>
          </div>

          {/* Final Price Display */}
          {originalAmount && (currency === 'BDT' || exchangeRate) && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#e0f2fe',
              borderRadius: '6px',
              border: '1px solid #0891b2',
            }}>
              <div style={{ fontSize: '14px', color: '#0e7490', marginBottom: '4px' }}>
                <strong>Calculation:</strong> {originalAmount} {currency} 
                {currency !== 'BDT' && ` × ${exchangeRate} BDT`}
                {dutyPerUnit && ` + ${dutyPerUnit} BDT duty`}
              </div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#0e7490' }}>
                <strong>Final Purchase Price: ৳{finalPurchasePrice.toFixed(2)}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Selling Price and Quantity */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label htmlFor="sellingPrice" style={labelStyle}>
              Selling Price (৳)
            </label>
            <input
              type="number"
              id="sellingPrice"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              style={inputStyle}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
              onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#3b82f6'}
              onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#d1d5db'}
            />
          </div>

          <div>
            <label htmlFor="quantity" style={labelStyle}>
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              style={inputStyle}
              placeholder="0"
              min="0"
              required
              onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#3b82f6'}
              onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#d1d5db'}
            />
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button
            type="button"
            onClick={onDone}
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
            disabled={isSubmitting}
            style={{
              ...buttonStyle,
              backgroundColor: isSubmitting ? '#9ca3af' : '#10b981',
              color: 'white',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#059669';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#10b981';
              }
            }}
          >
            {isSubmitting ? 'Adding...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductForm; 