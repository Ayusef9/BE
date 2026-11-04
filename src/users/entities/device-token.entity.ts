import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import type { Relation } from 'typeorm';
import { AppBaseEntity } from '../../common/entities/base.entity.js';
import { DevicePlatform } from '../../common/enums/index.js';
import { User } from './user.entity.js';

@Entity({ name: 'device_tokens' })
export class DeviceToken extends AppBaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.deviceTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Column({ name: 'fcm_token', type: 'varchar', length: 255, unique: true })
  fcmToken: string;

  @Column({ type: 'varchar', length: 20 })
  platform: DevicePlatform;
}
