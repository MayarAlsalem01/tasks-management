// Creates the first administrator account, since there is no public sign-up (FR-IAM-001).
// Usage: npm run create-admin
// Prompts for the details, or reads ADMIN_USERNAME / ADMIN_FULL_NAME / ADMIN_EMAIL /
// ADMIN_PASSWORD from the environment for non-interactive use.
import { stdin, stdout } from "node:process"
import { createInterface } from "node:readline/promises"

import { hashPassword } from "better-auth/crypto"
import pg from "pg"

process.loadEnvFile()

const USERNAME_PATTERN = /^[a-z0-9._-]{3,50}$/
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

async function ask(rl, question, envKey, validate) {
  const fromEnv = process.env[envKey]
  if (fromEnv) {
    const error = validate(fromEnv)
    if (error) throw new Error(`${envKey}: ${error}`)
    return fromEnv
  }
  for (;;) {
    const answer = (await rl.question(question)).trim()
    const error = validate(answer)
    if (!error) return answer
    console.log(`  ${error}`)
  }
}

async function main() {
  const rl = createInterface({ input: stdin, output: stdout })
  const username = (await ask(rl, "Username: ", "ADMIN_USERNAME", (v) =>
    USERNAME_PATTERN.test(v.toLowerCase()) ? null : "Use 3–50 lowercase letters, numbers, dots, dashes or underscores.",
  )).toLowerCase()
  const fullName = await ask(rl, "Full name: ", "ADMIN_FULL_NAME", (v) => (v ? null : "Enter a name."))
  const email = (await ask(rl, "Email: ", "ADMIN_EMAIL", (v) => (EMAIL_PATTERN.test(v) ? null : "Enter a valid email."))).toLowerCase()
  const password = await ask(rl, "Password (min 10 characters, shown as you type): ", "ADMIN_PASSWORD", (v) =>
    v.length >= 10 ? null : "Use at least 10 characters.",
  )
  rl.close()

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL })
  await client.connect()
  try {
    await client.query("begin")
    const { rows: [user] } = await client.query(
      "insert into users (username, display_username, full_name, email) values ($1, $1, $2, $3) returning id",
      [username, fullName, email],
    )
    await client.query(
      "insert into accounts (user_id, account_id, provider_id, password) values ($1, $2, 'credential', $3)",
      [user.id, user.id, await hashPassword(password)],
    )
    await client.query("insert into user_roles (user_id, role) values ($1, 'ADMIN')", [user.id])
    await client.query(
      "insert into audit_logs (entity_name, entity_id, action, new_values) values ('user', $1, 'CREATE', $2)",
      [user.id, JSON.stringify({ username, fullName, email, roles: ["ADMIN"], source: "create-admin script" })],
    )
    await client.query("commit")
    console.log(`\nCreated admin "${username}". Sign in at /login.`)
  } catch (error) {
    await client.query("rollback")
    if (error.code === "23505") throw new Error("That username or email is already in use.")
    throw error
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(`\nCouldn't create the admin: ${error.message}`)
  process.exit(1)
})
