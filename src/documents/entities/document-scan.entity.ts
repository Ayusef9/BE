import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { DocumentTask } from './document-task.entity.js';

/** Satu halaman hasil scan milik satu tugas berkas. Berkas dianggap selesai jika punya minimal satu halaman. */
@Entity({ name: 'document_scans' })
export class DocumentScan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'task_id', type: 'uuid' })
  taskId: string;

  @ManyToOne(() => DocumentTask, (task) => task.scans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Relation<DocumentTask>;

  @Column({ name: 'image_path', type: 'varchar', length: 255 })
  imagePath: string;

  @Column({ name: 'page_number', type: 'int' })
  pageNumber: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}