import React, { useEffect, useState } from 'react';
import { Save, User, FileText, Landmark, GraduationCap } from 'lucide-react';
import { Pendaftaran, ProgramStudi, JalurPendaftaran, Gelombang } from '../../types';
import { dbService } from '../../services/dbService';
import { useAuth } from '../../context/AuthContext';

export const MhsBiodata: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  // DB Dropdowns
  const [prodis, setProdis] = useState<ProgramStudi[]>([]);
  const [jalurs, setJalurs] = useState<JalurPendaftaran[]>([]);
  const [activeGelombang, setActiveGelombang] = useState<Gelombang | null>(null);

  // Form states
  const [nama, setNama] = useState('');
  const [nik, setNik] = useState('');
  const [nisn, setNisn] = useState('');
  const [asalSekolah, setAsalSekolah] = useState('');
  const [pilihanProdi, setPilihanProdi] = useState('');
  const [pilihanJalur, setPilihanJalur] = useState('');

  useEffect(() => {
    const loadDropdownsAndProfile = async () => {
      if (!user) return;
      try {
        const pr = await dbService.getProdi();
        const jl = await dbService.getJalur();
        const gel = await dbService.getGelombang();

        const activeG = gel.find(g => g.status === 'Aktif') || null;

        setProdis(pr.filter(p => p.status === 'Aktif'));
        setJalurs(jl.filter(j => j.status === 'Aktif'));
        setActiveGelombang(activeG);

        // Load existing pendaftaran
        const existing = await dbService.getPendaftaranByUid(user.uid);
        if (existing) {
          setNama(existing.nama || user.nama);
          setNik(existing.nik || '');
          setNisn(existing.nisn || '');
          setAsalSekolah(existing.asal_sekolah || '');
          setPilihanProdi(existing.program_studi || '');
          setPilihanJalur(existing.jalur || '');
        } else {
          setNama(user.nama);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDropdownsAndProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSuccess(false);

    if (!pilihanProdi || !pilihanJalur) {
      alert("Harap pilih program studi dan jalur pendaftaran!");
      return;
    }

    const item: Pendaftaran = {
      id: user.uid, // Map 1-to-1 main record
      uid: user.uid,
      nama,
      nik,
      nisn,
      asal_sekolah: asalSekolah,
      program_studi: pilihanProdi,
      jalur: pilihanJalur,
      gelombang: activeGelombang ? activeGelombang.nama : 'Gelombang Reguler',
      status: 'Menunggu Verifikasi', // Elevate to pending review
      createdAt: new Date().toISOString()
    };

    await dbService.savePendaftaran(item);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse p-1">
        <div className="h-10 bg-slate-100 rounded w-48" />
        <div className="h-96 bg-slate-100 rounded-2xl border border-slate-200" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-1">
      <div>
        <h3 className="text-xl font-bold text-slate-800 font-sans">Formulir Biodata Calon Mahasiswa</h3>
        <p className="text-xs text-slate-400 mt-0.5">Lengkapi formulir pendaftaran akademik di bawah ini dengan data asli.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {success && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl animate-in fade-in duration-200">
              ✓ Formulir biodata berhasil disimpan dan diajukan untuk verifikasi!
            </div>
          )}

          {activeGelombang && (
            <div className="p-3.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl flex items-center justify-between">
              <span>Registrasi Terbuka Untuk: <span className="font-bold">{activeGelombang.nama}</span> ({activeGelombang.tahun})</span>
              <span className="text-[10px] bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded uppercase font-bold">Aktif</span>
            </div>
          )}

          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                <User className="w-4 h-4 text-slate-400" /> Nama Lengkap Sesuai Ijazah *
              </label>
              <input
                type="text"
                value={nama}
                onChange={e => setNama(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                <FileText className="w-4 h-4 text-slate-400" /> NIK (No. KTP / KK) *
              </label>
              <input
                type="text"
                value={nik}
                onChange={e => setNik(e.target.value)}
                placeholder="Masukkan 16 digit NIK"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-mono"
                maxLength={16}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                <FileText className="w-4 h-4 text-slate-400" /> Nomor Induk Siswa Nasional (NISN) *
              </label>
              <input
                type="text"
                value={nisn}
                onChange={e => setNisn(e.target.value)}
                placeholder="Masukkan 10 digit NISN"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-mono"
                maxLength={10}
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                <GraduationCap className="w-4 h-4 text-slate-400" /> Nama Sekolah Asal *
              </label>
              <input
                type="text"
                value={asalSekolah}
                onChange={e => setAsalSekolah(e.target.value)}
                placeholder="Contoh: SMAN 1 Jakarta"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Academic Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                <GraduationCap className="w-4 h-4 text-slate-400" /> Pilihan Program Studi *
              </label>
              <select
                value={pilihanProdi}
                onChange={e => setPilihanProdi(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                required
              >
                <option value="">-- Pilih Program Studi --</option>
                {prodis.map(p => (
                  <option key={p.id} value={p.nama}>{p.nama} ({p.jenjang})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                <Landmark className="w-4 h-4 text-slate-400" /> Jalur Pendaftaran *
              </label>
              <select
                value={pilihanJalur}
                onChange={e => setPilihanJalur(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                required
              >
                <option value="">-- Pilih Jalur Masuk --</option>
                {jalurs.map(j => (
                  <option key={j.id} value={j.nama}>{j.nama}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full inline-flex justify-center items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors mt-3"
          >
            <Save className="w-4 h-4" /> Simpan & Ajukan Biodata
          </button>
        </form>
      </div>
    </div>
  );
};
