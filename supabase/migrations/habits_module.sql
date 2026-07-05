-- =====================================================================
-- HABITS MODULE — выполнить в Supabase SQL Editor
-- Простые привычки (сделал/не сделал): CRUD, отметка на сегодня,
-- серия дней, недельная статистика.
-- Идемпотентно (можно накатывать повторно).
--
-- УРОК ВОДЫ: каждой таблице/вьюхе — явный GRANT для authenticated.
-- RLS НЕ заменяет GRANT. Вьюхи с security_invoker читают базовые
-- таблицы от роли authenticated → без GRANT SELECT на базовую таблицу
-- вьюха под юзером падает 42501 и возвращает ПУСТО. Все GRANT — ниже.
-- =====================================================================

-- ---------------------------------------------------------------------
-- ШАГ 0 (ДИАГНОСТИКА — Елена, выполни ОТДЕЛЬНО и пришли результат, если
-- таблицы habits / habit_log уже существовали в старой мега-схеме):
--
--   SELECT table_name, column_name, data_type, is_nullable, column_default
--   FROM information_schema.columns
--   WHERE table_schema = 'public'
--     AND table_name IN ('habits', 'habit_log')
--   ORDER BY table_name, ordinal_position;
--
-- Если у legacy-таблиц есть колонки NOT NULL без DEFAULT, которых нет
-- в схеме ниже (например frequency / target), их вставка сломает —
-- пришли результат, поправлю. Если таблицы пустые и не нужны в старом
-- виде, можно безопасно раскомментировать DROP-строки ниже.
-- ---------------------------------------------------------------------

-- Опционально (ТОЛЬКО если диагностика показала несовместимую пустую
-- legacy-схему habit_log с другими именами колонок, напр. log_date):
-- DROP TABLE IF EXISTS habit_log CASCADE;
-- DROP TABLE IF EXISTS habits CASCADE;

-- 1) Таблица привычек --------------------------------------------------
CREATE TABLE IF NOT EXISTS habits (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL DEFAULT auth.uid()
                REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text NOT NULL,
  icon        text,                             -- эмодзи/строка
  color       text NOT NULL DEFAULT 'accent',   -- ключ токена палитры
  sort_order  int  NOT NULL DEFAULT 0,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- На случай, если таблица уже существовала без нужных колонок:
ALTER TABLE habits ADD COLUMN IF NOT EXISTS icon       text;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS color      text NOT NULL DEFAULT 'accent';
ALTER TABLE habits ADD COLUMN IF NOT EXISTS sort_order int  NOT NULL DEFAULT 0;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS is_active  boolean NOT NULL DEFAULT true;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

-- 2) Журнал отметок ----------------------------------------------------
CREATE TABLE IF NOT EXISTS habit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL DEFAULT auth.uid()
                REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id    uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date        date NOT NULL DEFAULT current_date,   -- серверная дата (не клиентская!)
  done        boolean NOT NULL DEFAULT true,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE habit_log ADD COLUMN IF NOT EXISTS date       date NOT NULL DEFAULT current_date;
ALTER TABLE habit_log ADD COLUMN IF NOT EXISTS done       boolean NOT NULL DEFAULT true;
ALTER TABLE habit_log ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Уникальность отметки на день — нужна для upsert (ON CONFLICT).
CREATE UNIQUE INDEX IF NOT EXISTS habit_log_uid_habit_date_idx
  ON habit_log (user_id, habit_id, date);

CREATE INDEX IF NOT EXISTS habit_log_uid_date_idx
  ON habit_log (user_id, date);

-- 3) RLS ---------------------------------------------------------------
ALTER TABLE habits    ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS habits_select ON habits;
DROP POLICY IF EXISTS habits_insert ON habits;
DROP POLICY IF EXISTS habits_update ON habits;
DROP POLICY IF EXISTS habits_delete ON habits;

CREATE POLICY habits_select ON habits
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY habits_insert ON habits
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY habits_update ON habits
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY habits_delete ON habits
  FOR DELETE USING (user_id = auth.uid());

DROP POLICY IF EXISTS habit_log_select ON habit_log;
DROP POLICY IF EXISTS habit_log_insert ON habit_log;
DROP POLICY IF EXISTS habit_log_update ON habit_log;
DROP POLICY IF EXISTS habit_log_delete ON habit_log;

CREATE POLICY habit_log_select ON habit_log
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY habit_log_insert ON habit_log
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY habit_log_update ON habit_log
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY habit_log_delete ON habit_log
  FOR DELETE USING (user_id = auth.uid());

-- 4) Вьюха недельной статистики (7 дней) -------------------------------
-- Для каждой активной привычки × каждый из последних 7 дней (серверная
-- дата через generate_series) — статус done. Последний день = сегодня.
-- security_invoker=true → читает habits/habit_log от роли authenticated,
-- поэтому ОБЯЗАТЕЛЕН GRANT SELECT на обе базовые таблицы (см. ниже).
CREATE OR REPLACE VIEW v_habit_week
WITH (security_invoker = true) AS
SELECT
  h.id                       AS habit_id,
  d.day::date                AS date,
  COALESCE(l.done, false)    AS done
FROM habits h
CROSS JOIN generate_series(current_date - 6, current_date, interval '1 day') AS d(day)
LEFT JOIN habit_log l
  ON  l.habit_id = h.id
  AND l.user_id  = h.user_id
  AND l.date     = d.day::date
WHERE h.user_id = auth.uid()
  AND COALESCE(h.is_active, true) = true
ORDER BY h.sort_order, h.created_at, d.day;

-- 5) RPC: отметить/снять привычку на СЕГОДНЯ (серверная дата) ----------
-- Upsert по (user_id, habit_id, current_date); повторный вызов флипает
-- done. Возвращает новое значение done. Дата берётся на сервере —
-- клиентская таймзона не влияет (урок про UTC на воде).
CREATE OR REPLACE FUNCTION toggle_habit(p_habit_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_done boolean;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM habits WHERE id = p_habit_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'habit % not found for current user', p_habit_id;
  END IF;

  INSERT INTO habit_log (user_id, habit_id, date, done)
  VALUES (auth.uid(), p_habit_id, current_date, true)
  ON CONFLICT (user_id, habit_id, date)
  DO UPDATE SET done = NOT habit_log.done, updated_at = now()
  RETURNING done INTO v_done;

  RETURN v_done;
END;
$$;

-- 6) GRANT (RLS НЕ заменяет GRANT — урок воды!) ------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON habits    TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON habit_log TO authenticated;
GRANT SELECT ON v_habit_week TO authenticated;      -- вьюха
-- security_invoker вьюха читает базовые таблицы под ролью authenticated:
-- GRANT SELECT на habits/habit_log уже даны строкой выше — вьюха оживает.
GRANT EXECUTE ON FUNCTION toggle_habit(uuid) TO authenticated;
