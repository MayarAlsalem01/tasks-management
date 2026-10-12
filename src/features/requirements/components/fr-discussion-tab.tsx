"use client"

import { cn } from "cn"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DeactivatedTag, UserAvatar } from "@/components/ui/user-avatar"
import { relativeTime } from "@/lib/format"

import { addCommentAction, addPullRequestAction, updateNotesAction } from "../actions/requirement-actions"
import type { FrComment, FrDetail, FrRow } from "../types/requirement"
import { useFr } from "./fr-context"
import { InlineText } from "./inline-text"
import { PrChip } from "./pr-chip"

const MENTION = /(@\p{L}+(?: \p{L}+)?)/u

function Heading({ children }: { children: string }) {
  return <span className="font-mono text-overline tracking-wider text-gray-500 uppercase">{children}</span>
}

/** Comment body with `@First Last` mentions highlighted. */
function CommentBody({ body }: { body: string }) {
  return (
    <p className="text-ui whitespace-pre-wrap text-pretty">
      {body.split(MENTION).map((part, i) =>
        MENTION.test(part) ? <span key={i} className="rounded-xs bg-cobalt-50 px-0.5 font-medium text-cobalt-700">{part}</span> : part,
      )}
    </p>
  )
}

function CommentItem({ comment }: { comment: FrComment }) {
  const { author } = comment
  return (
    <div className="flex gap-2.5">
      <UserAvatar userId={author.id} name={author.fullName} size="default" deactivated={author.deactivated} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex flex-wrap items-center gap-2 text-ui">
          <span className={cn("font-semibold", author.deactivated && "text-gray-600")}>{author.fullName}</span>
          {author.deactivated && <DeactivatedTag />}
          {comment.isDefect && <span className="text-caption font-medium text-danger-fg">Defect{comment.acCode ? ` · ${comment.acCode}` : ""}</span>}
          <span className="font-mono text-overline tracking-normal text-gray-500">{relativeTime(comment.createdAt)}</span>
        </span>
        <CommentBody body={comment.body} />
      </div>
    </div>
  )
}

/** Discussion tab: team notes, linked pull requests and comments (any role, FRS §2). */
export function FrDiscussionTab({ fr, detail, readOnly }: { fr: FrRow; detail: FrDetail; readOnly: boolean }) {
  const { run } = useFr()
  const [prUrl, setPrUrl] = useState<string | null>(null)
  const [comment, setComment] = useState("")

  const addPr = async () => {
    if (prUrl && (await run(fr.id, () => addPullRequestAction({ frId: fr.id, url: prUrl })))) setPrUrl(null)
  }
  const post = async () => {
    if (await run(fr.id, () => addCommentAction({ frId: fr.id, body: comment }))) setComment("")
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Heading>Notes</Heading>
        {readOnly ? <p className="text-ui whitespace-pre-wrap">{fr.notes || "—"}</p> : (
          <InlineText multiline rows={3} label="Notes" placeholder="Add a note for the team" value={fr.notes ?? ""} onSave={(notes) => run(fr.id, () => updateNotesAction({ frId: fr.id, notes }), { patch: { fr: { notes: notes || null } } })} />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Heading>Pull requests</Heading>
        <div className="flex flex-wrap items-center gap-1.5">
          {detail.pullRequests.map((pr) => (
            <a key={pr.id} href={pr.url} target="_blank" rel="noreferrer" className="rounded-md outline-none focus-visible:shadow-focus">
              <PrChip repo={pr.repo} number={pr.number} state={pr.state} showState />
            </a>
          ))}
          {!readOnly && (prUrl === null ? (
            <button type="button" onClick={() => setPrUrl("")} className="inline-flex h-6 items-center rounded-md border border-dashed border-gray-300 px-2 text-caption text-gray-700 outline-none hover:bg-gray-25 focus-visible:shadow-focus">+ Add PR</button>
          ) : (
            <span className="flex items-center gap-1.5">
              <Input autoFocus value={prUrl} onChange={(e) => setPrUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addPr()} placeholder="github.com/org/repo/pull/123" aria-label="Pull request URL" className="h-7 w-60 font-mono text-caption" />
              <Button size="sm" disabled={!prUrl.trim()} onClick={addPr}>Add</Button>
              <Button size="sm" variant="ghost" onClick={() => setPrUrl(null)}>Cancel</Button>
            </span>
          ))}
          {readOnly && !detail.pullRequests.length && <span className="text-ui text-gray-600">None</span>}
        </div>
      </div>
      <div className="flex flex-col gap-3.5">
        <Heading>Comments</Heading>
        {detail.comments.map((c) => <CommentItem key={c.id} comment={c} />)}
        {!detail.comments.length && <span className="text-ui text-gray-600">No comments yet.</span>}
        {!readOnly && (
          <div className="rounded-lg border border-input">
            <Textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment. Type @ to mention." aria-label="New comment" className="resize-none border-0 shadow-none focus-visible:shadow-none" />
            <div className="flex justify-end border-t border-gray-75 px-2 py-1.5">
              <Button size="sm" disabled={!comment.trim()} onClick={post}>Comment</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
