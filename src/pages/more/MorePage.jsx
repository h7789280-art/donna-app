import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import { MORE_GROUPS } from './catalog'

// "More" tab — level 1: a showcase grid of the 7 module groups.
// Tapping a group navigates to /more/:groupId (see MoreGroupPage), which keeps
// the browser back button working. Finance / Planner / Health are deliberately
// not here — they live in the BottomNav.
export default function MorePage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="max-w-[430px] mx-auto px-gutter pt-10 pb-24">
        <h1 className="font-serif italic text-3xl text-ink mb-1">{t('nav.more')}</h1>
        <p className="font-sans text-md text-ink-soft mb-6">{t('more.subtitle')}</p>

        <div className="grid grid-cols-2 gap-3">
          {MORE_GROUPS.map(({ key, icon: Icon }) => (
            <Link key={key} to={`/more/${key}`} className="block">
              <Card className="h-full p-4 flex flex-col gap-3 hover:bg-card-alt transition-colors cursor-pointer">
                <span className="shrink-0 h-11 w-11 rounded-xl bg-card-alt text-accent flex items-center justify-center">
                  <Icon />
                </span>
                <div className="min-w-0">
                  <h2 className="font-sans text-md font-medium text-ink">
                    {t(`more.groups.${key}`)}
                  </h2>
                  <p className="font-sans text-sm text-ink-soft mt-0.5">
                    {t(`more.groups.${key}_sub`)}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
