import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTransactions } from '../../hooks/useTransactions'
import { getCurrency } from '../../lib/currencies'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Toast from '../../components/ui/Toast'
import TransactionRow from '../../components/finance/TransactionRow'

// Unified operations feed (expenses + income). Read + delete only — entry lives
// in AddTransactionPage. Deleting rolls the wallet balance back (variant A);
// wallet cards re-read their balances when the user next opens /finance/wallets.
export default function HistoryPage() {
  const { t, i18n } = useTranslation()
  const { transactions, listLoading, listTransactions, deleteTransaction } = useTransactions()

  const [pending, setPending] = useState(null) // the tx awaiting delete confirmation
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    listTransactions({ limit: 50 })
  }, [listTransactions])

  const handleConfirmDelete = async () => {
    if (!pending) return
    setDeleting(true)
    const res = await deleteTransaction({
      id: pending.id,
      kind: pending.kind,
      walletId: pending.wallet_id,
      amount: pending.amount,
    })
    setDeleting(false)
    setPending(null)

    if (res?.ok) {
      setToast({ message: t('finance.history.deleted'), type: 'success' })
      await listTransactions({ limit: 50 })
    } else if (res?.balanceStale) {
      setToast({ message: t('finance.tx.balance_error'), type: 'error' })
      await listTransactions({ limit: 50 })
    } else {
      setToast({ message: t('finance.history.delete_error'), type: 'error' })
    }
  }

  const pendingAmount = pending
    ? `${Number(pending.amount) || 0} ${getCurrency(pending.currency).symbol}`
    : ''

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="max-w-[430px] mx-auto px-gutter pt-10 pb-24">
        <h1 className="font-serif italic text-3xl text-ink mb-6">{t('finance.history.title')}</h1>

        {listLoading && (
          <p className="font-mono text-xs uppercase tracking-caps text-ink-muted">
            {t('common.loading')}
          </p>
        )}

        {!listLoading && transactions.length === 0 && (
          <Card className="p-8 flex flex-col items-center text-center">
            <h2 className="font-serif italic text-xl text-ink mb-1">{t('finance.history.empty')}</h2>
            <p className="font-sans text-md text-ink-soft mb-6">{t('finance.history.empty_hint')}</p>
            <Link to="/finance/add">
              <Button variant="primary">{t('finance.tx.hub_title')}</Button>
            </Link>
          </Card>
        )}

        {!listLoading && transactions.length > 0 && (
          <Card className="px-4 py-1 divide-y divide-line">
            {transactions.map((tx) => (
              <TransactionRow key={`${tx.kind}-${tx.id}`} tx={tx} onDelete={setPending} />
            ))}
          </Card>
        )}
      </div>

      <Modal
        open={Boolean(pending)}
        onClose={() => (deleting ? null : setPending(null))}
        title={t('finance.history.delete_confirm_title')}
      >
        <p className="font-sans text-md text-ink-soft mb-5">
          {t('finance.history.delete_confirm_text', {
            amount: pendingAmount,
            category: pending?.category || t('finance.history.no_category'),
          })}
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setPending(null)}
            disabled={deleting}
          >
            {t('finance.history.cancel')}
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleConfirmDelete}
            disabled={deleting}
          >
            {deleting ? t('common.loading') : t('finance.history.delete')}
          </Button>
        </div>
      </Modal>

      <Toast message={toast?.message} type={toast?.type} onDone={() => setToast(null)} />
    </div>
  )
}
