GRANT SELECT ON v_water_today TO authenticated;
GRANT SELECT ON v_expenses_today TO authenticated;
GRANT SELECT ON v_expenses_this_week TO authenticated;
GRANT SELECT ON v_expenses_daily_7d TO authenticated;
GRANT SELECT ON v_expenses_monthly TO authenticated;
GRANT SELECT ON v_today_total TO authenticated;
GRANT SELECT ON v_month_total TO authenticated;
GRANT SELECT ON v_health_today TO authenticated;
GRANT SELECT ON v_zlata_today TO authenticated;
GRANT SELECT ON v_gratitude_streak TO authenticated;
GRANT SELECT ON v_energy_7d TO authenticated;
GRANT SELECT ON v_energy_avg_week TO authenticated;
GRANT SELECT ON v_upcoming_dates TO authenticated;
GRANT SELECT ON v_content_this_week TO authenticated;

-- Защита: для всех будущих views тоже
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO authenticated;
