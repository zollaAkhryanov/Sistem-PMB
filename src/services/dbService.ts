import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, auth, storage, handleFirestoreError, OperationType } from '../firebase';
import { 
  Gelombang, 
  JalurPendaftaran, 
  ProgramStudi, 
  Pendaftaran, 
  Berkas, 
  Pembayaran, 
  HasilSeleksi,
  UserProfile,
  SystemConfig
} from '../types';
import { DEFAULT_GELOMBANG, DEFAULT_JALUR, DEFAULT_PRODI } from '../data/defaultData';

// Storage helper keys
const STORAGE_PREFIX = 'pmb_storage_';
const KEYS = {
  USERS: STORAGE_PREFIX + 'users',
  GELOMBANG: STORAGE_PREFIX + 'gelombang',
  JALUR: STORAGE_PREFIX + 'jalur',
  PRODI: STORAGE_PREFIX + 'prodi',
  PENDAFTARAN: STORAGE_PREFIX + 'pendaftaran',
  BERKAS: STORAGE_PREFIX + 'berkas',
  PEMBAYARAN: STORAGE_PREFIX + 'pembayaran',
  HASIL: STORAGE_PREFIX + 'hasil_seleksi',
  CONFIG: STORAGE_PREFIX + 'config',
  CURRENT_USER: STORAGE_PREFIX + 'current_user',
};

// Check if localStorage has item, if not seed with default
function getLocalStorageItem<T>(key: string, defaultValue: T): T {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

function setLocalStorageItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Initial offline data seeding
const seededGelombang = getLocalStorageItem<Gelombang[]>(KEYS.GELOMBANG, DEFAULT_GELOMBANG);
const seededJalur = getLocalStorageItem<JalurPendaftaran[]>(KEYS.JALUR, DEFAULT_JALUR);
const seededProdi = getLocalStorageItem<ProgramStudi[]>(KEYS.PRODI, DEFAULT_PRODI);
getLocalStorageItem<Pendaftaran[]>(KEYS.PENDAFTARAN, []);
getLocalStorageItem<Berkas[]>(KEYS.BERKAS, []);
getLocalStorageItem<Pembayaran[]>(KEYS.PEMBAYARAN, []);
getLocalStorageItem<HasilSeleksi[]>(KEYS.HASIL, []);
getLocalStorageItem<SystemConfig>(KEYS.CONFIG, {
  namaKampus: 'Universitas Nusa Mandiri',
  alamat: 'Jl. Raya Margonda No.54, Depok, Jawa Barat',
  kontak: 'info@nusamandiri.ac.id | (021) 7870123',
  deskripsi: 'Membina calon pemimpin masa depan berbasis teknologi informasi dan industri kreatif.',
});

export const dbService = {
  // System Config
  async getConfig(): Promise<SystemConfig> {
    try {
      const docRef = doc(db, 'pengaturan', 'general');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as SystemConfig;
      }
    } catch (err) {
      console.warn("Using offline config fallback.");
    }
    return getLocalStorageItem<SystemConfig>(KEYS.CONFIG, {
      namaKampus: 'Universitas Nusa Mandiri',
      alamat: 'Jl. Raya Margonda No.54, Depok, Jawa Barat',
      kontak: 'info@nusamandiri.ac.id | (021) 7870123',
      deskripsi: 'Membina calon pemimpin masa depan berbasis teknologi informasi dan teknologi digital.',
    });
  },

  async updateConfig(config: SystemConfig): Promise<void> {
    try {
      const docRef = doc(db, 'pengaturan', 'general');
      await setDoc(docRef, config);
    } catch (err) {
      console.warn("Using offline config save.");
    }
    setLocalStorageItem(KEYS.CONFIG, config);
  },

  // Users Management
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, 'users', uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
    } catch (err) {
      console.warn("Using offline userProfile fallback.");
    }
    const users = getLocalStorageItem<UserProfile[]>(KEYS.USERS, []);
    return users.find(u => u.uid === uid) || null;
  },

  async createUserProfile(profile: UserProfile): Promise<void> {
    try {
      const docRef = doc(db, 'users', profile.uid);
      await setDoc(docRef, profile);
    } catch (err) {
      console.warn("Using offline user profile save.");
    }
    const users = getLocalStorageItem<UserProfile[]>(KEYS.USERS, []);
    const existsIdx = users.findIndex(u => u.uid === profile.uid);
    if (existsIdx >= 0) {
      users[existsIdx] = profile;
    } else {
      users.push(profile);
    }
    setLocalStorageItem(KEYS.USERS, users);
  },

  // Gelombang
  async getGelombang(): Promise<Gelombang[]> {
    try {
      const snap = await getDocs(collection(db, 'gelombang'));
      const list: Gelombang[] = [];
      snap.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as Gelombang);
      });
      if (list.length > 0) return list;
    } catch (err) {
      console.warn("Using offline gelombang list.");
    }
    return getLocalStorageItem<Gelombang[]>(KEYS.GELOMBANG, DEFAULT_GELOMBANG);
  },

  async saveGelombang(item: Gelombang): Promise<void> {
    try {
      const docRef = doc(db, 'gelombang', item.id);
      await setDoc(docRef, item);
    } catch (err) {
      console.warn("Using offline gelombang save.");
    }
    const list = getLocalStorageItem<Gelombang[]>(KEYS.GELOMBANG, DEFAULT_GELOMBANG);
    const idx = list.findIndex(g => g.id === item.id);
    if (idx >= 0) list[idx] = item;
    else list.push(item);
    setLocalStorageItem(KEYS.GELOMBANG, list);
  },

  async deleteGelombang(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'gelombang', id));
    } catch (err) {
      console.warn("Using offline gelombang delete.");
    }
    const list = getLocalStorageItem<Gelombang[]>(KEYS.GELOMBANG, DEFAULT_GELOMBANG);
    const filtered = list.filter(g => g.id !== id);
    setLocalStorageItem(KEYS.GELOMBANG, filtered);
  },

  // Jalur Pendaftaran
  async getJalur(): Promise<JalurPendaftaran[]> {
    try {
      const snap = await getDocs(collection(db, 'jalur_pendaftaran'));
      const list: JalurPendaftaran[] = [];
      snap.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as JalurPendaftaran);
      });
      if (list.length > 0) return list;
    } catch (err) {
      console.warn("Using offline jalur list.");
    }
    return getLocalStorageItem<JalurPendaftaran[]>(KEYS.JALUR, DEFAULT_JALUR);
  },

  async saveJalur(item: JalurPendaftaran): Promise<void> {
    try {
      const docRef = doc(db, 'jalur_pendaftaran', item.id);
      await setDoc(docRef, item);
    } catch (err) {
      console.warn("Using offline jalur save.");
    }
    const list = getLocalStorageItem<JalurPendaftaran[]>(KEYS.JALUR, DEFAULT_JALUR);
    const idx = list.findIndex(j => j.id === item.id);
    if (idx >= 0) list[idx] = item;
    else list.push(item);
    setLocalStorageItem(KEYS.JALUR, list);
  },

  async deleteJalur(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'jalur_pendaftaran', id));
    } catch (err) {
      console.warn("Using offline jalur delete.");
    }
    const list = getLocalStorageItem<JalurPendaftaran[]>(KEYS.JALUR, DEFAULT_JALUR);
    const filtered = list.filter(j => j.id !== id);
    setLocalStorageItem(KEYS.JALUR, filtered);
  },

  // Program Studi
  async getProdi(): Promise<ProgramStudi[]> {
    try {
      const snap = await getDocs(collection(db, 'program_studi'));
      const list: ProgramStudi[] = [];
      snap.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as ProgramStudi);
      });
      if (list.length > 0) return list;
    } catch (err) {
      console.warn("Using offline prodi list.");
    }
    return getLocalStorageItem<ProgramStudi[]>(KEYS.PRODI, DEFAULT_PRODI);
  },

  async saveProdi(item: ProgramStudi): Promise<void> {
    try {
      const docRef = doc(db, 'program_studi', item.id);
      await setDoc(docRef, item);
    } catch (err) {
      console.warn("Using offline prodi save.");
    }
    const list = getLocalStorageItem<ProgramStudi[]>(KEYS.PRODI, DEFAULT_PRODI);
    const idx = list.findIndex(p => p.id === item.id);
    if (idx >= 0) list[idx] = item;
    else list.push(item);
    setLocalStorageItem(KEYS.PRODI, list);
  },

  async deleteProdi(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'program_studi', id));
    } catch (err) {
      console.warn("Using offline prodi delete.");
    }
    const list = getLocalStorageItem<ProgramStudi[]>(KEYS.PRODI, DEFAULT_PRODI);
    const filtered = list.filter(p => p.id !== id);
    setLocalStorageItem(KEYS.PRODI, filtered);
  },

  // Pendaftaran (Registrasi Mahasiswa)
  async getPendaftaranByUid(uid: string): Promise<Pendaftaran | null> {
    try {
      const q = query(collection(db, 'pendaftaran'), where('uid', '==', uid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0];
        return { id: d.id, ...d.data() } as Pendaftaran;
      }
    } catch (err) {
      console.warn("Using offline registration fetch.");
    }
    const list = getLocalStorageItem<Pendaftaran[]>(KEYS.PENDAFTARAN, []);
    return list.find(p => p.uid === uid) || null;
  },

  async savePendaftaran(item: Pendaftaran): Promise<void> {
    try {
      const docRef = doc(db, 'pendaftaran', item.id || item.uid);
      await setDoc(docRef, item);
    } catch (err) {
      console.warn("Using offline pendaftaran save.");
    }
    const list = getLocalStorageItem<Pendaftaran[]>(KEYS.PENDAFTARAN, []);
    const idx = list.findIndex(p => p.uid === item.uid);
    if (idx >= 0) list[idx] = item;
    else list.push(item);
    setLocalStorageItem(KEYS.PENDAFTARAN, list);
  },

  async getAllPendaftaran(): Promise<Pendaftaran[]> {
    try {
      const snap = await getDocs(collection(db, 'pendaftaran'));
      const list: Pendaftaran[] = [];
      snap.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as Pendaftaran);
      });
      if (list.length > 0) return list;
    } catch (err) {
      console.warn("Using offline all pendaftaran fetch.");
    }
    return getLocalStorageItem<Pendaftaran[]>(KEYS.PENDAFTARAN, []);
  },

  // Berkas
  async getBerkasByUid(uid: string): Promise<Berkas | null> {
    try {
      const docRef = doc(db, 'berkas', uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as Berkas;
      }
    } catch (err) {
      console.warn("Using offline berkas fetch.");
    }
    const list = getLocalStorageItem<Berkas[]>(KEYS.BERKAS, []);
    return list.find(b => b.uid === uid) || null;
  },

  async saveBerkas(item: Berkas): Promise<void> {
    try {
      const docRef = doc(db, 'berkas', item.uid);
      await setDoc(docRef, item);
    } catch (err) {
      console.warn("Using offline berkas save.");
    }
    const list = getLocalStorageItem<Berkas[]>(KEYS.BERKAS, []);
    const idx = list.findIndex(b => b.uid === item.uid);
    if (idx >= 0) list[idx] = item;
    else list.push(item);
    setLocalStorageItem(KEYS.BERKAS, list);
  },

  async getAllBerkas(): Promise<Berkas[]> {
    try {
      const snap = await getDocs(collection(db, 'berkas'));
      const list: Berkas[] = [];
      snap.forEach(doc => {
        list.push(doc.data() as Berkas);
      });
      if (list.length > 0) return list;
    } catch (err) {
      console.warn("Using offline all berkas fetch.");
    }
    return getLocalStorageItem<Berkas[]>(KEYS.BERKAS, []);
  },

  // Pembayaran
  async getPembayaranByUid(uid: string): Promise<Pembayaran | null> {
    try {
      const q = query(collection(db, 'pembayaran'), where('uid', '==', uid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0];
        return { id: d.id, ...d.data() } as Pembayaran;
      }
    } catch (err) {
      console.warn("Using offline pembayaran fetch.");
    }
    const list = getLocalStorageItem<Pembayaran[]>(KEYS.PEMBAYARAN, []);
    return list.find(p => p.uid === uid) || null;
  },

  async savePembayaran(item: Pembayaran): Promise<void> {
    try {
      const docRef = doc(db, 'pembayaran', item.id);
      await setDoc(docRef, item);
    } catch (err) {
      console.warn("Using offline pembayaran save.");
    }
    const list = getLocalStorageItem<Pembayaran[]>(KEYS.PEMBAYARAN, []);
    const idx = list.findIndex(p => p.id === item.id || p.uid === item.uid);
    if (idx >= 0) list[idx] = item;
    else list.push(item);
    setLocalStorageItem(KEYS.PEMBAYARAN, list);
  },

  async getAllPembayaran(): Promise<Pembayaran[]> {
    try {
      const snap = await getDocs(collection(db, 'pembayaran'));
      const list: Pembayaran[] = [];
      snap.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as Pembayaran);
      });
      if (list.length > 0) return list;
    } catch (err) {
      console.warn("Using offline all pembayaran fetch.");
    }
    return getLocalStorageItem<Pembayaran[]>(KEYS.PEMBAYARAN, []);
  },

  // Hasil Seleksi
  async getHasilSeleksiByUid(uid: string): Promise<HasilSeleksi | null> {
    try {
      const docRef = doc(db, 'hasil_seleksi', uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as HasilSeleksi;
      }
    } catch (err) {
      console.warn("Using offline hasil seleksi fetch.");
    }
    const list = getLocalStorageItem<HasilSeleksi[]>(KEYS.HASIL, []);
    return list.find(h => h.uid === uid) || null;
  },

  async saveHasilSeleksi(item: HasilSeleksi): Promise<void> {
    try {
      const docRef = doc(db, 'hasil_seleksi', item.uid);
      await setDoc(docRef, item);
    } catch (err) {
      console.warn("Using offline hasil seleksi save.");
    }
    const list = getLocalStorageItem<HasilSeleksi[]>(KEYS.HASIL, []);
    const idx = list.findIndex(h => h.uid === item.uid);
    if (idx >= 0) list[idx] = item;
    else list.push(item);
    setLocalStorageItem(KEYS.HASIL, list);
  },

  async getAllHasilSeleksi(): Promise<HasilSeleksi[]> {
    try {
      const snap = await getDocs(collection(db, 'hasil_seleksi'));
      const list: HasilSeleksi[] = [];
      snap.forEach(doc => {
        list.push(doc.data() as HasilSeleksi);
      });
      if (list.length > 0) return list;
    } catch (err) {
      console.warn("Using offline all hasil seleksi fetch.");
    }
    return getLocalStorageItem<HasilSeleksi[]>(KEYS.HASIL, []);
  },

  // File Upload Simulation & Real Storage
  async uploadFile(uid: string, fileKey: string, base64Data: string): Promise<string> {
    try {
      const storagePath = `mahasiswa/${uid}/${fileKey}.jpg`;
      const storageRef = ref(storage, storagePath);
      await uploadString(storageRef, base64Data, 'data_url');
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (err) {
      console.warn("Firebase Storage offline, saving as offline URL.");
    }
    // Return base64Data itself so it can be rendered locally!
    return base64Data;
  }
};
