import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useFinanceCategories } from '../../hooks/useFinanceCategories'
import { useCategoryManager } from '../../hooks/useCategoryManager'
import CategoryForm from '../../components/finance/CategoryForm'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Toast from '../../components/ui/Toast'

const TYPES = ['expense', 'income']

function PencilIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20h4l10-10-4-4L4 16v4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M13.5 6.5l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 7h14M10 7V5h4v2M6 7l1 12h10l1-12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronDown({ open }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`transition-transform ${open ? 'rotate-180' : ''}`}
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// Small round icon button for the edit/delete row actions.
function IconButton({ onClick, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="shrink-0 h-8 w-8 inline-flex items-center justify-center rounded-pill text-ink-muted hover:bg-card-alt hover:text-ink transition-colors cursor-pointer"
    >
      {children}
    </button>
  )
}

export default function CategoriesPage() {
  const { t } = useTranslation()
  const { parents, children, loading, error, reload } = useFinanceCategories()
  const { createCategory, renameCategory, deleteSubcategory, deleteParent } = useCategoryManager()

  const [type, setType] = useState('expense')
  const [expanded, setExpanded] = useState({}) // parentId -> bool (default open)
  // form: { mode: 'create-parent'|'create-sub'|'edit', parent?, category? }
  const [form, setForm] = useState(null)
  // pendingDelete: { category, isParent, subIds }
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [toast, setToast] = useState(null)

  const parentList = useMemo(() => parents(type), [parents, type])

  const isExpanded = (id) => expanded[id] !== false // default: expanded
  const toggle = (id) => setExpanded((e) => ({ ...e, [id]: !isExpanded(id) }))

  const onFormSubmit = async (name) => {
    if (!form) return { ok: false }
    let res
    if (form.mode === 'edit') {
      res = await renameCategory(form.category.id, { name })
    } else if (form.mode === 'create-sub') {
      res = await createCategory({ name, type, parentId: form.parent.id })
    } else {
      res = await createCategory({ name, type, parentId: null })
    }
    if (res?.ok) {
      await reload()
      setToast({ message: t('common.finish'), type: 'success' })
    }
    return res
  }

  const askDeleteParent = (parent) => {
    const subs = children(parent.id)
    setPendingDelete({ category: parent, isParent: true, subIds: subs.map((s) => s.id) })
  }
  const askDeleteSub = (sub) => {
    setPendingDelete({ category: sub, isParent: false, subIds: [] })
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    const res = pendingDelete.isParent
      ? await deleteParent({ parentId: pendingDelete.category.id, subIds: pendingDelete.subIds })
      : await deleteSubcategory(pendingDelete.category.id)
    setDeleting(false)
    if (res?.ok) {
      await reload()
      setToast({ message: t('common.finish'), type: 'success' })
    } else {
      setToast({ message: t('common.error_generic'), type: 'error' })
    }
    setPendingDelete(null)
  }

  const formTitle =
    form?.mode === 'edit'
      ? t('finance.categories.edit')
      : form?.mode === 'create-sub'
      ? t('finance.categories.add_subcategory')
      : t('finance.categories.add_category')

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <div className="max-w-[430px] mx-auto px-gutter pt-10 pb-24">
        <h1 className="font-serif italic text-3xl text-ink mb-6">{t('finance.categories.title')}</h1>

        {/* Type switcher (same style as the report) */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {TYPES.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setType(k)}
              className={`rounded-xl border px-3 py-2.5 font-sans text-md transition-colors cursor-pointer ${
                type === k
                  ? 'bg-accent text-accent-ink border-transparent'
                  : 'bg-card text-ink border-line hover:bg-card-alt'
              }`}
            >
              {t(k === 'income' ? 'finance.categories.income' : 'finance.categories.expense')}
            </button>
          ))}
        </div>

        {loading && (
          <p className="font-mono text-xs uppercase tracking-caps text-ink-muted">
            {t('common.loading')}
          </p>
        )}

        {!loading && error && (
          <p className="font-sans text-md text-error">{t('common.error_generic')}</p>
        )}

        {!loading && !error && parentList.length === 0 && (
          <Card className="p-8 flex flex-col items-center text-center">
            <h2 className="font-serif italic text-xl text-ink mb-4">
              {t('finance.categories.no_categories')}
            </h2>
            <Button variant="primary" onClick={() => setForm({ mode: 'create-parent' })}>
              <PlusIcon />
              {t('finance.categories.add_category')}
            </Button>
          </Card>
        )}

        {!loading && !error && parentList.length > 0 && (
          <>
            <div className="flex flex-col gap-3">
              {parentList.map((parent) => {
                const subs = children(parent.id)
                const open = isExpanded(parent.id)
                return (
                  <Card key={parent.id} className="p-0 overflow-hidden">
                    {/* Parent row */}
                    <div className="flex items-center gap-1 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggle(parent.id)}
                        className="min-w-0 flex-1 flex items-center gap-2 text-left cursor-pointer"
                      >
                        <span className="text-ink-muted">
                          <ChevronDown open={open} />
                        </span>
                        <span className="min-w-0 truncate font-sans text-md font-medium text-ink">
                          {parent.name}
                        </span>
                        {subs.length > 0 && (
                          <span className="shrink-0 font-mono text-xs text-ink-muted">
                            {subs.length}
                          </span>
                        )}
                      </button>
                      <IconButton
                        label={t('finance.categories.edit')}
                        onClick={() => setForm({ mode: 'edit', category: parent })}
                      >
                        <PencilIcon />
                      </IconButton>
                      <IconButton
                        label={t('finance.categories.delete')}
                        onClick={() => askDeleteParent(parent)}
                      >
                        <TrashIcon />
                      </IconButton>
                    </div>

                    {/* Subcategories */}
                    {open && (
                      <div className="border-t border-line divide-y divide-line">
                        {subs.length === 0 && (
                          <p className="px-4 py-2.5 pl-11 font-sans text-sm text-ink-muted">
                            {t('finance.categories.no_subcategories')}
                          </p>
                        )}
                        {subs.map((sub) => (
                          <div key={sub.id} className="flex items-center gap-1 px-4 py-2.5">
                            <span className="min-w-0 flex-1 truncate pl-7 font-sans text-md text-ink-soft">
                              {sub.name}
                            </span>
                            <IconButton
                              label={t('finance.categories.edit')}
                              onClick={() => setForm({ mode: 'edit', category: sub })}
                            >
                              <PencilIcon />
                            </IconButton>
                            <IconButton
                              label={t('finance.categories.delete')}
                              onClick={() => askDeleteSub(sub)}
                            >
                              <TrashIcon />
                            </IconButton>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setForm({ mode: 'create-sub', parent })}
                          className="w-full flex items-center gap-2 px-4 py-2.5 pl-11 font-sans text-sm text-accent hover:bg-card-alt transition-colors cursor-pointer"
                        >
                          <PlusIcon />
                          {t('finance.categories.add_subcategory')}
                        </button>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>

            <Button
              variant="secondary"
              className="w-full mt-4"
              onClick={() => setForm({ mode: 'create-parent' })}
            >
              <PlusIcon />
              {t('finance.categories.add_category')}
            </Button>
          </>
        )}
      </div>

      <CategoryForm
        open={Boolean(form)}
        onClose={() => setForm(null)}
        title={formTitle}
        initialName={form?.mode === 'edit' ? form.category?.name ?? '' : ''}
        onSubmit={onFormSubmit}
        onToast={setToast}
      />

      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => (deleting ? null : setPendingDelete(null))}
        title={t('finance.categories.delete')}
      >
        <p className="font-sans text-md text-ink mb-2">
          {pendingDelete?.isParent
            ? t('finance.categories.delete_parent_confirm', {
                name: pendingDelete?.category?.name ?? '',
                count: pendingDelete?.subIds?.length ?? 0,
              })
            : t('finance.categories.delete_confirm', { name: pendingDelete?.category?.name ?? '' })}
        </p>
        <p className="font-sans text-sm text-ink-soft mb-6">
          {t('finance.categories.operations_detach_note')}
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setPendingDelete(null)}
            disabled={deleting}
          >
            {t('finance.categories.cancel')}
          </Button>
          <Button variant="primary" className="flex-1" onClick={confirmDelete} disabled={deleting}>
            {deleting ? t('common.loading') : t('finance.categories.delete')}
          </Button>
        </div>
      </Modal>

      <Toast message={toast?.message} type={toast?.type} onDone={() => setToast(null)} />
    </div>
  )
}
