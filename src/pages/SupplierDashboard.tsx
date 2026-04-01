import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link, Navigate } from 'react-router-dom';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  query, 
  where,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { 
  Package, 
  Plus, 
  DollarSign, 
  Layers,
  ArrowRight,
  ChevronRight,
  Search,
  Filter,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Tag,
  Trash2
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

const SupplierInventory = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, productId: string, productName: string }>({
    isOpen: false,
    productId: '',
    productName: ''
  });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'products'), where('supplierId', '==', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'products'));
    return () => unsub();
  }, [user]);

  const handleDeleteProduct = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      await axios.delete(`/products/${deleteModal.productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Product deleted successfully');
      setDeleteModal({ isOpen: false, productId: '', productName: '' });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
    </div>
  );

  const totalValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Supplier Inventory</h1>
          <p className="text-slate-500 font-medium">Manage your agri-products and track stock levels across your catalog.</p>
        </div>
        <Link to="add" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group">
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Add New Product
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-100 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
          <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600 mb-6 relative z-10">
            <Package className="w-7 h-7" />
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">Total Products</p>
          <div className="flex items-end gap-2 relative z-10">
            <p className="text-4xl font-bold text-slate-900 tracking-tight">{products.length}</p>
            <p className="text-slate-400 font-bold mb-1">SKUs</p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600">
            <ArrowUpRight className="w-4 h-4" />
            <span>+2 added this week</span>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-100 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 relative z-10">
            <DollarSign className="w-7 h-7" />
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">Inventory Value</p>
          <div className="flex items-end gap-2 relative z-10">
            <p className="text-4xl font-bold text-slate-900 tracking-tight">${totalValue.toLocaleString()}</p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-600">
            <TrendingUp className="w-4 h-4" />
            <span>High demand season</span>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-100 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-6 relative z-10">
            <Layers className="w-7 h-7" />
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">Total Stock</p>
          <div className="flex items-end gap-2 relative z-10">
            <p className="text-4xl font-bold text-slate-900 tracking-tight">{totalStock.toLocaleString()}</p>
            <p className="text-slate-400 font-bold mb-1">units</p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-amber-600">
            <Clock className="w-4 h-4" />
            <span>5 items low on stock</span>
          </div>
        </motion.div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-100 border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Product Catalog</h2>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none w-64"
              />
            </div>
            <button className="p-2 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors">
              <Filter className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Product Name</th>
                <th className="px-8 py-5">Category</th>
                <th className="px-8 py-5">Unit Price</th>
                <th className="px-8 py-5">Stock Level</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product: any) => (
                <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                        <Package className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-900">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3 h-3 text-slate-400" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{product.category}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-bold text-slate-900">${product.price}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{product.stock} units</span>
                      <div className="w-24 h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${product.stock > 10 ? 'bg-emerald-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min((product.stock / 100) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      product.stock > 10 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                      {product.stock > 10 ? 'Available' : 'Low Stock'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => setDeleteModal({ isOpen: true, productId: product.id, productName: product.name })}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                        <Package className="w-12 h-12" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-2xl font-bold text-slate-900 tracking-tight">No products added yet</p>
                        <p className="text-slate-500 font-medium">Start building your agri-product catalog to reach farmers across the platform.</p>
                      </div>
                      <Link to="add" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                        Add Your First Product
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteConfirmationModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDeleteProduct}
        title={deleteModal.productName}
      />
    </div>
  );
};

const AddProduct = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: 'seeds'
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, 'products'), {
        ...formData,
        supplierId: user.uid,
        price: Number(formData.price),
        stock: Number(formData.stock)
      });
      toast.success('Product added successfully!');
      navigate('..', { relative: 'path' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'products');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="flex items-center gap-4">
        <Link to=".." relative="path" className="text-slate-400 font-bold hover:text-brand-600 transition-colors">Inventory</Link>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Add New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-100 border border-slate-100 space-y-8">
        <div className="space-y-8">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Product Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold text-slate-900"
              placeholder="e.g. Premium Wheat Seeds"
            />
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Unit Price ($)</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold text-slate-900"
                placeholder="45.00"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Initial Stock</label>
              <input
                type="number"
                required
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-bold text-slate-900"
                placeholder="100"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Category</label>
            <div className="relative">
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none appearance-none font-bold text-slate-900"
              >
                <option value="seeds">Seeds</option>
                <option value="fertilizers">Fertilizers</option>
                <option value="tools">Tools</option>
              </select>
              <ChevronRight className="w-5 h-5 absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 group"
        >
          Publish Product <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </form>
    </div>
  );
};

const SupplierDashboard = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<SupplierInventory />} />
      <Route path="dashboard/add" element={<AddProduct />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default SupplierDashboard;
