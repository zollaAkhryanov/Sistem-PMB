import { Gelombang, JalurPendaftaran, ProgramStudi } from '../types';

export const DEFAULT_GELOMBANG: Gelombang[] = [
  {
    id: 'gel-1',
    nama: 'Gelombang 1',
    tahun: '2026/2027',
    tanggal_mulai: '2026-01-01',
    tanggal_selesai: '2026-04-15',
    status: 'Tidak Aktif',
  },
  {
    id: 'gel-2',
    nama: 'Gelombang 2',
    tahun: '2026/2027',
    tanggal_mulai: '2026-04-16',
    tanggal_selesai: '2026-07-31',
    status: 'Aktif',
  },
  {
    id: 'gel-3',
    nama: 'Gelombang 3 (Sisa Kuota)',
    tahun: '2026/2027',
    tanggal_mulai: '2026-08-01',
    tanggal_selesai: '2026-09-15',
    status: 'Tidak Aktif',
  },
];

export const DEFAULT_JALUR: JalurPendaftaran[] = [
  {
    id: 'jalur-1',
    nama: 'Jalur Prestasi Akademik/Rapor',
    biaya: 150000,
    status: 'Aktif',
  },
  {
    id: 'jalur-2',
    nama: 'Jalur UTBK / Reguler',
    biaya: 250000,
    status: 'Aktif',
  },
  {
    id: 'jalur-3',
    nama: 'Jalur Beasiswa KIP-Kuliah',
    biaya: 0,
    status: 'Aktif',
  },
];

export const DEFAULT_PRODI: ProgramStudi[] = [
  {
    id: 'prodi-1',
    nama: 'S1 Teknik Informatika',
    jenjang: 'S1',
    kuota: 120,
    status: 'Aktif',
  },
  {
    id: 'prodi-2',
    nama: 'S1 Sistem Informasi',
    jenjang: 'S1',
    kuota: 80,
    status: 'Aktif',
  },
  {
    id: 'prodi-3',
    nama: 'S1 Desain Komunikasi Visual',
    jenjang: 'S1',
    kuota: 50,
    status: 'Aktif',
  },
  {
    id: 'prodi-4',
    nama: 'D3 Manajemen Informatika',
    jenjang: 'D3',
    kuota: 60,
    status: 'Aktif',
  },
];
