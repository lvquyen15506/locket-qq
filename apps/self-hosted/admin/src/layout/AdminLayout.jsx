import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Palette, Settings, LogOut, Users } from 'lucide-react';
import { clsx } from 'clsx';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin_secret');
    navigate('/login');
  };

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/themes', icon: Palette, label: 'Quản lý Theme' },
    { path: '/config', icon: Settings, label: 'Cấu hình' },
  ];

  return (
    <div className="flex min-h-screen bg-base-300">
      {/* Sidebar */}
      <aside className="w-64 bg-base-100 shadow-xl hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <span className="p-2 bg-primary text-primary-content rounded-lg">L</span>
            Admin QQ
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                location.pathname === item.path 
                  ? "bg-primary text-primary-content font-semibold shadow-lg shadow-primary/20" 
                  : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-base-200">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-error hover:bg-error/10 transition-colors"
          >
            <LogOut size={20} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
