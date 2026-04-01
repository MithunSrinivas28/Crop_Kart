import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  getDocs,
  doc,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { 
  Sprout, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Plus, 
  ShoppingCart,
  BrainCircuit,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ChevronRight,
  Search,
  Filter,
  User,
  ClipboardList,
  X,
  Zap,
  ShieldCheck,
  Trash2,
  FileText,
  Download
} from 'lucide-react';
import { db, auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { GoogleGenAI } from "@google/genai";
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

// --- Components ---

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, title }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-100"
      >
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mb-6">
          <Trash2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Are you sure?</h3>
        <p className="text-slate-500 font-medium mb-8">
          Do you really want to delete <span className="text-slate-900 font-bold">{title}</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const FarmerOverview = () => {
  const { user } = useAuth();
  const [crops, setCrops] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, cropId: string, cropName: string }>({
    isOpen: false,
    cropId: '',
    cropName: ''
  });

  useEffect(() => {
    if (!user) return;

    const cropsQuery = query(collection(db, 'crops'), where('farmerId', '==', user.uid));
    const subsQuery = query(collection(db, 'subscriptions'), where('farmerId', '==', user.uid));

    const unsubCrops = onSnapshot(cropsQuery, (snapshot) => {
      setCrops(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'crops'));

    const unsubSubs = onSnapshot(subsQuery, (snapshot) => {
      setSubs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'subscriptions'));

    return () => {
      unsubCrops();
      unsubSubs();
    };
  }, [user]);

  const handleDeleteCrop = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      await axios.delete(`/crops/${deleteModal.cropId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Crop deleted successfully');
      setDeleteModal({ isOpen: false, cropId: '', cropName: '' });
    } catch (error) {
      console.error('Error deleting crop:', error);
      toast.error('Failed to delete crop');
    }
  };

  const totalSubscribed = subs.reduce((acc, s) => acc + (s.quantityPerWeek * s.duration), 0);
  const expectedIncome = subs.reduce((acc, s) => {
    const crop = crops.find(c => c.id === s.cropId);
    return acc + (s.quantityPerWeek * s.duration * (crop?.pricePerKg || 0));
  }, 0);

  const quickActions = [
    { name: 'Add New Crop', icon: Plus, path: 'add-crop', color: 'bg-brand-600', shadow: 'shadow-brand-200' },
    { name: 'Marketplace', icon: ShoppingCart, path: 'marketplace', color: 'bg-emerald-600', shadow: 'shadow-emerald-200' },
    { name: 'My Orders', icon: FileText, path: 'orders', color: 'bg-indigo-600', shadow: 'shadow-indigo-200' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
    </div>
  );

  return (
    <div className="space-y-12 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Farmer Dashboard</h1>
          <p className="text-slate-500 font-medium">Welcome back, <span className="text-brand-600 font-bold">{user?.name}</span>. Here's your farm's performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-slate-100 rounded-xl shadow-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-bold text-slate-600">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-100 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
          <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600 mb-6 relative z-10">
            <Sprout className="w-7 h-7" />
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">Total Subscribed</p>
          <div className="flex items-end gap-2 relative z-10">
            <p className="text-4xl font-bold text-slate-900 tracking-tight">{totalSubscribed.toLocaleString()}</p>
            <p className="text-slate-400 font-bold mb-1">kg</p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600">
            <ArrowUpRight className="w-4 h-4" />
            <span>+12% from last month</span>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-100 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 relative z-10">
            <DollarSign className="w-7 h-7" />
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">Expected Income</p>
          <div className="flex items-end gap-2 relative z-10">
            <p className="text-4xl font-bold text-slate-900 tracking-tight">${expectedIncome.toLocaleString()}</p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600">
            <ArrowUpRight className="w-4 h-4" />
            <span>On track for Q2 goals</span>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-100 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-6 relative z-10">
            <TrendingUp className="w-7 h-7" />
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">Active Contracts</p>
          <div className="flex items-end gap-2 relative z-10">
            <p className="text-4xl font-bold text-slate-900 tracking-tight">{subs.length}</p>
            <p className="text-slate-400 font-bold mb-1">vendors</p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-600">
            <Clock className="w-4 h-4" />
            <span>3 pending renewals</span>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <Link 
              key={action.name} 
              to={action.path}
              className="group relative bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100 hover:shadow-2xl hover:shadow-slate-200 transition-all overflow-hidden"
            >
              <div className={`w-12 h-12 ${action.color} rounded-2xl flex items-center justify-center text-white shadow-lg ${action.shadow} mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{action.name}</h3>
              <p className="text-sm text-slate-500 font-medium">Manage your {action.name.toLowerCase()} efficiently.</p>
              <ChevronRight className="w-5 h-5 absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>

      {/* My Crops Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">My Listed Crops</h2>
          <Link to="add-crop" className="text-brand-600 font-bold hover:underline text-sm flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {crops.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {crops.map((crop: any) => {
              const subPercentage = Math.round(( (crop.totalQuantity - crop.availableQuantity) / crop.totalQuantity) * 100);
              const status = subPercentage === 100 ? 'Fully Booked' : subPercentage > 50 ? 'High Demand' : subPercentage > 0 ? 'Partial' : 'No Demand';
              const statusColor = status === 'Fully Booked' ? 'bg-emerald-100 text-emerald-700' : status === 'High Demand' ? 'bg-brand-100 text-brand-700' : status === 'Partial' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700';

              return (
                <motion.div 
                  key={crop.id}
                  whileHover={{ y: -5 }}
                  className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-100 flex flex-col group"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all">
                      <Sprout className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setDeleteModal({ isOpen: true, cropId: crop.id, cropName: crop.cropName })}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${statusColor}`}>
                        {status}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">{crop.cropName}</h3>
                  
                  <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-6">
                    <MapPin className="w-4 h-4" />
                    <span>{crop.location}</span>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">Subscription</span>
                      <span className="text-slate-900">{subPercentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${subPercentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${subPercentage === 100 ? 'bg-emerald-500' : 'bg-brand-500'}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50 mt-auto">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Available</p>
                      <p className="text-lg font-bold text-slate-900">{crop.availableQuantity} <span className="text-xs font-medium text-slate-500">kg</span></p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Price/kg</p>
                      <p className="text-lg font-bold text-slate-900">${crop.pricePerKg}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-xs font-bold text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Harvest: {new Date(crop.harvestDate).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-16 rounded-[3rem] shadow-xl shadow-slate-100 border border-slate-100 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-8">
              <Package className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">No crops listed yet</h3>
            <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">Start listing your harvest to reach thousands of vendors and secure your income.</p>
            <Link to="add-crop" className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              List Your First Crop
            </Link>
          </div>
        )}
      </div>

      <DeleteConfirmationModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDeleteCrop}
        title={deleteModal.cropName}
      />
    </div>
  );
};

const AddCrop = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    cropName: '',
    totalQuantity: '',
    pricePerKg: '',
    harvestDate: '',
    location: ''
  });
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const cropData = {
        ...formData,
        farmerId: user.uid,
        totalQuantity: Number(formData.totalQuantity),
        availableQuantity: Number(formData.totalQuantity),
        pricePerKg: Number(formData.pricePerKg),
        harvestDate: new Date(formData.harvestDate).toISOString()
      };
      await addDoc(collection(db, 'crops'), cropData);
      toast.success('Crop listed successfully!');
      setFormData({ cropName: '', totalQuantity: '', pricePerKg: '', harvestDate: '', location: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'crops');
    }
  };

  const getAiRecommendation = async () => {
    if (!formData.cropName || !formData.location || !formData.pricePerKg) {
      toast.error('Please fill crop name, location, and price first');
      return;
    }
    setAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `As an agricultural expert, provide a demand prediction and sell/hold advice for ${formData.cropName} in ${formData.location} where the current price is ${formData.pricePerKg} per kg. 
        Return the response in JSON format with fields: demandPrediction (string), advice (string: "Sell" or "Hold"), explanation (string).`,
        config: { responseMimeType: "application/json" }
      });
      setAiResult(JSON.parse(response.text));
    } catch (error) {
      console.error("AI Error:", error);
      toast.error('AI recommendation failed');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="flex items-center gap-4">
        <Link to=".." relative="path" className="text-slate-400 font-bold hover:text-brand-600 transition-colors">Dashboard</Link>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">List New Crop</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-100 border border-slate-100 space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Crop Name</label>
                <input
                  type="text"
                  required
                  value={formData.cropName}
                  onChange={(e) => setFormData({...formData, cropName: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold text-slate-900"
                  placeholder="e.g. Organic Wheat"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Total Quantity (kg)</label>
                <input
                  type="number"
                  required
                  value={formData.totalQuantity}
                  onChange={(e) => setFormData({...formData, totalQuantity: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold text-slate-900"
                  placeholder="1000"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Price per kg ($)</label>
                <input
                  type="number"
                  required
                  value={formData.pricePerKg}
                  onChange={(e) => setFormData({...formData, pricePerKg: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold text-slate-900"
                  placeholder="2.5"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Harvest Date</label>
                <input
                  type="date"
                  required
                  value={formData.harvestDate}
                  onChange={(e) => setFormData({...formData, harvestDate: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Location</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold text-slate-900"
                  placeholder="City, State"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
            >
              List Crop for Subscription
            </button>
          </form>
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-brand-600 to-emerald-600 p-10 rounded-[2.5rem] text-white shadow-2xl shadow-brand-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">AI Insights</h3>
            </div>
            <p className="text-brand-50 font-medium mb-8 relative z-10 leading-relaxed">
              Get real-time demand predictions and pricing advice powered by Google Gemini.
            </p>
            <button
              onClick={getAiRecommendation}
              disabled={aiLoading}
              className="w-full bg-white text-brand-700 py-4 rounded-2xl font-bold hover:bg-brand-50 transition-all flex items-center justify-center gap-2 shadow-xl relative z-10"
            >
              {aiLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-brand-700"></div>
                  Analyzing Market...
                </>
              ) : 'Get Recommendation'}
            </button>
          </div>

          {aiResult && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-100 border border-slate-100"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Recommendation</span>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${aiResult.advice === 'Sell' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {aiResult.advice}
                </span>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-4 tracking-tight leading-tight">{aiResult.demandPrediction}</h4>
              <p className="text-slate-600 font-medium text-sm leading-relaxed">{aiResult.explanation}</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

const FarmerMarketplace = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Seeds', 'Fertilizers', 'Tools', 'Equipment'];

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'products'));
    return () => unsub();
  }, []);

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const addToCart = (product: any) => {
    setCart([...cart, product]);
    toast.success(`${product.name} added to cart`);
  };

  const checkout = async () => {
    if (cart.length === 0 || !user) return;
    try {
      const totalAmount = cart.reduce((acc, p) => acc + p.price, 0);
      await addDoc(collection(db, 'orders'), {
        farmerId: user.uid,
        products: cart.map(p => p.id),
        totalAmount,
        date: new Date().toISOString()
      });
      toast.success('Order placed successfully!');
      setCart([]);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'orders');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Agri Marketplace</h1>
          <p className="text-slate-500 font-medium">Premium seeds, tools, and fertilizers for your farm.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button className="p-4 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all shadow-xl shadow-slate-100 group">
              <ShoppingCart className="w-7 h-7 text-slate-600 group-hover:text-brand-600 transition-colors" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-600 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-lg shadow-brand-900/20">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeCategory === cat 
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredProducts.map((product: any) => (
          <motion.div 
            key={product.id} 
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-100 flex flex-col group"
          >
            <div className="w-full aspect-square bg-slate-50 rounded-3xl mb-6 flex items-center justify-center text-slate-200 group-hover:bg-brand-50 transition-colors relative overflow-hidden">
              <Package className="w-16 h-16 group-hover:text-brand-200 transition-colors relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/0 to-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-2">{product.category}</span>
            <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">{product.name}</h3>
            <div className="flex items-end gap-1 mb-6">
              <p className="text-3xl font-bold text-slate-900 tracking-tighter">${product.price}</p>
              <p className="text-slate-400 font-bold mb-1 text-sm">/ unit</p>
            </div>
            <div className="mt-auto pt-6 border-t border-slate-50">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Stock</span>
                <span className={`text-xs font-bold ${product.stock < 10 ? 'text-red-500' : 'text-slate-900'}`}>
                  {product.stock < 10 ? `Only ${product.stock} left` : `${product.stock} units`}
                </span>
              </div>
              <button
                onClick={() => addToCart(product)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add to Cart
              </button>
            </div>
          </motion.div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
              <Search className="w-10 h-10" />
            </div>
            <p className="text-lg font-bold text-slate-900">No products found</p>
            <p className="text-slate-500">Try adjusting your category filter.</p>
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-10 right-10 bg-white p-10 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] border border-slate-100 w-96 z-50"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Your Cart</h3>
            <span className="bg-brand-50 text-brand-600 px-3 py-1 rounded-full text-xs font-bold">{cart.length} items</span>
          </div>
          <div className="space-y-4 mb-8 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {cart.map((item, i) => (
              <div key={i} className="flex justify-between items-center group">
                <div className="flex flex-col">
                  <span className="text-slate-900 font-bold">{item.name}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-900">${item.price}</span>
                  <button 
                    onClick={() => setCart(cart.filter((_, idx) => idx !== i))}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 pt-8 mb-8 flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Amount</span>
              <span className="text-4xl font-bold text-slate-900 tracking-tighter">${cart.reduce((acc, p) => acc + p.price, 0)}</span>
            </div>
          </div>
          <button
            onClick={checkout}
            className="w-full py-5 bg-brand-600 text-white rounded-2xl font-bold text-lg hover:bg-brand-700 transition-all shadow-xl shadow-brand-200"
          >
            Complete Order
          </button>
        </motion.div>
      )}
    </div>
  );
};

const FarmerSubscriptions = () => {
  const { user } = useAuth();
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'subscriptions'), where('farmerId', '==', user.uid));
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
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Vendor Subscriptions</h1>
        <p className="text-slate-500 font-medium">Manage your active supply contracts and vendor relationships.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-100 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Crop</th>
                <th className="px-8 py-5">Weekly Delivery</th>
                <th className="px-8 py-5">Contract Duration</th>
                <th className="px-8 py-5">Start Date</th>
                <th className="px-8 py-5">Vendor Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subs.map((sub: any) => (
                <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                        <Sprout className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-900">{sub.cropName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{sub.quantityPerWeek} kg</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Per Week</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{sub.duration} weeks</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Term</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-bold text-slate-900">{new Date(sub.startDate).toLocaleDateString()}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono text-slate-500">{sub.vendorId.slice(0, 8)}...</span>
                    </div>
                  </td>
                </tr>
              ))}
              {subs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <ClipboardList className="w-12 h-12" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-2xl font-bold text-slate-900 tracking-tight">No active subscriptions</p>
                        <p className="text-slate-500 font-medium">Your listed crops are waiting for vendor subscriptions. Make sure your prices are competitive!</p>
                      </div>
                      <Link to="/farmer/dashboard" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                        Check My Listings
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const FarmerAIInsights = () => {
  const [formData, setFormData] = useState({
    crop: '',
    location: '',
    price: ''
  });
  const [insight, setInsight] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const getInsights = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide agricultural market insights for ${formData.crop} in ${formData.location} with a target price of ${formData.price}. Return JSON with fields: demandLevel (Low/Medium/High), pricePrediction (string), advice (string), riskLevel (Low/Medium/High).`,
        config: { responseMimeType: "application/json" }
      });
      
      const data = JSON.parse(response.text || '{}');
      setInsight(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to get AI insights");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">AI Market Insights</h1>
          <p className="text-slate-500 font-medium">Leverage advanced analytics to predict demand and optimize your harvest strategy.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-brand-50 rounded-2xl border border-brand-100">
          <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">AI Engine Active</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          <form onSubmit={getInsights} className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-100 border border-slate-100 space-y-8">
            <div className="space-y-8">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Target Crop</label>
                <input
                  type="text"
                  required
                  value={formData.crop}
                  onChange={(e) => setFormData({...formData, crop: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold text-slate-900"
                  placeholder="e.g. Organic Wheat"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Farm Location</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold text-slate-900"
                  placeholder="e.g. Punjab, India"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Expected Price ($/kg)</label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold text-slate-900"
                  placeholder="e.g. 2.50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Generate Insights <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="bg-brand-50 p-8 rounded-[2rem] border border-brand-100">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-6 h-6 text-brand-600" />
              <h4 className="font-bold text-slate-900">Data Privacy</h4>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              Your farm data is encrypted and used only for generating these insights. We never share individual farm data with third parties.
            </p>
          </div>
        </div>

        <div className="relative">
          {insight ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-100 border border-slate-100 h-full flex flex-col"
            >
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Analysis Result</h3>
                <div className="px-4 py-1.5 bg-brand-100 text-brand-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  Real-time Data
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Market Demand</p>
                  <p className={`text-2xl font-bold tracking-tight ${
                    insight.demandLevel === 'High' ? 'text-emerald-600' : 
                    insight.demandLevel === 'Medium' ? 'text-brand-600' : 'text-amber-600'
                  }`}>{insight.demandLevel}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Risk Level</p>
                  <p className={`text-2xl font-bold tracking-tight ${
                    insight.riskLevel === 'Low' ? 'text-emerald-600' : 
                    insight.riskLevel === 'Medium' ? 'text-amber-600' : 'text-red-600'
                  }`}>{insight.riskLevel}</p>
                </div>
              </div>

              <div className="space-y-8 flex-grow">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Price Prediction</p>
                  <p className="text-slate-900 font-bold text-lg leading-relaxed">{insight.pricePrediction}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Strategic Advice</p>
                  <p className="text-slate-600 font-medium leading-relaxed">{insight.advice}</p>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                  <Clock className="w-4 h-4" />
                  Generated just now
                </div>
                <button className="text-brand-600 font-bold text-sm hover:underline">Download PDF</button>
              </div>
            </motion.div>
          ) : (
            <div className="bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 h-full flex flex-col items-center justify-center p-12 text-center">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-xl shadow-slate-200 flex items-center justify-center text-slate-300 mb-8">
                <TrendingUp className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Ready for Analysis</h3>
              <p className="text-slate-500 font-medium max-w-xs">Fill out the form to generate deep market insights for your specific crop and location.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FarmerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'orders'), where('farmerId', '==', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'orders'));
    return () => unsub();
  }, [user]);

  const downloadCertificate = async (orderId: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.get(`/orders/${orderId}/certificate`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Certificate downloaded successfully');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
    </div>
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">My Orders</h1>
        <p className="text-slate-500 font-medium">View your purchase history and download authenticity certificates.</p>
      </div>

      <div className="grid gap-6">
        {orders.map((order: any) => (
          <motion.div 
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{new Date(order.date).toLocaleDateString()}</span>
                  <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                  <span className="text-sm font-bold text-brand-600">${order.totalAmount}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => downloadCertificate(order.id)}
              className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
            >
              <Download className="w-5 h-5" />
              Download Certificate
            </button>
          </motion.div>
        ))}

        {orders.length === 0 && (
          <div className="bg-white p-16 rounded-[3rem] shadow-xl shadow-slate-100 border border-slate-100 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-8">
              <ShoppingCart className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">No orders found</h3>
            <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">You haven't purchased any products from the marketplace yet.</p>
            <Link to="/farmer/dashboard/marketplace" className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 inline-flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Go to Marketplace
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

const FarmerDashboard = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<FarmerOverview />} />
      <Route path="dashboard/add-crop" element={<AddCrop />} />
      <Route path="dashboard/marketplace" element={<FarmerMarketplace />} />
      <Route path="dashboard/subscriptions" element={<FarmerSubscriptions />} />
      <Route path="dashboard/ai-insights" element={<FarmerAIInsights />} />
      <Route path="dashboard/orders" element={<FarmerOrders />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default FarmerDashboard;
