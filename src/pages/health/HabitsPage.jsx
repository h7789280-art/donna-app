import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import WidgetHeader from '../../components/ui/WidgetHeader'
import HabitIcon, { HABIT_ICON_KEYS } from '../../components/habits/HabitIcon'
import PinToggle from '../../components/dashboard/PinToggle'
import { useHabits, HABIT_COLORS, DEFAULT_COLOR } from '../../hooks/useHabits'

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
}

// Static Tailwind classes per token key (dynamic class names would be purged).
const COLOR_BG = {
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
  'decor-rose': 'bg-decor-rose',
  'decor-taupe': 'bg-decor-taupe',
}
const bgFor = (key) => COLOR_BG[key] || COLOR_BG[DEFAULT_COLOR]

// Text-colour tokens per key — tints the line icon (currentColor) so the
// glyph reads in the habit's chosen colour. Static classes to survive purge.
const COLOR_TEXT = {
  accent: 'text-accent',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  'decor-rose': 'text-decor-rose',
  'decor-taupe': 'text-decor-taupe',
}
const textFor = (key) => COLOR_TEXT[key] || COLOR_TEXT[DEFAULT_COLOR]

function weekdayInitial(iso, locale) {
  try {
    const d = new Date(iso + 'T00:00:00')
    return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d).slice(0, 2)
  } catch {
    return ''
  }
}

// Toggle circle: filled with the habit color + knockout check when done,
// empty outlined circle otherwise.
function CheckCircle({ done, color, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={done}
      className={`shrink-0 h-11 w-11 rounded-full flex items-center justify-center active:scale-90 transition ${
        done ? `${bgFor(color)} text-canvas` : 'bg-card-alt border-2 border-line text-transparent'
      }`}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M4 9.5 7.5 13 14 5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

// One habit row: icon + title + streak + 7-day strip, with a toggle circle.
function HabitRow({ habit, todayIso, locale, onToggle, onEdit, t }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="min-w-0 flex-1 flex items-center gap-3 text-left"
        >
          <span className="shrink-0 h-11 w-11 rounded-xl bg-card-alt flex items-center justify-center">
            <HabitIcon icon={habit.icon} size={22} className={textFor(habit.color)} />
          </span>
          <span className="min-w-0">
            <span className="block font-sans text-md font-medium text-ink truncate">
              {habit.title}
            </span>
            <span className="block font-sans text-sm text-ink-soft mt-0.5">
              {habit.streak > 0
                ? t('habits.streak_days', { count: habit.streak })
                : t('habits.streak_none')}
            </span>
          </span>
        </button>
        <CheckCircle
          done={habit.todayDone}
          color={habit.color}
          onClick={() => onToggle(habit.id)}
          label={habit.todayDone ? t('habits.mark_undone') : t('habits.mark_done')}
        />
      </div>

      {/* 7-day strip */}
      <div className="mt-3 flex items-center justify-between gap-1.5">
        {habit.week.map((d) => {
          const isToday = d.date === todayIso
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              <span
                className={`w-full aspect-square max-w-[26px] rounded-md ${
                  d.done ? bgFor(habit.color) : 'bg-card-alt border border-line'
                } ${isToday && !d.done ? 'ring-1 ring-inset ring-line-strong' : ''}`}
              />
              <span
                className={`font-mono text-[9px] uppercase tracking-caps ${
                  isToday ? 'text-accent' : 'text-ink-muted'
                }`}
              >
                {weekdayInitial(d.date, locale)}
              </span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// Create / edit form inside a modal.
function HabitForm({ open, initial, onClose, onSubmit, onDelete, busy, t }) {
  const [title, setTitle] = useState(initial?.title || '')
  const [icon, setIcon] = useState(initial?.icon || '')
  const [color, setColor] = useState(initial?.color || DEFAULT_COLOR)
  const [confirmDel, setConfirmDel] = useState(false)
  const isEdit = !!initial

  // Reset local state whenever the modal (re)opens for a different habit.
  const key = `${open}-${initial?.id || 'new'}`
  const [formKey, setFormKey] = useState(key)
  if (formKey !== key) {
    setFormKey(key)
    setTitle(initial?.title || '')
    setIcon(initial?.icon || '')
    setColor(initial?.color || DEFAULT_COLOR)
    setConfirmDel(false)
  }

  const canSave = title.trim().length > 0 && !busy

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? t('habits.edit') : t('habits.new')}>
      <div className="space-y-5">
        {/* Name */}
        <div>
          <WidgetHeader className="mb-2">{t('habits.name')}</WidgetHeader>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('habits.name_placeholder')}
            maxLength={60}
            className="w-full rounded-xl bg-card-alt border border-line px-4 py-3 font-sans text-md text-ink placeholder:text-ink-muted focus:outline-none focus:border-line-strong"
          />
        </div>

        {/* Icon */}
        <div>
          <WidgetHeader className="mb-2">{t('habits.icon')}</WidgetHeader>
          <div className="flex flex-wrap gap-2">
            {HABIT_ICON_KEYS.map((key) => {
              const selected = icon === key
              return (
                <button
                  key={key}
                  type="button"
                  aria-label={key}
                  aria-pressed={selected}
                  onClick={() => setIcon(selected ? '' : key)}
                  className={`h-10 w-10 rounded-xl flex items-center justify-center transition ${
                    selected
                      ? 'bg-accent/10 border-2 border-accent'
                      : 'bg-card-alt border border-line'
                  }`}
                >
                  {/* Live preview in the chosen colour → icon + colour = one visual. */}
                  <HabitIcon icon={key} size={20} className={textFor(color)} />
                </button>
              )
            })}
          </div>
        </div>

        {/* Color */}
        <div>
          <WidgetHeader className="mb-2">{t('habits.color')}</WidgetHeader>
          <div className="flex items-center gap-3">
            {HABIT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={c}
                className={`h-9 w-9 rounded-full ${bgFor(c)} flex items-center justify-center transition ${
                  color === c ? 'ring-2 ring-offset-2 ring-offset-card ring-ink' : ''
                }`}
              >
                {color === c && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M3 7.5 6 10.5 11 4"
                      stroke="currentColor"
                      className="text-canvas"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            {t('habits.cancel')}
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            disabled={!canSave}
            onClick={() => onSubmit({ title, icon, color })}
          >
            {t('habits.save')}
          </Button>
        </div>

        {/* Delete (edit only) */}
        {isEdit && (
          <div className="pt-2 border-t border-line">
            {confirmDel ? (
              <div className="flex items-center gap-2">
                <span className="flex-1 font-sans text-sm text-ink-soft">
                  {t('habits.delete_confirm')}
                </span>
                <Button variant="ghost" onClick={() => setConfirmDel(false)}>
                  {t('habits.cancel')}
                </Button>
                <Button
                  variant="primary"
                  className="!bg-error"
                  disabled={busy}
                  onClick={onDelete}
                >
                  {t('habits.delete')}
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDel(true)}
                className="font-sans text-sm text-error hover:opacity-80 transition"
              >
                {t('habits.delete')}
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

export default function HabitsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { habits, loading, busy, toggleToday, createHabit, updateHabit, deleteHabit } =
    useHabits()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null) // habit or null (=create)

  const todayIso = useMemo(() => {
    for (const h of habits) {
      if (h.week.length) return h.week[h.week.length - 1].date
    }
    return null
  }, [habits])

  const openCreate = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (habit) => {
    setEditing(habit)
    setFormOpen(true)
  }
  const closeForm = () => setFormOpen(false)

  const handleSubmit = async (values) => {
    const res = editing
      ? await updateHabit(editing.id, values)
      : await createHabit(values)
    if (!res?.error) closeForm()
  }
  const handleDelete = async () => {
    if (!editing) return
    const res = await deleteHabit(editing.id)
    if (!res?.error) closeForm()
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="max-w-[430px] mx-auto px-gutter pt-8 pb-24"
      >
        {/* Header */}
        <motion.div variants={fadeIn} className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => navigate('/health')}
            aria-label={t('common.back')}
            className="shrink-0 h-9 w-9 -ml-1 rounded-full flex items-center justify-center text-ink-soft hover:bg-card-alt transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M11 3.5 5.5 9l5.5 5.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif italic text-3xl leading-none text-ink">
              {t('habits.title')}
            </h1>
          </div>
          <PinToggle widgetKey="habits" />
        </motion.div>

        {loading && habits.length === 0 ? (
          <motion.div
            variants={fadeIn}
            className="font-sans text-sm text-ink-muted text-center py-12"
          >
            {t('common.loading')}
          </motion.div>
        ) : habits.length === 0 ? (
          /* Empty state */
          <motion.div variants={fadeIn}>
            <Card className="p-8 text-center">
              <div className="font-serif italic text-2xl text-ink mb-1">
                {t('habits.empty')}
              </div>
              <p className="font-sans text-sm text-ink-soft mb-5">
                {t('habits.empty_hint')}
              </p>
              <Button variant="primary" onClick={openCreate}>
                {t('habits.add')}
              </Button>
            </Card>
          </motion.div>
        ) : (
          <>
            <motion.div variants={fadeIn}>
              <WidgetHeader className="mb-3">{t('habits.today')}</WidgetHeader>
            </motion.div>
            <div className="space-y-3">
              {habits.map((h) => (
                <motion.div key={h.id} variants={fadeIn}>
                  <HabitRow
                    habit={h}
                    todayIso={todayIso}
                    locale={i18n.language}
                    onToggle={toggleToday}
                    onEdit={() => openEdit(h)}
                    t={t}
                  />
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeIn} className="mt-4">
              <Button variant="secondary" className="w-full" onClick={openCreate}>
                {t('habits.add')}
              </Button>
            </motion.div>
          </>
        )}
      </motion.div>

      <HabitForm
        open={formOpen}
        initial={editing}
        onClose={closeForm}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        busy={busy}
        t={t}
      />
    </div>
  )
}
