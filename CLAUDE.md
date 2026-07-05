# DONNA LIFE MANAGER — CLAUDE.md v4.0

**PWA SaaS Application (NO Telegram!)**

Обновлено: 05.07.2026 — каркас + дизайн-система готовы, финансовый модуль (ввод × 3 способа, полный отчёт, AI-анализ, категории, кошельки на хабе) готов, каталог «Ещё» готов, модуль «Вода» готов (первый живой модуль здоровья).

---

## ПРОЕКТ

Donna — AI-powered life manager SaaS. PWA-приложение.
- ~50 модулей, ~1334 пункта в чек-листе
- Целевая аудитория: женщины 25-45, мамы, предпринимательницы, экспаты
- Монетизация: **Free / Pro $4.99 / Family $7.99**
- Язык интерфейса: 16 языков (ru, uk, be, kk, en, tr, de, fr, es, it, pt, uz, ky, az, hy, ka)

---

## СТЕК

- **Frontend:** Vite + React 19 + Tailwind CSS
- **Backend:** Supabase (Auth + Database + Storage + Edge Functions)
- **AI:** Gemini 2.5 Flash API (через Edge Functions)
- **Cron/Push:** n8n Cloud (schedule triggers + Web Push)
- **Хостинг:** Vercel (бесплатно)
- **Платежи:** Stripe
- **i18n:** react-i18next (16 языков, файлы `src/locales/<lng>/common.json`)
- **Графики:** Recharts
- **Анимации:** framer-motion
- **PWA:** manifest.json + Service Worker

---

## ВАЖНО — НЕТ TELEGRAM!

Это **полноценное PWA-приложение**. Никакого Telegram-бота.

- Голосовой ввод: Web Speech API (браузер)
- Push-уведомления: Web Push API + Service Worker
- Камера (чеки): `<input type="file" capture>`
- Чат с Донной: встроенный в приложение
- Email-only авторизация (без SMS, без телефона)
- PIN только на финансовый модуль

---

## ТЕКУЩИЙ СТАТУС ✅

### ✅ ГОТОВО

- [x] Supabase проект создан (`daxuzttlpnyenveflhmg`)
- [x] **База данных развёрнута: 88 таблиц, 384 RLS-политики, 14 views, 9 функций**
- [x] Автотриггер `handle_new_user` — создаёт profile + free-подписку + gamification при регистрации
- [x] Схема сохранена в `donna_schema.sql` (идемпотентная, можно накатывать повторно)

### ✅ ТЕКУЩИЙ ПРОГРЕСС (обновлено 01.07.2026)

**Каркас и дизайн-система:**
- [x] Vite + React 19 проект инициализирован, Supabase-клиент, Auth (OTP), роутинг
- [x] **BottomNav** — навигация с ИКОНКАМИ над подписями, 5 табов: Главная / Финансы / Планировщик / Здоровье / Ещё. Увеличенные тап-таргеты (~71px), iOS safe-area. Таб «Дети» УБРАН (см. НАВИГАЦИЯ). Планировщик (`/planner`) и Донна — заглушки «Скоро».
- [x] **Каталог «Ещё»** (`/more`) — двухуровневый: 7 групп-карточек → список модулей группы (disabled, «Скоро»). Данные в `src/pages/more/catalog.jsx` (`MORE_GROUPS`), модуль `{ key, icon, route, status }`. Демо-витрина UI-кита убрана.
- [x] **AppLayout** — обёртка `ProtectedRoute` + `Outlet` + `BottomNav`
- [x] **UI-кит** в `src/components/ui/`: Button, Badge, StatCard, ProgressRing, Modal, Toast
- [x] Статусные токены `success` / `warning` / `error` (шалфей / охра / терракота) в `globals.css` + `tailwind.config.js`

**Финансы (модуль в работе):**
- [x] **PIN-защита:** `useFinancePin` (SHA-256 + `user_id` как соль), `PinPad`, `PinSetup`, `PinEnter`, `FinanceGate` (гейт роутинга). Хэш в `profiles.finance_pin_hash`.
- [x] **БД:** таблица `wallets` (мультивалюта, тип cash/card, `is_default`, RLS + GRANT). `finance_categories` расширена `parent_id` (двухуровневая иерархия), посеяно дерево (57 категорий: 13 родителей расходов + подкатегории + 5 доходов). `expenses` / `income` получили `wallet_id`. GRANT `authenticated` на `wallets` / `expenses` / `income` / `finance_categories`.
- [x] **Кошельки:** `useWallets` (CRUD, логика «основного»), `WalletCard`, `WalletForm`. `src/lib/currencies.js` (TRY / USD / EUR / RUB / GBP / UAH / KZT / AZN / GEL / AMD). Кошельки с балансами вынесены НАВЕРХ хаба `FinancePage` (видны сразу, CRUD/основной работают на хабе), карточка-ссылка «Кошельки» из списка убрана, кнопка «+ Кошелёк» — вторичный стиль.
- [x] **Ввод операции:** `useFinanceCategories`, `useTransactions`, `AddTransactionPage`. Расход/доход → кошелёк → категория → подкатегория → сумма → дата → заметка. Баланс кошелька пересчитывается в коде (вариант А: прочитать → delta → записать).

**Финансы — ввод расходов, ТРИ способа:**
- [x] **Ручной ввод** (форма: кошелёк → категория → подкатегория → сумма → дата → заметка).
- [x] **Распознавание чеков:** фото → сжатие (canvas, 1600px / JPEG 0.7) → Edge Function `scan-receipt` (Gemini 2.5 Flash vision) → распознаёт позиции, переводит названия на язык интерфейса (турецкий → рус), раскидывает по категориям/подкатегориям юзера → редактируемый список → несколько транзакций.
- [x] **Голосовой ввод:** `MediaRecorder` (НЕ Web Speech API — iOS) → Edge Function `voice-expense` (Gemini аудио) → умный разбор одной или нескольких трат из фразы («потратила 200 на такси и 150 на кофе») → транзакции.
- [x] **Общий компонент `ExpenseReview`** — единый редактируемый экран подтверждения для чека и голоса (позиции: имя, сумма, каскад категория → подкатегория, ochre-подсветка «без категории», удаление строки, итого, кошелёк, дата). Кнопки над `BottomNav` с учётом iOS safe-area.
- [x] **`addExpensesBatch`** в `useTransactions` — N транзакций + один пересчёт баланса (вариант А), общий для чека и голоса.

**Финансы — отчёт (ПОЛНЫЙ):**
- [x] **Отчёт с drill-down** (категории → подкатегории, донат с центральной подписью, авто-масштаб суммы, переключатели валюта + период).
- [x] **`ReportTrends`** под донатом: график по дням (`BarChart`), сравнение с прошлым периодом (рост = ochre / снижение = sage), график по месяцам (6 мес). `dailyTotals` переиспользует загруженные строки, `useExpenseTrends` догружает 6 мес / прошлый период.
- [x] **AI-анализ «Разбор от Донны»** — кнопка на отчёте → Edge Function `analyze-expenses` (Gemini) → инсайт по тратам в тоне Донны Полсен (sassy), женский род, на языке интерфейса.

**Финансы — категории:**
- [x] **Управление категориями** (CRUD, двухуровневое дерево, удаление с отвязкой операций в «Без категории»).
- [x] **Стартовое дерево категорий** для новых юзеров — SQL-триггер `seed_finance_categories` при регистрации (58 категорий, файл `supabase/seed_finance_categories.sql`).

**AI-инфраструктура:**
- [x] **Gemini-труба построена:** Edge Functions в `supabase/functions/*` (`analyze-expenses`, `scan-receipt`, `voice-expense`), клиентские хелперы в `src/lib/gemini.js`, секрет `GEMINI_API_KEY` в Supabase.
- [x] **Автодеплой Edge Functions** через GitHub Actions (`.github/workflows/deploy-functions.yml`, триггер push в `supabase/functions/**`, секрет `SUPABASE_ACCESS_TOKEN`, версия CLI запинена `2.109.0`).

**Здоровье — Вода (ПЕРВЫЙ живой модуль здоровья):**
- [x] **Экран `/health/water` (`WaterPage`):** ряд стаканов, счётчик N/цель + %, кнопки +/−, настраиваемая дневная цель с автосохранением (debounced, диапазон 1–20), недельная статистика (7 дней + среднее), серия дней (streak). Вход — карточка «Вода» на `HealthPage`.
- [x] **Виджет воды на дашборде** ведёт на `/health/water`, +1 работает.
- [x] **БД:** `water_log` (`id, user_id, date, glasses, goal, updated_at` — ЦЕЛЬ хранится в `water_log.goal`, НЕ в `profiles`). Вьюхи `v_water_today`, `v_water_7d` (`security_invoker`). RPC: `add_water`, `remove_water`, `set_water_goal`.

### 🔜 СЛЕДУЮЩЕЕ по финансам

- [ ] Лента операций (список последних записей)
- [ ] При редактировании/удалении операции — откат баланса на дельту (вариант А)

---

## SUPABASE

- **Project:** Donna Life Manager
- **URL:** `https://daxuzttlpnyenveflhmg.supabase.co`
- **Auth:** Email + OTP-код (6 цифр, `signInWithOtp`) (+ опционально Google OAuth)
- **RLS:** включён на всех таблицах — anon key безопасен для клиента
- **Все таблицы имеют `user_id`** — пользователь видит только свои данные
- **Дети:** таблица `children`, все детские модули через `child_id`

### Ключевые таблицы БД

**Фундамент:** `profiles`, `children`, `subscriptions_billing`, `user_settings`, `bot_state`, `push_subscriptions`, `chat_history`, `notifications_log`, `voice_transcriptions`, `analytics_events`

**Финансы:** `expenses`, `income`, `finance_categories`, `clients`, `projects`, `savings_goals`, `savings_log`, `subscriptions`, `wishlist_items`, `watchlist`

**Здоровье:** `health_schedule`, `health_log`, `water_log`, `energy_log`, `sleep_log`, `mood_log`, `weight_log`, `body_measurements`, `cycle_log`, `cycle_settings`, `medical_records`, `illness_log`, `skincare_routine`, `selfcare_log`, `workouts`, `workout_log`

**Дети:** `children`, `children_schedule`, `children_tasks`, `child_milestones`, `child_rewards`, `kids_quotes`

**Еда:** `menu_restrictions`, `menu_weekly`, `recipes`, `pantry`

**Продуктивность:** `goals`, `goal_milestones`, `goal_tasks`, `habits`, `habit_log`, `focus_sessions`, `time_entries`, `notes`, `ideas_bank`, `content_calendar`, `reflections`, `gratitude_log`, `quotes`, `affirmations`, `daily_questions`, `daily_wins`, `life_wheel`, `challenges`, `bucket_list`

**Дом/семья:** `home_zones`, `cleaning_tasks`, `cleaning_log`, `home_maintenance`, `routines`, `routine_log`, `important_dates`, `emergency_contacts`, `documents`, `secure_notes`, `contacts_crm`, `seasonal_checklists`, `family_activities`, `family_sizes`, `quality_time`, `gift_ideas`, `celebrations`

**Путешествия:** `trips`, `trip_checklists`

**Развитие:** `books`, `courses`, `wardrobe`, `ig_stats`

**Дневники:** `photo_diary`, `voice_diary`, `dream_journal`, `time_capsules`

**Питомцы:** `pets`, `pet_events`

**Геймификация:** `gamification`, `xp_log`, `badges`

### Готовые views (для дашборда)

- `v_expenses_today`, `v_expenses_this_week`, `v_expenses_daily_7d`, `v_expenses_monthly`, `v_today_total`, `v_month_total`
- `v_health_today`, `v_zlata_today` (→ переименовать восприятие: дети, не только Злата), `v_water_today`
- `v_gratitude_streak`, `v_energy_7d`, `v_energy_avg_week`
- `v_upcoming_dates`, `v_content_this_week`

### Готовые функции БД

- `add_water()` — +1 стакан воды на сегодня
- `mark_vitamins_taken(time_of_day)` — отметить приём витаминов
- `get_daily_summary(user_id)` → JSONB — для вечернего push
- `get_weekly_report(user_id)` → JSONB — для воскресного отчёта
- `get_russian_day(date)` → TEXT — конвертация дня недели
- `has_active_subscription(user_id)` → BOOLEAN — есть ли Pro/Family
- `get_user_plan(user_id)` → TEXT — `free` / `pro` / `family`
- `handle_new_user()` — автотриггер на регистрацию
- `set_updated_at()` — триггер для обновления updated_at

### Storage buckets (нужно создать вручную когда дойдём)

Через Dashboard → Storage → New bucket:
- `avatars` (public)
- `receipts` (private)
- `voice` (private)
- `photos` (private)
- `documents` (private)

---

## СТРУКТУРА ПРОЕКТА

```
donna-life/
├── public/
│   ├── manifest.json
│   ├── sw.js
│   └── icons/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── lib/
│   │   ├── supabase.js          # Supabase клиент
│   │   └── gemini.js            # AI вызовы
│   ├── contexts/
│   │   ├── AuthContext.jsx      # Auth provider
│   │   └── AppContext.jsx       # Глобальное состояние
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── usePlan.js           # Free/Pro/Family
│   │   ├── useChildren.js
│   │   ├── useVoice.js          # Web Speech API
│   │   └── useFinancePin.js     # PIN только на финансы
│   ├── components/
│   │   ├── ui/                  # Button, Card, Badge, Modal, Toast
│   │   ├── layout/              # BottomNav, Header, ProtectedRoute
│   │   ├── charts/              # Recharts обёртки
│   │   └── donna/               # DonnaChat, DonnaInsight, VoiceButton
│   ├── pages/
│   │   ├── auth/                # Login, Onboarding
│   │   ├── dashboard/           # Home dashboard (настраиваемый)
│   │   ├── finance/             # Expenses, Income, Reports (за PIN)
│   │   ├── children/            # Schedule, Tasks, Milestones
│   │   ├── health/              # Vitamins, Water, Energy, Sleep, Cycle
│   │   ├── habits/              # Habits, Routines, Goals
│   │   ├── content/             # Ideas, Calendar
│   │   ├── home/                # Cleaning, Travel
│   │   ├── reflect/             # Gratitude, Reflection, Journal
│   │   └── settings/            # Profile, Subscription, PIN
│   ├── locales/                # 16 языков, по папке на локаль
│   │   ├── ru/common.json
│   │   ├── uk/common.json
│   │   ├── be/common.json
│   │   ├── kk/common.json
│   │   ├── en/common.json
│   │   ├── tr/common.json
│   │   ├── de/common.json
│   │   ├── fr/common.json
│   │   ├── es/common.json
│   │   ├── it/common.json
│   │   ├── pt/common.json
│   │   ├── uz/common.json
│   │   ├── ky/common.json
│   │   ├── az/common.json
│   │   ├── hy/common.json
│   │   └── ka/common.json
│   └── styles/
│       └── globals.css
├── CLAUDE.md
├── donna_schema.sql             # полная схема БД (справка)
├── package.json
├── tailwind.config.js
├── vite.config.js
└── vercel.json
```

---

## ДИЗАЙН-СИСТЕМА

- **Темы:** Light (warm cream, основная) + Dark (ночная бархатная). Переключение — атрибут `data-theme` на `<html>`.
- **Палитра (семантические токены):** Light — `canvas #F5EFE7`, `card #FBF7F1`, `ink #2A211C`, `accent #5C1F2C` (бордо). Dark — `canvas #161210`, `card #221B18`, `ink #F2ECE2`, `accent #B85A6E`. Полный справочник: [`src/styles/tokens.md`](src/styles/tokens.md).
- **Источник правды:** [`src/styles/globals.css`](src/styles/globals.css) (CSS-переменные `:root` / `[data-theme="dark"]`) + [`tailwind.config.js`](tailwind.config.js) (утилиты `bg-canvas`, `text-ink`, `bg-accent`…).
- **Шрифты:** Cormorant Garamond (заголовки, italic serif, wordmark) + Geist (body sans) + JetBrains Mono (метки в uppercase). Все три — Google Fonts, подключены в [`index.html`](index.html).
- **НЕ использовать:** DM Sans / Playfair / Inter / Roboto / Arial как primary (только как fallback), золотые акценты, фиолетовые градиенты, хардкодный hex в компонентах.
- **Decor-токены:** `decor-rose`, `decor-rose-soft`, `decor-taupe` — ТОЛЬКО для градиентов, аватаров, иллюстраций (не для фонов/текста).
- **Future tweaks** (не реализовано): переключение акцента между bordeaux / emerald / ink — см. раздел "Future tweaks" в [`tokens.md`](src/styles/tokens.md).
- **Анимации:** framer-motion, staggered reveals.
- **Mobile-first** — сначала мобильный, потом десктоп.
- **Дашборд настраиваемый** — конфиг в `profiles.dashboard_config` (JSONB).

---

## ПЕРСОНА ДОННЫ

- **Характер:** Донна Полсен из "Suits"
- **3 тона:** sassy (дерзкий) / warm (тёплый) / neutral
- Подколки с теплотой, информация первична
- System prompt адаптируется под `profiles.assistant_tone`

---

## НАВИГАЦИЯ

**BottomNav (5 табов, ИКОНКИ над подписями, тап-таргеты ~71px, iOS safe-area):**
1. Главная (dashboard)
2. Финансы (за PIN)
3. Планировщик (`/planner`, пока заглушка «Скоро»)
4. Здоровье
5. ☰ Ещё (каталог всех остальных модулей)

**Дети — НЕ таб, а СЛОЙ ДАННЫХ.** Этика: приложение — органайзер для всех женщин, не только мам. Дети появляются на Главной / в Планировщике только если заведены в онбординге. Роут `/children` не удалён — живёт как заглушка. Донна — тоже пока заглушка «Скоро».

**Каталог «Ещё» (`/more`)** — двухуровневый: 7 групп-карточек → тап → список модулей группы (серые, disabled, «Скоро»). Группы: Дом и быт, Еда, Семья и дети, Саморазвитие, Путешествия, Питомцы, Геймификация. Финансы / Планировщик / Здоровье в каталог НЕ включены (они в нижней панели). Данные в `src/pages/more/catalog.jsx` (`MORE_GROUPS`), каждый модуль `{ key, icon, route, status }` — подключение модуля = смена `status`/`route`.

---

## ПРАВИЛА РАЗРАБОТКИ

1. **ОДНА задача за сессию Claude Code**
2. Supabase использует `auth.uid()` автоматически через RLS — **не нужно вручную добавлять `user_id` в запросы `SELECT`** (только в `INSERT`)
3. **RLS включён** — anon key безопасен для клиента
4. **Mobile-first** — сначала мобильный, потом десктоп
5. **i18n с первого дня** — все строки через `t('key')`, 16 языков. **Non-negotiable:** каждый перевод всегда заливать во ВСЕ 16 файлов `src/locales/<lng>/common.json` без пропусков (ru, uk, be, kk, en, tr, de, fr, es, it, pt, uz, ky, az, hy, ka)
6. **Компоненты переиспользуемые** — Card, Badge, StatCard, ProgressRing
7. **Каждый `npm run build`** должен проходить без ошибок
8. **PIN только на финансы** — хэш в `profiles.finance_pin_hash`, обычные модули без PIN
9. **Free/Pro/Family** — проверка через `usePlan()` хук, paywall при попытке Pro-фичи

---

## УСВОЕННЫЕ УРОКИ (не наступать повторно)

- **Каждая новая таблица:** сразу `GRANT SELECT/INSERT/UPDATE/DELETE ... TO authenticated`. RLS **не заменяет** GRANT — забывали, ловили `42501 permission denied`.
- **Все мутации Supabase:** `.select()` + обработка ошибки; на `UPDATE`/`DELETE` обязательно `.eq('user_id', ...)` (иначе RLS-403, как было с `setDefault` в `useWallets`).
- **Gemini 2.5 Flash — thinking-модель:** всегда `thinkingConfig: { thinkingBudget: 0 }`, иначе thinking съедает `maxOutputTokens` и ответ обрезается.
- **Голос:** только `MediaRecorder` + Gemini (Web Speech API нестабилен в iOS Safari).
- **Vision/аудио:** `mimeType` брать из реального recorder/файла, слать в `inline_data`.
- **Вьюхи с `security_invoker=true`** читают базовую таблицу от роли `authenticated`. Без `GRANT SELECT` на базовую таблицу вьюха под юзером падает с `42501 permission denied` и возвращает ПУСТО (в БД данные есть, на экране 0). Из SQL Editor под админом читается — баг маскируется. Диагностика: `SET request.jwt.claims` + `SET ROLE authenticated;` → `SELECT` из вьюхи. → Каждой таблице сразу `GRANT SELECT/INSERT/UPDATE/DELETE TO authenticated`.
- **SQL функций/вьюх не накатывать мимо репозитория:** если DDL идёт прямо в Supabase, в коде нет актуальной схемы и диагностика слепнет. Финальные определения модулей сохранять в `supabase/*.sql` в репозитории.
- **Фронтенд-задачи** всегда завершать `vercel --prod --yes` (не оставлять preview).

---

## ЗАДАНИЕ 1: Инициализация проекта (СЛЕДУЮЩИЙ ШАГ)

Создать базовый проект:

```bash
npm create vite@latest donna-life -- --template react
cd donna-life
npm install @supabase/supabase-js react-router-dom recharts
npm install framer-motion react-i18next i18next
npm install -D tailwindcss @tailwindcss/vite
```

1. Настроить Tailwind (`tailwind.config.js`)
2. Создать структуру папок (см. выше)
3. Создать `src/lib/supabase.js`:

```js
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseKey)
```

4. Создать `.env`:

```
VITE_SUPABASE_URL=https://daxuzttlpnyenveflhmg.supabase.co
VITE_SUPABASE_ANON_KEY=твой_publishable_key
```

⚠️ **Где взять anon key:** Supabase Dashboard → Settings → API → `anon` `public` key

5. Создать `AuthContext.jsx` с хуком `useAuth`
6. Создать `ProtectedRoute` компонент
7. Создать минимальный `App.jsx` с роутингом:
   - `/login` → LoginPage
   - `/onboarding` → OnboardingPage
   - `/` → Dashboard (protected)
8. Создать базовый `BottomNav`
9. Запустить: `npm run dev` — должно работать
10. Git init + первый коммит

**НЕ ДЕЛАТЬ на этом этапе:** страницы модулей, дизайн, i18n, PWA. Только скелет.

---

## ЗАДАНИЕ 2: Auth + Onboarding

1. **LoginPage:** email + OTP-код (`supabase.auth.signInWithOtp`)
2. Обработка callback (`/auth/callback`)
3. **OnboardingPage** (6 шагов):
   - Шаг 1: "Как тебя зовут?" (имя → `profiles.name`)
   - Шаг 2: "Дети?" (имена + даты рождения → `children`)
   - Шаг 3: "Что важно?" (выбор модулей → `dashboard_config`)
   - Шаг 4: "Настрой ассистента" (имя, тон, время утра/вечера)
   - Шаг 5: Анимация "Готовлю систему…"
   - Шаг 6: Редирект на Dashboard
4. Сохранение: `profiles.onboarding_completed = true`
5. Опционально: предзаполнить `finance_categories` для нового user_id

⚠️ **Profile создаётся автоматически** при регистрации (триггер `handle_new_user`), не нужно делать `INSERT` в profiles вручную — нужно только `UPDATE` полей.

---

## ЗАДАНИЕ 3: Dashboard + дизайн-система

1. **UI компоненты:** Card, Badge, StatCard, ProgressRing, Button
2. **Header:** "Donna" + бейдж DEMO/LIVE + кольца прогресса
3. **Dashboard виджеты** (настраиваются через `dashboard_config`):
   - Цитата дня (из `quotes` или `affirmations`)
   - Расходы сегодня (view `v_today_total`)
   - Дети (следующее занятие из `children_schedule`)
   - Здоровье (view `v_water_today` + `v_health_today` + последний `energy_log`)
   - Донна говорит (AI-инсайт через Edge Function)
4. **BottomNav** с иконками и анимацией

---

## ЗАДАНИЕ 4: PIN для финансов

1. Страница `/finance/pin-setup` при первом входе в финансы
2. Хук `useFinancePin()` — проверка сессии
3. Хэш PIN (4 или 6 цифр) в `profiles.finance_pin_hash` (bcrypt или SHA256)
4. Разблокировка на сессию (sessionStorage)
5. Страница `/finance/pin-enter` если уже настроен

---

## ПРИОРИТЕТНАЯ ЦЕЛЬ НА БУДУЩЕЕ — виджеты модулей на Главной

Девушка заходит в модуль (Вода, Привычки) и выносит его на Дашборд как РАБОЧИЙ виджет — пить воду / отмечать прямо с главной. Персонализация Главной. Архитектура заложена: `profiles.dashboard_config` (JSONB). Строить ПОСЛЕ появления нескольких реальных модулей.

Порядок: каталог «Ещё» ✅ → реальные модули (Вода ✅, дальше Привычки и т.д.) → система виджетов дашборда.

---

## СЛЕДУЮЩИЕ ЗАДАНИЯ (контекст на будущее)

5. **Финансы** (ввод + голос + чеки + графики)
6. **Дети** (расписание + задания + переключатель + milestones)
7. **Здоровье** (витамины + вода + энергия + сон + цикл)
8. **Привычки + настроение + цели**
9. **Push-уведомления** (n8n + Web Push API)
10. **Чат с Донной** (голос + текст через Gemini Edge Function)
11. **Геймификация** (XP, уровни, бейджи)
12. **i18n** — перевод на 16 языков
13. **Stripe подписка** (Free/Pro/Family, paywall)
14. **PWA** (manifest, service worker, install prompt)
15. **Деплой на Vercel**

---

## МОНЕТИЗАЦИЯ

### Free (навсегда)
- Финансы (ручной ввод, без AI-инсайтов)
- 1 ребёнок
- Привычки (до 5)
- Вода
- Базовые напоминания (без push)
- Без голосового ввода
- Без распознавания чеков
- Без AI-корреляций
- Лёгкая реклама

### Pro ($4.99/мес)
- Все 50 модулей
- Безлимит детей
- Голосовой ввод
- Распознавание чеков
- AI-инсайты и корреляции
- Push-уведомления
- Геймификация
- Экспорт данных
- Без рекламы

### Family ($7.99/мес)
- Всё из Pro
- До 5 членов семьи (общий доступ к выбранным модулям)

### Stripe интеграция
- Таблица `subscriptions_billing` уже создана
- Stripe Checkout → Stripe Webhook → n8n workflow → UPDATE `subscriptions_billing`
- Функции `has_active_subscription(user_id)` и `get_user_plan(user_id)` — готовы
- Хук `usePlan()` на клиенте читает эти функции
- Paywall при попытке использовать Pro-фичу → экран `/pricing`

---

## ПОЛЕЗНЫЕ КОМАНДЫ SQL (для отладки)

```sql
-- Сколько таблиц в БД?
SELECT count(*) FROM information_schema.tables WHERE table_schema='public';

-- Сколько RLS-политик?
SELECT count(*) FROM pg_policies WHERE schemaname='public';

-- Список всех таблиц
SELECT table_name FROM information_schema.tables
WHERE table_schema='public' ORDER BY table_name;

-- Проверить что RLS включён везде
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname='public' AND rowsecurity=false;
-- Должно быть пусто!

-- Посмотреть свой профиль (под залогиненным юзером)
SELECT * FROM profiles WHERE user_id = auth.uid();

-- Получить план пользователя
SELECT get_user_plan(auth.uid());
```

---

## ФАЙЛЫ ПРОЕКТА

- `CLAUDE.md` — этот файл (инструкция для Claude Code)
- `donna_schema.sql` — полная схема БД (88 таблиц + RLS + views + функции)
- `DONNA_1334_ULTIMATE_FINAL.pdf` — полный чек-лист 1334 пункта (справка)
- `DONNA_CLAUDE_CODE_v3.pdf` — прошлая версия этого файла (можно удалить)

---

**Donna — не приложение. Донна — AI операционная система жизни.**
**И бизнес на $10K+ MRR.**
