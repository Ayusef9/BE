import { User } from '../users/entities/user.entity.js';
import { DeviceToken } from '../users/entities/device-token.entity.js';
import { Vendor } from '../vendors/entities/vendor.entity.js';
import { ServiceCategory } from '../vendors/entities/service-category.entity.js';
import { ServiceItem } from '../vendors/entities/service-item.entity.js';
import { Package } from '../vendors/entities/package.entity.js';
import { PackageItem } from '../vendors/entities/package-item.entity.js';
import { WeddingPlan } from '../plans/entities/wedding-plan.entity.js';
import { PlanMember } from '../plans/entities/plan-member.entity.js';
import { PlanNeed } from '../plans/entities/plan-need.entity.js';
import { Conversation } from '../chat/entities/conversation.entity.js';
import { Message } from '../chat/entities/message.entity.js';
import { Deal } from '../deals/entities/deal.entity.js';
import { Schedule } from '../scheduler/entities/schedule.entity.js';
import { DocumentTask } from '../documents/entities/document-task.entity.js';
import { Receipt } from '../documents/entities/receipt.entity.js';
import { SavingsGoal } from '../savings/entities/savings-goal.entity.js';
import { SavingsContribution } from '../savings/entities/savings-contribution.entity.js';
import { SavingsNote } from '../savings/entities/savings-note.entity.js';
import { ChatbotSession } from '../chatbot/entities/chatbot-session.entity.js';
import { ChatbotMessage } from '../chatbot/entities/chatbot-message.entity.js';

/**
 * Semua entity didaftarkan di satu tempat. Wajib lengkap walau modulnya belum dibuat,
 * karena TypeORM butuh metadata semua entity yang direlasikan.
 */
export const ALL_ENTITIES = [
  User, DeviceToken,
  Vendor, ServiceCategory, ServiceItem, Package, PackageItem,
  WeddingPlan, PlanMember, PlanNeed,
  Conversation, Message, Deal,
  Schedule, DocumentTask, Receipt,
  SavingsGoal, SavingsContribution, SavingsNote,
  ChatbotSession, ChatbotMessage,
];
