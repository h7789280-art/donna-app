import { useTranslation } from 'react-i18next'

export default function MorePage() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="max-w-[430px] mx-auto px-gutter pt-10 pb-10">
        <h1 className="font-serif italic text-3xl text-ink mb-3">{t('nav.more')}</h1>
        <p className="font-mono text-xs uppercase tracking-caps text-accent">
          {t('coming_soon')}
        </p>
      </div>
    </div>
  )
}
