import { useState, useEffect } from 'react';
import type { ProductCategory, ProductBrand } from '../types';

// Default categories and brands
const DEFAULT_CATEGORIES: ProductCategory[] = [
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

const DEFAULT_BRANDS: ProductBrand[] = [
  'TARGET', 'D.D', 'Telco', 'Luk', 'LAP', 'LIPE', 'Eicher', 'C/A', 'S+B', 'S+S',
  'MANISH', 'ABC', 'CALEX', 'KMP', 'DIN', 'KKK', 'BULL', 'HARISH', 'TVS', 'Mahindra',
  'VICTOR', 'NPN', 'J---6', 'LUCUS', 'PAYEN', 'KANSAI', 'BOSS', 'M.C.', 'Layparts',
  'Prizol', 'Daewoo', 'MOD', 'TKL', 'Other'
];

export const useDynamicCategories = () => {
  const [categories, setCategories] = useState<ProductCategory[]>(() => {
    const saved = localStorage.getItem('customCategories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const addCategory = (newCategory: string) => {
    const trimmed = newCategory.trim();
    if (trimmed && !categories.includes(trimmed as ProductCategory)) {
      const updated = [...categories, trimmed as ProductCategory].sort();
      setCategories(updated);
      localStorage.setItem('customCategories', JSON.stringify(updated));
      return true;
    }
    return false;
  };

  const removeCategory = (categoryToRemove: ProductCategory) => {
    // Don't allow removing default categories
    if (DEFAULT_CATEGORIES.includes(categoryToRemove)) {
      return false;
    }
    
    const updated = categories.filter(cat => cat !== categoryToRemove);
    setCategories(updated);
    localStorage.setItem('customCategories', JSON.stringify(updated));
    return true;
  };

  return {
    categories,
    addCategory,
    removeCategory,
    isDefault: (category: ProductCategory) => DEFAULT_CATEGORIES.includes(category)
  };
};

export const useDynamicBrands = () => {
  const [brands, setBrands] = useState<ProductBrand[]>(() => {
    const saved = localStorage.getItem('customBrands');
    return saved ? JSON.parse(saved) : DEFAULT_BRANDS;
  });

  const addBrand = (newBrand: string) => {
    const trimmed = newBrand.trim();
    if (trimmed && !brands.includes(trimmed as ProductBrand)) {
      const updated = [...brands, trimmed as ProductBrand].sort();
      setBrands(updated);
      localStorage.setItem('customBrands', JSON.stringify(updated));
      return true;
    }
    return false;
  };

  const removeBrand = (brandToRemove: ProductBrand) => {
    // Don't allow removing default brands
    if (DEFAULT_BRANDS.includes(brandToRemove)) {
      return false;
    }
    
    const updated = brands.filter(brand => brand !== brandToRemove);
    setBrands(updated);
    localStorage.setItem('customBrands', JSON.stringify(updated));
    return true;
  };

  return {
    brands,
    addBrand,
    removeBrand,
    isDefault: (brand: ProductBrand) => DEFAULT_BRANDS.includes(brand)
  };
}; 