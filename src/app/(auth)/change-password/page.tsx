import type { Metadata } from "next"

import { ChangePasswordScreen } from "@/features/auth"
import { APP_NAME } from "@/lib/config"

export const metadata: Metadata = { title: `Set a new password · ${APP_NAME}` }

export default function ChangePasswordPage() {
  return <ChangePasswordScreen />
}
