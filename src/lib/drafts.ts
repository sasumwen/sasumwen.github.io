/**
 * Draft handling.
 *
 * - In `astro dev`, drafts and placeholders are always visible, with badges.
 * - In `astro build`, they are hidden unless PUBLIC_SHOW_DRAFTS=true
 *   (used for internal preview builds only: never for the deploy workflow).
 */
export const SHOW_DRAFTS: boolean =
  import.meta.env.DEV || import.meta.env.PUBLIC_SHOW_DRAFTS === 'true';

export type Status = 'verified' | 'self-reported' | 'draft';

/** True when an item with the given status may be rendered in this build. */
export function canShow(status: Status | undefined, draft?: boolean): boolean {
  if (draft) return SHOW_DRAFTS;
  if (status === 'draft') return SHOW_DRAFTS;
  return true;
}

/** Collection filter helper: keeps non-draft entries, plus drafts in preview builds. */
export function notDraft<T extends { data: { draft?: boolean } }>(entry: T): boolean {
  return SHOW_DRAFTS || !entry.data.draft;
}
