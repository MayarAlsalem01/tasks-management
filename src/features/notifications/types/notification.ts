export type NotificationItem = {
  id: string
  type: "ASSIGNED" | "QA_FAILED" | "ACS_DEV_COMPLETE"
  title: string
  message: string
  linkUrl: string | null
  actor: { id: string; fullName: string } | null
  frCode: string | null
  projectCode: string | null
  createdAt: Date
  read: boolean
}
