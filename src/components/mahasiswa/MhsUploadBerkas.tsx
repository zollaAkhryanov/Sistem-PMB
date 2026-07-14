import React, { useEffect, useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, RefreshCw, Eye } from 'lucide-react';
import { Berkas } from '../../types';
import { dbService } from '../../services/dbService';
import { useAuth } from '../../context/AuthContext';

export const MhsUploadBerkas: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [berkas, setBerkas] = useState<Berkas | null>(null);

  // Form Base64 image holders
  const [foto, setFoto] = useState<string>('');
  const [ktp, setKtp] = useState<string>('');
  const [kk, setKk] = useState<string>('');
  const [ijazah, setIjazah] = useState<string>('');
  const [rapor, setRapor] = useState<string>('');

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchBerkas = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await dbService.getBerkasByUid(user.uid);
      if (data) {
        setBerkas(data);
        setFoto(data.foto || '');
        setKtp(data.ktp || '');
        setKk(data.kk || '');
        setIjazah(data.ijazah || '');
        setRapor(data.rapor || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBerkas();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSuccess(false);

    const record: Berkas = {
      uid: user.uid,
      foto: foto || undefined,
      ktp: ktp || undefined,
      kk: kk || undefined,
      ijazah: ijazah || undefined,
      rapor: rapor || undefined,
      status: 'Menunggu Verifikasi',
      catatan: '',
      updatedAt: new Date().toISOString()
    };

    await dbService.saveBerkas(record);
    setBerkas(record);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const getStatusBanner = () => {
    if (!berkas) return null;
    switch (berkas.status) {
      case 'Disetujui':
        return (
          <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold rounded-2xl flex items-start gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Berkas Anda Telah Disetujui!</p>
              <p className="text-emerald-600 font-normal mt-0.5">Seluruh persyaratan berkas sudah terverifikasi lengkap. Anda siap melaksanakan seleksi ujian masuk.</p>
            </div>
          </div>
        );
      case 'Ditolak':
        return (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 text-xs font-semibold rounded-2xl flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Beberapa Berkas Perlu Diperbaiki!</p>
              <p className="text-rose-600 font-normal mt-0.5">Catatan Admin: <span className="font-bold text-rose-800">{berkas.catatan}</span></p>
              <p className="text-rose-500 font-normal mt-1">Silakan unggah kembali berkas yang valid di bawah ini.</p>
            </div>
          </div>
        );
      case 'Menunggu Verifikasi':
        return (
          <div className="p-4 bg-amber-50 border border-amber-100 text-amber-800 text-xs font-semibold rounded-2xl flex items-start gap-2.5">
            <RefreshCw className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-spin" />
            <div>
              <p className="font-bold">Berkas Menunggu Verifikasi</p>
              <p className="text-amber-600 font-normal mt-0.5">Berkas Anda sedang dalam proses pemeriksaan oleh tim administrasi akademik.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse p-1">
        <div className="h-10 bg-slate-100 rounded w-48" />
        <div className="h-96 bg-slate-100 rounded-2xl border border-slate-200" />
      </div>
    );
  }

  const isEditable = !berkas || berkas.status !== 'Disetujui';

  return (
    <div className="flex flex-col gap-6 p-1">
      <div>
        <h3 className="text-xl font-bold text-slate-800">Unggah Berkas Persyaratan PMB</h3>
        <p className="text-xs text-slate-400 mt-0.5">Lengkapi dokumen attachment berformat gambar (PNG, JPG) di bawah ini.</p>
      </div>

      {getStatusBanner()}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-2xl">
        <form onSubmit={handleUploadSubmit} className="flex flex-col gap-6">
          {success && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl">
              ✓ Berkas pendaftaran berhasil disimpan dan diajukan ke admin!
            </div>
          )}

          {/* Form items */}
          {[
            { key: 'foto', label: 'Pas Foto Resmi (3x4 background merah/biru) *', value: foto, setter: setFoto },
            { key: 'ktp', label: 'Scan Kartu Tanda Penduduk (KTP) / Kartu Pelajar *', value: ktp, setter: setKtp },
            { key: 'kk', label: 'Scan Kartu Keluarga (KK) *', value: kk, setter: setKk },
            { key: 'ijazah', label: 'Scan Ijazah / Surat Keterangan Lulus (SKL) *', value: ijazah, setter: setIjazah },
            { key: 'rapor', label: 'Scan Nilai Rapor Terakhir / Rapor Kelas 12 *', value: rapor, setter: setRapor }
          ].map((item) => (
            <div key={item.key} className="flex flex-col gap-2 p-4 rounded-2xl border border-slate-50 bg-slate-50/50">
              <label className="text-xs font-bold text-slate-700">{item.label}</label>
              
              {item.value ? (
                <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{item.key}_attachment.jpg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewImage(item.value)}
                      className="p-1 px-2.5 text-xs text-indigo-600 font-semibold hover:bg-indigo-50 rounded"
                    >
                      Preview
                    </button>
                    {isEditable && (
                      <button
                        type="button"
                        onClick={() => item.setter('')}
                        className="p-1 px-2.5 text-xs text-rose-600 font-semibold hover:bg-rose-50 rounded"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                isEditable && (
                  <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-white rounded-2xl p-6 transition-all flex flex-col items-center justify-center gap-2 text-center">
                    <Upload className="w-8 h-8 text-slate-400" />
                    <div>
                      <p className="text-xs font-semibold text-slate-600">Pilih atau Seret Dokumen</p>
                      <p className="text-[10px] text-slate-400 mt-1">Maksimum ukuran file: 2MB (PNG, JPG)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, item.setter)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      required
                    />
                  </div>
                )
              )}
            </div>
          ))}

          {isEditable && (
            <button
              type="submit"
              className="w-full inline-flex justify-center items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
            >
              Simpan & Unggah Dokumen Pendukung
            </button>
          )}
        </form>
      </div>

      {/* Preview Overlay */}
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
          </div>
        </div>
      )}
    </div>
  );
};
