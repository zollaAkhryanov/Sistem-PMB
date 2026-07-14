import React, { useEffect, useState } from 'react';
import { Check, X, FileText, AlertCircle, RefreshCw, Eye, CornerDownRight } from 'lucide-react';
import { Berkas, UserProfile, Pendaftaran } from '../../types';
import { dbService } from '../../services/dbService';

export const VerifikasiBerkas: React.FC = () => {
  const [list, setList] = useState<Berkas[]>([]);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Record<string, { nama: string; prodi: string }>>({});
  const [selectedBerkas, setSelectedBerkas] = useState<Berkas | null>(null);
  const [catatan, setCatatan] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const berkasData = await dbService.getAllBerkas();
      const pendaftaranData = await dbService.getAllPendaftaran();

      // map student profiles for quick lookup
      const studentMap: Record<string, { nama: string; prodi: string }> = {};
      pendaftaranData.forEach(p => {
        studentMap[p.uid] = { nama: p.nama, prodi: p.program_studi };
      });

      setStudents(studentMap);
      setList(berkasData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (item: Berkas, newStatus: 'Disetujui' | 'Ditolak' | 'Menunggu Verifikasi') => {
    const updated: Berkas = {
      ...item,
      status: newStatus,
      catatan: newStatus === 'Ditolak' ? catatan : '',
      updatedAt: new Date().toISOString()
    };
    await dbService.saveBerkas(updated);
    setList(prev => prev.map(b => b.uid === item.uid ? updated : b));
    setSelectedBerkas(null);
    setCatatan('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Disetujui':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Disetujui</span>;
      case 'Menunggu Verifikasi':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">Menunggu Verifikasi</span>;
      case 'Ditolak':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200">Ditolak</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-50 text-slate-700 border border-slate-200">Belum Lengkap</span>;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Verifikasi Berkas Mahasiswa</h3>
          <p className="text-xs text-slate-400 mt-0.5">Verifikasi kelayakan berkas administratif yang diunggah calon mahasiswa.</p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table/List Grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="p-4 text-xs uppercase tracking-wider font-semibold">Calon Mahasiswa</th>
                  <th className="p-4 text-xs uppercase tracking-wider font-semibold">Kelengkapan Berkas</th>
                  <th className="p-4 text-xs uppercase tracking-wider font-semibold">Status</th>
                  <th className="p-4 text-xs uppercase tracking-wider font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  [1, 2, 3].map(n => (
                    <tr key={n} className="animate-pulse">
                      <td colSpan={4} className="p-6">
                        <div className="h-6 bg-slate-100 rounded w-full" />
                      </td>
                    </tr>
                  ))
                ) : list.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400 font-light">
                      Belum ada calon mahasiswa yang mengunggah berkas.
                    </td>
                  </tr>
                ) : (
                  list.map((item) => {
                    const student = students[item.uid] || { nama: 'Biodata Belum Diisi', prodi: '-' };
                    const docCount = [item.foto, item.ktp, item.kk, item.ijazah, item.rapor].filter(Boolean).length;
                    return (
                      <tr key={item.uid} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="font-semibold text-slate-800">{student.nama}</p>
                            <p className="text-xs text-indigo-600 mt-0.5">{student.prodi}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                            {docCount} dari 5 Berkas Diunggah
                          </span>
                        </td>
                        <td className="p-4">{getStatusBadge(item.status)}</td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedBerkas(item);
                              setCatatan(item.catatan || '');
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-medium rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> Periksa
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

        {/* Action Panel for selected document bundle */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-5 h-fit">
          {selectedBerkas ? (
            <div className="flex flex-col gap-5 animate-in fade-in duration-200">
              <div>
                <h4 className="font-bold text-slate-800 text-base">Verifikasi Berkas Mahasiswa</h4>
                <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                  {students[selectedBerkas.uid]?.nama || 'Mahasiswa'}
                </p>
              </div>

              {/* List of Files with eye preview buttons */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Daftar Attachment</span>
                
                {[
                  { key: 'foto', label: 'Pas Foto Resmi (3x4)', url: selectedBerkas.foto },
                  { key: 'ktp', label: 'Kartu Tanda Penduduk (KTP)', url: selectedBerkas.ktp },
                  { key: 'kk', label: 'Kartu Keluarga (KK)', url: selectedBerkas.kk },
                  { key: 'ijazah', label: 'Ijazah SMA/SMK/MA', url: selectedBerkas.ijazah },
                  { key: 'rapor', label: 'Rapor Terakhir / SKL', url: selectedBerkas.rapor }
                ].map((docItem) => (
                  <div key={docItem.key} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <FileText className={`w-4 h-4 ${docItem.url ? 'text-indigo-600' : 'text-slate-300'}`} />
                      <span className="text-xs font-medium text-slate-700">{docItem.label}</span>
                    </div>
                    {docItem.url ? (
                      <button
                        onClick={() => setPreviewImage(docItem.url || null)}
                        className="p-1 text-xs text-indigo-600 font-semibold hover:bg-indigo-50 rounded"
                      >
                        Preview
                      </button>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400">Belum diunggah</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Status and reject reason input */}
              <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Catatan / Alasan Penolakan (Jika Berkas Ditolak)
                  </label>
                  <textarea
                    value={catatan}
                    onChange={e => setCatatan(e.target.value)}
                    placeholder="Contoh: KTP buram, harap unggah kembali scan KTP yang lebih jelas..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleUpdateStatus(selectedBerkas, 'Disetujui')}
                    className="flex-1 inline-flex justify-center items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all"
                  >
                    <Check className="w-4 h-4" /> Setujui Semua
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedBerkas, 'Ditolak')}
                    className="flex-1 inline-flex justify-center items-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-all"
                  >
                    <X className="w-4 h-4" /> Tolak Berkas
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 gap-3">
              <AlertCircle className="w-8 h-8 text-slate-300" />
              <div>
                <p className="font-semibold text-sm text-slate-600">Periksa Berkas</p>
                <p className="text-xs text-slate-400 mt-1">Pilih salah satu baris calon mahasiswa untuk mulai memverifikasi file attachment.</p>
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
              <img src={previewImage} alt="Document Attachment Preview" referrerPolicy="no-referrer" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="text-center text-xs text-slate-400">
              File Attachment Preview
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
