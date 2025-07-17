// Export utilities for data backup and analysis
import type { Product, Sale } from '../types';

export const exportProductsToCSV = (products: Product[]): void => {
  const headers = [
    'Name',
    'Type',
    'Category', 
    'Brand',
    'Country',
    'Purchase Price (BDT)',
    'Selling Price (BDT)',
    'Quantity',
    'Profit per Unit (BDT)',
    'Total Inventory Value (BDT)',
    'Total Potential Profit (BDT)'
  ];

  const rows = products.map(product => [
    product.name,
    product.type,
    product.category,
    product.brand,
    product.country,
    product.purchasePrice.toString(),
    product.sellingPrice.toString(),
    product.quantity.toString(),
    (product.sellingPrice - product.purchasePrice).toString(),
    (product.purchasePrice * product.quantity).toString(),
    ((product.sellingPrice - product.purchasePrice) * product.quantity).toString()
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  downloadCSV(csvContent, `products_${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportSalesToCSV = (sales: Sale[]): void => {
  const headers = [
    'Date',
    'Buyer',
    'Items Count',
    'Total Revenue (BDT)',
    'Total Profit (BDT)',
    'Cash Amount (BDT)',
    'Credit Amount (BDT)',
    'Items Detail'
  ];

  const rows = sales.map(sale => [
    new Date(sale.date).toLocaleDateString('en-GB'),
    sale.buyerName,
    sale.items.length.toString(),
    sale.totalRevenue.toString(),
    sale.totalProfit.toString(),
    sale.creditInfo.cashAmount.toString(),
    sale.creditInfo.creditAmount.toString(),
    sale.items.map(item => `${item.productName} (${item.quantity}x${item.sellingPrice})`).join('; ')
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  downloadCSV(csvContent, `sales_${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportMonthlySummary = (sales: Sale[], year: number, month: number): void => {
  const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long' });
  
  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate.getFullYear() === year && saleDate.getMonth() === month;
  });

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.totalRevenue, 0);
  const totalProfit = filteredSales.reduce((sum, sale) => sum + sale.totalProfit, 0);
  const totalCash = filteredSales.reduce((sum, sale) => sum + sale.creditInfo.cashAmount, 0);
  const totalCredit = filteredSales.reduce((sum, sale) => sum + sale.creditInfo.creditAmount, 0);

  const summaryData = [
    ['Monthly Summary', `${monthName} ${year}`],
    ['Total Sales', filteredSales.length.toString()],
    ['Total Revenue (BDT)', totalRevenue.toString()],
    ['Total Profit (BDT)', totalProfit.toString()],
    ['Total Cash (BDT)', totalCash.toString()],
    ['Total Credit (BDT)', totalCredit.toString()],
    ['Average Sale (BDT)', filteredSales.length > 0 ? (totalRevenue / filteredSales.length).toFixed(2) : '0'],
    ['Profit Margin %', totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) + '%' : '0%'],
    [''],
    ['Daily Breakdown', ''],
    ['Date', 'Sales Count', 'Revenue (BDT)', 'Profit (BDT)'],
  ];

  // Group sales by day
  const dailyStats = new Map();
  filteredSales.forEach(sale => {
    const day = new Date(sale.date).getDate();
    if (!dailyStats.has(day)) {
      dailyStats.set(day, { count: 0, revenue: 0, profit: 0 });
    }
    const stats = dailyStats.get(day);
    stats.count++;
    stats.revenue += sale.totalRevenue;
    stats.profit += sale.totalProfit;
  });

  for (let day = 1; day <= 31; day++) {
    const stats = dailyStats.get(day) || { count: 0, revenue: 0, profit: 0 };
    summaryData.push([
      `${day}/${month + 1}/${year}`,
      stats.count.toString(),
      stats.revenue.toString(),
      stats.profit.toString()
    ]);
  }

  const csvContent = summaryData
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  downloadCSV(csvContent, `monthly_summary_${monthName}_${year}.csv`);
};

const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}; 