import { cn } from "cn"

import type { TaskTile, TileTone } from "../utils/my-tasks"
import { DevGlyph, QaGlyph } from "./status-glyphs"

const TONE: Record<TileTone, string> = {
  neutral: "border-gray-150 bg-white",
  danger: "border-danger-border bg-danger-subtle",
  warning: "border-warning-border bg-warning-subtle",
  info: "border-info-border bg-info-bg/50",
}

/** The four My Tasks summary tiles (counts per status for the viewer's variant). */
export function MyTasksTiles({ tiles }: { tiles: TaskTile[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((tile) => (
        <div key={tile.label} className={cn("flex flex-col gap-1 rounded-xl border px-3.5 py-3", TONE[tile.tone])}>
          <span className="flex items-center gap-1.5 text-caption font-medium text-gray-700">
            {tile.glyph?.kind === "dev" && <DevGlyph status={tile.glyph.status} />}
            {tile.glyph?.kind === "qa" && <QaGlyph status={tile.glyph.status} />}
            {tile.label}
          </span>
          <span className="text-[26px] leading-[30px] font-semibold tracking-tight">{tile.value}</span>
          <span className="text-caption text-gray-600">{tile.sub}</span>
        </div>
      ))}
    </div>
  )
}
