import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Package, 
  Users, 
  AlertTriangle, 
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);

    fetch('/api/orders')
      .then(res => res.json())
      .then(data => setRecentOrders(data.slice(0, 5)))
      .catch(console.error);
  }, []);

  if (!stats) return <div className="p-8 text-textMuted animate-pulse">Loading dashboard...</div>;

  const statCards = [
    { label: "Total Orders", value: stats.ordersCount, icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Pending Fulfillments', value: stats.pendingFulfillments, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Active Suppliers', value: stats.activeSuppliers, icon: Users, color: 'text-secondary', bg: 'bg-secondary/10' },
    { label: 'Low Stock Alerts', value: stats.lowStockCount, icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/10' },
    { label: 'Total Margin', value: `₹${stats.totalMargin}`, icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
  ];

  const totalMarketplaceOrders = (stats.platformSplit.amazon + stats.platformSplit.flipkart) || 1;

  const platformSplit = [
    { name: 'Amazon', count: stats.platformSplit.amazon, percentage: Math.round((stats.platformSplit.amazon / totalMarketplaceOrders) * 100), color: 'bg-[#FF9900]' },
    { name: 'Flipkart', count: stats.platformSplit.flipkart, percentage: Math.round((stats.platformSplit.flipkart / totalMarketplaceOrders) * 100), color: 'bg-[#2874F0]' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-textMuted mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold text-text">{stat.value}</h3>
              </div>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text">Recent Orders</h2>
            <Link to="/orders" className="text-sm text-primary hover:text-primaryHover flex items-center">
              View All <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Platform</th>
                  <th>Customer</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-medium text-primary">
                      <Link to={`/orders/${order.id}`} className="hover:underline">{order.marketplaceOrderId}</Link>
                    </td>
                    <td>
                      <span className={`badge ${order.marketplace === 'Amazon' ? 'bg-[#FF9900]/10 text-[#FF9900] border-[#FF9900]/20' : 'bg-[#2874F0]/10 text-[#2874F0] border-[#2874F0]/20'}`}>
                        {order.marketplace}
                      </span>
                    </td>
                    <td>{order.customerName}</td>
                    <td>
                      <span className="badge badge-primary">{order.status}</span>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-textMuted">No orders recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="p-5 border-b border-border">
            <h2 className="text-lg font-semibold text-text">Platform Split</h2>
          </div>
          <div className="p-5 space-y-6">
            {platformSplit.map((platform) => (
              <div key={platform.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-text">{platform.name}</span>
                  <span className="text-sm text-textMuted">{platform.count} orders</span>
                </div>
                <div className="w-full h-3 bg-surfaceLight rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${platform.color}`} 
                    style={{ width: `${platform.percentage}%` }}
                  />
                </div>
                <div className="text-right mt-1">
                  <span className="text-xs font-semibold text-text">{platform.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

