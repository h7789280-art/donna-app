# Donna — Design Tokens Reference

**Source of truth:** [`src/styles/globals.css`](./globals.css) (CSS vars) + [`tailwind.config.js`](../../tailwind.config.js) (utility mapping).
**Origin:** извлечено из дизайн-макета Dashboard (Claude artifact, Apr 19 2026) — файл не в репозитории.

---

## Темы

| Тема | Активация |
|---|---|
| Light (default) | `<html>` без атрибута `data-theme` или `data-theme="light"` |
| Dark | `<html data-theme="dark">` |

Переключение темы — установкой/снятием атрибута. Все CSS-переменные и Tailwind-утилиты обновляются автоматически.

---

## Цветовая палитра (семантические роли)

Утилиты строятся как `bg-<role>`, `text-<role>`, `border-<role>`.

### Light

| Role | Utility | Hex |
|---|---|---|
| canvas (основной фон страницы) | `bg-canvas` | `#F5EFE7` |
| canvas-soft (фон inset-блоков) | `bg-canvas-soft` | `#EDE5D8` |
| card (приподнятая карточка) | `bg-card` | `#FBF7F1` |
| card-alt (вдавленная / muted карточка) | `bg-card-alt` | `#F0E8DC` |
| ink (основной текст) | `text-ink` | `#2A211C` |
| ink-soft (вторичный текст) | `text-ink-soft` | `#5E5148` |
| ink-muted (подписи / captions) | `text-ink-muted` | `#9A8A7C` |
| line (тонкие разделители) | `border-line` | `rgba(42,33,28,0.08)` |
| line-strong (бордеры посильнее) | `border-line-strong` | `rgba(42,33,28,0.14)` |
| accent (primary — бордо) | `bg-accent` / `text-accent` | `#5C1F2C` |
| accent-ink (текст поверх accent) | `text-accent-ink` | `#F5EFE7` |

### Dark

| Role | Utility | Hex |
|---|---|---|
| canvas | `bg-canvas` | `#161210` |
| canvas-soft | `bg-canvas-soft` | `#1E1815` |
| card | `bg-card` | `#221B18` |
| card-alt | `bg-card-alt` | `#2B221E` |
| ink | `text-ink` | `#F2ECE2` |
| ink-soft | `text-ink-soft` | `#B9AEA0` |
| ink-muted | `text-ink-muted` | `#807365` |
| line | `border-line` | `rgba(242,236,226,0.08)` |
| line-strong | `border-line-strong` | `rgba(242,236,226,0.16)` |
| accent (lifted bordeaux) | `bg-accent` / `text-accent` | `#B85A6E` |
| accent-ink | `text-accent-ink` | `#161210` |

---

## Decor-токены

⚠️ **Использовать только для градиентов, аватарок, иллюстраций — НЕ для body/card/text.**

| Role | Utility | Light | Dark |
|---|---|---|---|
| decor-rose (dusty rose) | `bg-decor-rose` | `#C9A19A` | `#C9A19A` |
| decor-rose-soft (радиальный glow) | `bg-decor-rose-soft` | `#E9D3CE` | `#3A2A2A` |
| decor-taupe | `bg-decor-taupe` | `#B8A99A` | `#857668` |

Типичное применение:
- Аватар (monogram disc): `linear-gradient(145deg, decor-rose, decor-taupe)`
- Радиальный glow в шапке Dashboard: `radial-gradient(..., decor-rose-soft 0%, transparent 70%)`

---

## Типографика

### Шрифты

| Семейство | Роль | Веса | Google Fonts ✓ |
|---|---|---|---|
| `Cormorant Garamond` | заголовки, wordmark, цитаты, section captions | italic 400/500, normal 400/500/600 | ✓ |
| `Geist` | body (sans-serif) | 400, 500, 600, 700 | ✓ |
| `JetBrains Mono` | метки, tags, stats (uppercase + letter-spacing) | 400, 500, 600 | ✓ |

Tailwind-алиасы: `font-sans` (Geist), `font-serif` (Cormorant), `font-mono` (JetBrains Mono).

Fallback-цепочки прописаны в [`tailwind.config.js`](../../tailwind.config.js) и [`globals.css`](./globals.css).

### Font-size scale

Наблюдённые размеры в макете: 9.5, 10, 11, 11.5, 12, 13, 14, 15, 17, 18, 20, 22, 32, 34. Нормализовано в шкалу:

| Utility | px | line-height | Типичное применение |
|---|---|---|---|
| `text-xs` | 10 | 14 | monospace-метки в uppercase (tags, labels) |
| `text-sm` | 12 | 16 | мелкий caption |
| `text-base` | 13 | 18 | body, second-line в хедере |
| `text-md` | 15 | 21 | section caption (italic serif) |
| `text-lg` | 18 | 24 | заголовок в карточке |
| `text-xl` | 22 | 28 | большой заголовок карточки (Today-card) |
| `text-2xl` | 32 | 36 | H1 на экране (Dashboard · главный экран) |
| `text-3xl` | 34 | 41 | iOS large title |

---

## Radii

| Utility | px | Применение |
|---|---|---|
| `rounded-xs` | 7 | notification dot |
| `rounded-sm` | 12 | small button, inline badge |
| `rounded-md` | 14 | inset-карточка внутри карточки (insight mini-card) |
| `rounded-lg` | 20 | pill badge, module tile |
| `rounded-xl` | 22 | medium card (Gamification) |
| `rounded-2xl` | 24 | большая карточка (Today, Donna insight) |
| `rounded-pill` | 9999 | полностью скруглённый (bottom nav, круглая кнопка) |

Также доступен стандартный `rounded-full` для идеальных кругов (аватары).

---

## Spacing

Tailwind-шкала как есть, плюс семантические алиасы:

| Utility | Значение | Применение |
|---|---|---|
| `p-gutter` / `px-gutter` | 20px | горизонтальный отступ страницы/секций |
| `gap-section` | 26px | vertical gap между секциями Dashboard |

Паддинги карточек обычно 16–22px — используй стандартные `p-4` (16), `p-5` (20), `p-6` (24) где уместно.

---

## Shadows

| Utility | Light | Dark |
|---|---|---|
| `shadow-card` | `0 1px 2px rgba(42,33,28,0.04), 0 8px 24px rgba(42,33,28,0.06)` | `0 1px 2px rgba(0,0,0,0.4), 0 12px 32px rgba(0,0,0,0.35)` |

Через CSS-переменную `--shadow-card`, автоматически меняется от темы.

---

## Letter-spacing

| Utility | Значение | Применение |
|---|---|---|
| `tracking-label` | 0.15em | JetBrains Mono uppercase-метки (stats, tags) |
| `tracking-caps` | 0.22em | "DONNA" wordmark в мелких caps |

---

## Future tweaks (не реализовано)

В макете заложена возможность переключения акцента между тремя вариантами. Сейчас зашит только **bordeaux**; emerald и ink — на будущее (фича «Акцентный цвет» в настройках).

| Акцент | Light | Dark | Label |
|---|---|---|---|
| bordeaux ★ active | `#5C1F2C` | `#B85A6E` | Бордо |
| emerald | `#1F4A3C` | `#4E9A7F` | Изумруд |
| ink | `#2A211C` | `#D6CABD` | Графит |

Реализация, когда будем добавлять: переключатель меняет значения `--accent` и `--accent-ink` на `<html>` — остальная палитра не трогается.

---

## Правила использования

1. **НЕ хардкодь hex** в компонентах — всегда через утилиту или CSS-переменную.
2. **НЕ используй** Tailwind-палитру по-умолчанию (`bg-red-500`, `text-gray-400`) — только семантические.
3. **`decor-*` — только для декора.** Для фона используй `canvas`/`card`, для текста `ink*`, для бордеров `line*`.
4. При смене темы ничего в коде не меняется — только атрибут `data-theme` на `<html>`.
5. Если нужен новый цвет, которого нет в палитре — сначала обсуди, расширяй палитру, не добавляй inline.
