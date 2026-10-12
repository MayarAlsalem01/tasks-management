import "server-only"

import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"

import * as schema from "./schema"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

/** Drizzle client over a pooled `pg` connection. Server-only. */
export const db = drizzle({ client: pool, schema })

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

/** The client or an open transaction: services that write accept either. */
export type DbExecutor = typeof db | Transaction
