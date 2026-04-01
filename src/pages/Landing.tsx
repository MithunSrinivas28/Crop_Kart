import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldCheck, TrendingUp, Users, ArrowRight, CheckCircle2, Globe, Zap } from 'lucide-react';
import { motion } from 'motion/react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <header className="fixed w-full z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between glass mt-4 rounded-full shadow-lg border-white/40">
          <div className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
            <div className="bg-brand-600 p-1.5 rounded-lg shadow-lg shadow-brand-200">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            CropKart
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Features</a>
            <a href="#stats" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">Impact</a>
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">About</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-brand-600 px-4 py-2">Login</Link>
            <Link to="/signup" className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-100/50 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold uppercase tracking-widest mb-6">
                <Zap className="w-3 h-3" />
                The Future of Agriculture
              </div>
              <h1 className="text-6xl md:text-8xl font-bold text-slate-900 leading-[0.9] tracking-tighter mb-8">
                Direct from <br />
                <span className="text-gradient">Farm to Table.</span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl">
                Eliminate middlemen, secure your harvest, and empower the agricultural ecosystem. 
                The world's first subscription-based farm-to-vendor marketplace.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link to="/signup" className="w-full sm:w-auto bg-brand-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-brand-700 transition-all shadow-2xl shadow-brand-200 flex items-center justify-center gap-2 group">
                  Join as a Farmer 
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link to="/signup" className="w-full sm:w-auto bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-slate-50 transition-all shadow-lg shadow-slate-100">
                  Join as a Vendor
                </Link>
              </div>
              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <img 
                      key={i}
                      src={`https://picsum.photos/seed/user${i}/100/100`} 
                      className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                      referrerPolicy="no-referrer"
                      alt="User"
                    />
                  ))}
                </div>
                <div className="text-sm text-slate-500">
                  <span className="font-bold text-slate-900">10,000+</span> farmers already joined
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white/50">
                <img 
                  src="https://picsum.photos/seed/agriculture/1200/1600" 
                  alt="Agriculture" 
                  className="w-full aspect-[4/5] object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 glass p-6 rounded-3xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Live Market</span>
                    <span className="flex items-center gap-1 text-xs font-bold text-brand-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse" />
                      Active
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">Organic Wheat Harvest</div>
                  <div className="text-sm text-slate-600">Expected: June 2026 • 500 Tons</div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-400/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features - Visible Grid Structure */}
      <section id="features" className="py-32 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20 max-w-2xl">
            <h2 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">Revolutionizing the <span className="italic font-serif">Agri-Supply Chain</span></h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              We've built a platform that addresses the core challenges of modern agriculture through transparency and direct connection.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-slate-200 rounded-3xl overflow-hidden border border-slate-200 shadow-2xl">
            <div className="bg-white p-12 hover:bg-brand-50 transition-colors group">
              <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600 mb-8 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Guaranteed Sales</h3>
              <p className="text-slate-600 leading-relaxed">
                Farmers can sell their crops even before harvest through our subscription model, ensuring financial stability.
              </p>
            </div>
            <div className="bg-white p-12 hover:bg-brand-50 transition-colors group">
              <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600 mb-8 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Direct to Vendor</h3>
              <p className="text-slate-600 leading-relaxed">
                Eliminate middlemen and get better prices. Vendors get fresh produce directly from the source.
              </p>
            </div>
            <div className="bg-white p-12 hover:bg-brand-50 transition-colors group">
              <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600 mb-8 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">Agri Marketplace</h3>
              <p className="text-slate-600 leading-relaxed">
                A dedicated marketplace for farmers to buy high-quality seeds, tools, and fertilizers from verified suppliers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats - Massive Typography */}
      <section id="stats" className="py-32 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px]" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16">
            <div className="flex flex-col gap-2">
              <div className="text-7xl font-bold tracking-tighter text-brand-400">10k+</div>
              <div className="text-sm font-bold uppercase tracking-widest text-slate-400">Active Farmers</div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-7xl font-bold tracking-tighter text-brand-400">500+</div>
              <div className="text-sm font-bold uppercase tracking-widest text-slate-400">Global Vendors</div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-7xl font-bold tracking-tighter text-brand-400">$2M+</div>
              <div className="text-sm font-bold uppercase tracking-widest text-slate-400">Market Value</div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-7xl font-bold tracking-tighter text-brand-400">50+</div>
              <div className="text-sm font-bold uppercase tracking-widest text-slate-400">Crop Varieties</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
              <h2 className="text-4xl font-bold text-slate-900 mb-8 leading-tight">Built on <span className="text-brand-600">Trust</span> and <span className="text-emerald-600">Transparency</span></h2>
              <div className="space-y-6">
                {[
                  "Verified farmer and supplier profiles",
                  "Secure blockchain-inspired transaction tracking",
                  "Real-time market price monitoring",
                  "AI-driven harvest predictions"
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="bg-brand-50 p-1 rounded-full">
                      <CheckCircle2 className="w-5 h-5 text-brand-600" />
                    </div>
                    <span className="text-lg text-slate-700 font-medium">{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 w-full md:w-auto">
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center">
                <Globe className="w-10 h-10 text-brand-600 mb-4" />
                <div className="font-bold text-slate-900">Global Reach</div>
                <div className="text-sm text-slate-500">Connecting continents</div>
              </div>
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center mt-12">
                <ShieldCheck className="w-10 h-10 text-emerald-600 mb-4" />
                <div className="font-bold text-slate-900">Secure Payments</div>
                <div className="text-sm text-slate-500">Encrypted transactions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-2 text-3xl font-bold text-white mb-8">
                <div className="bg-brand-600 p-1.5 rounded-lg">
                  <Sprout className="w-8 h-8 text-white" />
                </div>
                CropKart
              </div>
              <p className="text-slate-400 text-lg max-w-sm leading-relaxed">
                Empowering the world's farmers through technology and direct market access. 
                Join the revolution today.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Platform</h4>
              <ul className="space-y-4 text-slate-400">
                <li><Link to="/signup" className="hover:text-brand-400 transition-colors">For Farmers</Link></li>
                <li><Link to="/signup" className="hover:text-brand-400 transition-colors">For Vendors</Link></li>
                <li><Link to="/signup" className="hover:text-brand-400 transition-colors">For Suppliers</Link></li>
                <li><Link to="/marketplace" className="hover:text-brand-400 transition-colors">Marketplace</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Company</h4>
              <ul className="space-y-4 text-slate-400">
                <li><a href="#" className="hover:text-brand-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors">Sustainability</a></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-500 text-sm">
            <div>© 2026 CropKart Global Inc. All rights reserved.</div>
            <div className="flex items-center gap-8">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
