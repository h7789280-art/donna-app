import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { voiceExpense } from '../../lib/gemini'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import ExpenseReview from './ExpenseReview'

// Local YYYY-MM-DD (user's timezone). Voice entries are always dated today.
function todayISO() {
  const d = new Date()
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}

// Pick the first MediaRecorder mime the browser actually supports. Chrome/Firefox
// give webm/opus; iOS Safari gives mp4. Returning '' lets the recorder use its
// own default, and we read the real type back off the recorder afterwards.
function pickAudioMime() {
  if (typeof MediaRecorder === 'undefined') return ''
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']
  for (const c of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(c)) return c
    } catch {
      /* isTypeSupported can throw on old engines — keep trying */
    }
  }
  return ''
}

// Strip codec params so Gemini gets a clean container mime ("audio/webm;codecs=opus"
// → "audio/webm").
function cleanMime(mime) {
  return (mime || '').split(';')[0].trim() || 'audio/webm'
}

// Read a Blob as bare base64 (no `data:...;base64,` prefix) for the Gemini
// inline_data payload.
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const res = String(reader.result || '')
      resolve(res.slice(res.indexOf(',') + 1))
    }
    reader.onerror = () => reject(new Error('read-failed'))
    reader.readAsDataURL(blob)
  })
}

// mm:ss for the recording timer.
function fmt(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// Voice-expense flow: a mic button that records audio via MediaRecorder (NOT the
// Web Speech API — unreliable in iOS Safari), ships the raw audio to the
// voice-expense Edge Function where Gemini both transcribes the speech AND parses
// it into one or more expenses, then shows the SAME editable review overlay as the
// receipt scanner. Saving reuses addExpensesBatch (one balance write). Never
// touches the manual form; only calls back onSaved() so the page can refresh.
export default function VoiceExpense({
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

  const [status, setStatus] = useState('idle') // idle | recording | loading | error | review
  const [errorMsg, setErrorMsg] = useState('')
  const [items, setItems] = useState([])
  const [seconds, setSeconds] = useState(0)

  const recorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  // Fully release the mic + timer. Safe to call more than once.
  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((tr) => tr.stop())
      streamRef.current = null
    }
    recorderRef.current = null
  }

  // Release the mic if the component unmounts mid-recording.
  useEffect(() => cleanup, [])

  const startRecording = async () => {
    setErrorMsg('')
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setStatus('error')
      setErrorMsg(t('finance.voice.unsupported'))
      return
    }

    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      // Permission denied or no device — soft message, offer to try again.
      setStatus('error')
      setErrorMsg(t('finance.voice.mic_denied'))
      return
    }

    streamRef.current = stream
    chunksRef.current = []

    const preferred = pickAudioMime()
    let recorder
    try {
      recorder = preferred ? new MediaRecorder(stream, { mimeType: preferred }) : new MediaRecorder(stream)
    } catch {
      cleanup()
      setStatus('error')
      setErrorMsg(t('finance.voice.unsupported'))
      return
    }
    recorderRef.current = recorder

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
    }
    recorder.onstop = () => processRecording()

    recorder.start()
    setStatus('recording')
    setSeconds(0)
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
  }

  const stopRecording = () => {
    // Stop the timer immediately; the recorder's onstop fires processRecording.
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    const rec = recorderRef.current
    if (rec && rec.state !== 'inactive') {
      rec.stop() // → onstop → processRecording()
    } else {
      processRecording()
    }
  }

  // Cancel a recording without sending anything (discard audio, back to idle).
  const cancelRecording = () => {
    const rec = recorderRef.current
    if (rec) rec.onstop = null // suppress the auto-process
    if (rec && rec.state !== 'inactive') {
      try {
        rec.stop()
      } catch {
        /* already stopped */
      }
    }
    cleanup()
    chunksRef.current = []
    setStatus('idle')
    setSeconds(0)
  }

  const processRecording = async () => {
    const recorder = recorderRef.current
    const recMime = recorder?.mimeType || ''
    // Release the mic now — we already have the chunks.
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((tr) => tr.stop())
      streamRef.current = null
    }

    const parts = chunksRef.current
    chunksRef.current = []
    if (!parts.length) {
      setStatus('error')
      setErrorMsg(t('finance.voice.no_speech'))
      return
    }

    setStatus('loading')
    try {
      const blob = new Blob(parts, { type: recMime || 'audio/webm' })
      const mimeType = cleanMime(recMime || blob.type)
      const audio = await blobToBase64(blob)

      const result = await voiceExpense({
        audio,
        mimeType,
        categories,
        language: i18n.language,
      })

      const heard = Array.isArray(result?.items) ? result.items : []
      if (heard.length === 0) {
        // Gemini heard nothing usable — soft nudge to record again.
        setStatus('error')
        setErrorMsg(t('finance.voice.no_speech'))
        return
      }

      setItems(heard)
      setStatus('review')
    } catch (err) {
      // Server messages (e.g. "recording too long") are already human-readable.
      setStatus('error')
      setErrorMsg(err?.message || t('finance.voice.error_generic'))
    }
  }

  const closeReview = () => {
    setStatus('idle')
    setItems([])
    setErrorMsg('')
  }

  return (
    <>
      {/* Mic button — sits alongside the receipt-scan button */}
      <button
        type="button"
        onClick={startRecording}
        disabled={status === 'loading' || status === 'recording'}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-accent/50 bg-card px-3 py-3 font-sans text-md text-accent transition-colors hover:bg-card-alt disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5 11a7 7 0 0 0 14 0M12 18v3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {t('finance.voice.record')}
      </button>

      {/* Inline error under the button (before the review opens) */}
      {status === 'error' && (
        <Card className="col-span-2 p-4 flex flex-col gap-3 border-error/40">
          <p className="font-sans text-md text-ink">{errorMsg}</p>
          <Button variant="secondary" onClick={startRecording} className="self-start">
            {t('finance.voice.record_again')}
          </Button>
        </Card>
      )}

      {/* Recording overlay: pulsing mic + timer + stop */}
      {status === 'recording' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-gutter">
          <div className="absolute inset-0 bg-ink/40" aria-hidden="true" />
          <div className="relative w-full max-w-[430px] bg-card border border-line rounded-2xl shadow-card p-8 flex flex-col items-center text-center">
            <span className="relative flex h-16 w-16 items-center justify-center mb-5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent/20 animate-ping" />
              <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-ink">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5 11a7 7 0 0 0 14 0M12 18v3"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </span>
            <p className="font-serif italic text-xl text-ink mb-1">{t('finance.voice.listening')}</p>
            <p className="font-mono text-sm uppercase tracking-caps text-ink-muted mb-6">
              {fmt(seconds)}
            </p>
            <div className="flex gap-2 w-full">
              <Button variant="secondary" className="flex-1" onClick={cancelRecording}>
                {t('common.cancel')}
              </Button>
              <Button variant="primary" className="flex-1" onClick={stopRecording}>
                {t('finance.voice.stop')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loading veil while Donna listens */}
      {status === 'loading' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-gutter">
          <div className="absolute inset-0 bg-ink/40" aria-hidden="true" />
          <div className="relative w-full max-w-[430px] bg-card border border-line rounded-2xl shadow-card p-8 flex flex-col items-center text-center">
            <span className="h-9 w-9 rounded-full border-2 border-line border-t-accent animate-spin mb-4" />
            <p className="font-serif italic text-xl text-ink">{t('finance.voice.thinking')}</p>
          </div>
        </div>
      )}

      {/* Shared editable review overlay */}
      {status === 'review' && (
        <ExpenseReview
          items={items}
          initialDate={todayISO()}
          savedMessage={t('finance.voice.saved')}
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
