import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// Write-side CRUD for the finance category tree. Kept SEPARATE from
// useFinanceCategories (which stays read-only so AddTransactionPage/report never
// break). Every mutation does .select() and, per project rule, scopes every
// UPDATE/DELETE with .eq('user_id', ...) so RLS can never 403 us.
//
// Delete strategy (variant 2 — operations survive, just get detached):
// before removing a category we null out category_id on every expense/income
// booked against it, so those rows fall into the report's "no category" bucket
// instead of disappearing.
const TABLE = 'finance_categories'

export function useCategoryManager() {
  const { user } = useAuth()
  const userId = user?.id

  // Create a category. parentId === null → a top-level parent; otherwise a
  // subcategory of that parent. Two levels only — callers never pass a
  // subcategory's id as parentId.
  const createCategory = useCallback(
    async ({ name, type, parentId = null }) => {
      if (!userId) return { ok: false, error: 'no-user' }
      const trimmed = name?.trim()
      if (!trimmed) return { ok: false, error: 'empty-name' }
      const { data, error: err } = await supabase
        .from(TABLE)
        .insert({ user_id: userId, name: trimmed, type, parent_id: parentId })
        .select()
      if (err) {
        console.error('[useCategoryManager] create error:', err)
        return { ok: false, error: err }
      }
      return { ok: true, error: null, data: data?.[0] ?? null }
    },
    [userId]
  )

  // Rename a category (parent or subcategory). Only `name` is editable — the
  // table has no icon/emoji column to edit.
  const renameCategory = useCallback(
    async (id, { name }) => {
      if (!userId) return { ok: false, error: 'no-user' }
      const trimmed = name?.trim()
      if (!trimmed) return { ok: false, error: 'empty-name' }
      const { data, error: err } = await supabase
        .from(TABLE)
        .update({ name: trimmed })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
      if (err) {
        console.error('[useCategoryManager] rename error:', err)
        return { ok: false, error: err }
      }
      return { ok: true, error: null, data: data?.[0] ?? null }
    },
    [userId]
  )

  // Detach every expense/income booked against any of `categoryIds` by nulling
  // its category_id. Returns the first Supabase error (or null) so callers can
  // bail before touching finance_categories.
  const detachOperations = useCallback(
    async (categoryIds) => {
      if (!userId || categoryIds.length === 0) return null
      for (const table of ['expenses', 'income']) {
        const { error: err } = await supabase
          .from(table)
          .update({ category_id: null })
          .in('category_id', categoryIds)
          .eq('user_id', userId)
          .select()
        if (err) {
          console.error(`[useCategoryManager] detach ${table} error:`, err)
          return err
        }
      }
      return null
    },
    [userId]
  )

  // Delete a leaf subcategory: detach its operations, then remove the row.
  const deleteSubcategory = useCallback(
    async (id) => {
      if (!userId) return { ok: false, error: 'no-user' }
      const detachErr = await detachOperations([id])
      if (detachErr) return { ok: false, error: detachErr }
      const { error: err } = await supabase
        .from(TABLE)
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
        .select()
      if (err) {
        console.error('[useCategoryManager] delete subcategory error:', err)
        return { ok: false, error: err }
      }
      return { ok: true, error: null }
    },
    [userId, detachOperations]
  )

  // Delete a parent and its whole branch: detach operations from the parent AND
  // every subcategory, then delete the subcategories first and the parent last
  // (safe whether or not a FK constraint exists).
  const deleteParent = useCallback(
    async ({ parentId, subIds = [] }) => {
      if (!userId) return { ok: false, error: 'no-user' }
      const detachErr = await detachOperations([parentId, ...subIds])
      if (detachErr) return { ok: false, error: detachErr }

      if (subIds.length > 0) {
        const { error: subErr } = await supabase
          .from(TABLE)
          .delete()
          .in('id', subIds)
          .eq('user_id', userId)
          .select()
        if (subErr) {
          console.error('[useCategoryManager] delete subcategories error:', subErr)
          return { ok: false, error: subErr }
        }
      }

      const { error: err } = await supabase
        .from(TABLE)
        .delete()
        .eq('id', parentId)
        .eq('user_id', userId)
        .select()
      if (err) {
        console.error('[useCategoryManager] delete parent error:', err)
        return { ok: false, error: err }
      }
      return { ok: true, error: null }
    },
    [userId, detachOperations]
  )

  return { createCategory, renameCategory, deleteSubcategory, deleteParent }
}
