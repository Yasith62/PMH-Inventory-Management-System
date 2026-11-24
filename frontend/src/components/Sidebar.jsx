import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Truck,
  ShoppingCart,
  Receipt,
  BarChart3,
  Users,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/suppliers', icon: Truck, label: 'Suppliers', adminOnly: true },
  { to: '/purchases', icon: ShoppingCart, label: 'Purchases', adminOnly: true },
  { to: '/sales', icon: Receipt, label: 'Sales' },
  { to: '/reports', icon: BarChart3, label: 'Reports', adminOnly: true },
  { to: '/users', icon: Users, label: 'Users', adminOnly: true },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNav = navItems.filter((item) => !item.adminOnly || isAdmin);

  const NavContent = ({ collapsed = false }) => (
    <>
      <div className={`px-6 py-6 h-[103px] ${collapsed ? 'flex items-center justify-center' : ''}`}>
        <div className={`flex items-center ${collapsed ? '' : 'gap-3'}`}>
          <div className="flex h-[54px] w-[56px] items-center justify-center rounded-[19px] bg-white font-bold text-[#0038ff] shadow-glow shrink-0">
            IMS
          </div>
          {!collapsed && (
            <div>
              <p className="font-bold text-white text-[16px] leading-[27px]">Inventory Management System</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center ${collapsed ? 'justify-center' : 'gap-3'} rounded-[19px] px-4 py-3 text-[20px] font-bold transition ${
                isActive
                  ? 'bg-white text-[#0025ff] shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`
            }
            title={collapsed ? label : ''}
          >
            <Icon size={24} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/20 p-4">
        <div className={`mb-3 rounded-[20px] bg-[rgba(255,255,255,0.99)] px-4 py-3 ${collapsed ? 'flex items-center justify-center' : ''}`}>
          <div className={`flex items-center ${collapsed ? '' : 'gap-3'}`}>
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-[#0025ff]">{user?.name}</p>
                <p className="truncate text-xs text-[#3b82f6]">{user?.email}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <span className="mt-2 inline-block rounded-[12px] bg-[rgba(59,130,246,0.4)] px-2 py-0.5 text-xs font-semibold capitalize text-[#0025ff]">
              {user?.role}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className={`flex w-full items-center ${collapsed ? 'justify-center' : 'gap-3'} rounded-xl px-4 py-3 text-[20px] font-bold text-white transition hover:bg-white/10`}
          title={collapsed ? 'Logout' : ''}
        >
          <LogOut size={24} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-40 rounded-xl bg-slate-900 p-2.5 text-white shadow-lg lg:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={22} />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Desktop: Full sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-[348px] flex-col bg-gradient-to-b from-[#0b1f5c] via-[#0025ff] to-[#0038ff] rounded-tr-[54px]">
        <NavContent collapsed={false} />
      </aside>

      {/* Tablet: Icon-only sidebar */}
      <aside className="hidden md:flex lg:hidden fixed inset-y-0 left-0 z-50 w-[80px] flex-col bg-gradient-to-b from-[#0b1f5c] via-[#0025ff] to-[#0038ff] rounded-tr-[54px]">
        <NavContent collapsed={true} />
      </aside>

      {/* Mobile: Full sidebar with hamburger menu */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[348px] flex-col bg-gradient-to-b from-[#0b1f5c] via-[#0025ff] to-[#0038ff] rounded-tr-[54px] transition-transform md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          type="button"
          className="absolute right-3 top-3 rounded-lg p-2 text-slate-400"
          onClick={() => setMobileOpen(false)}
        >
          <X size={20} />
        </button>
        <NavContent collapsed={false} />
      </aside>
    </>
  );
}
