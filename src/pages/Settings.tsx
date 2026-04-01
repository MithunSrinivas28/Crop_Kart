import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Bell, 
  Moon, 
  Sun, 
  LogOut, 
  Shield, 
  ChevronRight, 
  Globe,
  Settings as SettingsIcon,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Logout failed');
    } finally {
      setLoggingOut(false);
    }
  };

  const sections = [
    {
      title: 'Account Settings',
      items: [
        { icon: User, label: 'Profile Information', description: 'Update your name, email, and location', link: '/profile' },
        { icon: Shield, label: 'Security', description: 'Change password and security settings', link: '/profile' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { 
          icon: darkMode ? Moon : Sun, 
          label: 'Theme', 
          description: darkMode ? 'Dark Mode' : 'Light Mode',
          action: () => setDarkMode(!darkMode),
          toggle: darkMode
        },
        { 
          icon: Bell, 
          label: 'Notifications', 
          description: 'Manage your alert preferences',
          action: () => setNotifications(!notifications),
          toggle: notifications
        },
        { icon: Globe, label: 'Language', description: 'English (US)', link: '#' },
      ]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-green-100 rounded-2xl text-green-700">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">Manage your account and app preferences</p>
        </div>
      </div>

      <div className="space-y-8">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                {section.title}
              </h2>
            </div>
            <div className="divide-y divide-gray-50">
              {section.items.map((item, itemIdx) => (
                <div 
                  key={itemIdx}
                  onClick={item.action}
                  className={`flex items-center justify-between p-6 hover:bg-gray-50 transition-colors cursor-pointer`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 rounded-xl text-gray-600">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                  
                  {item.toggle !== undefined ? (
                    <div 
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                        item.toggle ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <div 
                        className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${
                          item.toggle ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full bg-red-50 text-red-600 p-6 rounded-2xl font-semibold hover:bg-red-100 transition-all flex items-center justify-center gap-3 border border-red-100"
        >
          {loggingOut ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <LogOut className="w-5 h-5" />
          )}
          Logout from Account
        </button>
      </div>
    </motion.div>
  );
};

export default Settings;
