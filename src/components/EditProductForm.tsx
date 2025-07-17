import { useState } from 'react';
import type { Product, ProductCategory, ProductBrand, Country } from '../types';
import { formatBDT } from '../utils/currency';

interface EditProductFormProps {
  product: Product;
  onSave: (updatedProduct: Product) => void;
  onCancel: () => void;
}

const EditProductForm: React.FC<EditProductFormProps> = ({ product, onSave, onCancel }) => {
  const [name, setName] = useState(product.name);
  const [type, setType] = useState<'TATA' | 'Leyland' | 'Bedford' | 'Other'>(product.type);
  const [category, setCategory] = useState<ProductCategory>(product.category);
  const [brand, setBrand] = useState<ProductBrand>(product.brand);
  const [country, setCountry] = useState<Country>(product.country);
  const [purchasePrice, setPurchasePrice] = useState(product.purchasePrice);
  const [sellingPrice, setSellingPrice] = useState(product.sellingPrice);
  const [quantity, setQuantity] = useState(product.quantity);

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
    onSave({
      ...product,
      name,
      type,
      category,
      brand,
      country,
      purchasePrice: purchasePrice,
      sellingPrice: sellingPrice,
      quantity: quantity,
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
        <select
          value={type}
          onChange={(e) => setType(e.target.value as 'TATA' | 'Leyland' | 'Bedford' | 'Other')}
          style={inputStyle}
          required
        >
          <option value="TATA">TATA</option>
          <option value="Leyland">Leyland</option>
          <option value="Bedford">Bedford</option>
          <option value="Other">Other</option>
        </select>
      </td>
      <td style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value as Country)}
          style={inputStyle}
          required
        >
          <option value="India">India</option>
          <option value="China">China</option>
        </select>
      </td>
      <td style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <input
          type="number"
          value={purchasePrice}
          onChange={(e) => setPurchasePrice(Number(e.target.value))}
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
          onChange={(e) => setSellingPrice(Number(e.target.value))}
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
          onChange={(e) => setQuantity(Number(e.target.value))}
          style={inputStyle}
          min="0"
          required
        />
      </td>
      <td style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#059669' }}>
          {formatBDT((sellingPrice - purchasePrice) * quantity)}
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