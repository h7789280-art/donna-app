import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

// Create / rename a finance category inside a Modal. Name is the only editable
// field (the table has no icon/emoji column). No <form> — plain onClick, per
// project convention (see WalletForm/PinPad). `onSubmit(name)` runs the actual
// mutation and returns { ok }. `title` sets the modal heading so the same form
// serves "add parent", "add subcategory" and "edit".
export default function CategoryForm({ open, onClose, title, initialName = '', onSubmit, onToast }) {
  const { t } = useTranslation()

  const [name, setName] = useState('')
  const [nameError, setNameError] = useState(false)
  const [saving, setSaving] = useState(false)

  // Re-seed the field every time the modal opens.
  useEffect(() => {
    if (!open) return
    setName(initialName ?? '')
    setNameError(false)
    setSaving(false)
  }, [open, initialName])

  const handleSave = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setNameError(true)
      return
    }
    setSaving(true)
    const res = await onSubmit(trimmed)
    setSaving(false)
    if (res?.ok) {
      onClose?.()
    } else {
      onToast?.({ message: t('common.error_generic'), type: 'error' })
    }
  }

  const fieldLabel = 'font-mono text-xs uppercase tracking-caps text-ink-muted'
  const inputBase =
    'rounded-xl bg-canvas border px-3 py-2.5 font-sans text-md text-ink outline-none focus:border-accent transition-colors'

  return (
    <Modal open={open} onClose={saving ? undefined : onClose} title={title}>
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className={fieldLabel}>{t('finance.categories.name')}</span>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (nameError) setNameError(false)
            }}
            autoFocus
            placeholder={t('finance.categories.name_placeholder')}
            className={`${inputBase} ${nameError ? 'border-error' : 'border-line'}`}
          />
        </label>

        <div className="flex gap-2 pt-1">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={saving}>
            {t('finance.categories.cancel')}
          </Button>
          <Button variant="primary" className="flex-1" onClick={handleSave} disabled={saving}>
            {saving ? t('common.loading') : t('finance.categories.save')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
