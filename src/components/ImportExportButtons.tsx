import React, { useRef, useState } from 'react';
import type { Product } from '../types';
import { parseCSVToProducts, productsToCSV, downloadCSV } from '../utils/csvUtils';
import { downloadCSVTemplate } from '../utils/csvTemplate';

interface ImportExportButtonsProps {
  products: Product[];
  onImportProducts: (products: Product[]) => void;
}

const ImportExportButtons: React.FC<ImportExportButtonsProps> = ({ products, onImportProducts }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    try {
      const text = await file.text();
      const { products: importedProducts, errors } = parseCSVToProducts(text);
      
      if (errors.length > 0) {
        alert(`Import errors:\n${errors.join('\n')}`);
        return;
      }
      
      if (importedProducts.length === 0) {
        alert('No valid products found in CSV file');
        return;
      }
      
      const confirmed = window.confirm(
        `Import ${importedProducts.length} products?\n\n` +
        `This will add them to your current inventory of ${products.length} products.`
      );
      
      if (confirmed) {
        onImportProducts(importedProducts);
        alert(`Successfully imported ${importedProducts.length} products!`);
      }
      
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import CSV file. Please check the file format.');
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExportClick = () => {
    setIsExporting(true);
    
    try {
      const csvContent = productsToCSV(products);
      const filename = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csvContent, filename);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export CSV file.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleTemplateClick = () => {
    downloadCSVTemplate();
  };

  const buttonStyle = {
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };

  const containerStyle = {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  };

  return (
    <div style={containerStyle}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      {/* Import button */}
      <button
        onClick={handleImportClick}
        disabled={isImporting}
        style={{
          ...buttonStyle,
          backgroundColor: isImporting ? '#9ca3af' : '#3b82f6',
          color: 'white',
          cursor: isImporting ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={(e) => {
          if (!isImporting) {
            (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
          }
        }}
        onMouseLeave={(e) => {
          if (!isImporting) {
            (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6';
          }
        }}
      >
        {isImporting ? '📥 Importing...' : '📥 Import CSV'}
      </button>
      
      {/* Export button */}
      <button
        onClick={handleExportClick}
        disabled={isExporting || products.length === 0}
        style={{
          ...buttonStyle,
          backgroundColor: isExporting || products.length === 0 ? '#9ca3af' : '#10b981',
          color: 'white',
          cursor: isExporting || products.length === 0 ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={(e) => {
          if (!isExporting && products.length > 0) {
            (e.target as HTMLButtonElement).style.backgroundColor = '#059669';
          }
        }}
        onMouseLeave={(e) => {
          if (!isExporting && products.length > 0) {
            (e.target as HTMLButtonElement).style.backgroundColor = '#10b981';
          }
        }}
      >
        {isExporting ? '📤 Exporting...' : '📤 Export CSV'}
      </button>
      
      {/* Template button */}
      <button
        onClick={handleTemplateClick}
        style={{
          ...buttonStyle,
          backgroundColor: '#f59e0b',
          color: 'white',
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = '#d97706';
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.backgroundColor = '#f59e0b';
        }}
      >
        📋 Template
      </button>
      
      {/* Help tooltip */}
      <div style={{ 
        fontSize: '12px', 
        color: '#6b7280',
        marginLeft: '8px',
        cursor: 'help'
      }}
      title="CSV Format: name,type,category,brand,country,purchasePrice,sellingPrice,quantity"
      >
        ℹ️
      </div>
    </div>
  );
};

export default ImportExportButtons; 