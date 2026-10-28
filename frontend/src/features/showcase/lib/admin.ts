import 'server-only'
import { getServerSession } from '@/actions/auth.actions'
import { adminDb } from '@/lib/firebase/admin'

/** UID of the signed-in user if their users/{uid}.role is 'admin', otherwise null. */
export async function getAdminUid(): Promise<string | null> {
  const session = await getServerSession()
  if (!session) return null
  const snap = await adminDb.collection('users').doc(session.uid).get()
  return snap.exists && snap.get('role') === 'admin' ? session.uid : null
}
