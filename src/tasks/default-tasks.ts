import { TaskPriority } from '../common/enums/index.js';

/** Tugas bawaan, tenggatnya dihitung mundur dari tanggal pernikahan. */
const DEFAULTS = [
  { title: 'Tentukan tanggal pernikahan', category: 'Acara', daysBefore: 365, priority: TaskPriority.VERY_IMPORTANT },
  { title: 'Tentukan budget dan konsep', category: 'Acara', daysBefore: 350, priority: TaskPriority.VERY_IMPORTANT },
  { title: 'Konfirmasi venue resepsi', category: 'Venue', daysBefore: 300, priority: TaskPriority.VERY_IMPORTANT },
  { title: 'Pilih vendor katering', category: 'Vendor', daysBefore: 240, priority: TaskPriority.IMPORTANT },
  { title: 'Pilih vendor dokumentasi', category: 'Vendor', daysBefore: 180, priority: TaskPriority.IMPORTANT },
  { title: 'Pilih vendor rias dan busana', category: 'Vendor', daysBefore: 180, priority: TaskPriority.IMPORTANT },
  { title: 'Finalisasi daftar tamu', category: 'Tamu', daysBefore: 120, priority: TaskPriority.IMPORTANT },
  { title: 'Pesan undangan dan suvenir', category: 'Tamu', daysBefore: 120, priority: TaskPriority.NORMAL },
  { title: 'Lengkapi berkas administrasi nikah', category: 'Berkas', daysBefore: 90, priority: TaskPriority.VERY_IMPORTANT },
  { title: 'Tasting katering dan fitting busana', category: 'Vendor', daysBefore: 60, priority: TaskPriority.NORMAL },
  { title: 'Konfirmasi final semua vendor', category: 'Vendor', daysBefore: 30, priority: TaskPriority.VERY_IMPORTANT },
  { title: 'Gladi dan konfirmasi jumlah tamu', category: 'Acara', daysBefore: 14, priority: TaskPriority.IMPORTANT },
];

export function buildDefaultTasks(planId: string, weddingDate?: string | null) {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
  return DEFAULTS.map(({ daysBefore, ...task }) => {
    let dueDate: string | null = null;
    if (weddingDate) {
      const d = new Date(`${weddingDate.slice(0, 10)}T00:00:00Z`);
      d.setUTCDate(d.getUTCDate() - daysBefore);
      const iso = d.toISOString().slice(0, 10);
      dueDate = iso < today ? today : iso; // tenggat yang sudah lewat digeser ke hari ini
    }
    return { planId, ...task, dueDate };
  });
}