import type { Product } from '../types';
import { formatBDT } from '../utils/currency';

const StatDisplay: React.FC<{ label: string; value: string | number; icon?: string; color?: string }> = ({ 
  label, 
  value, 
  icon = "📊", 
  color = "#3b82f6" 
}) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default',
  }}
  onMouseEnter={(e) => {
    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 12px 0 rgba(0, 0, 0, 0.15)';
  }}
  onMouseLeave={(e) => {
    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
      <div style={{
        fontSize: '24px',
        backgroundColor: `${color}15`,
        borderRadius: '8px',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '48px',
        height: '48px',
      }}>
        {icon}
      </div>
    </div>
    <div style={{ marginBottom: '8px' }}>
      <span style={{ 
        fontSize: '28px', 
        fontWeight: 'bold', 
        color: '#111827',
        display: 'block',
        lineHeight: '1.2',
      }}>
        {value}
      </span>
    </div>
    <span style={{ 
      fontSize: '14px', 
      fontWeight: '600', 
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    }}>
      {label}
    </span>
  </div>
);

interface DashboardProps {
  products: Product[];
}

const Dashboard: React.FC<DashboardProps> = ({ products }) => {
  const totalProducts = products.length;
  const totalInventoryValue = products.reduce(
    (sum, product) => sum + product.purchasePrice * product.quantity,
    0
  );
  const potentialProfit = products.reduce(
    (sum, product) => sum + (product.sellingPrice - product.purchasePrice) * product.quantity,
    0
  );

  // Calculate additional metrics
  const totalRevenue = products.reduce(
    (sum, product) => sum + product.sellingPrice * product.quantity,
    0
  );

  // Get low stock items (less than 10 units)
  const lowStockItems = products.filter(p => p.quantity < 10).length;

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #e2e8f0',
      marginBottom: '24px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 'bold', 
          color: '#111827', 
          margin: '0 0 8px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{
            fontSize: '32px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            borderRadius: '12px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            📈
          </span>
          Dashboard
        </h1>
        <p style={{ 
          fontSize: '16px', 
          color: '#6b7280', 
          margin: '0',
          fontWeight: '500',
        }}>
          Overview of your auto parts inventory
        </p>
      </div>

      {/* Main Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginBottom: '24px',
      }}>
        <StatDisplay 
          label="Total Products" 
          value={totalProducts.toString()} 
          icon="📦"
          color="#3b82f6"
        />
        <StatDisplay 
          label="Inventory Value" 
          value={formatBDT(totalInventoryValue)} 
          icon="💰"
          color="#10b981"
        />
        <StatDisplay 
          label="Potential Profit" 
          value={formatBDT(potentialProfit)} 
          icon="📊"
          color="#f59e0b"
        />
        <StatDisplay 
          label="Potential Revenue" 
          value={formatBDT(totalRevenue)} 
          icon="💵"
          color="#8b5cf6"
        />
      </div>

      {/* Quick Insights */}
      {(lowStockItems > 0 || totalProducts === 0) && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: lowStockItems > 0 ? '#fef2f2' : '#f0f9ff',
          border: `1px solid ${lowStockItems > 0 ? '#fecaca' : '#bae6fd'}`,
          borderRadius: '8px',
        }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: lowStockItems > 0 ? '#dc2626' : '#0ea5e9',
            marginBottom: '4px',
          }}>
            {totalProducts === 0 ? '🚀 Getting Started' : '⚠️ Inventory Alert'}
          </div>
          <div style={{ fontSize: '14px', color: '#374151' }}>
            {totalProducts === 0 
              ? 'Add your first product to start tracking your auto parts inventory.'
              : `${lowStockItems} item${lowStockItems !== 1 ? 's' : ''} running low on stock. Consider restocking soon.`
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 