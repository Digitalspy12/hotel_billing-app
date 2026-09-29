import { AppHeader, AppShell } from '@/components/app-shell'
import { getMenu } from '@/lib/data'
import { MenuManageClient } from './menu-order-client'

export default async function MenuPage() {
  const { categories, items } = await getMenu()

  return (
    <AppShell>
      <AppHeader title="Menu Management" backHref="/" />
      <MenuManageClient categories={categories} menuItems={items} />
    </AppShell>
  )
}
