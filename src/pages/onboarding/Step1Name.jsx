export default function Step1Name({ value, onChange }) {
  return (
    <div className="w-full max-w-md mx-auto text-center">
      <h1 className="font-serif italic text-4xl text-accent mb-3">Как тебя зовут?</h1>
      <p className="font-sans text-sm text-ink-muted mb-10">
        Давай знакомиться — мне будет приятно звать тебя по имени
      </p>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Твоё имя"
        autoFocus
        maxLength={50}
        className="w-full bg-card border border-line rounded-2xl px-5 py-4 text-ink font-sans text-lg text-center placeholder:text-ink-muted focus:outline-none focus:border-accent transition-colors"
      />
    </div>
  )
}
