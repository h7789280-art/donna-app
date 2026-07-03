import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getCurrency } from '../../lib/currencies'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

// Local YYYY-MM-DD (user's timezone) — the fallback date when none is given.
function todayISO() {
  const d = new Date()
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}

const fieldLabel = 'font-mono text-xs uppercase tracking-caps text-ink-muted'
const inputBase =
  'rounded-xl bg-canvas border px-3 py-2.5 font-sans text-md text-ink outline-none focus:border-accent transition-colors'

// A stable-ish local key for review rows so React keeps inputs focused across
// edits/deletes. new Date()/Math.random() are avoided by the harness in some
// contexts, but this runs in the browser at click time — a counter is enough.
let rowSeq = 0
const nextKey = () => `row-${rowSeq++}`

// Turn a scanned/heard item into an editable review row. category_id is the
// parent, subcategory_id the leaf — we validate both against the user's own tree
// so a hallucinated id degrades to "no category" (highlighted) instead of a
// broken select.
function toRow(item, parentIds, childToParent) {
  const parentId = item?.category_id && parentIds.has(item.category_id) ? item.category_id : ''
  const subId =
    parentId && item?.subcategory_id && childToParent.get(item.subcategory_id) === parentId
      ? item.subcategory_id
      : ''
  return {
    key: nextKey(),
    name: typeof item?.name === 'string' ? item.name : '',
    amount: item?.amount != null ? String(item.amount) : '',
    parentId,
    subId,
  }
}

// Shared editable review overlay for a batch of expense line items, used by BOTH
// the receipt scanner and the voice-expense flow. It owns the row/date/wallet
// state, renders the same list (name + category→subcategory cascade + amount,
// ochre highlight when uncategorized, per-row delete, running total), and saves
// every line as its own expense via a single addExpensesBatch call (one
// balance write). It is mounted only when there are items to review, so the
// useState initializers seed straight from props.
export default function ExpenseReview({
  items,
  initialDate,
  title,
  savedMessage,
  wallets,
  defaultWalletId,
  currency,
  parents,
  children,
  categories,
  addExpensesBatch,
  onClose,
  onSaved,
  onToast,
}) {
  const { t } = useTranslation()

  const expenseParents = useMemo(() => parents('expense'), [parents])
  const parentIds = useMemo(() => new Set(expenseParents.map((c) => c.id)), [expenseParents])
  const childToParent = useMemo(() => {
    const m = new Map()
    for (const c of categories) {
      if (c.parent_id != null) m.set(c.id, c.parent_id)
    }
    return m
  }, [categories])

  const [rows, setRows] = useState(() =>
    (Array.isArray(items) ? items : []).map((it) => toRow(it, parentIds, childToParent))
  )
  const [date, setDate] = useState(initialDate || todayISO())
  const [walletId, setWalletId] = useState(defaultWalletId || '')
  const [saving, setSaving] = useState(false)

  const selectedWallet = wallets.find((w) => w.id === walletId) ?? null
  const currencyCode = selectedWallet?.currency ?? currency ?? ''
  const currencySymbol = currencyCode ? getCurrency(currencyCode).symbol : ''

  const total = useMemo(
    () => rows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0),
    [rows]
  )

  const patchRow = (key, patch) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)))

  const removeRow = (key) => setRows((prev) => prev.filter((r) => r.key !== key))

  const handleSave = async () => {
    if (!selectedWallet) {
      onToast?.({ message: t('finance.tx.need_wallet'), type: 'error' })
      return
    }
    // Build the batch: leaf category is the subcategory when chosen, else the
    // parent; a row with no parent saves as "no category" (category_id null).
    const batch = rows
      .map((r) => {
        const amt = parseFloat(r.amount)
        if (!Number.isFinite(amt) || amt <= 0) return null
        const subCat = r.subId ? children(r.parentId).find((c) => c.id === r.subId) : null
        const parentCat = r.parentId ? expenseParents.find((c) => c.id === r.parentId) : null
        const leaf = subCat ?? parentCat
        return {
          amount: amt,
          categoryId: leaf?.id ?? null,
          categoryName: leaf?.name ?? r.name?.trim() ?? null,
          description: r.name,
        }
      })
      .filter(Boolean)

    if (batch.length === 0) {
      onToast?.({ message: t('finance.tx.invalid_amount'), type: 'error' })
      return
    }

    setSaving(true)
    const res = await addExpensesBatch({
      walletId: selectedWallet.id,
      currency: currencyCode,
      date,
      items: batch,
    })
    setSaving(false)

    if (res?.ok) {
      onToast?.({ message: savedMessage || t('finance.receipt.saved'), type: 'success' })
      onSaved?.()
    } else if (res?.balanceStale) {
      onToast?.({ message: t('finance.tx.balance_error'), type: 'error' })
    } else {
      onToast?.({ message: t('finance.receipt.save_error'), type: 'error' })
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-canvas text-ink">
      <div className="max-w-[430px] mx-auto px-gutter pt-10 pb-32">
        <h1 className="font-serif italic text-3xl text-ink mb-6">
          {title || t('finance.receipt.review_title')}
        </h1>

        {/* Batch-wide fields: date + wallet */}
        <div className="flex flex-col gap-4 mb-6">
          <label className="flex flex-col gap-1.5">
            <span className={fieldLabel}>{t('finance.tx.date')}</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`${inputBase} border-line`}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={fieldLabel}>{t('finance.tx.wallet')}</span>
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className={`${inputBase} border-line cursor-pointer`}
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {getCurrency(w.currency).symbol} {w.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <span className={`${fieldLabel} block mb-2`}>{t('finance.receipt.items')}</span>

        {/* Line items */}
        <div className="flex flex-col gap-3">
          {rows.map((r) => {
            const subList = r.parentId ? children(r.parentId) : []
            const uncategorized = !r.parentId
            return (
              <Card
                key={r.key}
                className={`p-3 flex flex-col gap-2.5 ${uncategorized ? 'border-warning' : ''}`}
              >
                {/* name + delete */}
                <div className="flex items-center gap-2">
                  <input
                    value={r.name}
                    onChange={(e) => patchRow(r.key, { name: e.target.value })}
                    placeholder={t('finance.receipt.item_name')}
                    className={`${inputBase} border-line flex-1 min-w-0`}
                  />
                  <button
                    type="button"
                    onClick={() => removeRow(r.key)}
                    aria-label={t('finance.receipt.remove_item')}
                    className="shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-pill text-ink-muted hover:bg-card-alt hover:text-error transition-colors cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 4h10M6.5 4V3h3v1M5 4l.5 8h5L11 4"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>

                {/* category + subcategory */}
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={r.parentId}
                    onChange={(e) => patchRow(r.key, { parentId: e.target.value, subId: '' })}
                    className={`${inputBase} cursor-pointer ${
                      uncategorized ? 'border-warning text-warning' : 'border-line'
                    }`}
                  >
                    <option value="">{t('finance.receipt.no_category')}</option>
                    {expenseParents.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={r.subId}
                    onChange={(e) => patchRow(r.key, { subId: e.target.value })}
                    disabled={subList.length === 0}
                    className={`${inputBase} border-line cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    <option value="">{t('finance.tx.subcategory_none')}</option>
                    {subList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* amount + uncategorized hint */}
                <div className="flex items-center gap-2">
                  {uncategorized && (
                    <span className="font-mono text-xs uppercase tracking-caps text-warning flex items-center gap-1">
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path
                          d="M8 2l6 11H2L8 2zM8 6.5v3M8 11.2v.1"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {t('finance.receipt.pick_category')}
                    </span>
                  )}
                  <div className="relative ml-auto w-32">
                    <input
                      value={r.amount}
                      onChange={(e) => patchRow(r.key, { amount: e.target.value })}
                      inputMode="decimal"
                      placeholder="0"
                      className={`${inputBase} border-line w-full pr-8 text-right`}
                    />
                    {currencySymbol && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-sans text-sm text-ink-muted pointer-events-none">
                        {currencySymbol}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}

          {rows.length === 0 && (
            <p className="font-sans text-md text-ink-soft py-4 text-center">
              {t('finance.receipt.all_removed')}
            </p>
          )}
        </div>

        {/* Total */}
        <div className="flex items-baseline justify-between mt-6 pt-4 border-t border-line">
          <span className={fieldLabel}>{t('finance.receipt.total')}</span>
          <span className="font-serif italic text-2xl text-ink">
            {total.toLocaleString(undefined, { maximumFractionDigits: 2 })} {currencySymbol}
          </span>
        </div>
      </div>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-10 bg-canvas/95 backdrop-blur border-t border-line">
        <div className="max-w-[430px] mx-auto px-gutter py-3 flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleSave}
            disabled={saving || rows.length === 0}
          >
            {saving ? t('common.loading') : t('common.save')}
          </Button>
        </div>
      </div>
    </div>
  )
}
