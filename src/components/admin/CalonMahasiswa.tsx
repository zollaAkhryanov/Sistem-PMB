import React, { useEffect, useState } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Pendaftaran } from '../../types';
import { dbService } from '../../services/dbService';

export const CalonMahasiswa: React.FC = () => {
  const [list, setList] = useState<Pendaftaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<Pendaftaran | null>(null);

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await dbService.getAllPendaftaran();
      setList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleUpdateStatus = async (item: Pendaftaran, newStatus: 'Terverifikasi' | 'Ditolak' | 'Menunggu Verifikasi') => {
    const updated: Pendaftaran = { ...item, status: newStatus };
    await dbService.savePendaftaran(updated);
    setSelectedItem(updated);
    // update in list
    setList(prev => prev.map(p => p.uid === item.uid ? updated : p));
  };

  const filteredList = list.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(search.toLowerCase()) || 
                          item.nik.includes(search) || 
                          item.nisn.includes(search) ||
                          item.asal_sekolah.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Terverifikasi':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Terverifikasi</span>;
      case 'Menunggu Verifikasi':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">Menunggu</span>;
      case 'Ditolak':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200">Ditolak</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-50 text-slate-700 border border-slate-200">Draft</span>;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Daftar Calon Mahasiswa</h3>
          <p className="text-xs text-slate-400 mt-0.5">Pantau data profil pendaftaran dari calon mahasiswa baru.</p>
        </div>
        <button
          onClick={fetchList}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari Nama, NIK, NISN, Asal..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full sm:w-48 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
          >
            <option value="All">Semua Status</option>
            <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
            <option value="Terverifikasi">Terverifikasi</option>
            <option value="Ditolak">Ditolak</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                <th className="p-4 text-xs uppercase tracking-wider font-semibold">Nama Lengkap</th>
                <th className="p-4 text-xs uppercase tracking-wider font-semibold">NIK & NISN</th>
                <th className="p-4 text-xs uppercase tracking-wider font-semibold">Program Studi</th>
                <th className="p-4 text-xs uppercase tracking-wider font-semibold">Jalur & Gelombang</th>
                <th className="p-4 text-xs uppercase tracking-wider font-semibold">Status</th>
                <th className="p-4 text-xs uppercase tracking-wider font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [1, 2, 3].map(n => (
                  <tr key={n} className="animate-pulse">
                    <td colSpan={6} className="p-6">
                      <div className="h-6 bg-slate-100 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-light">
                    Tidak ditemukan data calon mahasiswa.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id || item.uid} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-semibold text-slate-800">
                      <div>
                        <p>{item.nama}</p>
                        <p className="text-xs font-normal text-slate-400 mt-0.5">{item.asal_sekolah}</p>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-xs">
                      <div>
                        <p>NIK: {item.nik || '-'}</p>
                        <p className="mt-0.5">NISN: {item.nisn || '-'}</p>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{item.program_studi}</td>
                    <td className="p-4 text-xs text-slate-500">
                      <div>
                        <p className="font-medium text-slate-700">{item.jalur}</p>
                        <p className="mt-0.5">{item.gelombang}</p>
                      </div>
                    </td>
                    <td className="p-4">{getStatusBadge(item.status)}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-medium rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col p-6 gap-6 relative">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-50 transition-colors"
            >
              ✕
            </button>

            <div>
              <h4 className="text-lg font-bold text-slate-800">Detail Pendaftaran Calon Mahasiswa</h4>
              <p className="text-xs text-slate-400 mt-0.5">ID Pendaftaran: {selectedItem.id || selectedItem.uid}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nama Lengkap</span>
                <span className="text-sm font-semibold text-slate-800">{selectedItem.nama}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Asal Sekolah</span>
                <span className="text-sm font-semibold text-slate-800">{selectedItem.asal_sekolah}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nomor Induk Kependudukan (NIK)</span>
                <span className="text-sm font-mono font-semibold text-slate-800">{selectedItem.nik || '-'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nomor Induk Siswa Nasional (NISN)</span>
                <span className="text-sm font-mono font-semibold text-slate-800">{selectedItem.nisn || '-'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pilihan Program Studi</span>
                <span className="text-sm font-semibold text-indigo-600">{selectedItem.program_studi}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Jalur Masuk</span>
                <span className="text-sm font-semibold text-indigo-600">{selectedItem.jalur}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gelombang Pendaftaran</span>
                <span className="text-sm font-semibold text-slate-700">{selectedItem.gelombang}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status Berkas & Biodata</span>
                <span className="mt-1 block">{getStatusBadge(selectedItem.status)}</span>
              </div>
            </div>

            {/* Quick Actions for admin */}
            <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aksi Verifikasi Biodata</span>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleUpdateStatus(selectedItem, 'Terverifikasi')}
                  disabled={selectedItem.status === 'Terverifikasi'}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  <CheckCircle className="w-4 h-4" /> Setujui & Verifikasi
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedItem, 'Ditolak')}
                  disabled={selectedItem.status === 'Ditolak'}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Tolak Data
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedItem, 'Menunggu Verifikasi')}
                  disabled={selectedItem.status === 'Menunggu Verifikasi'}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  <AlertCircle className="w-4 h-4" /> Set Menunggu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
