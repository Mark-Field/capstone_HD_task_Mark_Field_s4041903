import type { Metadata } from 'next'
import { ShieldAlert } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { ShowcaseAdmin } from '@/features/showcase/components/admin/ShowcaseAdmin'
import { getAdminUid } from '@/features/showcase/lib/admin'
import { listDemosForAdmin } from '@/features/showcase/lib/queries'

export const metadata: Metadata = {
  title: 'Showcase admin',
}

export const dynamic = 'force-dynamic'

export default async function ShowcaseAdminPage() {
  const uid = await getAdminUid()

  return (
    <div className="space-y-6">
      <PageHeader title="Showcase" description="Create, edit and publish the demos shown on the public site." />
      {uid ? (
        <ShowcaseAdmin demos={await listDemosForAdmin()} />
      ) : (
        <EmptyState
          icon={ShieldAlert}
          title="Admins only"
          description="Your account doesn’t have the admin role. Ask a project admin to set role: 'admin' on your users document."
        />
      )}
    </div>
  )
}
