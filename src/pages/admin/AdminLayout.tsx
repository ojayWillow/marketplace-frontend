import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useEffect } from 'react';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: '/admin', label: 'Overview', icon: '📊' },
  { path: '/admin/users', label: 'Users', icon: '👥' },
  { path: '/admin/jobs', label: 'Jobs', icon: '💼' },
  { path: '/admin/offerings', label: 'Offerings', icon: '🛠️' },
  { path: '/admin/reports', label: 'Reports', icon: '🚨' },
  { path: '/admin/announcements', label: 'Announcements', icon: '📢' },
  { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check if user is admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Check for admin role - adjust based on your backend
    if (user && !(user as any).is_admin && user.email !== 'admin@tirgus.lv') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-xl font-bold">
              T
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg">Tirgus</h1>
                <p className="text-xs text-gray-400">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Toggle */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span>{sidebarOpen ? '◀' : '▶'}</span>
            {sidebarOpen && <span className="text-sm">Collapse</span>}
          </button>
        </div>

        {/* Back to Site */}
        <div className="p-4 border-t border-gray-800">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span>🏠</span>
            {sidebarOpen && <span className="text-sm">Back to Site</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {navItems.find(item => isActive(item.path))?.label || 'Admin'}
              </h1>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium text-gray-900">{user?.username || 'Admin'}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {user?.username?.charAt(0)?.toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
