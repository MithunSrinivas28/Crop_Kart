import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser,
  signOut,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface UserProfile {
  name: string;
  email: string;
  role: 'farmer' | 'vendor' | 'supplier';
  uid: string;
  location?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  logout: () => Promise<void>;
  loginWithGoogle: (role?: 'farmer' | 'vendor' | 'supplier') => Promise<UserProfile>;
  loading: boolean;
  isAuthReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (fUser) {
        console.log('✅ Firebase Auth state updated: User logged in', fUser.uid);
        const token = await fUser.getIdToken();
        localStorage.setItem('token', token);

        // Use onSnapshot for real-time profile updates
        unsubscribeProfile = onSnapshot(doc(db, 'users', fUser.uid), (doc) => {
          if (doc.exists()) {
            const profile = doc.data() as UserProfile;
            setUser(profile);
            console.log('👤 User profile updated in real-time');
          } else {
            console.warn('⚠️ User profile not found in Firestore');
            setUser(null);
          }
        }, (error) => {
          console.error('❌ Error listening to profile:', error);
        });
      } else {
        console.log('❌ Firebase Auth state updated: User logged out');
        localStorage.removeItem('token');
        setUser(null);
      }
      setLoading(false);
      setIsAuthReady(true);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const loginWithGoogle = async (role?: 'farmer' | 'vendor' | 'supplier') => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const fUser = result.user;
    console.log('📥 Google Login successful, received user:', fUser.email);

    const token = await fUser.getIdToken();
    localStorage.setItem('token', token);
    console.log('🔑 Token received and stored');

    // Check if user profile exists, if not create it
    const userDocRef = doc(db, 'users', fUser.uid);
    const userDoc = await getDoc(userDocRef);

    let profile: UserProfile;

    if (!userDoc.exists()) {
      if (!role) {
        throw new Error('Account not found. Please sign up first.');
      }
      profile = {
        name: fUser.displayName || 'Anonymous',
        email: fUser.email || '',
        role,
        uid: fUser.uid,
        createdAt: new Date().toISOString()
      };
      await setDoc(userDocRef, profile);
      setUser(profile);
      console.log('🆕 New user profile created:', role);
    } else {
      profile = userDoc.data() as UserProfile;
      setUser(profile);
      console.log('✅ Existing user profile loaded:', profile.role);
    }
    return profile;
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('token');
    setUser(null);
    setFirebaseUser(null);
    console.log('👋 User logged out and token removed');
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, logout, loginWithGoogle, loading, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
