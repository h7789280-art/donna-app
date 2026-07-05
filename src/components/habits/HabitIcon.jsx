// Line-icon set for habits.
//
// Matches the project's inline-SVG convention (24×24 viewBox,
// stroke="currentColor", strokeWidth 1.5, rounded caps/joins, NO fill) —
// same visual language as BottomNav / finance hub / HealthPage glyphs.
// The habit's colour token is applied by the caller (text-<token>), so
// currentColor tints the glyph → icon + colour read as one visual.
//
// Storage: habits.icon holds an icon KEY (e.g. 'water', 'book'), not an
// emoji. Legacy rows may still contain an emoji string; getHabitIconKey()
// normalises any unknown value to the default glyph so old records never
// break the screen.

// Shared stroke props for every glyph.
const P = {
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  fill: 'none',
}

// key → glyph body (paths only; wrapper <svg> is added by HabitIcon).
// Order here is also the order shown in the picker (see HABIT_ICON_KEYS).
const GLYPHS = {
  // Вода / капля
  water: (
    <path d="M12 3.5s6 6 6 10a6 6 0 0 1-12 0c0-4 6-10 6-10z" {...P} />
  ),
  // Спорт / бег
  run: (
    <>
      <circle cx="15.5" cy="4.8" r="1.8" {...P} />
      <path d="M15 6.8l-2.5 4 3 2.4-1 5.6" {...P} />
      <path d="M17.6 12l-2.1-1.2-4 1" {...P} />
      <path d="M12.5 10.8l-2.6 3" {...P} />
    </>
  ),
  // Книга / чтение
  book: (
    <>
      <path d="M12 6.5c-1.6-1-4.2-1.5-6-1v11c1.8-.5 4.4 0 6 1 1.6-1 4.2-1.5 6-1v-11c-1.8-.5-4.4 0-6 1z" {...P} />
      <path d="M12 6.5v11" {...P} />
    </>
  ),
  // Медитация / лотос
  meditate: (
    <>
      <circle cx="12" cy="5.4" r="1.9" {...P} />
      <path d="M12 7.5v3.5" {...P} />
      <path d="M8 12l4 2 4-2" {...P} />
      <path d="M6 17.5C7.5 14.5 9.5 13.5 12 13.5s4.5 1 6 4" {...P} />
    </>
  ),
  // Таблетка / витамины
  pill: (
    <>
      <rect x="3.8" y="9" width="16.4" height="6" rx="3" transform="rotate(-45 12 12)" {...P} />
      <path d="M9.9 14.1 14.1 9.9" {...P} />
    </>
  ),
  // Еда / салат
  salad: (
    <>
      <path d="M4 11.5h16a8 8 0 0 1-16 0z" {...P} />
      <path d="M8.5 8.5c.3-1.7 1.8-2.8 3.5-2.7" {...P} />
      <path d="M12 8.5c.3-2 2-3 4-2.6" {...P} />
      <path d="M8 8.5c-1.4-1-3-.6-4 .5" {...P} />
    </>
  ),
  // Сон / луна
  moon: (
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" {...P} />
  ),
  // Письмо / ручка
  pen: (
    <>
      <path d="M4 20l1-4L15.5 5.5l3 3L8 19l-4 1z" {...P} />
      <path d="M13.5 7.5l3 3" {...P} />
    </>
  ),
  // Уборка / спрей
  clean: (
    <>
      <path d="M8.5 9h5v9a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1z" {...P} />
      <path d="M9.5 9V6H13" {...P} />
      <path d="M13 5h3l-1 2h-2" {...P} />
      <path d="M17 5.5h1.5M17.5 4h1.5M17.5 7h1.5" {...P} />
    </>
  ),
  // Цель / мишень
  target: (
    <>
      <circle cx="12" cy="12" r="8" {...P} />
      <circle cx="12" cy="12" r="4" {...P} />
      <circle cx="12" cy="12" r="1" {...P} />
    </>
  ),
  // Солнце / утро
  sun: (
    <>
      <circle cx="12" cy="12" r="4" {...P} />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M18.5 5.5l-1.4 1.4M6.9 17.1l-1.4 1.4" {...P} />
    </>
  ),
  // Сила / гантель
  dumbbell: (
    <>
      <path d="M6 9v6M4 10.5v3M18 9v6M20 10.5v3" {...P} />
      <path d="M6 12h12" {...P} />
    </>
  ),
  // Уход / косметика (баночка крема)
  skincare: (
    <>
      <rect x="5.5" y="10" width="13" height="9" rx="2" {...P} />
      <rect x="7.5" y="6" width="9" height="4" rx="1.2" {...P} />
    </>
  ),
  // Зубы
  teeth: (
    <path d="M6.5 4.5c-1.8 0-2.8 1.4-2.8 3.8 0 2.8 1 4.8 1.5 7.6.3 1.5 1.6 1.5 1.9 0l.6-2.9c.2-1 1.4-1 1.6 0l.6 2.9c.3 1.5 1.6 1.5 1.9 0 .5-2.8 1.5-4.8 1.5-7.6 0-2.4-1-3.8-2.8-3.8-1.2 0-1.9.8-2.8.8s-1.6-.8-2.7-.8z" {...P} />
  ),
  // Растение / росток
  plant: (
    <>
      <path d="M7.5 14h9l-1.4 6h-6.2z" {...P} />
      <path d="M12 14V7.5" {...P} />
      <path d="M12 10.5C10.5 8.5 8.5 8.5 7 9.5c1 2.5 3 2.5 5 1" {...P} />
      <path d="M12 9.5C13.5 7.5 15.5 7.5 17 8.5c-1 2.5-3 2.5-5 1" {...P} />
    </>
  ),
  // Кофе
  coffee: (
    <>
      <path d="M5 8.5h11v4.5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" {...P} />
      <path d="M16 9.5h1.5a2.2 2.2 0 0 1 0 4.4H16" {...P} />
      <path d="M8 3.5c-.5 1 .5 2 0 3M11.5 3.5c-.5 1 .5 2 0 3" {...P} />
    </>
  ),
  // Творчество / палитра
  create: (
    <>
      <path d="M12 4C7 4 3.5 7 3.5 11c0 3 2.5 5 5.4 5 1 0 1.6-.6 1.6-1.5 0-.5-.3-.9-.3-1.4 0-.8.6-1.4 1.5-1.4H14a4 4 0 0 0 4-4C18 5.4 15.3 4 12 4z" {...P} />
      <circle cx="7.5" cy="10.5" r="1" {...P} />
      <circle cx="10" cy="8" r="1" {...P} />
      <circle cx="13.5" cy="8.5" r="1" {...P} />
    </>
  ),
  // Деньги / монета
  money: (
    <>
      <circle cx="12" cy="12" r="8" {...P} />
      <path d="M12 8v8" {...P} />
      <path d="M14.2 9.6c-.5-.8-1.4-1.1-2.4-1.1-1.3 0-2.3.7-2.3 1.8 0 2.4 4.8 1.1 4.8 3.5 0 1.1-1 1.8-2.4 1.8-1.1 0-2-.4-2.5-1.2" {...P} />
    </>
  ),
  // Дефолт / фолбэк (искра) — для неизвестных ключей и legacy-эмодзи
  default: (
    <path d="M12 4l1.6 4.9L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.1z" {...P} />
  ),
}

// Picker order (18 curated habit glyphs, no 'default').
export const HABIT_ICON_KEYS = [
  'water', 'run', 'book', 'meditate', 'pill', 'salad',
  'moon', 'pen', 'clean', 'target', 'sun', 'dumbbell',
  'skincare', 'teeth', 'plant', 'coffee', 'create', 'money',
]

// Normalise any stored icon value to a known key. Unknown values
// (legacy emoji, null, typos) fall back to 'default' — never crashes.
export function getHabitIconKey(icon) {
  return icon && Object.prototype.hasOwnProperty.call(GLYPHS, icon) ? icon : 'default'
}

// Renders the line glyph for a habit. Tint via className (text-<token>);
// currentColor does the rest. size controls px width/height.
export default function HabitIcon({ icon, size = 22, className = '' }) {
  const key = getHabitIconKey(icon)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {GLYPHS[key]}
    </svg>
  )
}
