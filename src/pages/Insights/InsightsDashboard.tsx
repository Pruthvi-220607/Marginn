import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, ShieldCheck, Zap } from 'lucide-react';

export function InsightsDashboard() {
  const [pricing, setPricing] = useState<any[]>([]);
  const [reorder, setReorder] = useState<any[]>([]);
  const [health, setHealth] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/ai-engine/pricing').then(res => res.json()).catch(() => []),
      fetch('/api/ai-engine/reorder').then(res => res.json()).catch(() => []),
      fetch('/api/ai-engine/supplier-health').then(res => res.json()).catch(() => [])
    ]).then(([p, r, h]) => {
      setPricing(Array.isArray(p) ? p : []);
      setReorder(Array.isArray(r) ? r : []);
      setHealth(Array.isArray(h) ? h : []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-6 border-b border-border/50">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center border border-secondary/20 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
          <Zap className="w-6 h-6 text-secondary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text bg-gradient-to-r from-text to-textMuted bg-clip-text text-transparent">AI Intelligence</h1>
          <p className="text-sm text-secondary/80 mt-1">Advisory module for optimization and scaling. Does not block fulfillment.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-textMuted animate-pulse">Running Intelligence Engine...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pricing Suggestions */}
          <div className="card border-secondary/20 bg-surface/80 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-[50px]" />
            <div className="p-5 border-b border-border/50 relative z-10 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
              <h2 className="text-lg font-semibold text-text">Pricing Opportunities</h2>
            </div>
            <div className="p-5 space-y-4 relative z-10 max-h-[500px] overflow-y-auto">
              {pricing.length === 0 ? (
                <div className="text-sm text-textMuted text-center py-4">All margins are optimized.</div>
              ) : (
                pricing.map(item => (
                  <div key={item.id} className="bg-surfaceLight/50 p-4 rounded-xl border border-border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-sm font-medium text-text">{item.title}</div>
                        <div className="text-xs text-textMuted">{item.sku}</div>
                      </div>
                      <span className="badge badge-success shrink-0 whitespace-nowrap">₹{item.suggestedPrice}</span>
                    </div>
                    <p className="text-sm text-textMuted leading-relaxed">{item.reason}</p>
                    <button className="mt-3 btn btn-secondary text-xs w-full">Apply Target Price</button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Reorder Alerts */}
          <div className="card border-warning/20 bg-surface/80 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-warning/10 rounded-full blur-[50px]" />
            <div className="p-5 border-b border-border/50 relative z-10 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <h2 className="text-lg font-semibold text-text">Predictive Reorder</h2>
            </div>
            <div className="p-5 space-y-4 relative z-10 max-h-[500px] overflow-y-auto">
              {reorder.length === 0 ? (
                <div className="text-sm text-textMuted text-center py-4">Stock levels are healthy.</div>
              ) : (
                reorder.map(item => (
                  <div key={item.id} className="bg-surfaceLight/50 p-4 rounded-xl border border-border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-sm font-medium text-text">{item.title}</div>
                        <div className="text-xs text-textMuted">Supplier: {item.supplierName}</div>
                      </div>
                      <span className={item.critical ? "badge badge-danger" : "badge badge-warning"}>
                        {item.critical ? 'Critical' : 'Low'}
                      </span>
                    </div>
                    <p className="text-sm text-textMuted leading-relaxed">
                      Current stock: {item.currentStock}. Average daily velocity: {item.dailyVelocity}. 
                      Stock will deplete in {item.daysOfStock} days.
                    </p>
                    <button className="mt-3 btn bg-warning/20 text-warning hover:bg-warning/30 text-xs w-full">Draft Supplier WhatsApp</button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Supplier Reliability */}
          <div className="card border-primary/20 bg-surface/80 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px]" />
            <div className="p-5 border-b border-border/50 relative z-10 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-text">Supplier Health</h2>
            </div>
            <div className="p-5 space-y-4 relative z-10 max-h-[500px] overflow-y-auto">
              {health.length === 0 ? (
                <div className="text-sm text-textMuted text-center py-4">Not enough data to score suppliers.</div>
              ) : (
                health.map(item => (
                  <div key={item.id} className="bg-surfaceLight/50 p-4 rounded-xl border border-border">
                    <div className="flex justify-between items-center mb-3">
                      <div className="font-medium text-text truncate pr-2">{item.name}</div>
                      <span className={`text-lg font-bold shrink-0 ${parseFloat(item.score) >= 7 ? 'text-success' : 'text-danger'}`}>
                        {item.score}<span className="text-xs text-textMuted">/10</span>
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-textMuted">Total Orders Handled</span>
                        <span className="text-text font-medium">{item.totalOrders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-textMuted">Exceptions / RTOs</span>
                        <span className={`${item.exceptions > 0 ? 'text-danger' : 'text-text'} font-medium`}>{item.exceptions}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

