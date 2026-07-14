import React, { useEffect, useState } from 'react';
import { Settings, Save, MapPin, Mail, School } from 'lucide-react';
import { SystemConfig } from '../../types';
import { dbService } from '../../services/dbService';

export const PengaturanSistem: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  
  // Form states
  const [namaKampus, setNamaKampus] = useState('');
  const [alamat, setAlamat] = useState('');
  const [kontak, setKontak] = useState('');
  const [deskripsi, setDeskripsi] = useState('');

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await dbService.getConfig();
        setNamaKampus(config.namaKampus);
        setAlamat(config.alamat || '');
        setKontak(config.kontak || '');
        setDeskripsi(config.deskripsi || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    
    const updated: SystemConfig = {
      namaKampus,
      alamat,
      kontak,
      deskripsi
    };

    await dbService.updateConfig(updated);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-10 bg-slate-100 rounded w-48" />
        <div className="h-96 bg-slate-100 rounded-2xl border border-slate-200" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-1">
      <div>
        <h3 className="text-xl font-bold text-slate-800">Pengaturan Sistem PMB</h3>
        <p className="text-xs text-slate-400 mt-0.5">Kelola identitas institusi kampus, deskripsi pendaftaran, dan informasi kontak.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {success && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl animate-in fade-in duration-200">
              ✓ Pengaturan sistem berhasil disimpan dan diperbarui!
            </div>
          )}

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <School className="w-4 h-4 text-slate-400" /> Nama Institusi Kampus *
            </label>
            <input
              type="text"
              value={namaKampus}
              onChange={e => setNamaKampus(e.target.value)}
              placeholder="Contoh: Universitas Nusa Mandiri"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <MapPin className="w-4 h-4 text-slate-400" /> Alamat Kampus
            </label>
            <input
              type="text"
              value={alamat}
              onChange={e => setAlamat(e.target.value)}
              placeholder="Contoh: Jl. Raya Margonda No. 54..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <Mail className="w-4 h-4 text-slate-400" /> Informasi Kontak (Email/Telp)
            </label>
            <input
              type="text"
              value={kontak}
              onChange={e => setKontak(e.target.value)}
              placeholder="Contoh: info@kampus.ac.id | (021) 123456"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <Settings className="w-4 h-4 text-slate-400" /> Deskripsi Penerimaan Mahasiswa Baru
            </label>
            <textarea
              value={deskripsi}
              onChange={e => setDeskripsi(e.target.value)}
              rows={4}
              placeholder="Tulis deskripsi visi misi atau petunjuk umum PMB..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="inline-flex justify-center items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors mt-2"
          >
            <Save className="w-4 h-4" /> Simpan Konfigurasi
          </button>
        </form>
      </div>
    </div>
  );
};
