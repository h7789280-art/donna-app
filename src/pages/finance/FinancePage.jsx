import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useWallets } from '../../hooks/useWallets'
import WalletCard from '../../components/finance/WalletCard'
import WalletForm from '../../components/finance/WalletForm'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Toast from '../../components/ui/Toast'

// Finance hub. Wallets with live balances sit at the very top (full CRUD +
// "make default" inline via useWallets — same behaviour that used to live on
// WalletsPage). Below them: the section cards for add / history / report /
// categories. The standalone "Wallets" link card is gone — it's all here now.
function WalletGlyph() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="3" y="7" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 12.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16.5" cy="12.5" r="1.2" fill="currentColor" />
    </svg>
  )
}

function PlusGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function HistoryGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12a8 8 0 1 0 2.3-5.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 4v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8v4l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ReportGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3a9 9 0 1 0 9 9h-9V3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14 3.5a7.5 7.5 0 0 1 6.5 6.5H14V3.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function CategoriesGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function FinancePage() {
  const { t } = useTranslation()
  const { wallets, loading, error, createWallet, updateWallet, deleteWallet, setDefault } =
    useWallets()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null) // wallet | null (create)
  const [pendingDelete, setPendingDelete] = useState(null) // wallet awaiting confirm
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState(null)

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (wallet) => {
    setEditing(wallet)
    setFormOpen(true)
  }

  const handleSetDefault = async (wallet) => {
    const res = await setDefault(wallet.id)
    if (res?.ok) setToast({ message: t('wallets.default_set'), type: 'success' })
    else setToast({ message: t('wallets.save_error'), type: 'error' })
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    const res = await deleteWallet(pendingDelete.id)
    setDeleting(false)
    if (res?.ok) setToast({ message: t('wallets.deleted'), type: 'success' })
    else setToast({ message: t('wallets.save_error'), type: 'error' })
    setPendingDelete(null)
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="max-w-[430px] mx-auto px-gutter pt-10 pb-24">
        {/* Header + calm secondary "add wallet" action */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="font-serif italic text-3xl text-ink">{t('nav.finance')}</h1>
          <Button variant="secondary" onClick={openCreate}>
            {t('wallets.add_short')}
          </Button>
        </div>

        {/* Wallets with live balances */}
        {loading && (
          <p className="font-mono text-xs uppercase tracking-caps text-ink-muted mb-6">
            {t('common.loading')}
          </p>
        )}

        {!loading && error && (
          <p className="font-sans text-md text-error mb-6">{t('common.error_generic')}</p>
        )}

        {!loading && !error && wallets.length === 0 && (
          <Card className="p-8 flex flex-col items-center text-center mb-6">
            <span className="h-16 w-16 rounded-2xl bg-card-alt text-accent flex items-center justify-center mb-4">
              <WalletGlyph />
            </span>
            <h2 className="font-serif italic text-xl text-ink mb-1">{t('wallets.empty_title')}</h2>
            <p className="font-sans text-md text-ink-soft mb-6">{t('wallets.empty_subtitle')}</p>
            <Button variant="primary" onClick={openCreate}>
              {t('wallets.empty_cta')}
            </Button>
          </Card>
        )}

        {!loading && !error && wallets.length > 0 && (
          <div className="flex flex-col gap-3 mb-8">
            {wallets.map((wallet) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                onEdit={openEdit}
                onDelete={setPendingDelete}
                onSetDefault={handleSetDefault}
              />
            ))}
          </div>
        )}

        {/* Section cards */}
        <Link to="/finance/add" className="block mb-3">
          <Card className="p-4 flex items-center gap-3 bg-accent! text-accent-ink border-transparent hover:opacity-90 transition-opacity cursor-pointer">
            <span className="shrink-0 h-11 w-11 rounded-xl bg-accent-ink/15 flex items-center justify-center">
              <PlusGlyph />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-sans text-md font-medium">{t('finance.tx.hub_title')}</h2>
              <p className="font-sans text-sm opacity-80">{t('finance.tx.hub_subtitle')}</p>
            </div>
            <span className="shrink-0 opacity-70">
              <ChevronIcon />
            </span>
          </Card>
        </Link>

        <Link to="/finance/history" className="block mb-3">
          <Card className="p-4 flex items-center gap-3 hover:bg-card-alt transition-colors cursor-pointer">
            <span className="shrink-0 h-11 w-11 rounded-xl bg-card-alt text-accent flex items-center justify-center">
              <HistoryGlyph />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-sans text-md font-medium text-ink">{t('finance.history.hub_history_title')}</h2>
              <p className="font-sans text-sm text-ink-soft">{t('finance.history.hub_history_subtitle')}</p>
            </div>
            <span className="shrink-0 text-ink-muted">
              <ChevronIcon />
            </span>
          </Card>
        </Link>

        <Link to="/finance/report" className="block mb-3">
          <Card className="p-4 flex items-center gap-3 hover:bg-card-alt transition-colors cursor-pointer">
            <span className="shrink-0 h-11 w-11 rounded-xl bg-card-alt text-accent flex items-center justify-center">
              <ReportGlyph />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-sans text-md font-medium text-ink">{t('finance.report.hub_report_title')}</h2>
              <p className="font-sans text-sm text-ink-soft">{t('finance.report.hub_report_subtitle')}</p>
            </div>
            <span className="shrink-0 text-ink-muted">
              <ChevronIcon />
            </span>
          </Card>
        </Link>

        <Link to="/finance/categories" className="block">
          <Card className="p-4 flex items-center gap-3 hover:bg-card-alt transition-colors cursor-pointer">
            <span className="shrink-0 h-11 w-11 rounded-xl bg-card-alt text-accent flex items-center justify-center">
              <CategoriesGlyph />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-sans text-md font-medium text-ink">{t('finance.categories.hub_categories_title')}</h2>
              <p className="font-sans text-sm text-ink-soft">{t('finance.categories.hub_categories_subtitle')}</p>
            </div>
            <span className="shrink-0 text-ink-muted">
              <ChevronIcon />
            </span>
          </Card>
        </Link>
      </div>

      {/* Wallet create / edit form (same component as WalletsPage) */}
      <WalletForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        wallet={editing}
        onCreate={createWallet}
        onUpdate={updateWallet}
        onToast={setToast}
      />

      {/* Delete confirmation */}
      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => (deleting ? null : setPendingDelete(null))}
        title={t('wallets.delete_title')}
      >
        <p className="font-sans text-md text-ink-soft mb-6">
          {t('wallets.delete_body', { name: pendingDelete?.name ?? '' })}
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setPendingDelete(null)}
            disabled={deleting}
          >
            {t('common.cancel')}
          </Button>
          <Button variant="primary" className="flex-1" onClick={confirmDelete} disabled={deleting}>
            {t('common.delete')}
          </Button>
        </div>
      </Modal>

      <Toast message={toast?.message} type={toast?.type} onDone={() => setToast(null)} />
    </div>
  )
}
