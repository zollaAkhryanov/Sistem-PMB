import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, Calendar, Sparkles } from 'lucide-react';
import { Gelombang } from '../../types';
import { dbService } from '../../services/dbService';

export const GelombangManager: React.FC = () => {
  const [list, setList] = useState<Gelombang[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Gelombang | null>(null);

  // Form states
  const [nama, setNama] = useState('');
  const [tahun, setTahun] = useState('2026/2027');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [status, setStatus] = useState<'Aktif' | 'Tidak Aktif'>('Aktif');

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await dbService.getGelombang();
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

  const handleEditClick = (item: Gelombang) => {
    setEditingItem(item);
    setNama(item.nama);
    setTahun(item.tahun);
    setTanggalMulai(item.tanggal_mulai);
    setTanggalSelesai(item.tanggal_selesai);
    setStatus(item.status);
    setShowForm(true);
  };

  const handleAddClick = () => {
    setEditingItem(null);
    setNama('');
    setTahun('2026/2027');
    setTanggalMulai('');
    setTanggalSelesai('');
    setStatus('Aktif');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !tanggalMulai || !tanggalSelesai) {
      alert("Harap lengkapi semua field yang wajib!");
      return;
    }

    const item: Gelombang = {
      id: editingItem ? editingItem.id : 'gel-' + Math.random().toString(36).substr(2, 9),
      nama,
      tahun,
      tanggal_mulai: tanggalMulai,
      tanggal_selesai: tanggalSelesai,
      status: status,
    };

    // If setting active, we optionally deactivate others
    let updatedList = [...list];
    if (status === 'Aktif') {
      updatedList = updatedList.map(g => ({
        ...g,
        status: g.id === item.id ? 'Aktif' : 'Tidak Aktif'
      }));
      // Save all updated
      for (const g of updatedList) {
        if (g.id !== item.id && g.status === 'Tidak Aktif') {
          await dbService.saveGelombang(g);
        }
      }
    }

    await dbService.saveGelombang(item);
    setShowForm(false);
    fetchList();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus gelombang ini?")) {
      await dbService.deleteGelombang(id);
      fetchList();
    }
  };

  const toggleStatus = async (item: Gelombang) => {
    const newStatus = item.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif';
    const updated: Gelombang = { ...item, status: newStatus };

    if (newStatus === 'Aktif') {
      // Deactivate all others
      for (const g of list) {
        if (g.id !== item.id && g.status === 'Aktif') {
          await dbService.saveGelombang({ ...g, status: 'Tidak Aktif' });
        }
      }
    }

    await dbService.saveGelombang(updated);
    fetchList();
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-slate-100 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-slate-100 h-40 rounded-2xl border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-1">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Manajemen Gelombang PMB</h3>
          <p className="text-xs text-slate-400 mt-0.5">Kelola gelombang pendaftaran akademik yang sedang berlangsung.</p>
        </div>
        <button
          onClick={handleAddClick}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Gelombang Baru
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col gap-5 max-w-xl animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-semibold text-slate-800">{editingItem ? 'Edit Gelombang' : 'Tambah Gelombang Baru'}</h4>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xs font-medium">Batal</button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Nama Gelombang *</label>
              <input
                type="text"
                value={nama}
                onChange={e => setNama(e.target.value)}
                placeholder="Contoh: Gelombang I"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Tahun Akademik *</label>
              <input
                type="text"
                value={tahun}
                onChange={e => setTahun(e.target.value)}
                placeholder="Contoh: 2026/2027"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Tanggal Mulai *</label>
                <input
                  type="date"
                  value={tanggalMulai}
                  onChange={e => setTanggalMulai(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Tanggal Selesai *</label>
                <input
                  type="date"
                  value={tanggalSelesai}
                  onChange={e => setTanggalSelesai(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Status Gelombang</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as 'Aktif' | 'Tidak Aktif')}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              >
                <option value="Aktif">Aktif (Hanya boleh 1 gelombang aktif)</option>
                <option value="Tidak Aktif">Tidak Aktif</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-sm transition-colors"
            >
              Simpan Gelombang
            </button>
          </form>
        </div>
      )}

      {/* Gelombang Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl border p-6 flex flex-col gap-4 relative overflow-hidden transition-all duration-200 ${
              item.status === 'Aktif' 
                ? 'border-indigo-500 shadow-sm ring-1 ring-indigo-500/25' 
                : 'border-slate-100 shadow-sm hover:border-slate-200'
            }`}
          >
            {item.status === 'Aktif' && (
              <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Gelombang Aktif
              </div>
            )}

            <div className="flex flex-col gap-1">
              <span className="text-xs font-mono text-slate-400">{item.tahun}</span>
              <h4 className="font-bold text-slate-800 text-lg">{item.nama}</h4>
            </div>

            <div className="flex flex-col gap-2 bg-slate-50 p-3.5 rounded-xl text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>Mulai: <span className="text-slate-800 font-semibold">{item.tanggal_mulai}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>Selesai: <span className="text-slate-800 font-semibold">{item.tanggal_selesai}</span></span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-1">
              <button
                onClick={() => toggleStatus(item)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                  item.status === 'Aktif'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {item.status === 'Aktif' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Aktif
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-slate-400" /> Tidak Aktif
                  </>
                )}
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleEditClick(item)}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  title="Edit Gelombang"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  title="Hapus Gelombang"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
