/* eslint-disable node/prefer-global/process */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { testUser } from './schema';
import { eq } from 'drizzle-orm';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be a Neon postgres connection string');
}
const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle({
  client: sql,
  schema: { ...schema },
});

// example

/**
 * 创建新用户记录
 */
export async function createUser(name: string) {
  return await db
    .insert(testUser)
    .values({
      name,
    })
    .returning();
}

/**
 * 获取所有用户
 */
export async function getAllUsers() {
  return await db.select().from(testUser);
}

/**
 * 获取特定用户
 */
export async function getUserById(id: number) {
  return await db.select().from(testUser).where(eq(testUser.id, id));
}

/**
 * 更新用户信息
 */
export async function updateUser(id: number, name: string) {
  return await db.update(testUser).set({ name }).where(eq(testUser.id, id));
}

/**
 * 删除用户
 */
export async function deleteUser(id: number) {
  return await db.delete(testUser).where(eq(testUser.id, id));
}
