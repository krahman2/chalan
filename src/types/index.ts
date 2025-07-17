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
  | 'DD'
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

export interface Product {
  id: string;
  name: string;
  type: 'TATA' | 'Leyland' | 'Bedford' | 'Other';
  category: ProductCategory;
  brand: ProductBrand;
  country: Country;
  purchasePrice: number;
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