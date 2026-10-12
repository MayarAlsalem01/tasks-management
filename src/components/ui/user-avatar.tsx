import { CircleSlashIcon } from "lucide-react"
import { cn } from "cn"

import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { avatarTint, initials } from "@/lib/avatar-tint"

type AvatarSize = "xs" | "sm" | "default" | "lg"

type UserAvatarProps = {
  userId: string
  name: string
  size?: AvatarSize
  deactivated?: boolean
  online?: boolean
  className?: string
}

/** Initials on a muted tint derived from the user id. Deactivated users get a dashed grey ring. */
function UserAvatar({
  userId,
  name,
  size = "sm",
  deactivated = false,
  online = false,
  className,
}: UserAvatarProps) {
  return (
    <Avatar size={size} deactivated={deactivated} className={className}>
      <AvatarFallback className={cn(!deactivated && avatarTint(userId))}>
        {initials(name)}
      </AvatarFallback>
      {online && <AvatarBadge aria-label="Online" />}
    </Avatar>
  )
}

function DeactivatedTag() {
  return (
    <Badge variant="outline" size="sm" className="gap-1 border-input text-muted-foreground">
      <CircleSlashIcon className="size-2.5" />
      Deactivated
    </Badge>
  )
}

type UserLabelProps = UserAvatarProps & {
  role?: string
}

/** Avatar + name, with an optional role tag; deactivated users keep their place with a "Deactivated" tag. */
function UserLabel({ role, className, ...avatar }: UserLabelProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <UserAvatar {...avatar} />
      <span className={cn(avatar.deactivated && "text-muted-foreground")}>{avatar.name}</span>
      {avatar.deactivated ? (
        <DeactivatedTag />
      ) : (
        role && (
          <Badge variant="tag" size="sm">
            {role}
          </Badge>
        )
      )}
    </span>
  )
}

type StackUser = { userId: string; name: string }

/** Overlapping avatars with a "+N" overflow count. */
function UserAvatarStack({ users, max = 3 }: { users: StackUser[]; max?: number }) {
  const overflow = users.length - max
  return (
    <AvatarGroup>
      {users.slice(0, max).map((u) => (
        <UserAvatar key={u.userId} userId={u.userId} name={u.name} size="sm" />
      ))}
      {overflow > 0 && <AvatarGroupCount className="size-6">+{overflow}</AvatarGroupCount>}
    </AvatarGroup>
  )
}

export { DeactivatedTag, UserAvatar, UserAvatarStack, UserLabel }
