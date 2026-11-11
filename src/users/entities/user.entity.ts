import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import type { Relation } from 'typeorm';
import { AppSoftDeleteEntity } from '../../common/entities/base.entity.js';
import { Gender, Role } from '../../common/enums/index.js';
import { DeviceToken } from './device-token.entity.js';
import { Vendor } from '../../vendors/entities/vendor.entity.js';
import { PlanMember } from '../../plans/entities/plan-member.entity.js';

@Entity({ name: 'users' })
export class User extends AppSoftDeleteEntity {
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255, select: false })
  passwordHash: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 20, default: Role.USER })
  role: Role;

  @Column({
    name: 'refresh_token_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
    select: false,
  })
  refreshTokenHash: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nickname: string | null;

  @Column({ name: 'avatar_url', type: 'varchar', length: 255, nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'birth_date', type: 'date', nullable: true })
  birthDate: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender: Gender | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  province: string | null;

  @Column({ name: 'terms_accepted_at', type: 'timestamp', nullable: true })
  termsAcceptedAt: Date | null;

  @Column({ name: 'password_reset_hash', type: 'varchar', length: 64, nullable: true, select: false })
  passwordResetHash: string | null;

  @Column({ name: 'password_reset_expires_at', type: 'timestamp', nullable: true, select: false })
  passwordResetExpiresAt: Date | null;

  @OneToMany(() => DeviceToken, (token: DeviceToken) => token.user)
  deviceTokens: DeviceToken[];

  @OneToOne(() => Vendor, (vendor: Vendor) => vendor.user)
  vendor: Relation<Vendor>;

  @OneToMany(() => PlanMember, (member: PlanMember) => member.user)
  planMembers: PlanMember[];

}
