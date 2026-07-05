-- =====================================================================
-- WATER MODULE — выполнить в Supabase SQL Editor
-- Настраиваемая цель + недельная статистика + удаление стакана.
-- Идемпотентно (можно накатывать повторно).
-- =====================================================================

-- 1) Настраиваемая цель воды -------------------------------------------
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS water_goal INT NOT NULL DEFAULT 8;

-- 2) Вьюха «сегодня» — цель берём из profiles.water_goal, а не из хардкода
--    ВАЖНО: если в water_log колонки называются иначе (напр. `date`
--    вместо `log_date`, `amount`/`count` вместо `glasses`) — поправь имена.
CREATE OR REPLACE VIEW v_water_today
WITH (security_invoker = true) AS
SELECT
  auth.uid()                                             AS user_id,
  COALESCE((
    SELECT SUM(w.glasses)::int
    FROM water_log w
    WHERE w.user_id = auth.uid()
      AND w.log_date = current_date
  ), 0)                                                  AS glasses,
  COALESCE((
    SELECT p.water_goal FROM profiles p WHERE p.user_id = auth.uid()
  ), 8)                                                  AS goal;

-- 3) Недельная статистика — по каждому из последних 7 дней: дата + стаканы.
CREATE OR REPLACE VIEW v_water_7d
WITH (security_invoker = true) AS
SELECT
  d.day::date                                            AS log_date,
  COALESCE((
    SELECT SUM(w.glasses)::int
    FROM water_log w
    WHERE w.user_id = auth.uid()
      AND w.log_date = d.day::date
  ), 0)                                                  AS glasses
FROM generate_series(current_date - 6, current_date, interval '1 day') AS d(day)
ORDER BY d.day;

-- 4) Удаление стакана (−1, не ниже нуля) --------------------------------
CREATE OR REPLACE FUNCTION remove_water()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE water_log
     SET glasses = GREATEST(glasses - 1, 0)
   WHERE user_id = auth.uid()
     AND log_date = current_date;
END;
$$;

-- 5) GRANT (RLS не заменяет GRANT) --------------------------------------
GRANT SELECT ON v_water_today TO authenticated;
GRANT SELECT ON v_water_7d    TO authenticated;
GRANT EXECUTE ON FUNCTION remove_water() TO authenticated;
