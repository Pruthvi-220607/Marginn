import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Package, ShoppingCart, Lightbulb, LogOut, Box } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Orders', path: '/orders', icon: ShoppingCart },
  { name: 'Suppliers', path: '/suppliers', icon: Users },
  { name: 'Products', path: '/products', icon: Package },
];

const insightNavItems = [
  { name: 'AI Insights', path: '/insights', icon: Lightbulb },
];

export function Layout() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col transition-all">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Box className="w-6 h-6 text-primary mr-3" />
          <span className="text-xl font-bold text-text tracking-wide">FulfillFlow</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1">
          <div className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2 px-3 mt-2">Operations</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex items-center px-3 py-2.5 rounded-lg transition-colors group',
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-textMuted hover:bg-surfaceLight hover:text-text'
                )}
              >
                <Icon className={clsx('w-5 h-5 mr-3', isActive ? 'text-primary' : 'text-textMuted group-hover:text-text')} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}

          <div className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-2 px-3 mt-8">Intelligence</div>
          {insightNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex items-center px-3 py-2.5 rounded-lg transition-colors group',
                  isActive 
                    ? 'bg-secondary/10 text-secondary' 
                    : 'text-textMuted hover:bg-surfaceLight hover:text-text'
                )}
              >
                <Icon className={clsx('w-5 h-5 mr-3', isActive ? 'text-secondary' : 'text-textMuted group-hover:text-text')} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Link to="/" className="flex items-center px-3 py-2 rounded-lg text-textMuted hover:bg-surfaceLight hover:text-danger transition-colors group w-full">
            <LogOut className="w-5 h-5 mr-3 group-hover:text-danger" />
            <span className="font-medium">Disconnect</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col bg-background">
        <header className="h-16 border-b border-border bg-surface/50 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <h1 className="text-lg font-semibold text-text capitalize">
            {location.pathname.split('/')[1] || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <span className="text-sm font-medium text-primary">OP</span>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 animate-fade-in relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
