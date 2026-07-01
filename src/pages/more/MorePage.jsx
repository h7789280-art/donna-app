import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import StatCard from '../../components/ui/StatCard'
import ProgressRing from '../../components/ui/ProgressRing'
import Modal from '../../components/ui/Modal'
import Toast from '../../components/ui/Toast'
import WidgetHeader from '../../components/ui/WidgetHeader'

export default function MorePage() {
  const { t } = useTranslation()
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState(null)

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="max-w-[430px] mx-auto px-gutter pt-10 pb-10">
        <h1 className="font-serif italic text-3xl text-ink mb-3">{t('nav.more')}</h1>
        <p className="font-mono text-xs uppercase tracking-caps text-accent">
          {t('coming_soon')}
        </p>

        {/* DEMO: убрать когда MorePage наполнится */}
        <div className="mt-8 space-y-6">
          <WidgetHeader>{t('more.ui_demo_title')}</WidgetHeader>

          <div className="flex flex-wrap gap-2">
            <Button variant="primary">{t('more.ui_demo_btn_primary')}</Button>
            <Button variant="secondary">{t('more.ui_demo_btn_secondary')}</Button>
            <Button variant="ghost">{t('more.ui_demo_btn_ghost')}</Button>
            <Button variant="primary" disabled>{t('more.ui_demo_btn_disabled')}</Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">{t('more.ui_demo_badge_accent')}</Badge>
            <Badge variant="neutral">{t('more.ui_demo_badge_neutral')}</Badge>
            <Badge variant="success">{t('more.ui_demo_badge_success')}</Badge>
            <Badge variant="warning">{t('more.ui_demo_badge_warning')}</Badge>
            <Badge variant="error">{t('more.ui_demo_badge_error')}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label={t('more.ui_demo_stat_label')}
              value="1 247 ₽"
              hint={t('more.ui_demo_stat_hint')}
            />
            <div className="flex items-center justify-center">
              <ProgressRing value={65} size={96} label="65%" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(true)}>
              {t('more.ui_demo_open_modal')}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setToast({ message: t('more.ui_demo_toast_msg'), type: 'success' })}
            >
              {t('more.ui_demo_show_toast')}
            </Button>
          </div>
        </div>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t('more.ui_demo_modal_title')}>
          <p className="font-sans text-md text-ink-soft">{t('more.ui_demo_modal_body')}</p>
          <div className="mt-4 flex justify-end">
            <Button variant="primary" onClick={() => setModalOpen(false)}>
              {t('common.finish')}
            </Button>
          </div>
        </Modal>

        <Toast
          message={toast?.message}
          type={toast?.type}
          onDone={() => setToast(null)}
        />
        {/* /DEMO */}
      </div>
    </div>
  )
}
