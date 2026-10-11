import { cn } from "cn"
import Link from "next/link"
import { Fragment, type ReactNode } from "react"

export type Crumb = { label: string; href?: string }

type PageHeaderProps = {
  breadcrumb?: Crumb[]
  title: string
  /**
   * Short mono annotation after the title, e.g. "12 FRs". May be a streamed node
   * (wrap data-dependent meta in `<Suspense>` so the header stays in the static shell).
   */
  meta?: ReactNode
  actions?: ReactNode
  /** Usually `<NavTabs>`; sits flush on the header's bottom border. */
  tabs?: ReactNode
  className?: string
}

/** Page title block from the App Shell design: breadcrumb, title + meta, actions and tabs. */
function PageHeader({ breadcrumb, title, meta, actions, tabs, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-none flex-col gap-2.5 border-b border-gray-150 px-4 pt-4 lg:px-6", !tabs && "pb-3", className)}>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-caption text-gray-600">
          {breadcrumb.map((crumb, i) => (
            <Fragment key={`${crumb.label}-${i}`}>
              {i > 0 && <span className="text-gray-400">/</span>}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-foreground">
                  {crumb.label}
                </Link>
              ) : (
                <span className={cn(i === breadcrumb.length - 1 && "font-medium text-foreground")}>{crumb.label}</span>
              )}
            </Fragment>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-title-1">{title}</h1>
        {meta && <span className="font-mono text-caption text-gray-600">{meta}</span>}
        <span className="flex-1" />
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {tabs}
    </div>
  )
}

export { PageHeader }
