export type ProductCategory = 
  | 'Clutch & Pressure'
  | 'Brake / Brake Lining'
  | 'Propeller Shaft'
  | 'Steering / Suspension'
  | 'Gears'
  | 'Pipes'
  | 'Bearings'
  | 'Water Pump'
  | 'Rubber Items / Mountings'
  | 'Electrical / Wiring / Switches'
  | 'Filter'
  | 'Compressor Head'
  | 'Cabin Parts / Brake Cabin'
  | 'Power Steering Pump'
  | 'Cable'
  | 'Control / Controller'
  | 'Horn'
  | 'Grease Gun'
  | 'Tools / Spanner / Hardware'
  | 'Layparts Items'
  | 'Others / Miscellaneous';

export type ProductBrand = 
  | 'TARGET'
  | 'D.D'
  | 'Telco'
  | 'Luk'
  | 'LAP'
  | 'LIPE'
  | 'Eicher'
  | 'C/A'
  | 'S+B'
  | 'S+S'
  | 'MANISH'
  | 'ABC'
  | 'CALEX'
  | 'KMP'
  | 'DIN'
  | 'KKK'
  | 'BULL'
  | 'HARISH'
  | 'TVS'
  | 'Mahindra'
  | 'VICTOR'
  | 'NPN'
  | 'J---6'
  | 'LUCUS'
  | 'PAYEN'
  | 'KANSAI'
  | 'BOSS'
  | 'M.C.'
  | 'Layparts'
  | 'Prizol'
  | 'Daewoo'
  | 'MOD'
  | 'TKL'
  | 'Other';

export type Country = 'India' | 'China';

export type Currency = 'BDT' | 'USD' | 'INR' | 'CNY';

export interface PurchasePricing {
  originalAmount: number;
  currency: Currency;
  exchangeRate?: number; // Only for non-BDT currencies
  dutyPerUnit: number; // In BDT
  finalPurchasePrice: number; // Calculated final price in BDT
}

export interface Product {
  id: string;
  name: string;
  type: 'TATA' | 'Leyland' | 'Bedford' | 'Other';
  category: ProductCategory;
  brand: ProductBrand;
  country: Country;
  purchasePrice: number; // Legacy field for backward compatibility
  pricing?: PurchasePricing; // New detailed pricing structure
  sellingPrice: number;
  quantity: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  profit: number;
  sellingPrice: number;
}

export interface CreditInfo {
  cashAmount: number;
  creditAmount: number;
  totalAmount: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  totalProfit: number;
  totalRevenue: number;
  date: string;
  buyerName: string;
  creditInfo: CreditInfo;
}

// New types for credit management
export interface StandaloneCredit {
  id: string;
  buyerName: string;
  creditAmount: number;
  description: string;
  date: string;
  isStandalone: true; // Flag to distinguish from sale-based credit
}

export interface Payment {
  id: string;
  buyerName: string;
  amount: number;
  date: string;
  description?: string;
  relatedSaleId?: string; // Optional reference to a specific sale
  relatedCreditId?: string; // Optional reference to standalone credit
} 