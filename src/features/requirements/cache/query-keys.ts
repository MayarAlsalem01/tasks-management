/** React Query keys for requirement data fetched on the client. */
export const requirementKeys = {
  all: ["requirements"] as const,
  detail: (frId: string) => [...requirementKeys.all, "detail", frId] as const,
}
