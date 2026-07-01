# DONNA — Диагностика проекта (2026-07-01)

> Диагностический аудит. Код не менялся. Единственный новый файл — этот отчёт.

## 1. Сводка одной строкой

**Скелет + инфра + i18n (16 языков) + welcome + auth (OTP) + онбординг (6 шагов) + Dashboard (5 виджетов) — готовы и собираются. Из ~50 продуктовых модулей реализовано 0 (только Dashboard как витрина). Реальных экранных модулей нет: нет finance / children / health / habits / content / home / reflect / settings.**

---

## 2. Что ГОТОВО ✅

- **Инфраструктура Vite**: Vite 6 + React 19 + Tailwind 4 (`@tailwindcss/vite`). `npm run build` проходит без ошибок (см. §10).
- **Supabase-клиент** (`src/lib/supabase.js`) + `AuthContext` с OTP-кодом (не magic link), persist-сессией и подгрузкой профиля.
- **ProtectedRoute** — гейт по locale → user → onboarding_completed.
- **Welcome-экран** (`/welcome`) — выбор языка перед входом (`LocaleGate`).
- **Auth** (`/login`) — email + OTP-код через `signInWithOtp` / `verifyOtp`.
- **Онбординг** — полноценные 6 шагов (имя → дети → модули → ассистент → «готовлю» → финиш), все пишут в `profiles` / `children`, есть обработка ошибок и RLS-проверки.
- **Dashboard** (`/`) — 5 виджетов с реальными данными: приветствие по времени суток, дети (`useChildren`), вода +1 (`useWaterToday` через RPC), цитата дня (`useDailyQuote`), «Донна говорит» (пока placeholder-текст). Framer-motion staggered-анимации.
- **i18n** — 16 языков, react-i18next + LanguageDetector, покрытие практически 100% (см. §6).
- **PWA** — `vite-plugin-pwa` (autoUpdate), manifest в конфиге, `sw.js` + workbox-кэши генерируются при сборке (155 precache entries).
- **Деплой** — `vercel.json` с SPA-rewrites, папка `.vercel` присутствует (проект привязан).

---

## 3. Что ЧАСТИЧНО 🟡

- **UI-кит** — есть только `Card`, `WidgetHeader`, `ChildCard`. Не хватает переиспользуемых `Badge`, `StatCard`, `ProgressRing`, `Button`, `Modal`, `Toast` (обещаны в CLAUDE.md, §3).
- **BottomNav** — файл `src/components/layout/BottomNav.jsx` существует, но **нигде не импортируется** (сирота: в `App.jsx` и `DashboardPage` не подключён). Навигации по табам фактически нет.
- **«Донна говорит»** — виджет есть, но текст статический (`dashboard.donna_insight_placeholder_sassy`). AI-инсайта нет.
- **Модуль «дети»** — есть только карточка на дашборде и шаг онбординга; отдельного экрана `/children` (расписание, задания, milestones) нет.
- **Модуль «здоровье»** — на дашборде только вода. Витамины / энергия / сон / цикл — отсутствуют как экраны.
- **i18n-плюрализация** — у не-славянских языков нет форм `_few` / `_many`, но это **корректно** (i18next для них использует one/other) — не пробел, а особенность правил.

---

## 4. Что НЕ НАЧАТО ❌

- **`src/lib/gemini.js`** и любые AI-вызовы (Gemini Edge Function) — файла нет.
- **Финансы** — нет ни экрана, ни PIN (`/finance/*`, `useFinancePin`, `pin-setup/enter`).
- **Модули-страницы**: finance, children, health, habits, content, home, reflect, settings — **ни одной папки под `src/pages/` кроме** `welcome`, `auth`, `onboarding`, `dashboard`.
- **Хуки из CLAUDE.md**: `usePlan`, `useVoice`, `useFinancePin` — нет (есть только `useAuth`, `useChildren`, `useWaterToday`, `useDailyQuote`).
- **Роутинг модулей** — в `App.jsx` всего 4 маршрута, ни один модуль не подключён.
- **Stripe / монетизация** — `@stripe/stripe-js` не установлен, paywall / `/pricing` нет.
- **Push-уведомления** (n8n + Web Push), **Чат с Донной**, **Геймификация** (XP/бейджи UI) — не начаты.
- **Голосовой ввод / чеки** (Web Speech, `<input capture>`) — не начаты.

---

## 5. Модули — таблица

| Модуль | Экран(ы) | Статус | Комментарий |
|---|---|---|---|
| welcome | `WelcomePage.jsx` | ✅ РЕАЛИЗОВАНО | Выбор языка перед входом |
| auth | `LoginPage.jsx` | ✅ РЕАЛИЗОВАНО | Email + OTP-код (не magic link) |
| onboarding | `OnboardingPage` + `Step1..6`, `OnboardingLayout` | ✅ РЕАЛИЗОВАНО | 6 шагов, пишет в `profiles`/`children`, обработка ошибок |
| dashboard | `DashboardPage.jsx` | ✅ РЕАЛИЗОВАНО | 5 виджетов, реальные Supabase-хуки; «Донна говорит» — placeholder |
| finance | — | ❌ НЕТ ФАЙЛА | Нет экрана, нет PIN |
| children | — | ❌ НЕТ ФАЙЛА | Только карточка на дашборде + шаг онбординга |
| health | — | ❌ НЕТ ФАЙЛА | На дашборде только вода |
| habits | — | ❌ НЕТ ФАЙЛА | — |
| content | — | ❌ НЕТ ФАЙЛА | — |
| home | — | ❌ НЕТ ФАЙЛА | — |
| reflect | — | ❌ НЕТ ФАЙЛА | — |
| settings | — | ❌ НЕТ ФАЙЛА | Нет профиля/подписки/PIN-настроек |
| BottomNav | `layout/BottomNav.jsx` | 🟡 ЧАСТИЧНО | Файл есть, но нигде не подключён |

**Итого страниц-модулей реализовано: 4 (welcome, auth, onboarding, dashboard) из ~50 продуктовых.**

---

## 6. i18n — таблица

16 языков в `src/locales/*/common.json`. Эталон — `ru` (107 ключей). «Пробелы» у не-славянских — это отсутствующие славянские плюрал-формы `_few`/`_many` (для них не требуются → фактически 100%).

| Язык | Ключей | % от ru | Пробелы |
|---|---|---|---|
| ru | 107 | 100% | — (эталон) |
| uk | 103 | 96% | 4 ключа `step2_date_*` / `step2_load_failed` |
| be | 103 | 96% | 4 ключа `step2_date_*` / `step2_load_failed` |
| en | 101 | 94% | только плюрал-формы `_few`/`_many` (не нужны) |
| es | 99 | 93% | плюрал `_few`/`_many` + `step2_date_*` |
| fr | 99 | 93% | то же |
| it | 99 | 93% | то же |
| pt | 99 | 93% | то же |
| de | 97 | 91% | плюрал `_few`/`_many` + `step2_date_*` |
| tr | 97 | 91% | то же |
| kk | 97 | 91% | то же |
| uz | 97 | 91% | то же |
| ky | 97 | 91% | то же |
| az | 97 | 91% | то же |
| hy | 97 | 91% | то же |
| ka | 97 | 91% | то же |

**Реальное число языков: 16** (`ru, uk, be, kk, en, tr, de, fr, es, it, pt, uz, ky, az, hy, ka`).
Разделы ключей: `common`, `auth`, `onboarding`, `dashboard`.

> ⚠️ Действительный пробел, требующий заливки, есть только у `uk`/`be`/`es`/`fr`/`it`/`pt` и др.: не хватает `step2_date_invalid`, `step2_date_future`, `step2_date_too_old`, `step2_load_failed` — валидационные строки шага 2 онбординга. Остальное — плюрал-формы, которые для этих языков не требуются.

---

## 7. Расхождения с CLAUDE.md

1. **Число языков.** CLAUDE.md говорит «11 языков» (и в разных местах фигурирует 8/16). Фактически в коде — **16** (добавлены `uz, ky, az, hy, ka`). Коммит `224f258` подтверждает «i18n на 16 языков».
2. **Локали.** CLAUDE.md описывает плоские файлы `src/locales/ru.json`. Фактически — namespace-структура `src/locales/<lng>/common.json`.
3. **`src/lib/gemini.js`** — заявлен в структуре, **не создан**.
4. **UI-кит** — обещаны `Card, Badge, StatCard, ProgressRing, Button, Modal, Toast`; реально есть только `Card`, `WidgetHeader`, `ChildCard`.
5. **BottomNav** — заявлен как готовая навигация (5 табов); файл есть, но **не подключён** к приложению.
6. **Роут `/auth/callback`** (Задание 2) — отсутствует; вместо magic link используется OTP-код, поэтому callback не нужен (осознанное отклонение от плана).
7. **Welcome-экран** (`/welcome`, выбор языка) — реализован, но в CLAUDE.md не описан.
8. **React 19 / router 7 / Tailwind 4** — версии новее, чем подразумевает CLAUDE.md (React 18, Tailwind 3-стиль config). Проект на Tailwind v4 (`@tailwindcss/vite`, без классического `content`-конфига).
9. **Stripe** — заявлен в стеке; `@stripe/stripe-js` не установлен.
10. **`profiles.language`** — используется для синхронизации локали (в CLAUDE.md явно не описано).

### Зависимости (package.json)

Установлено: `@supabase/supabase-js`, `react-router-dom` (v7), `recharts`, `framer-motion`, `react-i18next`, `i18next`, `i18next-browser-languagedetector`, `flag-icons`, `react`/`react-dom` (v19).
Dev: `vite` (v6), `@vitejs/plugin-react`, `tailwindcss` + `@tailwindcss/vite` (v4), `vite-plugin-pwa`.

| Пакет | Статус |
|---|---|
| @supabase/supabase-js | ✅ есть |
| react-router-dom | ✅ есть (v7) |
| recharts | ✅ есть (пока нигде не используется) |
| framer-motion | ✅ есть |
| react-i18next / i18next | ✅ есть |
| vite-plugin-pwa | ✅ есть |
| @stripe/stripe-js | ❌ нет |

Файлы инфры: `src/lib/supabase.js` ✅, `src/lib/gemini.js` ❌, `AuthContext.jsx` ✅, `ProtectedRoute` ✅, `vite.config.js` ✅, `vercel.json` ✅, `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) ✅.

---

## 8. Где мы остановились

Последние 15 коммитов (`git log --oneline -15`) — работа шла над **Dashboard и виджетом воды**:

```
280b0f2 fix: grant SELECT on views to authenticated + fix quotes.text → quotes.quote
628a73d fix(water): ждём резолва user.id перед загрузкой view при холодном старте
446f046 fix(water): синхронизация UI с view после RPC без race condition
e29d16b fix(dashboard): вода +1 теперь работает и сохраняется
224f258 feat(dashboard): полноценный Dashboard с 5 виджетами и i18n на 16 языков
7399b46 fix(auth): persist session in PWA (localStorage + autoRefresh)
ae7bf38 fix(onboarding): шаг 2 — подгрузка детей + full-replace
78267f4 feat(i18n): полная интеграция react-i18next, 16 языков
6744a63 feat(onboarding): шаг 4 — знакомство с Донной
...
```

**Вывод:** последним доводили до ума **Dashboard** (виджет воды, права на views, цитаты). Онбординг и auth стабилизированы раньше. Следующий логичный шаг по дорожной карте CLAUDE.md — **PIN + модуль Финансы**, но перед этим не хватает базовой навигации и UI-кита.

---

## 9. Рекомендованные следующие 5 задач (по приоритету)

1. **Подключить навигацию (BottomNav) + каркас роутинга модулей.** Импортировать существующий `BottomNav`, добавить в `App.jsx` маршруты-заглушки `/finance`, `/children`, `/health`, `/more` под `ProtectedRoute`. Одна сессия — только скелет навигации, без содержимого экранов.

2. **Доукомплектовать UI-кит.** Создать `Button`, `Badge`, `StatCard`, `ProgressRing`, `Modal`, `Toast` в `src/components/ui/` на дизайн-токенах (`bg-canvas/card/accent`). Разблокирует все будущие модули.

3. **PIN для финансов + `useFinancePin`.** `/finance/pin-setup` и `/finance/pin-enter`, хэш в `profiles.finance_pin_hash`, разблокировка в sessionStorage (Задание 4 CLAUDE.md).

4. **Модуль «Финансы» — базовый экран.** `/finance` (за PIN): список расходов (`expenses`), ручной ввод, сводка из view `v_today_total` / `v_month_total`, график на recharts (пакет уже стоит, но не задействован).

5. **Залить недостающие i18n-ключи + `src/lib/gemini.js` (заглушка Edge Function).** Добавить `step2_date_*` / `step2_load_failed` в языки, где их нет; создать `gemini.js` с вызовом Edge Function, чтобы «Донна говорит» перестал быть статикой. Закрывает расхождения §7.

---

## 10. Результат сборки

`npm run build` — ✅ **успешно** (`✓ built in 2.73s`).

- PWA сгенерирован: `dist/sw.js` + workbox, **155 precache entries (~4.76 MiB)**.
- ⚠️ Предупреждение: главный чанк `index-*.js` **741.69 kB** (gzip 224.97 kB) — больше 500 kB. Не ошибка, но стоит подумать о code-splitting / `manualChunks` (частично из-за `flag-icons` SVG и recharts).
- Ошибок и падений сборки нет.
