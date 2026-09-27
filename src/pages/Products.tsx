import { useState, useEffect } from 'react';
import { Plus, Search, AlertCircle, X, Edit, Trash2, History } from 'lucide-react';

interface Supplier {
  id: string;
  businessName: string;
}

interface Product {
  id: string;
  sku: string;
  title: string;
  costPrice: number;
  sellPrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  weight?: number | null;
  dimensions?: string | null;
  supplier: Supplier;
  supplierId: string;
}

interface AuditLog {
  id: string;
  reason: string;
  beforeQuantity: number;
  afterQuantity: number;
  source: string;
  timestamp: string;
}

export function Products() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedAuditLogs, setSelectedAuditLogs] = useState<{ productTitle: string; logs: AuditLog[] } | null>(null);
  const [search, setSearch] = useState('');

  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  
  const [formData, setFormData] = useState({
    title: '', sku: '', supplierId: '', costPrice: '', sellPrice: '', stockQuantity: '', lowStockThreshold: '10', weight: '', dimensions: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers');
      const data = await res.json();
      setSuppliers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', sku: '', supplierId: '', costPrice: '', sellPrice: '', stockQuantity: '', lowStockThreshold: '10', weight: '', dimensions: ''
    });
    setEditingId(null);
    setIsAddOpen(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingId(prod.id);
    setFormData({
      title: prod.title,
      sku: prod.sku,
      supplierId: prod.supplierId || prod.supplier?.id || '',
      costPrice: String(prod.costPrice),
      sellPrice: String(prod.sellPrice),
      stockQuantity: String(prod.stockQuantity),
      lowStockThreshold: String(prod.lowStockThreshold),
      weight: prod.weight ? String(prod.weight) : '',
      dimensions: prod.dimensions || ''
    });
    setIsAddOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        title: formData.title,
        sku: formData.sku,
        supplierId: formData.supplierId,
        costPrice: parseFloat(formData.costPrice),
        sellPrice: parseFloat(formData.sellPrice),
        stockQuantity: parseInt(formData.stockQuantity, 10),
        lowStockThreshold: parseInt(formData.lowStockThreshold, 10),
        weight: formData.weight ? parseFloat(formData.weight) : null,
        dimensions: formData.dimensions || null
      };

      if (editingId) {
        await fetch(`/api/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      resetForm();
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewAuditLogs = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product.id}/audit-logs`);
      const logs = await res.json();
      setSelectedAuditLogs({ productTitle: product.title, logs });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Products & Inventory</h1>
          <p className="text-sm text-textMuted mt-1">Manage SKUs, margins, track stock levels, and audit logs.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleOpenCreate} className="btn btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-border flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
            <input 
              type="text" 
              placeholder="Search by SKU or Title..." 
              className="input pl-10"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Product Info</th>
                <th>Supplier</th>
                <th>Cost Price</th>
                <th>Sell Price</th>
                <th>Margin</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((prod) => {
                const lowStock = prod.stockQuantity <= prod.lowStockThreshold;
                const marginPercent = prod.sellPrice > 0 ? Math.round(((prod.sellPrice - prod.costPrice) / prod.sellPrice) * 100) : 0;
                return (
                  <tr key={prod.id}>
                    <td>
                      <div className="font-medium text-text">{prod.title}</div>
                      <div className="text-xs text-textMuted mt-0.5">SKU: {prod.sku} {prod.weight ? `• ${prod.weight}kg` : ''}</div>
                    </td>
                    <td>
                      <span className="text-sm">{prod.supplier?.businessName || 'N/A'}</span>
                    </td>
                    <td>₹{prod.costPrice}</td>
                    <td>₹{prod.sellPrice}</td>
                    <td>
                      <span className="text-success font-medium">
                        {marginPercent}%
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${lowStock ? 'text-danger' : 'text-text'}`}>
                          {prod.stockQuantity}
                        </span>
                        {lowStock && <AlertCircle className="w-4 h-4 text-danger" />}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleViewAuditLogs(prod)} className="text-textMuted hover:text-primary transition-colors" title="View Audit Logs">
                          <History className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleOpenEdit(prod)} className="text-textMuted hover:text-primary transition-colors" title="Edit Product">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(prod.id)} className="text-textMuted hover:text-danger transition-colors" title="Delete Product">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-textMuted">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-2xl bg-surface border border-border shadow-2xl relative animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-text">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={resetForm} className="text-textMuted hover:text-text transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Product Title</label>
                  <input type="text" className="input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div>
                  <label className="label">SKU</label>
                  <input type="text" className="input" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                </div>
                <div>
                  <label className="label">Linked Supplier</label>
                  <select className="input" value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})}>
                    <option value="">Select Supplier...</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.businessName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Cost Price (₹)</label>
                  <input type="number" className="input" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} />
                </div>
                <div>
                  <label className="label">Sell Price (₹)</label>
                  <input type="number" className="input" value={formData.sellPrice} onChange={e => setFormData({...formData, sellPrice: e.target.value})} />
                </div>
                <div>
                  <label className="label">Stock Quantity</label>
                  <input type="number" className="input" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} />
                </div>
                <div>
                  <label className="label">Low Stock Threshold</label>
                  <input type="number" className="input" value={formData.lowStockThreshold} onChange={e => setFormData({...formData, lowStockThreshold: e.target.value})} />
                </div>
                <div>
                  <label className="label">Weight (kg)</label>
                  <input type="number" step="0.1" placeholder="e.g. 0.5" className="input" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} />
                </div>
                <div>
                  <label className="label">Dimensions (LxWxH cm)</label>
                  <input type="text" placeholder="e.g. 10x10x5 cm" className="input" value={formData.dimensions} onChange={e => setFormData({...formData, dimensions: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-3 bg-surfaceLight/30">
              <button onClick={resetForm} className="btn btn-outline">Cancel</button>
              <button onClick={handleSave} className="btn btn-primary">{editingId ? 'Update Product' : 'Save Product'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Modal */}
      {selectedAuditLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-2xl bg-surface border border-border shadow-2xl relative animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h2 className="text-lg font-semibold text-text">Inventory Audit Trail</h2>
                <p className="text-xs text-textMuted">{selectedAuditLogs.productTitle}</p>
              </div>
              <button onClick={() => setSelectedAuditLogs(null)} className="text-textMuted hover:text-text transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
              {selectedAuditLogs.logs.length === 0 ? (
                <div className="text-center text-textMuted py-4">No audit logs recorded for this product.</div>
              ) : (
                selectedAuditLogs.logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-surfaceLight border border-border">
                    <div>
                      <div className="font-medium text-sm text-text">{log.reason}</div>
                      <div className="text-xs text-textMuted">Source: {log.source} • {new Date(log.timestamp).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {log.beforeQuantity} → <span className={log.afterQuantity < log.beforeQuantity ? 'text-danger' : 'text-success'}>{log.afterQuantity}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-border flex justify-end">
              <button onClick={() => setSelectedAuditLogs(null)} className="btn btn-outline">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

