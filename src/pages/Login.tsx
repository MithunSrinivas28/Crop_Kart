import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, LogIn, ArrowRight, ShieldCheck, Globe, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const profile = await loginWithGoogle();
      toast.success('Welcome back to CropKart!');
      navigate(`/${profile.role}/dashboard`);
    } catch (error) {
      console.error(error);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden px-4">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-100/50 rounded-full blur-[120px]" />
      <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100">
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-2 text-3xl font-bold text-slate-900 mb-6">
              <div className="bg-brand-600 p-1.5 rounded-lg">
                <Sprout className="w-8 h-8 text-white" />
              </div>
              CropKart
            </Link>
            <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-slate-500 font-medium">Continue your journey in the future of agriculture.</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-4 bg-white border-2 border-slate-100 p-4 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-200 transition-all group shadow-sm"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              {loading ? 'Authenticating...' : 'Continue with Google'}
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
              Don't have an account?{' '}
              <Link to="/signup" className="text-brand-600 font-bold hover:underline">
                Sign up now
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

export default Login;
