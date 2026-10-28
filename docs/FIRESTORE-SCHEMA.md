# Firestore Schema

## Overview

All collections use the typed collection pattern — see `frontend/src/lib/firebase/firestore.ts`.
Security rules are in `firebase/firestore.rules`.

When adding a new collection, use the `/firebase-collection` Claude Code skill.

## Schema versioning

Every document in every collection **must** include a `_schemaVersion` field:

```typescript
_schemaVersion: 1  // increment when doing a breaking schema change
```

This enables **lazy migration** — when a document is read, check `_schemaVersion` and migrate on the fly if it's behind current. See the `/evolve-schema` skill for the full migration workflow.

**Rules:**
- `_schemaVersion` is always `1` on creation
- Non-breaking changes (adding optional fields with defaults) keep the same version
- Breaking changes (rename, remove, type change) increment the version and require a migration function
- Never remove `_schemaVersion` from a schema

---

## `users` collection

**Path:** `/users/{userId}`
**Access:** Owner-only (user can read/write their own document; admins can read all)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `uid` | `string` | Yes | Firebase Auth UID (same as document ID) |
| `email` | `string` | Yes | User's email address |
| `displayName` | `string \| null` | Yes | Display name from Auth or profile |
| `photoURL` | `string \| null` | Yes | Profile photo URL |
| `role` | `'user' \| 'admin'` | Yes | User role — immutable by user after creation |
| `createdAt` | `Timestamp` | Yes | When the document was created |
| `updatedAt` | `Timestamp` | Yes | When the document was last updated |
| `_schemaVersion` | `1` | Yes | Schema version for lazy migration |

**Creation:** Auto-created by `AuthProvider` on first sign-in via `syncUserProfile()`.
**Deletion:** Hard-delete is disabled in security rules. Use `deletedAt` field for soft-delete.

---

## `demos` collection

**Path:** `/demos/{slug}` (document ID is the URL slug)
**Access:** Public read when `published == true` and not deleted; admins read all. All client writes denied — writes go through Server Actions in `frontend/src/features/showcase/actions/` (Admin SDK + `getAdminUid()` role check).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | `string` | Yes | Display title |
| `capability` | `string` | Yes | e.g. "Locomotion" |
| `summary` | `string` | Yes | One or two sentences shown on the card |
| `status` | `'working' \| 'partial' \| 'planned'` | Yes | Honest status label |
| `environment` | `'simulation' \| 'physical'` | Yes | Where it was demonstrated |
| `sprint` | `number` | Yes | Primary sort key |
| `order` | `number` | Yes | Secondary sort key within a sprint |
| `sections` | `{ heading, paragraphs?, bullets?, steps? }[]` | Yes | Explanation body |
| `published` | `boolean` | Yes | Public visibility |
| `createdBy` | `string` | Yes | Admin UID (or `seed-script`) |
| `createdAt` / `updatedAt` | `Timestamp` | Yes | |
| `deletedAt` | `Timestamp \| null` | Yes | Soft delete — always written as `null` on create |
| `_schemaVersion` | `1` | Yes | |

## `media` collection

**Path:** `/media/{mediaId}`
**Access:** Same as `demos`. A media item can only be published while its parent demo is published and not deleted (enforced in `setMediaPublished`).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `demoId` | `string` | Yes | Slug of the parent demo |
| `type` | `'video' \| 'image'` | Yes | |
| `provider` | `'local' \| 'youtube' \| 'vimeo'` | Yes | Derived server-side by `parseMediaSource()` |
| `src` | `string` | Yes | `/assets/...` path for local files, otherwise the provider's video ID (raw URLs are never stored) |
| `caption` | `string` | Yes | |
| `alt` | `string \| null` | Yes | Required for images |
| `order` | `number` | Yes | Display order within the demo |
| `published` | `boolean` | Yes | |
| `createdBy`, `createdAt`, `updatedAt`, `deletedAt`, `_schemaVersion` | | Yes | As for `demos` |

**Seeding:** `pnpm --filter frontend seed:showcase` loads the current demos (idempotent, fixed IDs).

<!-- Add new collection schemas below using the /firebase-collection skill -->
