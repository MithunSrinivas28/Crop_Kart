import React, { useState } from 'react';
import { Bell, Search, User, LogOut, Settings, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const notifications = [
    { id: 1, title: 'New Subscription', message: 'A vendor subscribed to your Wheat crop.', time: '2m ago', read: false },
    { id: 2, title: 'Price Alert', message: 'Market price for Corn increased by 5%.', time: '1h ago', read: false },
    { id: 3, title: 'System Update', message: 'New AI features are now available.', time: '5h ago', read: true },
  ];

  return (
    <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
          <input 
            type="text" 
            placeholder="Search for crops, vendors, or insights..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors relative group"
          >
            <Bell className="w-5 h-5 text-slate-600 group-hover:text-brand-600 transition-colors" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)}></div>
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-20"
                >
                  <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900">Notifications</h3>
                    <button className="text-[10px] font-bold text-brand-600 uppercase tracking-widest hover:underline">Mark all as read</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar">
                    {notifications.map((n) => (
                      <div key={n.id} className={`p-5 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer relative ${!n.read ? 'bg-brand-50/30' : ''}`}>
                        {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-600"></div>}
                        <p className="text-sm font-bold text-slate-900 mb-1">{n.title}</p>
                        <p className="text-xs text-slate-500 leading-relaxed mb-2">{n.message}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{n.time}</p>
                      </div>
                    ))}
                  </div>
                  <button className="w-full py-4 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">View All Notifications</button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-px bg-slate-100"></div>

        <div className="relative">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 p-1.5 pr-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-900/20">
              {user?.name[0].toUpperCase()}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-slate-900 truncate max-w-[100px]">{user?.name}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{user?.role}</p>
            </div>
          </button>

          <AnimatePresence>
            {showProfile && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowProfile(false)}></div>
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-20"
                >
                  <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                    <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 hover:text-slate-900 group">
                      <User className="w-4 h-4 text-slate-400 group-hover:text-brand-600" />
                      <span className="text-sm font-semibold">My Profile</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 hover:text-slate-900 group">
                      <Settings className="w-4 h-4 text-slate-400 group-hover:text-brand-600" />
                      <span className="text-sm font-semibold">Settings</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 hover:text-slate-900 group">
                      <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-brand-600" />
                      <span className="text-sm font-semibold">Help Center</span>
                    </button>
                  </div>
                  <div className="p-2 border-t border-slate-100">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-colors text-red-500 group"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-bold">Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
