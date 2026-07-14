import React, { useEffect, useState } from 'react';
import { Users, FileCheck, CreditCard, Award, ArrowUpRight, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Pendaftaran, Berkas, Pembayaran, HasilSeleksi } from '../../types';
import { dbService } from '../../services/dbService';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMhs: 0,
    pendingBerkas: 0,
    pendingPembayaran: 0,
    lolosSeleksi: 0
  });
  const [recentList, setRecentList] = useState<Pendaftaran[]>([]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const pendaftaran = await dbService.getAllPendaftaran();
        const berkas = await dbService.getAllBerkas();
        const pembayaran = await dbService.getAllPembayaran();
        const hasil = await dbService.getAllHasilSeleksi();

        const pendingB = berkas.filter(b => b.status === 'Menunggu Verifikasi').length;
        const pendingP = pembayaran.filter(p => p.status === 'Menunggu Verifikasi').length;
        const lolos = hasil.filter(h => h.status === 'Lolos').length;

        setStats({
          totalMhs: pendaftaran.length,
          pendingBerkas: pendingB,
          pendingPembayaran: pendingP,
          lolosSeleksi: lolos
        });

        // Sort recent first
        const sorted = [...pendaftaran].sort((a, b) => {
          const tA = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : 0;
          const tB = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        });
        setRecentList(sorted.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Terverifikasi':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi</span>;
      case 'Menunggu Verifikasi':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3.5 h-3.5 animate-pulse" /> Menunggu</span>;
      case 'Ditolak':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200"><XCircle className="w-3.5 h-3.5" /> Ditolak</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200"><AlertCircle className="w-3.5 h-3.5" /> Draft</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="bg-slate-100 h-32 rounded-2xl border border-slate-200" />
          ))}
        </div>
        <div className="bg-slate-100 h-96 rounded-2xl border border-slate-200" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-1">
      {/* Welcome Banner */}
      <div className="sleek-gradient text-white p-8 rounded-3xl border border-slate-950/30 shadow-[0_12px_30px_rgba(15,23,42,0.08)] relative overflow-hidden">
        <h2 className="text-2xl font-bold font-display tracking-tight">Dashboard Administrasi PMB</h2>
        <p className="text-indigo-200 mt-2 max-w-xl font-light text-sm">
          Selamat datang kembali di panel manajemen penerimaan mahasiswa baru. Kelola gelombang pendaftaran, verifikasi pembayaran, berkas, dan umumkan hasil kelulusan seleksi.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat 1 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100/80 card-sleek cursor-pointer" onClick={() => onNavigate('calon_mahasiswa')}>
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-display">Calon Mahasiswa</span>
              <h3 className="text-3xl font-bold text-slate-800 font-mono">{stats.totalMhs}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50/80 text-blue-600 border border-blue-100/30">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-slate-500">
            <span>Lihat semua registran</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-blue-500" />
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100/80 card-sleek cursor-pointer" onClick={() => onNavigate('verifikasi_berkas')}>
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-display">Verifikasi Berkas</span>
              <h3 className="text-3xl font-bold text-slate-800 font-mono">{stats.pendingBerkas}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50/80 text-amber-600 border border-amber-100/30">
              <FileCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-amber-600">
            <span>Menunggu verifikasi berkas</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100/80 card-sleek cursor-pointer" onClick={() => onNavigate('pembayaran')}>
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-display">Konfirmasi Bayar</span>
              <h3 className="text-3xl font-bold text-slate-800 font-mono">{stats.pendingPembayaran}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50/80 text-emerald-600 border border-emerald-100/30">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-emerald-600">
            <span>Menunggu verifikasi bukti</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100/80 card-sleek cursor-pointer" onClick={() => onNavigate('hasil_seleksi')}>
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-display">Lolos Seleksi</span>
              <h3 className="text-3xl font-bold text-slate-800 font-mono">{stats.lolosSeleksi}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-50/80 text-indigo-600 border border-indigo-100/30">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-4 text-xs font-semibold text-indigo-600">
            <span>Lihat pengumuman seleksi</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Registrations & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Registrations Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100/80 card-sleek p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold font-display text-slate-800 text-lg tracking-tight">Pendaftaran Terbaru</h4>
              <p className="text-xs text-slate-400 mt-0.5">5 pendaftaran terakhir calon mahasiswa baru</p>
            </div>
            <button 
              onClick={() => onNavigate('calon_mahasiswa')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3.5 py-2 bg-indigo-50/80 rounded-xl hover:bg-indigo-100 border border-indigo-100/20 transition-all active:scale-[0.98]"
            >
              Semua Data
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-medium">
                  <th className="pb-3 text-xs uppercase tracking-wider font-bold font-display">Nama Lengkap</th>
                  <th className="pb-3 text-xs uppercase tracking-wider font-bold font-display">Program Studi</th>
                  <th className="pb-3 text-xs uppercase tracking-wider font-bold font-display">Jalur</th>
                  <th className="pb-3 text-xs uppercase tracking-wider font-bold font-display">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 font-light">
                      Belum ada calon mahasiswa yang mendaftar.
                    </td>
                  </tr>
                ) : (
                  recentList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 font-semibold text-slate-800 text-sm">
                        <div>
                          <p>{item.nama}</p>
                          <p className="text-[10px] font-mono text-slate-400 font-normal mt-0.5">NISN: {item.nisn || '-'}</p>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-600 text-sm">{item.program_studi}</td>
                      <td className="py-3.5 text-slate-500 text-xs font-mono">{item.jalur}</td>
                      <td className="py-3.5">{getStatusBadge(item.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Informational Widget */}
        <div className="bg-white rounded-3xl border border-slate-100/80 card-sleek p-6 flex flex-col gap-6">
          <div>
            <h4 className="font-bold font-display text-slate-800 text-lg tracking-tight">Alur Seleksi PMB</h4>
            <p className="text-xs text-slate-400 mt-0.5">Prosedur penerimaan mahasiswa baru online</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/30 flex items-center justify-center font-bold font-mono text-sm shrink-0">1</div>
              <div>
                <h5 className="font-semibold text-slate-800 text-sm">Registrasi & Biodata</h5>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Calon mahasiswa melengkapi berkas biodata, program studi dan jalur pendaftaran.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/30 flex items-center justify-center font-bold font-mono text-sm shrink-0">2</div>
              <div>
                <h5 className="font-semibold text-slate-800 text-sm">Biaya Pendaftaran</h5>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Mengunggah bukti transfer biaya pendaftaran sesuai jalur yang diambil.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/30 flex items-center justify-center font-bold font-mono text-sm shrink-0">3</div>
              <div>
                <h5 className="font-semibold text-slate-800 text-sm">Verifikasi & Seleksi</h5>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Tim Admin memverifikasi berkas, pembayaran, dan menginput hasil ujian/seleksi.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/30 flex items-center justify-center font-bold font-mono text-sm shrink-0">4</div>
              <div>
                <h5 className="font-semibold text-slate-800 text-sm">Daftar Ulang</h5>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">Mahasiswa yang dinyatakan LOLOS melengkapi berkas daftar ulang dan mendapatkan NIM.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
