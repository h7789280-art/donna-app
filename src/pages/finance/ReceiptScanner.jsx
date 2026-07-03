import { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { scanReceipt } from '../../lib/gemini'
import { compressImageToBase64 } from '../../lib/imageCompress'
import { getCurrency } from '../../lib/currencies'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

// Local YYYY-MM-DD (user's timezone) — used when the receipt has no date.
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

// Turn a scanned item into an editable review row. category_id is the parent,
// subcategory_id the leaf — we validate both against the user's own tree so a
// hallucinated id degrades to "no category" (which gets highlighted) instead of
// a broken select.
function toRow(item, parentIds, childIds) {
  const parentId = item?.category_id && parentIds.has(item.category_id) ? item.category_id : ''
  const subId =
    parentId && item?.subcategory_id && childIds.get(item.subcategory_id) === parentId
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

// Full receipt-scan flow: a "scan" button that opens the camera/gallery, then
// compresses → sends to scan-receipt → shows an editable review → saves every
// line as its own expense with a single wallet-balance write. It DOES NOT touch
// the manual form; it only calls back onSaved() so the page can refresh.
export default function ReceiptScanner({
  categories,
  parents,
  children,
  wallets,
  defaultWalletId,
  currency,
  addExpensesBatch,
  onSaved,
  onToast,
}) {
  const { t, i18n } = useTranslation()
  const fileRef = useRef(null)

  const [status, setStatus] = useState('idle') // idle | loading | error | review
  const [errorMsg, setErrorMsg] = useState('')
  const [date, setDate] = useState(todayISO)
  const [walletId, setWalletId] = useState(defaultWalletId || '')
  const [rows, setRows] = useState([])
  const [saving, setSaving] = useState(false)

  const expenseParents = useMemo(() => parents('expense'), [parents])
  // Fast lookups for validating scanned category ids against the real tree.
  const parentIds = useMemo(
    () => new Set(expenseParents.map((c) => c.id)),
    [expenseParents]
  )
  const childToParent = useMemo(() => {
    const m = new Map()
    for (const c of categories) {
      if (c.parent_id != null) m.set(c.id, c.parent_id)
    }
    return m
  }, [categories])

  const selectedWallet = wallets.find((w) => w.id === walletId) ?? null
  const currencyCode = selectedWallet?.currency ?? currency ?? ''
  const currencySymbol = currencyCode ? getCurrency(currencyCode).symbol : ''

  const total = useMemo(
    () => rows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0),
    [rows]
  )

  const openPicker = () => {
    setErrorMsg('')
    fileRef.current?.click()
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    // Reset the input so picking the same file again re-fires onChange.
    e.target.value = ''
    if (!file) return

    setStatus('loading')
    setErrorMsg('')
    try {
      const { base64, mimeType } = await compressImageToBase64(file)
      const result = await scanReceipt({
        image: base64,
        mimeType,
        categories,
        language: i18n.language,
      })

      const items = Array.isArray(result?.items) ? result.items : []
      if (items.length === 0) {
        setStatus('error')
        setErrorMsg(t('finance.receipt.empty_items'))
        return
      }

      setDate(result?.date || todayISO())
      setWalletId((prev) => (prev && wallets.some((w) => w.id === prev) ? prev : defaultWalletId || ''))
      setRows(items.map((it) => toRow(it, parentIds, childToParent)))
      setStatus('review')
    } catch (err) {
      // Server messages (e.g. "receipt too long") are already human-readable —
      // show them as-is; fall back to a soft generic line otherwise.
      setStatus('error')
      setErrorMsg(err?.message || t('finance.receipt.error_generic'))
    }
  }

  const patchRow = (key, patch) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)))

  const removeRow = (key) => setRows((prev) => prev.filter((r) => r.key !== key))

  const closeReview = () => {
    setStatus('idle')
    setRows([])
    setErrorMsg('')
  }

  const handleSave = async () => {
    if (!selectedWallet) {
      onToast?.({ message: t('finance.tx.need_wallet'), type: 'error' })
      return
    }
    // Build the batch: leaf category is the subcategory when chosen, else the
    // parent; a row with no parent saves as "no category" (category_id null).
    const items = rows
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

    if (items.length === 0) {
      onToast?.({ message: t('finance.tx.invalid_amount'), type: 'error' })
      return
    }

    setSaving(true)
    const res = await addExpensesBatch({
      walletId: selectedWallet.id,
      currency: currencyCode,
      date,
      items,
    })
    setSaving(false)

    if (res?.ok) {
      onToast?.({ message: t('finance.receipt.saved'), type: 'success' })
      closeReview()
      onSaved?.()
    } else if (res?.balanceStale) {
      onToast?.({ message: t('finance.tx.balance_error'), type: 'error' })
    } else {
      onToast?.({ message: t('finance.receipt.save_error'), type: 'error' })
    }
  }

  return (
    <>
      {/* Scan button — sits alongside the manual form */}
      <button
        type="button"
        onClick={openPicker}
        disabled={status === 'loading'}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-accent/50 bg-card px-3 py-3 font-sans text-md text-accent transition-colors hover:bg-card-alt disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 8V6a2 2 0 0 1 2-2h1.5l1-1.5h5l1 1.5H18a2 2 0 0 1 2 2v2M4 8v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M4 8h16"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        {status === 'loading' ? t('finance.receipt.reading') : t('finance.receipt.scan')}
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />

      {/* Inline error under the button (before the review opens) */}
      {status === 'error' && (
        <Card className="p-4 flex flex-col gap-3 border-error/40">
          <p className="font-sans text-md text-ink">{errorMsg}</p>
          <Button variant="secondary" onClick={openPicker} className="self-start">
            {t('finance.receipt.retry')}
          </Button>
        </Card>
      )}

      {/* Loading veil while Donna reads the receipt */}
      {status === 'loading' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-gutter">
          <div className="absolute inset-0 bg-ink/40" aria-hidden="true" />
          <div className="relative w-full max-w-[430px] bg-card border border-line rounded-2xl shadow-card p-8 flex flex-col items-center text-center">
            <span className="h-9 w-9 rounded-full border-2 border-line border-t-accent animate-spin mb-4" />
            <p className="font-serif italic text-xl text-ink">{t('finance.receipt.reading')}</p>
          </div>
        </div>
      )}

      {/* Full editable review overlay */}
      {status === 'review' && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-canvas text-ink">
          <div className="max-w-[430px] mx-auto px-gutter pt-10 pb-32">
            <h1 className="font-serif italic text-3xl text-ink mb-6">
              {t('finance.receipt.review_title')}
            </h1>

            {/* Receipt-wide fields: date + wallet */}
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
              <Button
                variant="secondary"
                className="flex-1"
                onClick={closeReview}
                disabled={saving}
              >
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
      )}
    </>
  )
}
