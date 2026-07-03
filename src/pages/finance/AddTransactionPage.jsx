import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useWallets } from '../../hooks/useWallets'
import { useFinanceCategories } from '../../hooks/useFinanceCategories'
import { useTransactions } from '../../hooks/useTransactions'
import { getCurrency } from '../../lib/currencies'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Toast from '../../components/ui/Toast'
import ReceiptScanner from './ReceiptScanner'

// Local YYYY-MM-DD for the date input's default (today, in the user's timezone).
function todayISO() {
  const d = new Date()
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}

const fieldLabel = 'font-mono text-xs uppercase tracking-caps text-ink-muted'
const inputBase =
  'rounded-xl bg-canvas border px-3 py-2.5 font-sans text-md text-ink outline-none focus:border-accent transition-colors'

export default function AddTransactionPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { wallets, loading: walletsLoading } = useWallets()
  const { categories, parents, children, loading: catsLoading } = useFinanceCategories()
  const { addTransaction, addExpensesBatch } = useTransactions()

  const [kind, setKind] = useState('expense') // 'expense' | 'income'
  const [walletId, setWalletId] = useState('')
  const [parentId, setParentId] = useState('')
  const [subId, setSubId] = useState('')
  const [amount, setAmount] = useState('')
  const [amountError, setAmountError] = useState(false)
  const [date, setDate] = useState(todayISO)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  // Default to the primary wallet (or the first one) once wallets arrive.
  useEffect(() => {
    if (walletsLoading || wallets.length === 0) return
    setWalletId((prev) => {
      if (prev && wallets.some((w) => w.id === prev)) return prev
      const def = wallets.find((w) => w.is_default) ?? wallets[0]
      return def.id
    })
  }, [wallets, walletsLoading])

  const parentList = useMemo(() => parents(kind), [parents, kind])
  const subList = useMemo(
    () => (parentId ? children(parentId) : []),
    [children, parentId]
  )

  // Reset the category picker whenever the type flips or the parent set changes.
  useEffect(() => {
    setParentId(parentList[0]?.id ?? '')
    setSubId('')
  }, [parentList])

  // Clear a stale subcategory choice when the parent changes.
  useEffect(() => {
    setSubId('')
  }, [parentId])

  const selectedWallet = wallets.find((w) => w.id === walletId) ?? null
  const currencyCode = selectedWallet?.currency ?? ''
  const currencySymbol = currencyCode ? getCurrency(currencyCode).symbol : ''

  const handleSave = async () => {
    const numeric = parseFloat(amount)
    if (!Number.isFinite(numeric) || numeric <= 0) {
      setAmountError(true)
      setToast({ message: t('finance.tx.invalid_amount'), type: 'error' })
      return
    }
    if (!selectedWallet) {
      setToast({ message: t('finance.tx.need_wallet'), type: 'error' })
      return
    }

    // Leaf category is the subcategory if picked, otherwise the parent itself.
    const parentCat = parentList.find((c) => c.id === parentId) ?? null
    const subCat = subList.find((c) => c.id === subId) ?? null
    const leaf = subCat ?? parentCat

    setSaving(true)
    const res = await addTransaction({
      kind,
      walletId: selectedWallet.id,
      amount,
      categoryId: leaf?.id ?? null,
      categoryName: leaf?.name ?? null,
      description: note,
      date,
      currency: currencyCode,
    })
    setSaving(false)

    if (res?.ok) {
      setToast({ message: t('finance.tx.saved'), type: 'success' })
      setTimeout(() => navigate('/finance'), 600)
    } else if (res?.balanceStale) {
      setToast({ message: t('finance.tx.balance_error'), type: 'error' })
    } else {
      setToast({ message: t('finance.tx.error'), type: 'error' })
    }
  }

  const noWallets = !walletsLoading && wallets.length === 0

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="max-w-[430px] mx-auto px-gutter pt-10 pb-24">
        <h1 className="font-serif italic text-3xl text-ink mb-6">{t('finance.tx.title')}</h1>

        {walletsLoading && (
          <p className="font-mono text-xs uppercase tracking-caps text-ink-muted">
            {t('common.loading')}
          </p>
        )}

        {noWallets && (
          <Card className="p-8 flex flex-col items-center text-center">
            <h2 className="font-serif italic text-xl text-ink mb-1">{t('finance.tx.no_wallets')}</h2>
            <p className="font-sans text-md text-ink-soft mb-6">{t('finance.tx.need_wallet')}</p>
            <Link to="/finance/wallets">
              <Button variant="primary">{t('finance.tx.go_wallets')}</Button>
            </Link>
          </Card>
        )}

        {!walletsLoading && !noWallets && (
          <div className="flex flex-col gap-4">
            {/* Type toggle */}
            <div className="flex flex-col gap-1.5">
              <span className={fieldLabel}>{t('finance.tx.type')}</span>
              <div className="grid grid-cols-2 gap-2">
                {['expense', 'income'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKind(k)}
                    className={`rounded-xl border px-3 py-2.5 font-sans text-md transition-colors cursor-pointer ${
                      kind === k
                        ? 'bg-accent text-accent-ink border-transparent'
                        : 'bg-card text-ink border-line hover:bg-card-alt'
                    }`}
                  >
                    {t(k === 'income' ? 'finance.tx.type_income' : 'finance.tx.type_expense')}
                  </button>
                ))}
              </div>
            </div>

            {/* Receipt scan — expenses only; complements the manual form below */}
            {kind === 'expense' && (
              <ReceiptScanner
                categories={categories}
                parents={parents}
                children={children}
                wallets={wallets}
                defaultWalletId={walletId}
                currency={currencyCode}
                addExpensesBatch={addExpensesBatch}
                onToast={setToast}
                onSaved={() => setTimeout(() => navigate('/finance'), 600)}
              />
            )}

            {/* Wallet */}
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

            {/* Category */}
            <label className="flex flex-col gap-1.5">
              <span className={fieldLabel}>{t('finance.tx.category')}</span>
              {catsLoading ? (
                <span className="font-sans text-sm text-ink-muted py-2.5">{t('common.loading')}</span>
              ) : parentList.length === 0 ? (
                <span className="font-sans text-sm text-ink-muted py-2.5">
                  {t('finance.tx.no_categories')}
                </span>
              ) : (
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className={`${inputBase} border-line cursor-pointer`}
                >
                  {parentList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </label>

            {/* Subcategory (only when the chosen parent has children) */}
            {subList.length > 0 && (
              <label className="flex flex-col gap-1.5">
                <span className={fieldLabel}>{t('finance.tx.subcategory')}</span>
                <select
                  value={subId}
                  onChange={(e) => setSubId(e.target.value)}
                  className={`${inputBase} border-line cursor-pointer`}
                >
                  <option value="">{t('finance.tx.subcategory_none')}</option>
                  {subList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {/* Amount */}
            <label className="flex flex-col gap-1.5">
              <span className={fieldLabel}>{t('finance.tx.amount')}</span>
              <div className="relative">
                <input
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value)
                    if (amountError) setAmountError(false)
                  }}
                  inputMode="decimal"
                  placeholder="0"
                  className={`${inputBase} w-full pr-10 ${amountError ? 'border-error' : 'border-line'}`}
                />
                {currencySymbol && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-sans text-md text-ink-muted pointer-events-none">
                    {currencySymbol}
                  </span>
                )}
              </div>
            </label>

            {/* Date */}
            <label className="flex flex-col gap-1.5">
              <span className={fieldLabel}>{t('finance.tx.date')}</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`${inputBase} border-line`}
              />
            </label>

            {/* Note */}
            <label className="flex flex-col gap-1.5">
              <span className={fieldLabel}>{t('finance.tx.note')}</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder={t('finance.tx.note_placeholder')}
                className={`${inputBase} border-line resize-none`}
              />
            </label>

            <div className="flex gap-2 pt-1">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => navigate('/finance')}
                disabled={saving}
              >
                {t('common.cancel')}
              </Button>
              <Button variant="primary" className="flex-1" onClick={handleSave} disabled={saving}>
                {saving ? t('common.loading') : t('finance.tx.save')}
              </Button>
            </div>
          </div>
        )}
      </div>

      <Toast message={toast?.message} type={toast?.type} onDone={() => setToast(null)} />
    </div>
  )
}
