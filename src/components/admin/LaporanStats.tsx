import React, { useEffect, useState } from 'react';
import { Download, FileText, BarChart3, PieChart, Users, TrendingUp, CheckCircle, ArrowDown } from 'lucide-react';
import { Pendaftaran, ProgramStudi, JalurPendaftaran } from '../../types';
import { dbService } from '../../services/dbService';

export const LaporanStats: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [pendaftaran, setPendaftaran] = useState<Pendaftaran[]>([]);
  const [prodiList, setProdiList] = useState<ProgramStudi[]>([]);
  const [jalurList, setJalurList] = useState<JalurPendaftaran[]>([]);

  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0,
  });

  const [prodiStats, setProdiStats] = useState<Record<string, number>>({});
  const [jalurStats, setJalurStats] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadReportData = async () => {
      try {
        const p = await dbService.getAllPendaftaran();
        const pr = await dbService.getProdi();
        const jl = await dbService.getJalur();

        setPendaftaran(p);
        setProdiList(pr);
        setJalurList(jl);

        // Core stats
        const total = p.length;
        const verified = p.filter(x => x.status === 'Terverifikasi').length;
        const pending = p.filter(x => x.status === 'Menunggu Verifikasi').length;
        const rejected = p.filter(x => x.status === 'Ditolak').length;

        setStats({ total, verified, pending, rejected });

        // Prodi counts
        const prStats: Record<string, number> = {};
        p.forEach(x => {
          prStats[x.program_studi] = (prStats[x.program_studi] || 0) + 1;
        });
        setProdiStats(prStats);

        // Jalur counts
        const jlStats: Record<string, number> = {};
        p.forEach(x => {
          jlStats[x.jalur] = (jlStats[x.jalur] || 0) + 1;
        });
        setJalurStats(jlStats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-slate-100 rounded w-48" />
        <div className="h-64 bg-slate-100 rounded-2xl border border-slate-200" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Laporan Statistik Pendaftaran</h3>
          <p className="text-xs text-slate-400 mt-0.5 font-light">Analisis distribusi calon mahasiswa berdasarkan program studi dan jalur masuk.</p>
        </div>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" /> Ekspor & Cetak Laporan
        </button>
      </div>

      {/* Grid Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Registran</span>
            <span className="text-2xl font-bold text-slate-800 font-mono">{stats.total}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Terverifikasi</span>
            <span className="text-2xl font-bold text-emerald-600 font-mono">{stats.verified}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Menunggu Review</span>
            <span className="text-2xl font-bold text-amber-600 font-mono">{stats.pending}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ditolak / Gagal</span>
            <span className="text-2xl font-bold text-rose-600 font-mono">{stats.rejected}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Statistics by Program Studi */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
          <div>
            <h4 className="font-bold text-slate-800 text-base">Distribusi Program Studi</h4>
            <p className="text-xs text-slate-400 mt-0.5">Jumlah pelamar berdasarkan program studi yang dipilih</p>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            {prodiList.map(prodi => {
              const count = prodiStats[prodi.nama] || 0;
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={prodi.id} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{prodi.nama} ({prodi.jenjang})</span>
                    <span>{count} Calon Mahasiswa</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statistics by Pathway */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
          <div>
            <h4 className="font-bold text-slate-800 text-base">Distribusi Jalur Pendaftaran</h4>
            <p className="text-xs text-slate-400 mt-0.5">Peta sebaran calon mahasiswa berdasarkan jalur masuk</p>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            {jalurList.map(jalur => {
              const count = jalurStats[jalur.nama] || 0;
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={jalur.id} className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{jalur.nama}</span>
                    <span>{count} Pelamar</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
