import React, { useEffect, useState } from 'react';
import { ShieldCheck, Award, GraduationCap, ArrowRight, RefreshCw, BookmarkCheck } from 'lucide-react';
import { HasilSeleksi, Pendaftaran } from '../../types';
import { dbService } from '../../services/dbService';
import { useAuth } from '../../context/AuthContext';

export const MhsDaftarUlang: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [hasil, setHasil] = useState<HasilSeleksi | null>(null);
  const [pendaftaran, setPendaftaran] = useState<Pendaftaran | null>(null);

  // Form states
  const [ijazahNo, setIjazahNo] = useState('');
  const [nim, setNim] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const h = await dbService.getHasilSeleksiByUid(user.uid);
        const p = await dbService.getPendaftaranByUid(user.uid);
        setHasil(h);
        setPendaftaran(p);

        // Check if NIM already generated locally
        const savedNim = localStorage.getItem(`nim_${user.uid}`);
        if (savedNim) {
          setNim(savedNim);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const handleFinalize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Generate random realistic NIM
    // e.g. 2026 + 11 + random 4 digits
    const generatedNim = '2026110' + Math.floor(100 + Math.random() * 900);
    localStorage.setItem(`nim_${user.uid}`, generatedNim);
    setNim(generatedNim);
    setSuccess(true);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse p-1">
        <div className="h-10 bg-slate-100 rounded w-48" />
        <div className="h-96 bg-slate-100 rounded-2xl border border-slate-200" />
      </div>
    );
  }

  const isLolos = !!hasil && hasil.status === 'Lolos';

  if (!isLolos) {
    return (
      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center gap-4 max-w-xl py-12">
        <BookmarkCheck className="w-12 h-12 text-slate-300" />
        <div>
          <h4 className="font-bold text-slate-800 text-base">Pendaftaran Daftar Ulang Belum Terbuka</h4>
          <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
            Tahap daftar ulang dan pembuatan NIM hanya terbuka bagi calon mahasiswa yang sudah dinyatakan **Lolos** pada pengumuman kelulusan ujian masuk.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-1">
      <div>
        <h3 className="text-xl font-bold text-slate-800">Daftar Ulang & Pengambilan NIM</h3>
        <p className="text-xs text-slate-400 mt-0.5">Selesaikan daftar ulang administrasi akademik Anda untuk mengklaim Nomor Induk Mahasiswa resmi.</p>
      </div>

      {nim ? (
        <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-8 flex flex-col items-center justify-center text-center gap-6 max-w-xl shadow-xl relative overflow-hidden py-10 animate-in zoom-in-95 duration-200">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-indigo-500/10 blur-xl" />
          
          <div className="p-4 bg-indigo-500/10 text-indigo-300 rounded-full border border-indigo-500/20">
            <ShieldCheck className="w-12 h-12" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Selamat! Anda Telah Terdaftar Resmi</span>
            <h4 className="text-xl font-bold">{user?.nama}</h4>
            <p className="text-slate-400 text-xs">Program Studi: {pendaftaran?.program_studi}</p>
          </div>

          <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 w-full flex flex-col gap-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Nomor Induk Mahasiswa (NIM) Anda</span>
            <span className="text-3xl font-extrabold text-indigo-300 tracking-wider font-mono">{nim}</span>
          </div>

          <div className="text-xs text-slate-400 font-light leading-relaxed max-w-sm">
            Simpan nomor NIM di atas. Silakan periksa kotak masuk email atau pantau terus pengumuman jadwal Pengenalan Kehidupan Kampus (PKKMB).
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-xl flex flex-col gap-5">
          <div>
            <h4 className="font-bold text-slate-800 text-base">Formulir Daftar Ulang</h4>
            <p className="text-xs text-slate-400 mt-0.5">Lengkapi ijazah kelulusan sekolah untuk mengklaim NIM</p>
          </div>

          <form onSubmit={handleFinalize} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">No. Seri Ijazah SMA/SMK/MA *</label>
              <input
                type="text"
                value={ijazahNo}
                onChange={e => setIjazahNo(e.target.value)}
                placeholder="Contoh: DN-01/M-SMA/13/0012345"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-mono"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex justify-center items-center gap-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors mt-2"
            >
              Klaim NIM & Selesaikan Daftar Ulang <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
