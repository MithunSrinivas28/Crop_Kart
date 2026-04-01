import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, User, ShoppingBag, Truck, ArrowRight, ShieldCheck, Globe, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

const Signup = () => {
  const [role, setRole] = useState<'farmer' | 'vendor' | 'supplier' | null>(null);
  const [loading, setLoading] = useState(false);
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!role) {
      toast.error('Please select your role first.');
      return;
    }
    setLoading(true);
    try {
      const profile = await loginWithGoogle(role);
      toast.success(`Welcome to CropKart, ${role}!`);
      navigate(`/${profile.role}/dashboard`);
    } catch (error) {
      console.error(error);
      toast.error('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'farmer', title: 'Farmer', icon: Sprout, desc: 'Sell harvests directly to vendors.', color: 'bg-brand-50 text-brand-600 border-brand-100' },
    { id: 'vendor', title: 'Vendor', icon: ShoppingBag, desc: 'Subscribe to fresh harvests.', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { id: 'supplier', title: 'Supplier', icon: Truck, desc: 'Sell agri-products to farmers.', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden px-4 py-20">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-100/50 rounded-full blur-[120px]" />
      <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full relative z-10"
      >
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100">
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-2 text-3xl font-bold text-slate-900 mb-6">
              <div className="bg-brand-600 p-1.5 rounded-lg">
                <Sprout className="w-8 h-8 text-white" />
              </div>
              CropKart
            </Link>
            <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Join the Future</h2>
            <p className="text-slate-500 font-medium">Select your role to start your journey.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id as any)}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center text-center gap-4 group ${
                  role === r.id 
                    ? `${r.color} border-current ring-4 ring-current/10` 
                    : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                  role === r.id ? 'bg-white shadow-lg' : 'bg-slate-50'
                }`}>
                  <r.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{r.title}</h3>
                  <p className="text-[10px] font-medium text-slate-500 leading-tight">{r.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <button
              onClick={handleSignup}
              disabled={loading || !role}
              className={`w-full flex items-center justify-center gap-4 p-4 rounded-2xl font-bold transition-all group shadow-sm ${
                role 
                  ? 'bg-slate-900 text-white hover:bg-slate-800' 
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              {loading ? 'Creating Account...' : 'Continue with Google'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-slate-400 bg-white px-4">Secure Access</div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <ShieldCheck className="w-5 h-5 text-brand-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Secure</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <Globe className="w-5 h-5 text-emerald-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Global</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <Zap className="w-5 h-5 text-amber-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Fast</span>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-slate-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-600 font-bold hover:underline">
                Login now
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-slate-400 text-xs font-medium">
          By continuing, you agree to CropKart's <br />
          <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
