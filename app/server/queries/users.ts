import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertUser } from "@db/schema";
import { getDb } from "./connection";
import { env } from "../lib/env";

export async function findUserByUnionId(unionId: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.unionId, unionId))
    .limit(1);
  return rows.at(0);
}

export async function upsertUser(data: InsertUser) {
  const values = { ...data };
  const updateSet: Partial<InsertUser> = {
    lastSignInAt: new Date(),
    ...data,
  };

  if (
    values.role === undefined &&
    values.unionId &&
    values.unionId === env.ownerUnionId
  ) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  await getDb()
    .insert(schema.users)
    .values(values)
    .onDuplicateKeyUpdate({ set: updateSet });
}

export async function countUsers(): Promise<number> {
  const rows = await getDb()
    .select({ id: schema.users.id })
    .from(schema.users)
    .limit(1000);
  return rows.length;
}

/** users able to sign in with email/password (legacy OAuth accounts can't) */
export async function countLocalUsers(): Promise<number> {
  const { isNotNull } = await import("drizzle-orm");
  const rows = await getDb()
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(isNotNull(schema.users.passwordHash))
    .limit(1000);
  return rows.length;
}

export async function updateUserAuth(
  unionId: string,
  patch: Partial<Pick<schema.InsertUser, "passwordHash" | "totpSecret" | "totpEnabled">>,
) {
  await getDb()
    .update(schema.users)
    .set(patch)
    .where(eq(schema.users.unionId, unionId));
}
