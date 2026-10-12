import { APP_NAME } from "@/lib/config"

import { AuthLayout } from "./auth-layout"
import { SignInForm } from "./sign-in-form"

/** The full `/login` page: brand bar, heading, sign-in form, and the "no public sign-up" note. */
export function SignInScreen() {
  return (
    <AuthLayout
      title={`Sign in to ${APP_NAME}`}
      subtitle="Requirements tracking for your project teams."
      footer={
        <div className="flex flex-col gap-1">
          <p className="text-body text-gray-700 sm:text-ui">Need access? Contact your administrator.</p>
          <p className="text-caption text-gray-600">
            Accounts are created by administrators. There is no public sign-up.
          </p>
        </div>
      }
    >
      <SignInForm />
    </AuthLayout>
  )
}
