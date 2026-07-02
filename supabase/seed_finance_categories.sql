-- ============================================================================
-- seed_finance_categories.sql
-- ----------------------------------------------------------------------------
-- НАЗНАЧЕНИЕ:
--   При регистрации КАЖДОГО нового пользователя автоматически создаёт
--   стартовое дерево финансовых категорий (расходы + доходы, двухуровневое).
--
--   Реализовано как ОТДЕЛЬНЫЙ триггер на auth.users, независимый от рабочего
--   триггера handle_new_user (тот НЕ модифицируется).
--
-- КАК ЗАПУСКАТЬ (Supabase Dashboard → SQL Editor):
--   Просто выполнить весь этот файл целиком. Он идемпотентен
--   (CREATE OR REPLACE FUNCTION + DROP TRIGGER IF EXISTS), безопасно
--   запускать повторно.
--
-- КАК ПРОТЕСТИТЬ ВРУЧНУЮ (для существующего юзера):
--   SELECT seed_finance_categories('<uuid-пользователя>');
--   -- повторный вызов ничего не сделает (у юзера уже есть категории).
--
-- Колонки finance_categories, которые заполняем:
--   user_id, name, type ('expense'|'income'), parent_id, sort_order.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Функция посева дерева категорий для одного пользователя
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION seed_finance_categories(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_parent_id uuid;
BEGIN
  -- Идемпотентность: если у юзера уже есть хоть одна категория — выходим.
  IF EXISTS (SELECT 1 FROM finance_categories WHERE user_id = p_user_id) THEN
    RETURN;
  END IF;

  -- ========================= РАСХОДЫ (expense) =========================

  -- 1. Продукты
  INSERT INTO finance_categories (user_id, name, type, parent_id, sort_order)
  VALUES (p_user_id, 'Продукты', 'expense', NULL, 1)
  RETURNING id INTO v_parent_id;
  INSERT INTO finance_categories (user_id, name, type, parent_id, sort_order) VALUES
    (p_user_id, 'Овощи',            'expense', v_parent_id, 1),
    (p_user_id, 'Фрукты',           'expense', v_parent_id, 2),
    (p_user_id, 'Мясо и птица',     'expense', v_parent_id, 3),
    (p_user_id, 'Рыба',             'expense', v_parent_id, 4),
    (p_user_id, 'Молочка',          'expense', v_parent_id, 5),
    (p_user_id, 'Хлеб и выпечка',   'expense', v_parent_id, 6),
    (p_user_id, 'Макароны и крупы', 'expense', v_parent_id, 7),
    (p_user_id, 'Сладости',         'expense', v_parent_id, 8),
    (p_user_id, 'Напитки',          'expense', v_parent_id, 9),
    (p_user_id, 'Кофе и чай',       'expense', v_parent_id, 10);

  -- 2. Бытовая химия
  INSERT INTO finance_categories (user_id, name, type, parent_id, sort_order)
  VALUES (p_user_id, 'Бытовая химия', 'expense', NULL, 2)
  RETURNING id INTO v_parent_id;
  INSERT INTO finance_categories (user_id, name, type, parent_id, sort_order) VALUES
    (p_user_id, 'Стиральный порошок', 'expense', v_parent_id, 1),
    (p_user_id, 'Чистящие средства',  'expense', v_parent_id, 2),
    (p_user_id, 'Пакеты и плёнка',    'expense', v_parent_id, 3),
    (p_user_id, 'Гигиена',            'expense', v_parent_id, 4),
    (p_user_id, 'Бумажные изделия',   'expense', v_parent_id, 5);

  -- 3. Кафе и рестораны (без подкатегорий)
  INSERT INTO finance_categories (user_id, name, type, parent_id, sort_order)
  VALUES (p_user_id, 'Кафе и рестораны', 'expense', NULL, 3);

  -- 4. Транспорт
  INSERT INTO finance_categories (user_id, name, type, parent_id, sort_order)
  VALUES (p_user_id, 'Транспорт', 'expense', NULL, 4)
  RETURNING id INTO v_parent_id;
  INSERT INTO finance_categories (user_id, name, type, parent_id, sort_order) VALUES
    (p_user_id, 'Такси',                  'expense', v_parent_id, 1),
    (p_user_id, 'Топливо',                'expense', v_parent_id, 2),
    (p_user_id, 'Общественный транспорт', 'expense', v_parent_id, 3),
    (p_user_id, 'Парковка',               'expense', v_parent_id, 4);

  -- 5. Дети
  INSERT INTO finance_categories (user_id, name, type, parent_id, sort_order)
  VALUES (p_user_id, 'Дети', 'expense', NULL, 5)
  RETURNING id INTO v_parent_id;
  INSERT INTO finance_categories (user_id, name, type, parent_id, sort_order) VALUES
    (p_user_id, 'Одежда',           'expense', v_parent_id, 1),
    (p_user_id, 'Игрушки',          'expense', v_parent_id, 2),
    (p_user_id, 'Кружки и секции',  'expense', v_parent_id, 3),
    (p_user_id, 'Детская еда',      'expense', v_parent_id, 4),
    (p_user_id, 'Детское здоровье', 'expense', v_parent_id, 5);

  -- 6. Здоровье и аптека
  INSERT INTO finance_categories (user_id, name, type, parent_id, sort_order)
  VALUES (p_user_id, 'Здоровье и аптека', 'expense', NULL, 6)
  RETURNING id INTO v_parent_id;
  INSERT INTO finance_categories (user_id, name, type, parent_id, sort_order) VALUES
    (p_user_id, 'Лекарства', 'expense', v_parent_id, 1),
    (p_user_id, 'Витамины',  'expense', v_parent_id, 2),
    (p_user_id, 'Врачи',     'expense', v_parent_id, 3),
    (p_user_id, 'Анализы',   'expense', v_parent_id, 4);

  -- 7. Красота
  INSERT INTO finance_categories (user_id, name, type, parent_id, sort_order)
  VALUES (p_user_id, 'Красота', 'expense', NULL, 7)
  RETURNING id INTO v_parent_id;
  INSERT INTO finance_categories (user_id, name, type, parent_id, sort_order) VALUES
    (p_user_id, 'Косметика',      'expense', v_parent_id, 1),
    (p_user_id, 'Парикмахерская', 'expense', v_parent_id, 2),
    (p_user_id, 'Уход',           'expense', v_parent_id, 3),
    (p_user_id, 'Маникюр',        'expense', v_parent_id, 4);

  -- 8. Дом и быт
  INSERT INTO finance_categories (user_id, name, type, parent_id, sort_order)
  VALUES (p_user_id, 'Дом и быт', 'expense', NULL, 8)
  RETURNING id INTO v_parent_id;
  INSERT INTO finance_categories (user_id, name, type, parent_id, sort_order) VALUES
    (p_user_id, 'Аренда',     'expense', v_parent_id, 1),
    (p_user_id, 'Коммуналка', 'expense', v_parent_id, 2),
    (p_user_id, 'Мебель',     'expense', v_parent_id, 3),
    (p_user_id, 'Ремонт',     'expense', v_parent_id, 4),
    (p_user_id, 'Посуда',     'expense', v_parent_id, 5);

  -- 9. Одежда (без подкатегорий)
  INSERT INTO finance_categories (user_id, name, type, parent_id, sort_order)
  VALUES (p_user_id, 'Одежда', 'expense', NULL, 9);

  -- 10. Развлечения
  INSERT INTO finance_categories (user_id, name, type, parent_id, sort_order)
  VALUES (p_user_id, 'Развлечения', 'expense', NULL, 10)
  RETURNING id INTO v_parent_id;
  INSERT INTO finance_categories (user_id, name, type, parent_id, sort_order) VALUES
    (p_user_id, 'Кино',        'expense', v_parent_id, 1),
    (p_user_id, 'Хобби',       'expense', v_parent_id, 2),
    (p_user_id, 'Путешествия', 'expense', v_parent_id, 3);

  -- 11. Подписки (без подкатегорий)
  INSERT INTO finance_categories (user_id, name, type, parent_id, sort_order)
  VALUES (p_user_id, 'Подписки', 'expense', NULL, 11);

  -- 12. Связь (без подкатегорий)
  INSERT INTO finance_categories (user_id, name, type, parent_id, sort_order)
  VALUES (p_user_id, 'Связь', 'expense', NULL, 12);

  -- 13. Прочее (без подкатегорий)
  INSERT INTO finance_categories (user_id, name, type, parent_id, sort_order)
  VALUES (p_user_id, 'Прочее', 'expense', NULL, 13);

  -- ========================= ДОХОДЫ (income) =========================
  -- Все без подкатегорий.
  INSERT INTO finance_categories (user_id, name, type, parent_id, sort_order) VALUES
    (p_user_id, 'Зарплата', 'income', NULL, 1),
    (p_user_id, 'Фриланс',  'income', NULL, 2),
    (p_user_id, 'Подарок',  'income', NULL, 3),
    (p_user_id, 'Возврат',  'income', NULL, 4),
    (p_user_id, 'Прочее',   'income', NULL, 5);
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. Триггерная функция-обёртка для auth.users
--    Ошибка сева НИКОГДА не должна блокировать регистрацию юзера,
--    поэтому вызов обёрнут в BEGIN ... EXCEPTION WHEN OTHERS.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user_categories()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    PERFORM seed_finance_categories(NEW.id);
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'seed_finance_categories failed for user %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. Триггер на auth.users (отдельный от on_auth_user_created / handle_new_user)
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created_categories ON auth.users;

CREATE TRIGGER on_auth_user_created_categories
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_categories();
