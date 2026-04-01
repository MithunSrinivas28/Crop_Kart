import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link, Navigate } from 'react-router-dom';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  query, 
  where, 
  doc, 
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { 
  Sprout, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  ClipboardList,
  Clock,
  CheckCircle2,
  ChevronRight,
  Search,
  Filter,
  TrendingUp,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { db, auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

// --- Error Handler ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const BrowseCrops = () => {
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'crops'), (snapshot) => {
      setCrops(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'crops'));
    return () => unsub();
  }, []);

  const filteredCrops = crops.filter(c => 
    c.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
    </div>
  );

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Browse Fresh Harvests</h1>
          <p className="text-slate-500 font-medium">Secure your supply chain by subscribing to future crops directly from farmers.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search crops or locations..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-brand-500 outline-none w-72 shadow-sm transition-all"
            />
          </div>
          <button className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
            <Filter className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {filteredCrops.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCrops.map((crop: any) => {
            const subPercentage = Math.round(( (crop.totalQuantity - crop.availableQuantity) / crop.totalQuantity) * 100);
            const isLowStock = crop.availableQuantity < 50;
            const status = subPercentage === 100 ? 'Fully Booked' : subPercentage > 50 ? 'High Demand' : 'Available';
            const statusColor = status === 'Fully Booked' ? 'bg-emerald-100 text-emerald-700' : status === 'High Demand' ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-700';

            return (
              <motion.div 
                key={crop.id}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-100 flex flex-col group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all">
                    <Sprout className="w-7 h-7" />
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusColor}`}>
                    {status}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight relative z-10">{crop.cropName}</h3>
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-6 relative z-10">
                  <MapPin className="w-4 h-4" />
                  <span>{crop.location}</span>
                </div>
                
                <div className="space-y-4 mb-8 relative z-10">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-400 uppercase tracking-widest">Availability</span>
                    <span className="text-slate-900">{crop.availableQuantity} kg left</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(crop.availableQuantity / crop.totalQuantity) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-brand-500 rounded-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50 mb-8 relative z-10">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Price/kg</p>
                    <p className="text-2xl font-bold text-slate-900 tracking-tighter">${crop.pricePerKg}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Harvest</p>
                    <p className="text-sm font-bold text-slate-900">{new Date(crop.harvestDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`subscribe/${crop.id}`)}
                  disabled={crop.availableQuantity <= 0}
                  className={`mt-auto w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-xl group/btn ${
                    crop.availableQuantity > 0 
                      ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  {crop.availableQuantity > 0 ? 'Subscribe Now' : 'Out of Stock'}
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-20 rounded-[3rem] shadow-xl shadow-slate-100 border border-slate-100 text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-8">
            <Search className="w-12 h-12" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">No crops found</h3>
          <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">We couldn't find any crops matching your search. Try adjusting your filters or search terms.</p>
          <button 
            onClick={() => setSearchTerm('')}
            className="text-brand-600 font-bold hover:underline"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
};

const SubscribePage = () => {
  const { user } = useAuth();
  const [crop, setCrop] = useState<any>(null);
  const [formData, setFormData] = useState({
    quantityPerWeek: '',
    duration: '',
    startDate: ''
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const cropId = window.location.pathname.split('/').pop();

  useEffect(() => {
    if (!cropId) return;
    const fetchCrop = async () => {
      try {
        const cropDoc = await getDoc(doc(db, 'crops', cropId));
        if (cropDoc.exists()) {
          setCrop({ id: cropDoc.id, ...cropDoc.data() });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `crops/${cropId}`);
      } finally {
        setLoading(false);
      }
    };
    fetchCrop();
  }, [cropId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !crop) return;

    const totalNeeded = Number(formData.quantityPerWeek) * Number(formData.duration);
    if (crop.availableQuantity < totalNeeded) {
      toast.error('Insufficient quantity available');
      return;
    }

    try {
      await addDoc(collection(db, 'subscriptions'), {
        vendorId: user.uid,
        farmerId: crop.farmerId,
        cropId: crop.id,
        cropName: crop.cropName,
        quantityPerWeek: Number(formData.quantityPerWeek),
        duration: Number(formData.duration),
        startDate: new Date(formData.startDate).toISOString()
      });

      await updateDoc(doc(db, 'crops', crop.id), {
        availableQuantity: crop.availableQuantity - totalNeeded
      });

      toast.success('Subscription successful!');
      navigate('../subscriptions', { relative: 'path' });
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, 'subscriptions');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
    </div>
  );
  if (!crop) return <div>Crop not found</div>;

  const totalQuantity = Number(formData.quantityPerWeek) * Number(formData.duration);
  const totalPrice = totalQuantity * crop.pricePerKg;

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('..', { relative: 'path' })} className="text-slate-400 font-bold hover:text-brand-600 transition-colors">Browse</button>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Subscribe to {crop.cropName}</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-100 border border-slate-100 space-y-8">
            <div className="space-y-8">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Quantity per Week (kg)</label>
                <input
                  type="number"
                  required
                  value={formData.quantityPerWeek}
                  onChange={(e) => setFormData({...formData, quantityPerWeek: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold text-slate-900"
                  placeholder="e.g. 50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Duration (weeks)</label>
                <input
                  type="number"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold text-slate-900"
                  placeholder="e.g. 12"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Start Date</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
            >
              Confirm Subscription
            </button>
          </form>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
            <h3 className="text-2xl font-bold mb-8 tracking-tight relative z-10">Order Summary</h3>
            <div className="space-y-6 mb-10 relative z-10">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Crop</span>
                <span className="font-bold text-white">{crop.cropName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Price per kg</span>
                <span className="font-bold text-white">${crop.pricePerKg}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Total Quantity</span>
                <span className="font-bold text-white">{totalQuantity || 0} kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Duration</span>
                <span className="font-bold text-white">{formData.duration || 0} weeks</span>
              </div>
            </div>
            <div className="border-t border-white/10 pt-8 relative z-10">
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Total Commitment</span>
                <span className="text-5xl font-bold text-brand-400 tracking-tighter">${totalPrice.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-brand-50 p-8 rounded-[2rem] border border-brand-100">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-6 h-6 text-brand-600" />
              <h4 className="font-bold text-slate-900">Secure Contract</h4>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Your subscription is protected by CropKart's secure contract system. Payment is held in escrow until delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MySubscriptions = () => {
  const { user } = useAuth();
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'subscriptions'), where('vendorId', '==', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setSubs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'subscriptions'));
    return () => unsub();
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
    </div>
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">My Subscriptions</h1>
        <p className="text-slate-500 font-medium">Manage your active supply contracts and delivery schedules.</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        {subs.map((sub: any) => (
          <motion.div 
            key={sub.id} 
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-100 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600">
                  <ClipboardList className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{sub.cropName}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contract ID: {sub.id.slice(0, 8)}</p>
                </div>
              </div>
              <span className="px-4 py-1.5 bg-brand-100 text-brand-700 text-[10px] font-bold rounded-full uppercase tracking-widest">Active</span>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8 relative z-10">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Weekly Supply</p>
                <p className="text-2xl font-bold text-slate-900 tracking-tight">{sub.quantityPerWeek} kg</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Duration</p>
                <p className="text-2xl font-bold text-slate-900 tracking-tight">{sub.duration} weeks</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-6 text-sm text-slate-500 relative z-10 pt-6 border-t border-slate-50">
              <div className="flex items-center gap-2 font-medium">
                <Clock className="w-4 h-4 text-slate-400" />
                Starts: <span className="text-slate-900 font-bold">{new Date(sub.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Verified Contract
              </div>
            </div>
          </motion.div>
        ))}
        {subs.length === 0 && (
          <div className="col-span-full py-32 text-center bg-white rounded-[3rem] shadow-xl shadow-slate-100 border border-slate-100">
            <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                <ClipboardList className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-slate-900 tracking-tight">No active subscriptions</p>
                <p className="text-slate-500 font-medium">You haven't subscribed to any crops yet. Start browsing to secure your supply chain.</p>
              </div>
              <Link to=".." relative="path" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                Browse Available Crops
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const VendorDashboard = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<BrowseCrops />} />
      <Route path="dashboard/subscribe/:id" element={<SubscribePage />} />
      <Route path="dashboard/subscriptions" element={<MySubscriptions />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default VendorDashboard;
