import { ClaimDialogConfig, SocialLink } from '@/interfaces';
import { jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export interface EnvelopeAttributes {
  roochObjectId: string;
  socialLinks: SocialLink[];
  claimDialogConfig: ClaimDialogConfig;
}

// 红包扩展属性表
export const envelopeAttributes = pgTable('envelope_attributes', {
  id: serial('id').primaryKey(),
  roochObjectId: text('rooch_object_id').notNull().unique(), // 红包ID，链上创建的object_id
  socialLinks: jsonb('social_links'), // 社交链接，JSON格式存储
  claimDialogConfig: jsonb('claim_dialog_config'), // 领取弹窗，JSON格式存储
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
