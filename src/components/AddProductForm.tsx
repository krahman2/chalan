import { useState } from 'react';
import type { Product, ProductCategory, ProductBrand, Country } from '../types';


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
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  const categories: ProductCategory[] = [
    'Clutch & Pressure',
    'Brake / Brake Lining',
    'Propeller Shaft',
    'Steering / Suspension',
    'Gears',
    'Pipes',
    'Bearings',
    'Water Pump',
    'Rubber Items / Mountings',
    'Electrical / Wiring / Switches',
    'Filter',
    'Compressor Head',
    'Cabin Parts / Brake Cabin',
    'Power Steering Pump',
    'Cable',
    'Control / Controller',
    'Horn',
    'Grease Gun',
    'Tools / Spanner / Hardware',
    'Layparts Items',
    'Others / Miscellaneous'
  ];

  const brands: ProductBrand[] = [
    'TARGET', 'D.D', 'DD', 'Telco', 'Luk', 'LAP', 'LIPE', 'Eicher', 'C/A', 'S+B', 'S+S',
    'MANISH', 'ABC', 'CALEX', 'KMP', 'DIN', 'KKK', 'BULL', 'HARISH', 'TVS', 'Mahindra',
    'VICTOR', 'NPN', 'J---6', 'LUCUS', 'PAYEN', 'KANSAI', 'BOSS', 'M.C.', 'Layparts',
    'Prizol', 'Daewoo', 'MOD', 'TKL', 'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProduct({
      name,
      type,
      category,
      brand,
      country,
      purchasePrice: parseFloat(purchasePrice),
      sellingPrice: parseFloat(sellingPrice),
      quantity: parseInt(quantity, 10),
    });
    setName('');
    setType('TATA');
    setCategory('Others / Miscellaneous');
    setBrand('Other');
    setCountry('India');
    setPurchasePrice('');
    setSellingPrice('');
    setQuantity('');
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
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ProductCategory)}
            style={{
              ...inputStyle,
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
            required
            onFocus={(e) => (e.target as HTMLSelectElement).style.borderColor = '#3b82f6'}
            onBlur={(e) => (e.target as HTMLSelectElement).style.borderColor = '#d1d5db'}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Brand */}
        <div>
          <label htmlFor="brand" style={labelStyle}>
            Brand
          </label>
          <select
            id="brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value as ProductBrand)}
            style={{
              ...inputStyle,
              backgroundColor: 'white',
              cursor: 'pointer',
            }}
            required
            onFocus={(e) => (e.target as HTMLSelectElement).style.borderColor = '#3b82f6'}
            onBlur={(e) => (e.target as HTMLSelectElement).style.borderColor = '#d1d5db'}
          >
            {brands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>
        
        {/* Price Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label htmlFor="purchasePrice" style={labelStyle}>
              Purchase Price (৳)
            </label>
            <input
              type="number"
              id="purchasePrice"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
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
        </div>

        {/* Quantity */}
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
            style={{
              ...buttonStyle,
              backgroundColor: '#10b981',
              color: 'white',
            }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#059669'}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#10b981'}
          >
            Add Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductForm; 