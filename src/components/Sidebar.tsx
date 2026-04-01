import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Sprout, 
  ShoppingCart, 
  Package, 
  LogOut, 
  ClipboardList,
  Settings,
  User,
  HelpCircle,
  ChevronRight,
  Menu,
  X,
  Bell,
  Search,
  Zap,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getLinks = () => {
    const base = user?.role === 'farmer' ? '/farmer/dashboard' : 
                 user?.role === 'vendor' ? '/vendor/dashboard' : 
                 '/supplier/dashboard';

    switch (user?.role) {
      case 'farmer':
        return [
          { name: 'Overview', path: `${base}`, icon: LayoutDashboard },
          { name: 'Subscriptions', path: `${base}/subscriptions`, icon: ClipboardList },
          { name: 'Marketplace', path: `${base}/marketplace`, icon: ShoppingCart },
          { name: 'AI Insights', path: `${base}/ai-insights`, icon: Zap },
          { name: 'My Orders', path: `${base}/orders`, icon: FileText },
        ];
      case 'vendor':
        return [
          { name: 'Browse Crops', path: `${base}`, icon: Sprout },
          { name: 'My Subscriptions', path: `${base}/subscriptions`, icon: ClipboardList },
        ];
      case 'supplier':
        return [
          { name: 'Inventory', path: `${base}`, icon: Package },
          { name: 'Add Product', path: `${base}/add`, icon: Package },
        ];
      default:
        return [];
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '288px' }}
      className="bg-slate-900 text-slate-400 flex flex-col h-screen sticky top-0 overflow-hidden border-r border-white/5 z-50 transition-all duration-300 ease-in-out"
    >
      <div className="p-6 flex items-center justify-between">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Link to="/" className="text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
                <div className="bg-brand-600 p-1.5 rounded-xl shadow-lg shadow-brand-900/20">
                  <Sprout className="w-7 h-7 text-white" />
                </div>
                CropKart
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
        >
          {isCollapsed ? <Menu className="w-6 h-6" /> : <X className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar pt-4">
        <div>
          {!isCollapsed && (
            <div className="px-4 mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Main Menu</div>
          )}
          <nav className="space-y-1">
            {getLinks().map((link) => (
              <Link
                key={`${link.name}-${link.path}`}
                to={link.path}
                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group relative ${
                  isActive(link.path) 
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20' 
                    : 'hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <link.icon className={`w-5 h-5 flex-shrink-0 ${isActive(link.path) ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-semibold text-sm whitespace-nowrap"
                    >
                      {link.name}
                    </motion.span>
                  )}
                </div>
                {!isCollapsed && isActive(link.path) && (
                  <ChevronRight className="w-4 h-4 text-white/70" />
                )}
                
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                    {link.name}
                  </div>
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          {!isCollapsed && (
            <div className="px-4 mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">System</div>
          )}
          <nav className="space-y-1">
            <Link 
              to="/profile"
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group relative ${
                isActive('/profile') ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20' : 'hover:bg-white/5 hover:text-white'
              }`}
            >
              <User className={`w-5 h-5 flex-shrink-0 ${isActive('/profile') ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
              {!isCollapsed && <span className="font-semibold text-sm">Profile</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                  Profile
                </div>
              )}
            </Link>
            <Link 
              to="/settings"
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group relative ${
                isActive('/settings') ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20' : 'hover:bg-white/5 hover:text-white'
              }`}
            >
              <Settings className={`w-5 h-5 flex-shrink-0 ${isActive('/settings') ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
              {!isCollapsed && <span className="font-semibold text-sm">Settings</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                  Settings
                </div>
              )}
            </Link>
          </nav>
        </div>
      </div>

      <div className="p-4 mt-auto">
        <div className={`bg-white/5 rounded-3xl p-4 border border-white/5 mb-4 transition-all ${isCollapsed ? 'items-center' : ''}`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'mb-4'}`}>
            <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand-900/20">
              {user?.name[0].toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-500">{user?.role}</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          )}
          {isCollapsed && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-2 bg-red-500/10 text-red-500 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all mt-4"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
        {!isCollapsed && (
          <div className="text-[10px] text-center font-bold text-slate-600 uppercase tracking-widest">
            CropKart v2.4.0
          </div>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
