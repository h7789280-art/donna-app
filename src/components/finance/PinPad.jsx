// Reusable numeric PIN keypad. Controlled via `value` (string of digits).
// Fires onChange on every digit/delete and onComplete once `length` is reached.
// Design-token only, no <form>.
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

export default function PinPad({ value = '', onChange, onComplete, length = 4 }) {
  const pushDigit = (digit) => {
    if (value.length >= length) return
    const next = value + digit
    onChange?.(next)
    if (next.length === length) onComplete?.(next)
  }

  const popDigit = () => {
    if (value.length === 0) return
    onChange?.(value.slice(0, -1))
  }

  return (
    <div className="flex flex-col items-center gap-8 select-none">
      {/* dots */}
      <div className="flex items-center gap-4" role="status" aria-label={`${value.length}/${length}`}>
        {Array.from({ length }).map((_, i) => (
          <span
            key={i}
            className={`h-3.5 w-3.5 rounded-pill transition-colors ${
              i < value.length ? 'bg-accent' : 'border border-line'
            }`}
          />
        ))}
      </div>

      {/* keypad */}
      <div className="grid grid-cols-3 gap-3">
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => pushDigit(k)}
            className="h-16 w-16 rounded-2xl bg-card border border-line text-ink font-serif text-2xl flex items-center justify-center transition-colors hover:bg-card-alt active:bg-card-alt cursor-pointer"
          >
            {k}
          </button>
        ))}
        {/* spacer */}
        <span aria-hidden="true" className="h-16 w-16" />
        <button
          type="button"
          onClick={() => pushDigit('0')}
          className="h-16 w-16 rounded-2xl bg-card border border-line text-ink font-serif text-2xl flex items-center justify-center transition-colors hover:bg-card-alt active:bg-card-alt cursor-pointer"
        >
          0
        </button>
        <button
          type="button"
          onClick={popDigit}
          aria-label="delete"
          className="h-16 w-16 rounded-2xl bg-transparent border border-transparent text-ink-soft font-mono text-xl flex items-center justify-center transition-colors hover:bg-card-alt active:bg-card-alt cursor-pointer"
        >
          ⌫
        </button>
      </div>
    </div>
  )
}
