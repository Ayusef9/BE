export enum Role {
  USER = 'user',
  VENDOR = 'vendor',
  ADMIN = 'admin',
}

export enum VerificationStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  REJECTED = 'rejected',
}

/** Posisi satu kategori kebutuhan dalam rencana (plan_needs.status). */
export enum NeedStatus {
  BELUM_DIPILIH = 'belum_dipilih',
  NEGOSIASI = 'negosiasi',
  DISEPAKATI = 'disepakati',
  BUKTI_TERUNGGAH = 'bukti_terunggah',
}

/** Nasib satu permintaan ke satu vendor (deals.status). */
export enum DealStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum MemberRole {
  OWNER = 'owner',
  PARTNER = 'partner',
}

export enum DevicePlatform {
  ANDROID = 'android',
  IOS = 'ios',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  SYSTEM = 'system',
}

export enum ScheduleType {
  MILESTONE = 'milestone',
  SURVEY = 'survey',
  TASTING = 'tasting',
  FITTING = 'fitting',
  WEDDING_DAY = 'wedding_day',
  CUSTOM = 'custom',
}

export enum ScheduleSource {
  AUTO = 'auto',
  DEAL = 'deal',
  MANUAL = 'manual',
}

export enum ChatbotRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export enum RecommendationMode {
  PACKAGE = 'package',
  ITEM = 'item',
}
