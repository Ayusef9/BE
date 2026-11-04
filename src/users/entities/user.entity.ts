import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import type { Relation } from 'typeorm';
import { AppSoftDeleteEntity } from '../../common/entities/base.entity.js';
import { Role } from '../../common/enums/index.js';
import { DeviceToken } from './device-token.entity.js';
import { Vendor } from '../../vendors/entities/vendor.entity.js';
import { PlanMember } from '../../plans/entities/plan-member.entity.js';

@Entity({ name: 'users' })
export class User extends AppSoftDeleteEntity {
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email: string;

  // select:false -> tidak ikut terambil kecuali diminta (addSelect) saat login
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

  @OneToMany(() => DeviceToken, (token) => token.user)
  deviceTokens: DeviceToken[];

  @OneToOne(() => Vendor, (vendor) => vendor.user)
  vendor: Relation<Vendor>;

  @OneToMany(() => PlanMember, (member) => member.user)
  planMembers: PlanMember[];
}
