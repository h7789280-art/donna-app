# DONNA LIFE MANAGER — CLAUDE.md v4.0

**PWA SaaS Application (NO Telegram!)**

Обновлено: 18.04.2026 — база данных развёрнута, начинаем фронтенд.

---

## ПРОЕКТ

Donna — AI-powered life manager SaaS. PWA-приложение.
- ~50 модулей, ~1334 пункта в чек-листе
- Целевая аудитория: женщины 25-45, мамы, предпринимательницы, экспаты
- Монетизация: **Free / Pro $4.99 / Family $7.99**
- Язык интерфейса: 8 языков (ru, en, tr, es, de, fr, it, pt)

---

## СТЕК

- **Frontend:** Vite + React 18 + Tailwind CSS
- **Backend:** Supabase (Auth + Database + Storage + Edge Functions)
- **AI:** Gemini 2.5 Flash API (через Edge Functions)
- **Cron/Push:** n8n Cloud (schedule triggers + Web Push)
- **Хостинг:** Vercel (бесплатно)
- **Платежи:** Stripe
- **i18n:** react-i18next
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

### 🔜 СЛЕДУЮЩИЙ ШАГ

**Задание 1: Инициализация Vite-проекта** (см. ниже)

---

## SUPABASE

- **Project:** Donna Life Manager
- **URL:** `https://daxuzttlpnyenveflhmg.supabase.co`
- **Auth:** Email + Magic Link (+ опционально Google OAuth)
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
│   ├── locales/
│   │   ├── ru.json
│   │   ├── en.json
│   │   ├── tr.json
│   │   ├── es.json
│   │   ├── de.json
│   │   ├── fr.json
│   │   ├── it.json
│   │   └── pt.json
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

**BottomNav (5 табов):**
1. Главная (dashboard)
2. Финансы (за PIN)
3. Дети (переключатель между детьми)
4. Здоровье
5. ☰ Ещё (все остальные модули)

---

## ПРАВИЛА РАЗРАБОТКИ

1. **ОДНА задача за сессию Claude Code**
2. Supabase использует `auth.uid()` автоматически через RLS — **не нужно вручную добавлять `user_id` в запросы `SELECT`** (только в `INSERT`)
3. **RLS включён** — anon key безопасен для клиента
4. **Mobile-first** — сначала мобильный, потом десктоп
5. **i18n с первого дня** — все строки через `t('key')`, 8 языков
6. **Компоненты переиспользуемые** — Card, Badge, StatCard, ProgressRing
7. **Каждый `npm run build`** должен проходить без ошибок
8. **PIN только на финансы** — хэш в `profiles.finance_pin_hash`, обычные модули без PIN
9. **Free/Pro/Family** — проверка через `usePlan()` хук, paywall при попытке Pro-фичи

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

1. **LoginPage:** email + magic link (`supabase.auth.signInWithOtp`)
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

## СЛЕДУЮЩИЕ ЗАДАНИЯ (контекст на будущее)

5. **Финансы** (ввод + голос + чеки + графики)
6. **Дети** (расписание + задания + переключатель + milestones)
7. **Здоровье** (витамины + вода + энергия + сон + цикл)
8. **Привычки + настроение + цели**
9. **Push-уведомления** (n8n + Web Push API)
10. **Чат с Донной** (голос + текст через Gemini Edge Function)
11. **Геймификация** (XP, уровни, бейджи)
12. **i18n** — перевод на 8 языков
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
