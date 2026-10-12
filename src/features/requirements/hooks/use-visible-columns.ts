"use client"

import { useSyncExternalStore } from "react"

import { logError } from "@/lib/errors"

import type { FrColumn } from "../types/table"
import { FR_COLUMNS } from "../utils/table-layout"

const STORAGE_KEY = "fractals-tasks:table-columns"
const CHANGE_EVENT = "fractals-tasks:table-columns"

// Per-viewer preference only: storage can be unavailable (private mode), so every access
// falls back to "all columns".
function read(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ""
  } catch {
    return ""
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange)
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

/** Columns hidden through the Columns menu, remembered in this browser. */
export function useVisibleColumns() {
  const stored = useSyncExternalStore(subscribe, read, () => "")
  const hidden = stored.split(",").filter(Boolean)
  const visible = FR_COLUMNS.filter((column) => !hidden.includes(column))

  const toggle = (column: FrColumn) => {
    const next = hidden.includes(column) ? hidden.filter((c) => c !== column) : [...hidden, column]
    try {
      localStorage.setItem(STORAGE_KEY, next.join(","))
      window.dispatchEvent(new Event(CHANGE_EVENT))
    } catch (error) {
      logError(error, "requirements.useVisibleColumns")
    }
  }

  return { visible, toggle }
}
