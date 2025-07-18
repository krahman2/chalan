/**
 * CSV template generator for product import
 */

export const generateCSVTemplate = (): string => {
  const headers = [
    'name',
    'type', 
    'category',
    'brand',
    'country',
    'purchasePrice',
    'sellingPrice',
    'quantity'
  ];
  
  const sampleData = [
    [
      'Clutch Plate',
      'TATA',
      'Clutch & Pressure',
      'Luk',
      'India',
      '2500.00',
      '3000.00',
      '10'
    ],
    [
      'Brake Lining',
      'Leyland',
      'Brake / Brake Lining',
      'TARGET',
      'India',
      '800.00',
      '1200.00',
      '25'
    ],
    [
      'Water Pump',
      'Bedford',
      'Water Pump',
      'Other',
      'China',
      '1500.00',
      '2000.00',
      '5'
    ]
  ];
  
  const csvContent = [
    headers.join(','),
    ...sampleData.map(row => row.join(','))
  ].join('\n');
  
  return csvContent;
};

export const downloadCSVTemplate = (): void => {
  const template = generateCSVTemplate();
  const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'inventory_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}; 