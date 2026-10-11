// Admin pages are for Admin / PO only (FRS §2). Each admin page checks access itself with
// `requireAdminPage()`: a layout check alone wouldn't stop the page from rendering.
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return children
}
