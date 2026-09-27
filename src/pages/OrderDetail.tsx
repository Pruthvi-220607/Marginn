import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, CheckCircle2, Clock, MapPin, Truck, Box } from 'lucide-react';
import clsx from 'clsx';

const timelineSteps = [
  { key: 'Received', label: 'Order Received', desc: 'Marketplace Webhook' },
  { key: 'InventoryDeducted', label: 'Inventory Deducted', desc: 'SKU reserved & audit logged' },
  { key: 'SupplierNotified', label: 'Supplier Notified', desc: 'WhatsApp/Email dispatch' },
  { key: 'ShipmentBooked', label: 'Shipment Booked', desc: 'Shiprocket logistics creation' },
  { key: 'AWBAssigned', label: 'AWB Assigned', desc: 'Tracking AWB generated' },
  { key: 'InTransit', label: 'In Transit', desc: 'Picked up from supplier address' },
  { key: 'Delivered', label: 'Delivered', desc: 'Customer received package' },
  { key: 'Exception', label: 'Delivery Exception', desc: 'Issue with delivery reported' },
  { key: 'RTO', label: 'RTO Initiated', desc: 'Return to origin initiated' },
];

export function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchOrder();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-textMuted animate-pulse">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <Link to="/orders" className="flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
        <div className="card p-8 text-center text-textMuted">Order not found.</div>
      </div>
    );
  }

  const currentStepIndex = timelineSteps.findIndex(s => s.key === order.status);
  const actualStepIndex = currentStepIndex === -1 ? 1 : currentStepIndex;

  let totalAmount = 0;
  order.lineItems?.forEach((item: any) => {
    if (item.product) {
      totalAmount += item.product.sellPrice * item.quantity;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/orders" className="p-2 rounded-lg hover:bg-surfaceLight text-textMuted hover:text-text transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-text">{order.marketplaceOrderId}</h1>
              <span className={`badge ${order.marketplace === 'Amazon' ? 'bg-[#FF9900]/10 text-[#FF9900] border-[#FF9900]/20' : 'bg-[#2874F0]/10 text-[#2874F0] border-[#2874F0]/20'}`}>
                {order.marketplace}
              </span>
            </div>
            <p className="text-sm text-textMuted mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fulfillment Pipeline */}
        <div className="card lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-text">Fulfillment Pipeline</h2>
            <div className="flex gap-2">
              {actualStepIndex < timelineSteps.length - 1 && (
                <button
                  disabled={updating}
                  onClick={() => handleStatusUpdate(timelineSteps[actualStepIndex + 1].key)}
                  className="btn btn-outline text-xs"
                >
                  Advance to {timelineSteps[actualStepIndex + 1].label}
                </button>
              )}
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute left-[21px] top-4 bottom-4 w-[2px] bg-border z-0" />
            
            <div className="space-y-8 relative z-10">
              {timelineSteps.map((step, index) => {
                const isCompleted = index <= actualStepIndex;
                const isCurrent = index === actualStepIndex;
                const isPending = index > actualStepIndex;

                return (
                  <div key={step.key} className="flex gap-4">
                    <div className={clsx(
                      'w-11 h-11 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors cursor-pointer',
                      isCompleted && !isCurrent ? 'bg-success border-success text-white' : '',
                      isCurrent ? 'bg-surface border-primary text-primary shadow-[0_0_15px_rgba(59,130,246,0.5)]' : '',
                      isPending ? 'bg-surface border-border text-textMuted' : ''
                    )}
                    onClick={() => handleStatusUpdate(step.key)}
                    title={`Click to set status to ${step.label}`}
                    >
                      {isCompleted && !isCurrent ? <CheckCircle2 className="w-5 h-5" /> : 
                       isCurrent ? <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" /> : 
                       <Clock className="w-5 h-5" />}
                    </div>
                    <div className="pt-2 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className={clsx('font-semibold text-lg', isPending ? 'text-textMuted' : 'text-text')}>
                            {step.label}
                          </h4>
                          <p className="text-sm text-textMuted mt-1">{step.desc}</p>
                        </div>
                        <span className={clsx('text-xs font-semibold px-2 py-1 rounded', isCurrent ? 'bg-primary/10 text-primary' : isCompleted ? 'bg-success/10 text-success' : 'text-textMuted')}>
                          {isCurrent ? 'Current' : isCompleted ? 'Passed' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Details Sidebar */}
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="text-md font-semibold text-text mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" /> Products ({order.lineItems?.length || 0})
            </h3>
            <div className="space-y-3">
              {order.lineItems?.map((item: any) => (
                <div key={item.id} className="flex items-start justify-between bg-surfaceLight p-3 rounded-lg border border-border">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-surface rounded flex items-center justify-center shrink-0">
                      <Box className="w-6 h-6 text-textMuted" />
                    </div>
                    <div>
                      <div className="font-medium text-text text-sm">{item.product?.title || 'Unknown Product'}</div>
                      <div className="text-xs text-textMuted">{item.product?.sku}</div>
                      <div className="text-xs text-primary font-medium mt-1">Supplier: {item.product?.supplier?.businessName || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-text">₹{item.product?.sellPrice || 0}</div>
                    <div className="text-xs text-textMuted">Qty: {item.quantity}</div>
                  </div>
                </div>
              ))}
              <div className="border-t border-border pt-3 flex justify-between font-semibold text-text">
                <span>Total Value</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-md font-semibold text-text mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-secondary" /> Customer Details
            </h3>
            <div className="text-sm text-text space-y-1">
              <div className="font-semibold">{order.customerName}</div>
              <div className="text-textMuted">{order.phone || 'No phone provided'}</div>
              <div className="text-textMuted mt-2 whitespace-pre-line">
                {order.shippingAddress}
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-md font-semibold text-text mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-success" /> Logistics Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-textMuted">Order Status</span>
                <span className="font-medium text-primary">{order.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textMuted">Order Ref</span>
                <span className="font-medium text-text">{order.marketplaceOrderId}</span>
              </div>
              {order.shiprocketOrderId && (
                <div className="flex justify-between mt-2 border-t border-border/50 pt-2">
                  <span className="text-textMuted">Shiprocket ID</span>
                  <span className="font-medium text-text">{order.shiprocketOrderId}</span>
                </div>
              )}
              {order.awbNumber && (
                <div className="flex justify-between mt-2">
                  <span className="text-textMuted">Tracking AWB</span>
                  <span className="font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">{order.awbNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

