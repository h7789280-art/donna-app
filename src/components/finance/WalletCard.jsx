import { useTranslation } from 'react-i18next'
import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { getCurrency, formatMoney } from '../../lib/currencies'

// Inline line-icons (lucide isn't installed and we don't add packages) — same
// thin-stroke style as the Modal close glyph.
function BanknoteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 12h.01M18 12h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function CardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 9.5h20M6 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20h4L18.5 9.5a2.12 2.12 0 0 0-3-3L5 17v3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M13.5 6.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function WalletCard({ wallet, onEdit, onDelete, onSetDefault }) {
  const { t } = useTranslation()
  const isCard = wallet.type === 'card'
  const TypeIcon = isCard ? CardIcon : BanknoteIcon

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <span className="shrink-0 h-11 w-11 rounded-xl bg-card-alt text-accent flex items-center justify-center">
          <TypeIcon />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-sans text-md font-medium text-ink truncate">{wallet.name}</h3>
            {wallet.is_default && <Badge variant="accent">{t('wallets.default_badge')}</Badge>}
          </div>
          <p className="font-mono text-xs uppercase tracking-caps text-ink-muted mt-1">
            {t(isCard ? 'wallets.type_card' : 'wallets.type_cash')} · {getCurrency(wallet.currency).code}
          </p>
          <p className="font-serif text-3xl text-ink mt-2 leading-none">
            {formatMoney(wallet.balance, wallet.currency)}
          </p>
          {!wallet.is_default && (
            <button
              type="button"
              onClick={() => onSetDefault?.(wallet)}
              className="mt-3 font-mono text-xs uppercase tracking-caps text-accent hover:opacity-70 transition-opacity cursor-pointer"
            >
              {t('wallets.make_default')}
            </button>
          )}
        </div>

        <div className="shrink-0 flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onEdit?.(wallet)}
            aria-label={t('wallets.edit_aria')}
            className="h-8 w-8 inline-flex items-center justify-center rounded-pill text-ink-muted hover:bg-card-alt hover:text-ink transition-colors cursor-pointer"
          >
            <EditIcon />
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(wallet)}
            aria-label={t('wallets.delete_aria')}
            className="h-8 w-8 inline-flex items-center justify-center rounded-pill text-ink-muted hover:bg-error-soft hover:text-error transition-colors cursor-pointer"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </Card>
  )
}
