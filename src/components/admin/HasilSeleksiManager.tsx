import React, { useEffect, useState } from 'react';
import { Award, CheckCircle, XCircle, Clock, RefreshCw, PenTool } from 'lucide-react';
import { HasilSeleksi, Pendaftaran } from '../../types';
import { dbService } from '../../services/dbService';

export const HasilSeleksiManager: React.FC = () => {
  const [list, setList] = useState<Pendaftaran[]>([]);
  const [hasilMap, setHasilMap] = useState<Record<string, HasilSeleksi>>({});
  const [loading, setLoading] = useState(true);
  const [selectedMhs, setSelectedMhs] = useState<Pendaftaran | null>(null);

  // Form states
  const [noUjian, setNoUjian] = useState('');
  const [nilaiSeleksi, setNilaiSeleksi] = useState(80);
  const [status, setStatus] = useState<'Menunggu' | 'Lolos' | 'Tidak Lolos'>('Lolos');
  const [keterangan, setKeterangan] = useState('Selamat, Anda dinyatakan lulus seleksi masuk program studi pilihan pertama.');

  const fetchData = async () => {
    setLoading(true);
    try {
      const pendaftar = await dbService.getAllPendaftaran();
      const hasilList = await dbService.getAllHasilSeleksi();

      const map: Record<string, HasilSeleksi> = {};
      hasilList.forEach(h => {
        map[h.uid] = h;
      });

      setHasilMap(map);
      setList(pendaftar);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (mhs: Pendaftaran) => {
    const existing = hasilMap[mhs.uid];
    setSelectedMhs(mhs);
    if (existing) {
      setNoUjian(existing.noUjian || 'PMB-' + Math.floor(1000 + Math.random() * 9000));
      setNilaiSeleksi(existing.nilaiSeleksi || 80);
      setStatus(existing.status);
      setKeterangan(existing.keterangan);
    } else {
      setNoUjian('PMB-' + Math.floor(1000 + Math.random() * 9000));
      setNilaiSeleksi(80);
      setStatus('Lolos');
      setKeterangan('Selamat! Anda dinyatakan LULUS seleksi ujian masuk.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMhs) return;

    const record: HasilSeleksi = {
      uid: selectedMhs.uid,
      namaMahasiswa: selectedMhs.nama,
      status,
      keterangan,
      noUjian,
      nilaiSeleksi: Number(nilaiSeleksi),
      updatedAt: new Date().toISOString()
    };

    await dbService.saveHasilSeleksi(record);
    setHasilMap(prev => ({ ...prev, [selectedMhs.uid]: record }));
    setSelectedMhs(null);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'Lolos':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Lolos</span>;
      case 'Tidak Lolos':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200">Tidak Lolos</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">Menunggu Ujian</span>;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Manajemen Hasil Kelulusan Seleksi</h3>
          <p className="text-xs text-slate-400 mt-0.5">Input kartu ujian, skor hasil tes, dan publikasikan kelulusan seleksi PMB.</p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                <th className="p-4 text-xs uppercase tracking-wider font-semibold">Nama Mahasiswa</th>
                <th className="p-4 text-xs uppercase tracking-wider font-semibold">Jurusan Pilihan</th>
                <th className="p-4 text-xs uppercase tracking-wider font-semibold">No Ujian / Skor</th>
                <th className="p-4 text-xs uppercase tracking-wider font-semibold">Hasil Seleksi</th>
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
                    Belum ada calon mahasiswa yang mendaftar.
                  </td>
                </tr>
              ) : (
                list.map((item) => {
                  const hasil = hasilMap[item.uid];
                  return (
                    <tr key={item.uid} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-semibold text-slate-800">{item.nama}</td>
                      <td className="p-4 text-slate-600">{item.program_studi}</td>
                      <td className="p-4 text-xs text-slate-500 font-mono">
                        {hasil ? (
                          <div>
                            <p className="font-semibold text-slate-700">Card: {hasil.noUjian}</p>
                            <p className="mt-0.5">Nilai: <span className="text-indigo-600 font-bold">{hasil.nilaiSeleksi}</span></p>
                          </div>
                        ) : (
                          <span className="text-slate-400">Belum diinput</span>
                        )}
                      </td>
                      <td className="p-4">{getStatusBadge(hasil?.status)}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-lg transition-colors"
                        >
                          <PenTool className="w-3.5 h-3.5" /> Atur Hasil
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Result Configuration Modal */}
      {selectedMhs && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-5 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedMhs(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-50 transition-colors"
            >
              ✕
            </button>

            <div>
              <h4 className="font-bold text-slate-800 text-lg">Konfigurasi Kelulusan Seleksi</h4>
              <p className="text-xs text-slate-400 mt-0.5">Input nilai dan kartu ujian untuk: <span className="font-semibold text-indigo-600">{selectedMhs.nama}</span></p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">No. Kartu Ujian *</label>
                  <input
                    type="text"
                    value={noUjian}
                    onChange={e => setNoUjian(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Skor Ujian Masuk *</label>
                  <input
                    type="number"
                    value={nilaiSeleksi}
                    onChange={e => setNilaiSeleksi(Number(e.target.value))}
                    min={0}
                    max={100}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Status Akhir Seleksi</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                >
                  <option value="Menunggu">Menunggu / Sedang Ujian</option>
                  <option value="Lolos">Lolos / Diterima</option>
                  <option value="Tidak Lolos">Tidak Lolos / Ditolak</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Keterangan Tambahan / Surat Pengantar</label>
                <textarea
                  value={keterangan}
                  onChange={e => setKeterangan(e.target.value)}
                  rows={4}
                  placeholder="Isi rincian penawaran, program beasiswa, atau rincian daftar ulang..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-sm transition-colors"
              >
                Simpan & Publikasikan Hasil
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
