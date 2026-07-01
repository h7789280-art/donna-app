import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { CURRENCIES, DEFAULT_CURRENCY } from '../../lib/currencies'

const TYPES = ['cash', 'card']

// Create / edit a wallet inside a Modal. No <form> — plain onClick handlers, per
// project convention (see PinPad/PinEnter). Pass `wallet` to enter edit mode.
// The onCreate/onUpdate props are the useWallets mutations; onToast surfaces
// success/error feedback on the parent screen.
export default function WalletForm({ open, onClose, wallet, onCreate, onUpdate, onToast }) {
  const { t } = useTranslation()
  const isEdit = Boolean(wallet)

  const [name, setName] = useState('')
  const [type, setType] = useState('cash')
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY)
  const [balance, setBalance] = useState('')
  const [makeDefault, setMakeDefault] = useState(false)
  const [nameError, setNameError] = useState(false)
  const [saving, setSaving] = useState(false)

  // Re-seed the fields every time the modal opens (blank for create, filled for
  // edit). Locking the default checkbox on when editing the current default so
  // you can't silently orphan the account's default wallet.
  useEffect(() => {
    if (!open) return
    setName(wallet?.name ?? '')
    setType(wallet?.type === 'card' ? 'card' : 'cash')
    setCurrency(wallet?.currency ?? DEFAULT_CURRENCY)
    setBalance(wallet?.balance != null ? String(wallet.balance) : '')
    setMakeDefault(Boolean(wallet?.is_default))
    setNameError(false)
    setSaving(false)
  }, [open, wallet])

  const lockDefault = isEdit && Boolean(wallet?.is_default)

  const handleSave = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setNameError(true)
      return
    }
    const numericBalance = balance.trim() === '' ? 0 : Number(balance)
    if (Number.isNaN(numericBalance)) {
      onToast?.({ message: t('wallets.balance_invalid'), type: 'error' })
      return
    }

    setSaving(true)
    const payload = {
      name: trimmed,
      type,
      currency,
      balance: numericBalance,
      is_default: makeDefault,
    }
    const res = isEdit ? await onUpdate(wallet.id, payload) : await onCreate(payload)
    setSaving(false)

    if (res?.ok) {
      onToast?.({
        message: isEdit ? t('wallets.saved_edit') : t('wallets.saved_create'),
        type: 'success',
      })
      onClose?.()
    } else {
      onToast?.({ message: t('wallets.save_error'), type: 'error' })
    }
  }

  const fieldLabel = 'font-mono text-xs uppercase tracking-caps text-ink-muted'
  const inputBase =
    'rounded-xl bg-canvas border px-3 py-2.5 font-sans text-md text-ink outline-none focus:border-accent transition-colors'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t('wallets.edit_title') : t('wallets.add_title')}
    >
      <div className="flex flex-col gap-4">
        {/* Name */}
        <label className="flex flex-col gap-1.5">
          <span className={fieldLabel}>{t('wallets.name_label')}</span>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (nameError) setNameError(false)
            }}
            placeholder={t('wallets.name_placeholder')}
            className={`${inputBase} ${nameError ? 'border-error' : 'border-line'}`}
          />
          {nameError && (
            <span className="font-sans text-sm text-error">{t('wallets.name_required')}</span>
          )}
        </label>

        {/* Type toggle */}
        <div className="flex flex-col gap-1.5">
          <span className={fieldLabel}>{t('wallets.type_label')}</span>
          <div className="grid grid-cols-2 gap-2">
            {TYPES.map((ty) => (
              <button
                key={ty}
                type="button"
                onClick={() => setType(ty)}
                className={`rounded-xl border px-3 py-2.5 font-sans text-md transition-colors cursor-pointer ${
                  type === ty
                    ? 'bg-accent text-accent-ink border-transparent'
                    : 'bg-card text-ink border-line hover:bg-card-alt'
                }`}
              >
                {t(ty === 'card' ? 'wallets.type_card' : 'wallets.type_cash')}
              </button>
            ))}
          </div>
        </div>

        {/* Currency */}
        <label className="flex flex-col gap-1.5">
          <span className={fieldLabel}>{t('wallets.currency_label')}</span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className={`${inputBase} border-line cursor-pointer`}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} {c.code} · {t(c.nameKey)}
              </option>
            ))}
          </select>
        </label>

        {/* Starting balance */}
        <label className="flex flex-col gap-1.5">
          <span className={fieldLabel}>{t('wallets.balance_label')}</span>
          <input
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            inputMode="decimal"
            placeholder="0"
            className={`${inputBase} border-line`}
          />
        </label>

        {/* Make default */}
        <label className={`flex items-center gap-3 ${lockDefault ? 'opacity-60' : 'cursor-pointer'}`}>
          <input
            type="checkbox"
            checked={makeDefault}
            disabled={lockDefault}
            onChange={(e) => setMakeDefault(e.target.checked)}
            className="h-4 w-4 accent-accent cursor-pointer disabled:cursor-not-allowed"
          />
          <span className="font-sans text-md text-ink">
            {lockDefault ? t('wallets.make_default_locked') : t('wallets.make_default_field')}
          </span>
        </label>

        <div className="flex gap-2 pt-1">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" className="flex-1" onClick={handleSave} disabled={saving}>
            {t('common.save')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
