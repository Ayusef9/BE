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

export enum Gender { 
  MALE = 'male', FEMALE = 'female'
}
export enum TaskPriority {
   NORMAL = 'normal', IMPORTANT = 'important', VERY_IMPORTANT = 'very_important'
}
export enum NotificationType { 
  CHAT = 'chat', DEAL = 'deal', DOCUMENT = 'document', REVIEW = 'review', SYSTEM = 'system'
}
export enum ReceiptValidation {
   PENDING = 'pending', VALID = 'valid', REJECTED = 'rejected'
} 
export enum RecommendationSort { 
  PRICE_ASC = 'price_asc', PRICE_DESC = 'price_desc', RATING = 'rating' 
}