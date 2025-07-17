import type { Product, Sale } from '../types';
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
  sales: Sale[];
}

const Dashboard: React.FC<DashboardProps> = ({ products, sales }) => {
  const totalProducts = products.length;
  const totalInventoryValue = products.reduce(
    (sum, product) => sum + product.purchasePrice * product.quantity,
    0
  );

  // Monthly calculations (current month)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlySales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
  });

  const monthlyRevenue = monthlySales.reduce((sum, sale) => sum + sale.totalRevenue, 0);
  const monthlyProfit = monthlySales.reduce((sum, sale) => sum + sale.totalProfit, 0);

  // Weekly calculations (current week)
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);
  
  const weeklySales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate >= startOfWeek;
  });

  // Credit calculations
  const totalCreditAmount = sales.reduce((sum, sale) => sum + sale.creditInfo.creditAmount, 0);

  // Sales count
  const monthlySalesCount = monthlySales.length;
  const weeklySalesCount = weeklySales.length;

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
          label="Monthly Revenue" 
          value={formatBDT(monthlyRevenue)} 
          icon="📊"
          color="#f59e0b"
        />
        <StatDisplay 
          label="Monthly Profit" 
          value={formatBDT(monthlyProfit)} 
          icon="💵"
          color="#8b5cf6"
        />
      </div>

      {/* Additional Business Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginTop: '24px',
      }}>
        <StatDisplay 
          label="Outstanding Credit" 
          value={formatBDT(totalCreditAmount)} 
          icon="💳"
          color="#dc2626"
        />
        <StatDisplay 
          label={weeklySalesCount === 1 ? "This Week" : "This Week"} 
          value={`${weeklySalesCount} sale${weeklySalesCount !== 1 ? 's' : ''}`}
          icon="📈"
          color="#059669"
        />
        <StatDisplay 
          label={monthlySalesCount === 1 ? "This Month" : "This Month"} 
          value={`${monthlySalesCount} sale${monthlySalesCount !== 1 ? 's' : ''}`}
          icon="📅"
          color="#7c3aed"
        />
      </div>
    </div>
  );
};

export default Dashboard; 