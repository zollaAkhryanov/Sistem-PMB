import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../firebase';
import { UserProfile, UserRole } from '../types';
import { dbService } from '../services/dbService';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<UserProfile>;
  signUp: (email: string, password: string, nama: string, role: UserRole) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (email: string, password: string, nama: string, roleOrPhone?: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Listen for Firebase auth changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const profile = await dbService.getUserProfile(firebaseUser.uid);
          if (profile) {
            setUser(profile);
            localStorage.setItem('pmb_current_user', JSON.stringify(profile));
          } else {
            // If Firebase authenticated but profile not in Firestore, create default
            const defaultProfile: UserProfile = {
              uid: firebaseUser.uid,
              nama: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User Baru',
              email: firebaseUser.email || '',
              role: firebaseUser.email === 'akhryanovzolla@gmail.com' ? 'admin' : 'mahasiswa', // bootstrap admin!
              createdAt: new Date().toISOString()
            };
            await dbService.createUserProfile(defaultProfile);
            setUser(defaultProfile);
            localStorage.setItem('pmb_current_user', JSON.stringify(defaultProfile));
          }
        } else {
          setUser(null);
          localStorage.removeItem('pmb_current_user');
        }
      } catch (err) {
        console.error("Auth initialization error", err);
        setUser(null);
        localStorage.removeItem('pmb_current_user');
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      // Attempt real Firebase Login
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const profile = await dbService.getUserProfile(credential.user.uid);
      if (profile) {
        setUser(profile);
        localStorage.setItem('pmb_current_user', JSON.stringify(profile));
        return profile;
      } else {
        const defaultProfile: UserProfile = {
          uid: credential.user.uid,
          nama: credential.user.displayName || credential.user.email?.split('@')[0] || 'User Baru',
          email: credential.user.email || '',
          role: credential.user.email === 'akhryanovzolla@gmail.com' ? 'admin' : 'mahasiswa',
          createdAt: new Date().toISOString()
        };
        await dbService.createUserProfile(defaultProfile);
        setUser(defaultProfile);
        localStorage.setItem('pmb_current_user', JSON.stringify(defaultProfile));
        return defaultProfile;
      }
    } catch (fbErr: any) {
      console.error("Firebase Auth login failed", fbErr);
      let errorMsg = "Login gagal. Silakan periksa kembali email dan password Anda.";
      if (fbErr.code === 'auth/user-not-found' || fbErr.code === 'auth/wrong-password' || fbErr.code === 'auth/invalid-credential') {
        errorMsg = "Email atau password salah.";
      } else if (fbErr.code === 'auth/invalid-email') {
        errorMsg = "Format email tidak valid.";
      } else if (fbErr.code === 'auth/user-disabled') {
        errorMsg = "Akun ini telah dinonaktifkan.";
      }
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, nama: string, role: UserRole): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const finalRole: UserRole = (email === 'akhryanovzolla@gmail.com') ? 'admin' : role;
      
      const profile: UserProfile = {
        uid: credential.user.uid,
        nama,
        email,
        role: finalRole,
        createdAt: new Date().toISOString()
      };

      await dbService.createUserProfile(profile);
      setUser(profile);
      localStorage.setItem('pmb_current_user', JSON.stringify(profile));
      return profile;
    } catch (fbErr: any) {
      console.error("Firebase Auth sign up failed", fbErr);
      let errorMsg = "Registrasi gagal. Silakan coba lagi.";
      if (fbErr.code === 'auth/email-already-in-use') {
        errorMsg = "Email sudah terdaftar. Silakan gunakan email lain.";
      } else if (fbErr.code === 'auth/weak-password') {
        errorMsg = "Password terlalu lemah. Masukkan minimal 6 karakter.";
      } else if (fbErr.code === 'auth/invalid-email') {
        errorMsg = "Format email tidak valid.";
      }
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn("Firebase sign out failed", err);
    } finally {
      setUser(null);
      localStorage.removeItem('pmb_current_user');
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (fbErr) {
      console.warn("Firebase send password reset failed, mocking success for offline.", fbErr);
    }
  };

  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    setError(null);
    try {
      return await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Login gagal');
      throw err;
    }
  };

  const register = async (email: string, password: string, nama: string, roleOrPhone?: string): Promise<UserProfile> => {
    setError(null);
    try {
      const role: UserRole = (roleOrPhone === 'admin' || roleOrPhone === 'mahasiswa') ? roleOrPhone : 'mahasiswa';
      return await signUp(email, password, nama, role);
    } catch (err: any) {
      setError(err.message || 'Registrasi gagal');
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    setError(null);
    await signOut();
  };

  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    if (!user) throw new Error("Tidak ada user aktif.");
    const updated = { ...user, ...updates };
    await dbService.createUserProfile(updated);
    setUser(updated);
    localStorage.setItem('pmb_current_user', JSON.stringify(updated));
    return updated;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updateUserProfile,
      login,
      register,
      logout,
      error
    }}>
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
