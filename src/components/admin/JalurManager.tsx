import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, CheckSquare, Square, DollarSign } from 'lucide-react';
import { JalurPendaftaran } from '../../types';
import { dbService } from '../../services/dbService';

export const JalurManager: React.FC = () => {
  const [list, setList] = useState<JalurPendaftaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<JalurPendaftaran | null>(null);

  // Form states
  const [nama, setNama] = useState('');
  const [biaya, setBiaya] = useState(150000);
  const [status, setStatus] = useState<'Aktif' | 'Tidak Aktif'>('Aktif');

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await dbService.getJalur();
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

  const handleEditClick = (item: JalurPendaftaran) => {
    setEditingItem(item);
    setNama(item.nama);
    setBiaya(item.biaya);
    setStatus(item.status);
    setShowForm(true);
  };

  const handleAddClick = () => {
    setEditingItem(null);
    setNama('');
    setBiaya(150000);
    setStatus('Aktif');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama) {
      alert("Harap lengkapi nama jalur pendaftaran!");
      return;
    }

    const item: JalurPendaftaran = {
      id: editingItem ? editingItem.id : 'jalur-' + Math.random().toString(36).substr(2, 9),
      nama,
      biaya: Number(biaya),
      status: status,
    };

    await dbService.saveJalur(item);
    setShowForm(false);
    fetchList();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus jalur pendaftaran ini?")) {
      await dbService.deleteJalur(id);
      fetchList();
    }
  };

  const toggleStatus = async (item: JalurPendaftaran) => {
    const newStatus = item.status === 'Aktif' ? 'Tidak Aktif' : 'Aktif';
    const updated: JalurPendaftaran = { ...item, status: newStatus };
    await dbService.saveJalur(updated);
    fetchList();
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-slate-100 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(n => (
            <div key={n} className="bg-slate-100 h-32 rounded-2xl border border-slate-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-1">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Manajemen Jalur Pendaftaran</h3>
          <p className="text-xs text-slate-400 mt-0.5">Atur opsi jalur penerimaan mahasiswa beserta biaya registrasinya.</p>
        </div>
        <button
          onClick={handleAddClick}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Jalur Baru
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col gap-5 max-w-xl animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-semibold text-slate-800">{editingItem ? 'Edit Jalur Pendaftaran' : 'Tambah Jalur Baru'}</h4>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 text-xs font-medium">Batal</button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Nama Jalur Pendaftaran *</label>
              <input
                type="text"
                value={nama}
                onChange={e => setNama(e.target.value)}
                placeholder="Contoh: Jalur Prestasi Akademik"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Biaya Pendaftaran (Rupiah) *</label>
              <div className="relative">
                <span className="absolute left-4 top-2.5 text-slate-400 font-medium text-sm">Rp</span>
                <input
                  type="number"
                  value={biaya}
                  onChange={e => setBiaya(Number(e.target.value))}
                  placeholder="Contoh: 150000"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Status Aktif</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as 'Aktif' | 'Tidak Aktif')}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              >
                <option value="Aktif">Aktif</option>
                <option value="Tidak Aktif">Tidak Aktif</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-sm transition-colors"
            >
              Simpan Jalur
            </button>
          </form>
        </div>
      )}

      {/* Jalur Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-2xl border p-5 flex flex-col justify-between gap-4 transition-all duration-200 ${
              item.status === 'Aktif'
                ? 'border-indigo-100 shadow-sm'
                : 'border-slate-100 opacity-80'
            }`}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  item.status === 'Aktif'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {item.status}
                </span>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md flex items-center gap-1 font-mono">
                  <DollarSign className="w-3.5 h-3.5" /> {formatRupiah(item.biaya)}
                </span>
              </div>
              <h4 className="font-bold text-slate-800 text-base mt-1 line-clamp-2">{item.nama}</h4>
            </div>

            <div className="flex items-center justify-between border-t border-slate-50 pt-3.5 mt-2">
              <button
                onClick={() => toggleStatus(item)}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 font-medium transition-colors"
              >
                {item.status === 'Aktif' ? (
                  <CheckSquare className="w-4 h-4 text-indigo-500" />
                ) : (
                  <Square className="w-4 h-4 text-slate-300" />
                )}
                <span>Ubah Status</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEditClick(item)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  title="Edit Jalur"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  title="Hapus Jalur"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
