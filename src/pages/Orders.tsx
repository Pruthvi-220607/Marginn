import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, X } from 'lucide-react';

export function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    marketplace: 'Amazon',
    marketplaceOrderId: '',
    customerName: '',
    shippingAddress: '',
    phone: '',
    productId: '',
    quantity: '1'
  });

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateOrder = async () => {
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketplace: formData.marketplace,
          marketplaceOrderId: formData.marketplaceOrderId || `SIM-${Date.now()}`,
          customerName: formData.customerName,
          shippingAddress: formData.shippingAddress,
          phone: formData.phone,
          items: [
            {
              productId: formData.productId,
              quantity: parseInt(formData.quantity, 10)
            }
          ]
        })
      });
      setIsAddOpen(false);
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Orders</h1>
          <p className="text-sm text-textMuted mt-1">Track and manage marketplace orders and fulfillment.</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="btn btn-warning flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Simulate Test Order
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-border flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
            <input type="text" placeholder="Search orders..." className="input pl-10" />
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Platform</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                let amount = 0;
                order.lineItems?.forEach((item: any) => amount += item.product.sellPrice * item.quantity);
                return (
                  <tr key={order.id} className="group">
                    <td className="font-medium text-primary">
                      <Link to={`/orders/${order.id}`} className="hover:underline">{order.marketplaceOrderId}</Link>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${order.marketplace === 'Amazon' ? 'bg-[#FF9900]/10 text-[#FF9900] border-[#FF9900]/20' : 'bg-[#2874F0]/10 text-[#2874F0] border-[#2874F0]/20'}`}>
                        {order.marketplace}
                      </span>
                    </td>
                    <td>{order.customerName}</td>
                    <td>₹{amount}</td>
                    <td>
                      <span className={`badge ${
                        order.status === 'Received' ? 'badge-warning' :
                        order.status === 'Delivered' ? 'badge-success' : 'badge-primary'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-textMuted">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-2xl bg-surface border border-border shadow-2xl relative animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-text">Simulate Test Order</h2>
              <button onClick={() => setIsAddOpen(false)} className="text-textMuted hover:text-text transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Marketplace</label>
                  <select className="input" value={formData.marketplace} onChange={e => setFormData({...formData, marketplace: e.target.value})}>
                    <option>Amazon</option>
                    <option>Flipkart</option>
                  </select>
                </div>
                <div>
                  <label className="label">Order ID (Auto-generated if empty)</label>
                  <input type="text" className="input" value={formData.marketplaceOrderId} onChange={e => setFormData({...formData, marketplaceOrderId: e.target.value})} />
                </div>
                <div>
                  <label className="label">Customer Name</label>
                  <input type="text" className="input" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input type="text" className="input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="label">Shipping Address</label>
                  <input type="text" className="input" value={formData.shippingAddress} onChange={e => setFormData({...formData, shippingAddress: e.target.value})} />
                </div>
                <div>
                  <label className="label">Product</label>
                  <select className="input" value={formData.productId} onChange={e => setFormData({...formData, productId: e.target.value})}>
                    <option value="">Select a Product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.sku} - {p.title} (Stock: {p.stockQuantity})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Quantity</label>
                  <input type="number" className="input" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-3 bg-surfaceLight/30">
              <button onClick={() => setIsAddOpen(false)} className="btn btn-outline">Cancel</button>
              <button onClick={handleSimulateOrder} className="btn btn-warning text-black font-semibold">Create Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
