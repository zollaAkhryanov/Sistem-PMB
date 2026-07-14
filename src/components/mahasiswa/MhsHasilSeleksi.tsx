import React, { useEffect, useState } from 'react';
import { Award, Clock, XCircle, RefreshCw, FileText, CheckCircle } from 'lucide-react';
import { HasilSeleksi, Pendaftaran } from '../../types';
import { dbService } from '../../services/dbService';
import { useAuth } from '../../context/AuthContext';

export const MhsHasilSeleksi: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hasil, setHasil] = useState<HasilSeleksi | null>(null);
  const [pendaftaran, setPendaftaran] = useState<Pendaftaran | null>(null);

  useEffect(() => {
    const loadHasil = async () => {
      if (!user) return;
      try {
        const h = await dbService.getHasilSeleksiByUid(user.uid);
        const p = await dbService.getPendaftaranByUid(user.uid);
        setHasil(h);
        setPendaftaran(p);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadHasil();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse p-1">
        <div className="h-10 bg-slate-100 rounded w-48" />
        <div className="h-96 bg-slate-100 rounded-2xl border border-slate-200" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-1">
      <div>
        <h3 className="text-xl font-bold text-slate-800">Hasil Pengumuman Seleksi PMB</h3>
        <p className="text-xs text-slate-400 mt-0.5">Pantau hasil seleksi kelulusan dan rincian surat ketetapan pendaftaran Anda di sini.</p>
      </div>

      {!hasil || hasil.status === 'Menunggu' ? (
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center gap-4 max-w-xl py-12">
          <Clock className="w-12 h-12 text-slate-300 animate-pulse" />
          <div>
            <h4 className="font-bold text-slate-800 text-base">Hasil Seleksi Masih Diproses</h4>
            <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
              Tim akademik sedang melakukan kalkulasi nilai dan memproses berkas Anda. Pengumuman kelulusan akan diterbitkan secara serentak. Harap periksa secara berkala.
            </p>
          </div>
        </div>
      ) : hasil.status === 'Lolos' ? (
        <div className="flex flex-col gap-6 max-w-2xl">
          {/* Success card banner */}
          <div className="bg-emerald-600 text-white p-6 rounded-3xl flex items-start gap-4 shadow-md border border-emerald-700 animate-in fade-in duration-300">
            <Award className="w-10 h-10 text-emerald-200 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-lg">Selamat! Anda Dinyatakan LULUS</h4>
              <p className="text-emerald-100 text-xs leading-relaxed mt-1 max-w-lg font-light">
                Dengan penuh sukacita, Anda dinyatakan **Lolos** seleksi penerimaan mahasiswa baru di program studi **{pendaftaran?.program_studi}**.
              </p>
            </div>
          </div>

          {/* Official Letter Styles */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col gap-6">
            <div className="text-center border-b border-slate-100 pb-5">
              <h5 className="font-bold text-slate-800 text-base uppercase">Surat Keputusan Kelulusan Seleksi</h5>
              <p className="text-[10px] text-slate-400 font-mono mt-1">NO: SK-{user?.uid.substring(0, 5).toUpperCase()}/PMB-NM/2026</p>
            </div>

            <div className="flex flex-col gap-4 text-sm text-slate-600 font-light leading-relaxed">
              <p>Berdasarkan keputusan hasil rapat kelayakan tim seleksi Panitia Penerimaan Mahasiswa Baru Universitas Nusa Mandiri Tahun Akademik 2026/2027, menyatakan bahwa:</p>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 font-medium text-slate-800 flex flex-col gap-1.5 text-xs">
                <div className="grid grid-cols-3">
                  <span className="text-slate-400">Nama Calon</span>
                  <span className="col-span-2">: {user?.nama}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-400">ID Registrasi</span>
                  <span className="col-span-2 font-mono">: {hasil.noUjian}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-400">Program Studi</span>
                  <span className="col-span-2 text-indigo-600">: {pendaftaran?.program_studi}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-400">Skor Kelayakan</span>
                  <span className="col-span-2 font-bold text-emerald-600">: {hasil.nilaiSeleksi} / 100</span>
                </div>
              </div>

              <p className="text-xs">{hasil.keterangan}</p>
              <p className="text-xs">Silakan lanjutkan ke langkah berikutnya untuk melunasi biaya daftar ulang, melengkapi syarat dokumen, dan mengambil Nomor Induk Mahasiswa (NIM).</p>
            </div>

            <div className="border-t border-slate-50 pt-5 flex justify-end text-xs text-slate-400 font-light italic">
              <span>Panitia Akademik PMB Universitas Nusa Mandiri</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-rose-50 border border-rose-100 flex flex-col items-center justify-center text-center gap-4 max-w-xl py-12">
          <XCircle className="w-12 h-12 text-rose-500" />
          <div>
            <h4 className="font-bold text-slate-800 text-base">Mohon Maaf, Anda Belum Lolos Seleksi</h4>
            <p className="text-xs text-rose-600 font-normal mt-2 leading-relaxed max-w-md">
              Nilai atau syarat berkas Anda belum dapat memenuhi kuota program studi yang diajukan pada gelombang ini. Kami sangat mengapresiasi upaya dan dedikasi Anda. Jangan patah semangat, Anda dapat mengajukan kembali pendaftaran pada program studi lain atau gelombang berikutnya.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
