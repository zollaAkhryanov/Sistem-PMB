import React, { useEffect, useState } from 'react';
import { Download, Award, AlertTriangle, Calendar, User, LayoutGrid, CheckCircle } from 'lucide-react';
import { HasilSeleksi, Pendaftaran, Pembayaran } from '../../types';
import { dbService } from '../../services/dbService';
import { useAuth } from '../../context/AuthContext';

export const MhsKartuUjian: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pendaftaran, setPendaftaran] = useState<Pendaftaran | null>(null);
  const [pembayaran, setPembayaran] = useState<Pembayaran | null>(null);
  const [hasil, setHasil] = useState<HasilSeleksi | null>(null);

  useEffect(() => {
    const loadCardData = async () => {
      if (!user) return;
      try {
        const p = await dbService.getPendaftaranByUid(user.uid);
        const pay = await dbService.getPembayaranByUid(user.uid);
        const h = await dbService.getHasilSeleksiByUid(user.uid);

        setPendaftaran(p);
        setPembayaran(pay);
        setHasil(h);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCardData();
  }, [user]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse p-1">
        <div className="h-10 bg-slate-100 rounded w-48" />
        <div className="h-96 bg-slate-100 rounded-2xl border border-slate-200" />
      </div>
    );
  }

  const isPaid = !!pembayaran && pembayaran.status === 'Lunas';

  return (
    <div className="flex flex-col gap-6 p-1">
      <div>
        <h3 className="text-xl font-bold text-slate-800">Kartu Peserta Ujian PMB</h3>
        <p className="text-xs text-slate-400 mt-0.5">Cetak kartu ujian masuk resmi Anda untuk ditunjukkan saat pelaksanaan tes seleksi tertulis online.</p>
      </div>

      {!isPaid ? (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-3 items-start text-amber-800">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <p className="font-bold text-sm">Kartu Ujian Belum Terbit!</p>
              <p className="text-xs text-amber-600 font-normal mt-0.5">Kartu ujian baru dapat diterbitkan dan dicetak setelah pembayaran biaya pendaftaran pendaftaran Anda dikonfirmasi **Lunas** oleh admin.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 max-w-xl">
          {/* Card to Print */}
          <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-8 flex flex-col gap-6 relative overflow-hidden shadow-xl" id="printable-exam-card">
            {/* watermark circle background */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-indigo-500/10 blur-xl" />

            <div className="flex justify-between items-center border-b border-slate-800 pb-5">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Kartu Ujian Masuk</span>
                <span className="text-lg font-bold block mt-0.5">PMB Universitas Nusa Mandiri</span>
                <span className="text-[10px] text-slate-400 block font-mono font-normal mt-0.5">Tahun Akademik 2026/2027</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg font-sans">NM</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
              <div className="flex flex-col gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">No. Peserta Ujian</span>
                  <span className="text-base font-bold font-mono text-indigo-300 mt-0.5 block">{hasil?.noUjian || 'PMB-' + Math.floor(1000 + Math.random() * 9000)}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Nama Lengkap</span>
                  <span className="font-semibold text-slate-200 mt-0.5 block">{user?.nama}</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Program Studi</span>
                  <span className="font-semibold text-slate-200 mt-0.5 block">{pendaftaran?.program_studi}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80">
                <div>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Jalur Seleksi</span>
                  <span className="font-semibold text-slate-200 mt-0.5 block text-xs">{pendaftaran?.jalur}</span>
                </div>

                <div>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Metode Ujian</span>
                  <span className="font-semibold text-emerald-400 mt-0.5 block text-xs">Computer Assisted Test (CAT Online)</span>
                </div>

                <div>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Status Kartu</span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold mt-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Valid & Siap Ujian
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-5 flex items-center justify-between text-xs text-slate-400 font-light">
              <span>* Harap tunjukkan kartu ini saat ujian CAT online.</span>
              <span className="font-mono font-normal">BARCODE: {user?.uid.substring(0, 8).toUpperCase()}</span>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex justify-center items-center gap-2 px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" /> Cetak Kartu Peserta Ujian
          </button>
        </div>
      )}
    </div>
  );
};
