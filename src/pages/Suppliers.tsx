import { useState, useEffect } from 'react';
import { Plus, Search, MapPin, X, Edit, Trash2 } from 'lucide-react';

interface Supplier {
  id: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string | null;
  street: string;
  city: string;
  state: string;
  pincode: string;
  paymentTerms: string;
  notificationChannel: string;
}

export function Suppliers() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [formData, setFormData] = useState({
    businessName: '', contactPerson: '', phone: '', email: '', 
    street: '', city: '', state: '', pincode: '', 
    paymentTerms: 'Advance', notificationChannel: 'WhatsApp'
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

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
      businessName: '', contactPerson: '', phone: '', email: '', 
      street: '', city: '', state: '', pincode: '', 
      paymentTerms: 'Advance', notificationChannel: 'WhatsApp'
    });
    setEditingId(null);
    setIsAddOpen(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleOpenEdit = (sup: Supplier) => {
    setEditingId(sup.id);
    setFormData({
      businessName: sup.businessName,
      contactPerson: sup.contactPerson,
      phone: sup.phone,
      email: sup.email || '',
      street: sup.street,
      city: sup.city,
      state: sup.state,
      pincode: sup.pincode,
      paymentTerms: sup.paymentTerms,
      notificationChannel: sup.notificationChannel
    });
    setIsAddOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    try {
      await fetch(`/api/suppliers/${id}`, { method: 'DELETE' });
      fetchSuppliers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await fetch(`/api/suppliers/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('/api/suppliers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      resetForm();
      fetchSuppliers();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.businessName.toLowerCase().includes(search.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
    s.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Suppliers</h1>
          <p className="text-sm text-textMuted mt-1">Manage your drop-ship supply partners and pickup locations.</p>
        </div>
        <button onClick={handleOpenCreate} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Supplier
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-border flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
            <input 
              type="text" 
              placeholder="Search suppliers by name, contact, city..." 
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
                <th>Supplier Info</th>
                <th>Pickup Address</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((sup) => (
                <tr key={sup.id}>
                  <td>
                    <div className="font-medium text-text">{sup.businessName}</div>
                    <div className="text-xs text-textMuted mt-1 flex items-center gap-1">
                      {sup.notificationChannel} • {sup.paymentTerms}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-start gap-1 max-w-xs">
                      <MapPin className="w-4 h-4 text-textMuted mt-0.5 shrink-0" />
                      <span className="text-sm text-textMuted">{sup.street}, {sup.city}, {sup.state} - {sup.pincode}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{sup.contactPerson}</span>
                      <span className="text-xs text-textMuted">{sup.phone}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleOpenEdit(sup)} className="text-textMuted hover:text-primary transition-colors" title="Edit Supplier">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(sup.id)} className="text-textMuted hover:text-danger transition-colors" title="Delete Supplier">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSuppliers.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-textMuted">No suppliers found.</td>
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
              <h2 className="text-lg font-semibold text-text">{editingId ? 'Edit Supplier' : 'Add New Supplier'}</h2>
              <button onClick={resetForm} className="text-textMuted hover:text-text transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Business Name</label>
                  <input type="text" className="input" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
                </div>
                <div>
                  <label className="label">Contact Person</label>
                  <input type="text" className="input" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} />
                </div>
                <div>
                  <label className="label">Phone / WhatsApp</label>
                  <input type="text" className="input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input type="email" className="input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="label">Street Address</label>
                  <input type="text" className="input" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} />
                </div>
                <div>
                  <label className="label">City</label>
                  <input type="text" className="input" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>
                <div>
                  <label className="label">State</label>
                  <input type="text" className="input" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                </div>
                <div>
                  <label className="label">PIN Code</label>
                  <input type="text" className="input" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} />
                </div>
                <div>
                  <label className="label">Payment Terms</label>
                  <select className="input" value={formData.paymentTerms} onChange={e => setFormData({...formData, paymentTerms: e.target.value})}>
                    <option>Advance</option>
                    <option>Net 15</option>
                    <option>Net 30</option>
                  </select>
                </div>
                <div>
                  <label className="label">Notification Channel</label>
                  <select className="input" value={formData.notificationChannel} onChange={e => setFormData({...formData, notificationChannel: e.target.value})}>
                    <option>WhatsApp (Recommended)</option>
                    <option>Email</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-border flex justify-end gap-3 bg-surfaceLight/30">
              <button onClick={resetForm} className="btn btn-outline">Cancel</button>
              <button onClick={handleSave} className="btn btn-primary">{editingId ? 'Update Supplier' : 'Save Supplier'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

