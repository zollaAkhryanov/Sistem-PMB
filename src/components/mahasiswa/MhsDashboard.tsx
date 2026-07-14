import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  CreditCard, 
  UploadCloud, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  XCircle,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Pendaftaran, Berkas, Pembayaran, HasilSeleksi } from '../../types';
import { dbService } from '../../services/dbService';
import { useAuth } from '../../context/AuthContext';

interface MhsDashboardProps {
  onNavigate: (tab: string) => void;
}

export const MhsDashboard: React.FC<MhsDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pendaftaran, setPendaftaran] = useState<Pendaftaran | null>(null);
  const [berkas, setBerkas] = useState<Berkas | null>(null);
  const [pembayaran, setPembayaran] = useState<Pembayaran | null>(null);
  const [hasil, setHasil] = useState<HasilSeleksi | null>(null);

  useEffect(() => {
    const loadStudentData = async () => {
      if (!user) return;
      try {
        const p = await dbService.getPendaftaranByUid(user.uid);
        const b = await dbService.getBerkasByUid(user.uid);
        const pay = await dbService.getPembayaranByUid(user.uid);
        const h = await dbService.getHasilSeleksiByUid(user.uid);

        setPendaftaran(p);
        setBerkas(b);
        setPembayaran(pay);
        setHasil(h);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStudentData();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-1">
        <div className="h-32 bg-slate-100 rounded-2xl" />
        <div className="h-96 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  // Determine current timeline status
  const isBioCompleted = !!pendaftaran && pendaftaran.status !== 'Draft';
  const isPayCompleted = !!pembayaran && pembayaran.status === 'Lunas';
  const isDocCompleted = !!berkas && berkas.status === 'Disetujui';
  const isSelected = !!hasil && hasil.status === 'Lolos';

  return (
    <div className="flex flex-col gap-8 p-1">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-8 rounded-2xl shadow-md border border-indigo-950 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase bg-indigo-500/30 px-2.5 py-1 rounded-md text-indigo-200">Portal Calon Mahasiswa Baru</span>
          <h2 className="text-2xl font-bold mt-2.5">Selamat Datang, {user?.nama}!</h2>
          <p className="text-indigo-200 text-sm mt-1 max-w-xl font-light">
            Selesaikan pengisian biodata, unggah berkas, lapor pembayaran, dan pantau pengumuman seleksi Anda langsung dari dashboard ini.
          </p>
        </div>
        {pendaftaran ? (
          <div className="bg-white/10 backdrop-blur-md border border-white/15 px-5 py-4 rounded-xl shrink-0">
            <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block">Program Studi Pilihan</span>
            <span className="text-base font-bold block mt-0.5">{pendaftaran.program_studi}</span>
            <span className="text-xs text-indigo-200 mt-1 block">{pendaftaran.jalur}</span>
          </div>
        ) : (
          <button
            onClick={() => onNavigate('biodata')}
            className="inline-flex items-center gap-2 px-5 py-3 bg-white text-indigo-950 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-colors shrink-0"
          >
            Mulai Pendaftaran <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Grid: timeline flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step Timeline */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-6">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Alur Tahapan PMB Anda</h3>
            <p className="text-xs text-slate-400 mt-0.5">Selesaikan seluruh langkah berikut untuk menjadi mahasiswa resmi.</p>
          </div>

          <div className="flex flex-col gap-5">
            {/* Step 1: Biodata */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border text-sm font-semibold ${
                  isBioCompleted 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                    : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                }`}>
                  {isBioCompleted ? <CheckCircle2 className="w-5 h-5" /> : '1'}
                </div>
                <div className="w-0.5 h-12 bg-slate-100" />
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-sm">Biodata & Pilihan Jurusan</h4>
                  <span className="text-xs font-semibold">
                    {pendaftaran ? (
                      pendaftaran.status === 'Draft' ? 'Draft' : 'Selesai'
                    ) : 'Belum Diisi'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Isi data diri lengkap, NIK, NISN, asal sekolah, dan pilih jurusan.</p>
                {!isBioCompleted && (
                  <button onClick={() => onNavigate('biodata')} className="inline-flex items-center gap-1 text-xs text-indigo-600 font-bold mt-2 hover:underline">
                    Isi Biodata Sekarang <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Step 2: Pembayaran */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border text-sm font-semibold ${
                  isPayCompleted 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}>
                  {isPayCompleted ? <CheckCircle2 className="w-5 h-5" /> : '2'}
                </div>
                <div className="w-0.5 h-12 bg-slate-100" />
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-sm">Pembayaran Biaya Pendaftaran</h4>
                  <span className="text-xs font-semibold">
                    {pembayaran ? pembayaran.status : 'Belum Bayar'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Unggah bukti transfer untuk mengaktifkan kartu ujian masuk Anda.</p>
                {!isPayCompleted && isBioCompleted && (
                  <button onClick={() => onNavigate('pembayaran')} className="inline-flex items-center gap-1 text-xs text-indigo-600 font-bold mt-2 hover:underline">
                    Upload Bukti Bayar <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Step 3: Berkas */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border text-sm font-semibold ${
                  isDocCompleted 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}>
                  {isDocCompleted ? <CheckCircle2 className="w-5 h-5" /> : '3'}
                </div>
                <div className="w-0.5 h-12 bg-slate-100" />
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-sm">Unggah Berkas Pendukung</h4>
                  <span className="text-xs font-semibold">
                    {berkas ? berkas.status : 'Belum Upload'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Unggah scan KTP, KK, Pas Foto, Rapor, dan Ijazah kelulusan sekolah.</p>
                {!isDocCompleted && isPayCompleted && (
                  <button onClick={() => onNavigate('upload_berkas')} className="inline-flex items-center gap-1 text-xs text-indigo-600 font-bold mt-2 hover:underline">
                    Upload Berkas Pendukung <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Step 4: Seleksi */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border text-sm font-semibold ${
                  isSelected 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}>
                  {isSelected ? <CheckCircle2 className="w-5 h-5" /> : '4'}
                </div>
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-sm">Hasil Ujian & Kelulusan Seleksi</h4>
                  <span className="text-xs font-semibold">
                    {hasil ? hasil.status : 'Menunggu'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Ujian online diselenggarakan setelah berkas & pembayaran lengkap terverifikasi.</p>
                {hasil && (
                  <button onClick={() => onNavigate('hasil_seleksi')} className="inline-flex items-center gap-1 text-xs text-indigo-600 font-bold mt-2 hover:underline">
                    Lihat Surat Pengumuman <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info panel / shortcuts */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-6 h-fit">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Status Kelayakan</h3>
            <p className="text-xs text-slate-400 mt-0.5">Syarat mengikuti ujian tertulis online</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-600 font-medium">Validasi Biodata</span>
              {isBioCompleted ? (
                <span className="text-xs font-bold text-emerald-600">Terpenuhi</span>
              ) : (
                <span className="text-xs font-bold text-amber-600">Pending</span>
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-600 font-medium">Lunas Pendaftaran</span>
              {isPayCompleted ? (
                <span className="text-xs font-bold text-emerald-600">Terpenuhi</span>
              ) : (
                <span className="text-xs font-bold text-amber-600">Pending</span>
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-600 font-medium">Verifikasi Berkas</span>
              {isDocCompleted ? (
                <span className="text-xs font-bold text-emerald-600">Terpenuhi</span>
              ) : (
                <span className="text-xs font-bold text-amber-600">Pending</span>
              )}
            </div>
          </div>

          {isBioCompleted && isPayCompleted && (
            <div className="mt-2 pt-4 border-t border-slate-50">
              <button
                onClick={() => onNavigate('kartu_ujian')}
                className="w-full inline-flex justify-center items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                Cetak Kartu Peserta Ujian
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
