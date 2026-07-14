import React, { useState, useEffect } from 'react';
import { 
  AuthProvider, 
  useAuth 
} from './context/AuthContext';
import { 
  School, 
  LayoutDashboard, 
  Calendar, 
  Waypoints, 
  GraduationCap, 
  Users, 
  FileCheck, 
  CreditCard, 
  Award, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User,
  ClipboardList,
  UploadCloud,
  FileBadge,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { GelombangManager } from './components/admin/GelombangManager';
import { JalurManager } from './components/admin/JalurManager';
import { ProdiManager } from './components/admin/ProdiManager';
import { CalonMahasiswa } from './components/admin/CalonMahasiswa';
import { VerifikasiBerkas } from './components/admin/VerifikasiBerkas';
import { VerifikasiPembayaran } from './components/admin/VerifikasiPembayaran';
import { HasilSeleksiManager } from './components/admin/HasilSeleksiManager';
import { LaporanStats } from './components/admin/LaporanStats';
import { PengaturanSistem } from './components/admin/PengaturanSistem';

// Student Components
import { MhsDashboard } from './components/mahasiswa/MhsDashboard';
import { MhsBiodata } from './components/mahasiswa/MhsBiodata';
import { ErrorBoundary } from './components/ErrorBoundary';
import { MhsUploadBerkas } from './components/mahasiswa/MhsUploadBerkas';
import { MhsPembayaran } from './components/mahasiswa/MhsPembayaran';
import { MhsKartuUjian } from './components/mahasiswa/MhsKartuUjian';
import { MhsHasilSeleksi } from './components/mahasiswa/MhsHasilSeleksi';
import { MhsDaftarUlang } from './components/mahasiswa/MhsDaftarUlang';

function AppContent() {
  const { user, login, logout, register, error } = useAuth();
  
  // Auth Screen Flow: 'login' | 'register' | 'forgot'
  const [authScreen, setAuthScreen] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Tab/Navigation States
  const [adminTab, setAdminTab] = useState('dashboard');
  const [mhsTab, setMhsTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Form states for login/register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nama, setNama] = useState('');
  const [phone, setPhone] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');
  const [authErrorMsg, setAuthErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setShowPassword(false);
  }, [authScreen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorMsg('');
    try {
      await login(email, password);
    } catch (err: any) {
      setAuthErrorMsg(err.message || 'Email atau password salah');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorMsg('');
    setAuthSuccessMsg('');
    try {
      await register(email, password, nama, phone);
      setAuthSuccessMsg('Registrasi berhasil! Silakan login.');
      setAuthScreen('login');
      // Clear forms
      setEmail('');
      setPassword('');
      setNama('');
      setPhone('');
    } catch (err: any) {
      setAuthErrorMsg(err.message || 'Gagal mendaftar akun');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthSuccessMsg('Link reset password telah dikirim ke email Anda.');
    setTimeout(() => {
      setAuthScreen('login');
      setAuthSuccessMsg('');
    }, 2500);
  };

  // Render Auth Screen (Login / Register / Forgot Password)
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-zinc-100/60 to-indigo-50/40 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100/80 shadow-[0_24px_50px_-12px_rgba(15,23,42,0.06)] overflow-hidden p-8 flex flex-col gap-6 animate-in fade-in duration-300">
          <div className="text-center">
            <div className="inline-flex p-3 bg-indigo-50/80 text-indigo-600 rounded-2xl mb-4 border border-indigo-100/30">
              <School className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold font-display text-slate-900 tracking-tight">Sistem PMB Online</h2>
            <p className="text-xs text-slate-400 font-medium mt-1">Penerimaan Mahasiswa Baru STIKOM POLTEK Cirebon</p>
          </div>

          {authSuccessMsg && (
            <div className="p-3 bg-emerald-50/80 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl text-center">
              {authSuccessMsg}
            </div>
          )}

          {authErrorMsg && (
            <div className="p-3 bg-rose-50/80 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl text-center">
              {authErrorMsg}
            </div>
          )}

          {authScreen === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Alamat Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="budi@email.com"
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all placeholder-slate-400"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                  <button type="button" onClick={() => setAuthScreen('forgot')} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
                    Lupa Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-11 py-2.5 bg-slate-50/50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all placeholder-slate-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                    title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:shadow-indigo-600/15 active:scale-[0.98] mt-2"
              >
                Masuk ke Portal
              </button>

              <div className="text-center text-xs text-slate-500 mt-2">
                Belum punya akun?{' '}
                <button type="button" onClick={() => setAuthScreen('register')} className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline">
                  Daftar Sekarang
                </button>
              </div>
            </form>
          )}

          {authScreen === 'register' && (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  placeholder="Budi Santoso"
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all placeholder-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nomor Handphone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="08123456789"
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all placeholder-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Alamat Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="budi@email.com"
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all placeholder-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password Baru</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-4 pr-11 py-2.5 bg-slate-50/50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all placeholder-slate-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                    title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:shadow-indigo-600/15 active:scale-[0.98] mt-2"
              >
                Buat Akun PMB
              </button>

              <div className="text-center text-xs text-slate-500 mt-2">
                Sudah punya akun?{' '}
                <button type="button" onClick={() => setAuthScreen('login')} className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline">
                  Login
                </button>
              </div>
            </form>
          )}

          {authScreen === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Terdaftar</label>
                <input
                  type="email"
                  placeholder="budi@email.com"
                  className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all placeholder-slate-400"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:shadow-indigo-600/15 active:scale-[0.98] mt-2"
              >
                Kirim Tautan Reset
              </button>

              <div className="text-center text-xs text-slate-500 mt-2">
                Kembali ke{' '}
                <button type="button" onClick={() => setAuthScreen('login')} className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline">
                  Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // --- ROLE: ADMIN LAYOUT ---
  if (user.role === 'admin') {
    const adminNavItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'gelombang', label: 'Gelombang', icon: Calendar },
      { id: 'jalur', label: 'Jalur Masuk', icon: Waypoints },
      { id: 'prodi', label: 'Program Studi', icon: GraduationCap },
      { id: 'calon_mahasiswa', label: 'Calon Mahasiswa', icon: Users },
      { id: 'verifikasi_berkas', label: 'Berkas Upload', icon: FileCheck },
      { id: 'pembayaran', label: 'Slip Pembayaran', icon: CreditCard },
      { id: 'hasil_seleksi', label: 'Hasil Seleksi', icon: Award },
      { id: 'laporan', label: 'Laporan Stats', icon: BarChart3 },
      { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
    ];

    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row">
        {/* Desktop Sidebar / Mobile Header combined */}
        <aside className="w-full md:w-64 sleek-gradient text-white flex flex-col border-r border-slate-950/20 shrink-0 shadow-2xl">
          <div className="p-5 border-b border-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold font-display shadow-lg shadow-indigo-600/30 border border-indigo-500/20">UNM</div>
              <div>
                <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest block font-display">Admin Panel</span>
                <span className="text-sm font-bold block leading-tight font-display tracking-tight text-slate-100">Sistem PMB</span>
              </div>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          <nav className={`flex-1 p-4 flex flex-col gap-1 ${mobileMenuOpen ? 'block' : 'hidden md:flex'}`}>
            {adminNavItems.map(item => {
              const Icon = item.icon;
              const isActive = adminTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setAdminTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                    isActive 
                      ? 'bg-indigo-600/90 hover:bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.2)] border border-indigo-500/20' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="border-t border-slate-800/40 mt-auto pt-4">
              <div className="p-3 bg-slate-950/30 rounded-2xl border border-slate-800/40 mb-3 text-xs flex items-center gap-2.5 shadow-inner">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl shrink-0 border border-indigo-500/20">
                  <User className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <span className="font-bold text-slate-200 block truncate font-display">{user.nama}</span>
                  <span className="text-[10px] text-slate-400 block truncate">Administrator</span>
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all active:scale-[0.98]"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 max-w-5xl overflow-y-auto bg-[#f8fafc]">
          {adminTab === 'dashboard' && <AdminDashboard />}
          {adminTab === 'gelombang' && <GelombangManager />}
          {adminTab === 'jalur' && <JalurManager />}
          {adminTab === 'prodi' && <ProdiManager />}
          {adminTab === 'calon_mahasiswa' && <CalonMahasiswa />}
          {adminTab === 'verifikasi_berkas' && <VerifikasiBerkas />}
          {adminTab === 'pembayaran' && <VerifikasiPembayaran />}
          {adminTab === 'hasil_seleksi' && <HasilSeleksiManager />}
          {adminTab === 'laporan' && <LaporanStats />}
          {adminTab === 'pengaturan' && <PengaturanSistem />}
        </main>
      </div>
    );
  }

  // --- ROLE: STUDENT / MAHASISWA LAYOUT ---
  const mhsNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'biodata', label: 'Isi Biodata', icon: ClipboardList },
    { id: 'pembayaran', label: 'Biaya Pendaftaran', icon: CreditCard },
    { id: 'upload_berkas', label: 'Upload Berkas', icon: UploadCloud },
    { id: 'kartu_ujian', label: 'Kartu Peserta', icon: FileBadge },
    { id: 'hasil_seleksi', label: 'Hasil Seleksi', icon: Award },
    { id: 'daftar_ulang', label: 'Daftar Ulang', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 student-gradient text-white flex flex-col border-r border-indigo-950/20 shrink-0 shadow-2xl">
        <div className="p-5 border-b border-indigo-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold font-display shadow-lg shadow-indigo-600/30 border border-indigo-500/20">UNM</div>
            <div>
              <span className="text-[10px] text-indigo-300 font-extrabold uppercase tracking-widest block font-display">PMB Portal</span>
              <span className="text-sm font-bold block leading-tight font-display tracking-tight text-slate-100">Mhs Dashboard</span>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-indigo-200 hover:text-white rounded-lg hover:bg-indigo-900">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className={`flex-1 p-4 flex flex-col gap-1 ${mobileMenuOpen ? 'block' : 'hidden md:flex'}`}>
          {mhsNavItems.map(item => {
            const Icon = item.icon;
            const isActive = mhsTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setMhsTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-600/90 hover:bg-indigo-600 text-white shadow-[0_4px_12px_rgba(79,70,229,0.2)] border border-indigo-500/20' 
                    : 'text-indigo-200/80 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="border-t border-indigo-900/40 mt-auto pt-4">
            <div className="p-3 bg-indigo-950/50 rounded-2xl border border-indigo-900/30 mb-3 text-xs flex items-center gap-2.5 shadow-inner">
              <div className="p-2 bg-indigo-500/10 text-indigo-300 rounded-xl shrink-0 border border-indigo-500/20">
                <User className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <span className="font-bold text-slate-200 block truncate font-display">{user.nama}</span>
                <span className="text-[10px] text-indigo-300 block truncate">Calon Mahasiswa</span>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition-all active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </div>
        </nav>
      </aside>

      {/* Main viewport */}
      <main className="flex-1 p-6 md:p-8 max-w-5xl overflow-y-auto bg-[#f8fafc]">
        {mhsTab === 'dashboard' && <MhsDashboard onNavigate={setMhsTab} />}
        {mhsTab === 'biodata' && <MhsBiodata />}
        {mhsTab === 'upload_berkas' && <MhsUploadBerkas />}
        {mhsTab === 'pembayaran' && <MhsPembayaran />}
        {mhsTab === 'kartu_ujian' && <MhsKartuUjian />}
        {mhsTab === 'hasil_seleksi' && <MhsHasilSeleksi />}
        {mhsTab === 'daftar_ulang' && <MhsDaftarUlang />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
