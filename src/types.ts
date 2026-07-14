export type UserRole = 'admin' | 'mahasiswa';

export interface UserProfile {
  uid: string;
  nama: string;
  email: string;
  role: UserRole;
  photoURL?: string;
  createdAt: any; // Firestore Timestamp
}

export interface Gelombang {
  id: string;
  nama: string;
  tahun: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status: 'Aktif' | 'Tidak Aktif';
}

export interface JalurPendaftaran {
  id: string;
  nama: string;
  biaya: number;
  status: 'Aktif' | 'Tidak Aktif';
}

export interface ProgramStudi {
  id: string;
  nama: string;
  jenjang: 'D3' | 'S1' | 'S2';
  kuota: number;
  status: 'Aktif' | 'Tidak Aktif';
}

export interface Pendaftaran {
  id: string; // usually equals uid for 1-to-1 main records
  uid: string;
  nama: string;
  nik: string;
  nisn: string;
  asal_sekolah: string;
  program_studi: string; // Nama / ID prodi
  jalur: string; // Nama / ID jalur
  gelombang: string; // Nama / ID gelombang
  status: 'Draft' | 'Menunggu Verifikasi' | 'Terverifikasi' | 'Ditolak';
  createdAt: any;
}

export interface Berkas {
  uid: string;
  foto?: string; // URL
  ktp?: string;  // URL
  kk?: string;   // URL
  ijazah?: string; // URL
  rapor?: string;  // URL
  status: 'Belum Lengkap' | 'Menunggu Verifikasi' | 'Disetujui' | 'Ditolak';
  catatan?: string;
  updatedAt?: any;
}

export interface Pembayaran {
  id: string;
  uid: string;
  namaMahasiswa: string;
  nominal: number;
  tanggal: string;
  bukti?: string; // URL or Base64
  status: 'Belum Bayar' | 'Menunggu Verifikasi' | 'Lunas' | 'Ditolak';
  catatan?: string;
  updatedAt?: any;
}

export interface HasilSeleksi {
  uid: string;
  namaMahasiswa: string;
  status: 'Menunggu' | 'Lolos' | 'Tidak Lolos';
  keterangan: string;
  noUjian?: string;
  nilaiSeleksi?: number;
  updatedAt?: any;
}

export interface SystemConfig {
  namaKampus: string;
  logoUrl?: string;
  alamat?: string;
  kontak?: string;
  deskripsi?: string;
}
