import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'

// Minimal finance hub. For now it only links to Wallets — the full finance
// dashboard (expenses, income, reports) lands in later tasks.
function WalletGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="3" y="7" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 12.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16.5" cy="12.5" r="1.2" fill="currentColor" />
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
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="max-w-[430px] mx-auto px-gutter pt-10 pb-24">
        <h1 className="font-serif italic text-3xl text-ink mb-6">{t('nav.finance')}</h1>

        <Link to="/finance/wallets" className="block">
          <Card className="p-4 flex items-center gap-3 hover:bg-card-alt transition-colors cursor-pointer">
            <span className="shrink-0 h-11 w-11 rounded-xl bg-card-alt text-accent flex items-center justify-center">
              <WalletGlyph />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-sans text-md font-medium text-ink">{t('wallets.title')}</h2>
              <p className="font-sans text-sm text-ink-soft">{t('wallets.hub_subtitle')}</p>
            </div>
            <span className="shrink-0 text-ink-muted">
              <ChevronIcon />
            </span>
          </Card>
        </Link>
      </div>
    </div>
  )
}
