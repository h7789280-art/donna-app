import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { scanReceipt } from '../../lib/gemini'
import { compressImageToBase64 } from '../../lib/imageCompress'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ExpenseReview from './ExpenseReview'

// Local YYYY-MM-DD (user's timezone) — used when the receipt has no date.
function todayISO() {
  const d = new Date()
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}

// Receipt-scan flow: a "scan" button that opens the camera/gallery, then
// compresses → sends to scan-receipt → shows the shared ExpenseReview overlay,
// which saves every line as its own expense with a single wallet-balance write.
// It DOES NOT touch the manual form; it only calls back onSaved() so the page
// can refresh. The editable review list is shared with the voice-expense flow.
export default function ReceiptScanner({
  categories,
  parents,
  children,
  wallets,
  defaultWalletId,
  currency,
  addExpensesBatch,
  onSaved,
  onToast,
}) {
  const { t, i18n } = useTranslation()
  const fileRef = useRef(null)

  const [status, setStatus] = useState('idle') // idle | loading | error | review
  const [errorMsg, setErrorMsg] = useState('')
  const [items, setItems] = useState([])
  const [date, setDate] = useState(todayISO)

  const openPicker = () => {
    setErrorMsg('')
    fileRef.current?.click()
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    // Reset the input so picking the same file again re-fires onChange.
    e.target.value = ''
    if (!file) return

    setStatus('loading')
    setErrorMsg('')
    try {
      const { base64, mimeType } = await compressImageToBase64(file)
      const result = await scanReceipt({
        image: base64,
        mimeType,
        categories,
        language: i18n.language,
      })

      const scanned = Array.isArray(result?.items) ? result.items : []
      if (scanned.length === 0) {
        setStatus('error')
        setErrorMsg(t('finance.receipt.empty_items'))
        return
      }

      setDate(result?.date || todayISO())
      setItems(scanned)
      setStatus('review')
    } catch (err) {
      // Server messages (e.g. "receipt too long") are already human-readable —
      // show them as-is; fall back to a soft generic line otherwise.
      setStatus('error')
      setErrorMsg(err?.message || t('finance.receipt.error_generic'))
    }
  }

  const closeReview = () => {
    setStatus('idle')
    setItems([])
    setErrorMsg('')
  }

  return (
    <>
      {/* Scan button — sits alongside the manual form */}
      <button
        type="button"
        onClick={openPicker}
        disabled={status === 'loading'}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-accent/50 bg-card px-3 py-3 font-sans text-md text-accent transition-colors hover:bg-card-alt disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 8V6a2 2 0 0 1 2-2h1.5l1-1.5h5l1 1.5H18a2 2 0 0 1 2 2v2M4 8v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M4 8h16"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        {status === 'loading' ? t('finance.receipt.reading') : t('finance.receipt.scan')}
      </button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />

      {/* Inline error under the button (before the review opens) */}
      {status === 'error' && (
        <Card className="col-span-2 p-4 flex flex-col gap-3 border-error/40">
          <p className="font-sans text-md text-ink">{errorMsg}</p>
          <Button variant="secondary" onClick={openPicker} className="self-start">
            {t('finance.receipt.retry')}
          </Button>
        </Card>
      )}

      {/* Loading veil while Donna reads the receipt */}
      {status === 'loading' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-gutter">
          <div className="absolute inset-0 bg-ink/40" aria-hidden="true" />
          <div className="relative w-full max-w-[430px] bg-card border border-line rounded-2xl shadow-card p-8 flex flex-col items-center text-center">
            <span className="h-9 w-9 rounded-full border-2 border-line border-t-accent animate-spin mb-4" />
            <p className="font-serif italic text-xl text-ink">{t('finance.receipt.reading')}</p>
          </div>
        </div>
      )}

      {/* Shared editable review overlay */}
      {status === 'review' && (
        <ExpenseReview
          items={items}
          initialDate={date}
          savedMessage={t('finance.receipt.saved')}
          wallets={wallets}
          defaultWalletId={defaultWalletId}
          currency={currency}
          parents={parents}
          children={children}
          categories={categories}
          addExpensesBatch={addExpensesBatch}
          onClose={closeReview}
          onToast={onToast}
          onSaved={() => {
            closeReview()
            onSaved?.()
          }}
        />
      )}
    </>
  )
}
