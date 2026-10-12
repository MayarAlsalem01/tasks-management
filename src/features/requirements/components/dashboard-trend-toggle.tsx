"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { SearchParam, withQuery } from "@/lib/routes"

import { TREND_WINDOW_LABEL, TrendWindow } from "../types/dashboard"

/** "Trend 7 days / 30 days" for the dashboard, kept in `?trend=` (7 days is the default and leaves the URL clean). */
export function DashboardTrendToggle() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const value = searchParams.get(SearchParam.Trend) === TrendWindow.Month ? TrendWindow.Month : TrendWindow.Week

  const select = (next: string) => {
    if (!next) return
    const query = Object.fromEntries(searchParams)
    router.replace(withQuery(pathname, { ...query, [SearchParam.Trend]: next === TrendWindow.Week ? undefined : next }), { scroll: false })
  }

  return (
    <span className="flex items-center gap-2 text-caption text-gray-600">
      Trend
      <ToggleGroup type="single" value={value} onValueChange={select} size="sm" spacing={0.5} className="rounded-[7px] bg-gray-75 p-0.5">
        {Object.values(TrendWindow).map((option) => (
          <ToggleGroupItem
            key={option}
            value={option}
            className="h-[26px] px-3 text-caption text-gray-600 hover:bg-transparent data-[state=on]:bg-white data-[state=on]:text-foreground data-[state=on]:shadow-e1"
          >
            {TREND_WINDOW_LABEL[option]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </span>
  )
}
