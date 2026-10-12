import type { Metadata } from "next"

import { SignInScreen } from "@/features/auth"
import { APP_NAME } from "@/lib/config"

export const metadata: Metadata = { title: `Sign in · ${APP_NAME}` }

export default function LoginPage() {
  return <SignInScreen />
}
