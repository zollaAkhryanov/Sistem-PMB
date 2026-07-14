import React, { useEffect, useState } from 'react';
import { Check, X, CreditCard, RefreshCw, Eye, DollarSign, AlertCircle } from 'lucide-react';
import { Pembayaran } from '../../types';
import { dbService } from '../../services/dbService';

export const VerifikasiPembayaran: React.FC = () => {
  const [list, setList] = useState<Pembayaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPembayaran, setSelectedPembayaran] = useState<Pembayaran | null>(null);
  const [catatan, setCatatan] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await dbService.getAllPembayaran();
      setList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (item: Pembayaran, newStatus: 'Lunas' | 'Ditolak' | 'Menunggu Verifikasi') => {
    const updated: Pembayaran = {
      ...item,
      status: newStatus,
      catatan: newStatus === 'Ditolak' ? catatan : '',
      updatedAt: new Date().toISOString()
    };
    await dbService.savePembayaran(updated);
    setList(prev => prev.map(p => p.id === item.id ? updated : p));
    setSelectedPembayaran(null);
    setCatatan('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Lunas':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Lunas / Terverifikasi</span>;
      case 'Menunggu Verifikasi':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">Menunggu Verifikasi</span>;
      case 'Ditolak':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200">Ditolak</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-50 text-slate-700 border border-slate-200">Belum Bayar</span>;
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="flex flex-col gap-6 p-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Verifikasi Bukti Pembayaran</h3>
          <p className="text-xs text-slate-400 mt-0.5">Konfirmasi dan verifikasi tagihan biaya pendaftaran calon mahasiswa baru.</p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table/List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="p-4 text-xs uppercase tracking-wider font-semibold">Mahasiswa</th>
                  <th className="p-4 text-xs uppercase tracking-wider font-semibold">Nominal Transfer</th>
                  <th className="p-4 text-xs uppercase tracking-wider font-semibold">Tanggal Kirim</th>
                  <th className="p-4 text-xs uppercase tracking-wider font-semibold">Status</th>
                  <th className="p-4 text-xs uppercase tracking-wider font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  [1, 2, 3].map(n => (
                    <tr key={n} className="animate-pulse">
                      <td colSpan={5} className="p-6">
                        <div className="h-6 bg-slate-100 rounded w-full" />
                      </td>
                    </tr>
                  ))
                ) : list.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 font-light">
                      Belum ada calon mahasiswa yang melapor pembayaran.
                    </td>
                  </tr>
                ) : (
                  list.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-semibold text-slate-800">
                        {item.namaMahasiswa}
                      </td>
                      <td className="p-4 font-semibold font-mono text-indigo-600 text-xs">
                        {formatRupiah(item.nominal)}
                      </td>
                      <td className="p-4 text-slate-500 text-xs">
                        {item.tanggal}
                      </td>
                      <td className="p-4">{getStatusBadge(item.status)}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedPembayaran(item);
                            setCatatan(item.catatan || '');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-medium rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Periksa Slip
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Receipt Verification Panel */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-5 h-fit">
          {selectedPembayaran ? (
            <div className="flex flex-col gap-5 animate-in fade-in duration-200">
              <div>
                <h4 className="font-bold text-slate-800 text-base">Verifikasi Keabsahan Slip</h4>
                <p className="text-xs text-indigo-600 font-semibold mt-0.5">{selectedPembayaran.namaMahasiswa}</p>
              </div>

              <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nominal Pembayaran</span>
                  <span className="text-sm font-bold text-indigo-600 font-mono">{formatRupiah(selectedPembayaran.nominal)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tanggal Dilaporkan</span>
                  <span className="text-xs font-semibold text-slate-700">{selectedPembayaran.tanggal}</span>
                </div>
              </div>

              {/* Preview Button for receipt slip image */}
              {selectedPembayaran.bukti ? (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bukti Transfer (Slip)</span>
                  <div className="relative rounded-2xl overflow-hidden border border-slate-100 h-40 bg-slate-50 flex items-center justify-center group">
                    <img 
                      src={selectedPembayaran.bukti} 
                      alt="Receipt Slip" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => setPreviewImage(selectedPembayaran.bukti || null)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-slate-800 rounded-xl text-xs font-bold shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" /> Lihat Ukuran Penuh
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 items-center text-xs text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Mahasiswa belum mengunggah bukti gambar transfer pendaftaran.</span>
                </div>
              )}

              {/* Action and feedback input */}
              <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Catatan Konfirmasi (Jika Ditolak)
                  </label>
                  <textarea
                    value={catatan}
                    onChange={e => setCatatan(e.target.value)}
                    placeholder="Contoh: Nominal transfer kurang, harap lengkapi kekurangannya..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleUpdateStatus(selectedPembayaran, 'Lunas')}
                    className="flex-1 inline-flex justify-center items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all"
                  >
                    <Check className="w-4 h-4" /> Konfirmasi Lunas
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedPembayaran, 'Ditolak')}
                    className="flex-1 inline-flex justify-center items-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-all"
                  >
                    <X className="w-4 h-4" /> Tolak Bukti
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 gap-3">
              <CreditCard className="w-8 h-8 text-slate-300" />
              <div>
                <p className="font-semibold text-sm text-slate-600">Periksa Slip Bukti</p>
                <p className="text-xs text-slate-400 mt-1">Pilih salah satu baris pengajuan transfer untuk mulai memverifikasi slip pembayaran.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Overlay Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 flex flex-col gap-4 relative shadow-2xl">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-slate-900/60 text-white hover:bg-slate-900/80 p-2 rounded-full transition-colors z-10"
            >
              ✕
            </button>
            <div className="rounded-2xl overflow-hidden border border-slate-100 max-h-[70vh] flex items-center justify-center bg-slate-900">
              <img src={previewImage} alt="Payment Slip Preview" referrerPolicy="no-referrer" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="text-center text-xs text-slate-400">
              Bukti Slip Transfer Pembayaran
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
