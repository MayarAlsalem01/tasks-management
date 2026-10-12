import { AuthLayout } from "./auth-layout"
import { ChangePasswordForm } from "./change-password-form"

/** The `/change-password` page shown after an admin-issued password (first sign-in or reset). */
export function ChangePasswordScreen() {
  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Your administrator gave you a temporary password. Choose your own to continue."
    >
      <ChangePasswordForm />
    </AuthLayout>
  )
}
