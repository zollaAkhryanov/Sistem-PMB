import React, { useEffect, useState } from 'react';
import { CreditCard, CheckCircle, AlertCircle, RefreshCw, Landmark, Upload } from 'lucide-react';
import { Pembayaran, Pendaftaran, JalurPendaftaran } from '../../types';
import { dbService } from '../../services/dbService';
import { useAuth } from '../../context/AuthContext';

export const MhsPembayaran: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  // States
  const [pendaftaran, setPendaftaran] = useState<Pendaftaran | null>(null);
  const [pembayaran, setPembayaran] = useState<Pembayaran | null>(null);
  const [jalurDetail, setJalurDetail] = useState<JalurPendaftaran | null>(null);

  // Form states
  const [bukti, setBukti] = useState<string>('');
  const [nominal, setNominal] = useState<number>(150000);
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split('T')[0]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const p = await dbService.getPendaftaranByUid(user.uid);
      const pay = await dbService.getPembayaranByUid(user.uid);
      const jl = await dbService.getJalur();

      setPendaftaran(p);
      setPembayaran(pay);

      if (p) {
        const foundJalur = jl.find(j => j.nama === p.jalur);
        if (foundJalur) {
          setJalurDetail(foundJalur);
          setNominal(foundJalur.biaya);
        }
      }

      if (pay) {
        setBukti(pay.bukti || '');
        setNominal(pay.nominal);
        setTanggal(pay.tanggal);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setBukti(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSuccess(false);

    if (!bukti) {
      alert("Harap unggah bukti transfer pendaftaran!");
      return;
    }

    const record: Pembayaran = {
      id: pembayaran?.id || 'pay-' + Math.random().toString(36).substr(2, 9),
      uid: user.uid,
      namaMahasiswa: user.nama,
      nominal: Number(nominal),
      tanggal,
      bukti,
      status: 'Menunggu Verifikasi',
      catatan: '',
      updatedAt: new Date().toISOString()
    };

    await dbService.savePembayaran(record);
    setPembayaran(record);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const getStatusBanner = () => {
    if (!pembayaran) return null;
    switch (pembayaran.status) {
      case 'Lunas':
        return (
          <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold rounded-2xl flex items-start gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Pembayaran Lunas & Terverifikasi!</p>
              <p className="text-emerald-600 font-normal mt-0.5">Biaya pendaftaran Anda sudah lunas. Anda sekarang sudah berhak mengikuti tahapan seleksi masuk berikutnya.</p>
            </div>
          </div>
        );
      case 'Ditolak':
        return (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 text-xs font-semibold rounded-2xl flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Bukti Pembayaran Ditolak!</p>
              <p className="text-rose-600 font-normal mt-0.5">Catatan Admin: <span className="font-bold text-rose-800">{pembayaran.catatan}</span></p>
              <p className="text-rose-500 font-normal mt-1">Harap upload kembali slip bukti transfer bank yang valid.</p>
            </div>
          </div>
        );
      case 'Menunggu Verifikasi':
        return (
          <div className="p-4 bg-amber-50 border border-amber-100 text-amber-800 text-xs font-semibold rounded-2xl flex items-start gap-2.5">
            <RefreshCw className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-spin" />
            <div>
              <p className="font-bold">Menunggu Konfirmasi Pembayaran</p>
              <p className="text-amber-600 font-normal mt-0.5">Bukti transfer Anda sedang dalam tahap verifikasi keabsahan dana oleh admin.</p>
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

  const isEditable = !pembayaran || pembayaran.status !== 'Lunas';

  return (
    <div className="flex flex-col gap-6 p-1">
      <div>
        <h3 className="text-xl font-bold text-slate-800">Laporan Pembayaran Pendaftaran</h3>
        <p className="text-xs text-slate-400 mt-0.5">Kirimkan rincian bukti transfer pelunasan biaya registrasi masuk kampus.</p>
      </div>

      {getStatusBanner()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Billing details */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-5 h-fit">
          <div>
            <h4 className="font-bold text-slate-800 text-base">Rincian Tagihan Anda</h4>
            <p className="text-xs text-slate-400 mt-0.5">Kewajiban tagihan biaya pendaftaran PMB</p>
          </div>

          {pendaftaran ? (
            <div className="flex flex-col gap-4">
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Jalur Masuk Terpilih</span>
                <span className="text-sm font-semibold text-indigo-700 mt-0.5 block">{pendaftaran.jalur}</span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-600 font-medium">Biaya Pendaftaran</span>
                <span className="text-sm font-bold text-slate-800 font-mono">{formatRupiah(nominal)}</span>
              </div>

              <div className="flex flex-col gap-2.5 p-4 rounded-xl border border-slate-100 text-xs text-slate-600 font-medium bg-slate-50">
                <span className="font-bold text-slate-700 block">Metode Transfer Bank:</span>
                <div className="flex justify-between items-center">
                  <span>Bank Mandiri:</span>
                  <span className="font-bold font-mono">137-00-1234567-8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Atas Nama:</span>
                  <span className="font-semibold text-slate-800">PMB Nusa Mandiri</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl">
              ⚠️ Silakan isi dan ajukan formulir biodata pendaftaran Anda terlebih dahulu agar nominal tagihan muncul.
            </div>
          )}
        </div>

        {/* Form panel */}
        {pendaftaran && (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {success && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl">
                  ✓ Laporan bukti transfer berhasil terkirim dan siap direview!
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Tanggal Pengiriman Dana *</label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={e => setTanggal(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                    disabled={!isEditable}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nominal Dana Transfer *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-slate-400 font-bold text-sm">Rp</span>
                    <input
                      type="number"
                      value={nominal}
                      onChange={e => setNominal(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-mono"
                      disabled={true} // Locked to pathway cost
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Upload image receipt slip */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Unggah Gambar Bukti Transfer (Slip) *</label>
                {bukti ? (
                  <div className="flex flex-col gap-3">
                    <div className="rounded-2xl border border-slate-100 overflow-hidden h-48 bg-slate-50 flex items-center justify-center">
                      <img src={bukti} alt="Uploaded Slip Preview" className="max-w-full max-h-full object-contain" />
                    </div>
                    {isEditable && (
                      <button
                        type="button"
                        onClick={() => setBukti('')}
                        className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 self-start"
                      >
                        Hapus Gambar
                      </button>
                    )}
                  </div>
                ) : (
                  isEditable && (
                    <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 rounded-2xl p-8 transition-all flex flex-col items-center justify-center gap-2 text-center cursor-pointer">
                      <Upload className="w-8 h-8 text-slate-400" />
                      <div>
                        <p className="text-xs font-semibold text-slate-600">Klik Untuk Unggah Slip Pembayaran</p>
                        <p className="text-[10px] text-slate-400 mt-1">Harus berupa gambar format JPG atau PNG (Maks 2MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        required
                      />
                    </div>
                  )
                )}
              </div>

              {isEditable && (
                <button
                  type="submit"
                  className="w-full inline-flex justify-center items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors mt-2"
                >
                  <CreditCard className="w-4 h-4" /> Lapor Pembayaran
                </button>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
