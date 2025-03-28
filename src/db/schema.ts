import { pgTable, serial, text } from 'drizzle-orm/pg-core';

export const testUser = pgTable('test_user', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
});
