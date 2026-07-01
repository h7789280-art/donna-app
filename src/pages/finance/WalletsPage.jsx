import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useWallets } from '../../hooks/useWallets'
import WalletCard from '../../components/finance/WalletCard'
import WalletForm from '../../components/finance/WalletForm'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Toast from '../../components/ui/Toast'

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

export default function WalletsPage() {
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
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="font-serif italic text-3xl text-ink">{t('wallets.title')}</h1>
          {wallets.length > 0 && (
            <Button variant="primary" onClick={openCreate}>
              {t('wallets.add_short')}
            </Button>
          )}
        </div>

        {loading && (
          <p className="font-mono text-xs uppercase tracking-caps text-ink-muted">
            {t('common.loading')}
          </p>
        )}

        {!loading && error && (
          <p className="font-sans text-md text-error">{t('common.error_generic')}</p>
        )}

        {!loading && !error && wallets.length === 0 && (
          <Card className="p-8 flex flex-col items-center text-center">
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
          <div className="flex flex-col gap-3">
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
      </div>

      <WalletForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        wallet={editing}
        onCreate={createWallet}
        onUpdate={updateWallet}
        onToast={setToast}
      />

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
