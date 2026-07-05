import WaterWidget from './WaterWidget'
import HabitsWidget from './HabitsWidget'

// ---------------------------------------------------------------------------
// WIDGET REGISTRY — single source of truth for dashboard widgets.
//
// The dashboard reads the enabled keys from profiles.dashboard_config
// ({ widgets: [...] }) and renders each one by looking it up here. The module
// screen (Water / Habits) shows a "Pin to home" toggle that writes the key
// into that array.
//
// To add a NEW module widget in the future — no dashboard rewrite needed:
//   1. Build a compact <YourWidget/> in src/widgets/ (self-contained: reuses
//      the module's own hook, renders <motion.section variants={fadeIn}> with
//      a WidgetHeader + Card).
//   2. Add its i18n title under dashboard.widgets.<key> in all 16 locales.
//   3. Append one entry to WIDGETS below:
//        { key, titleKey, moduleRoute, Component }
//   Done — it becomes pinnable and renders in dashboard_config order.
//
// Contract per entry:
//   key         — stable string stored in dashboard_config.widgets
//   titleKey    — i18n key for the section title
//   moduleRoute — route of the full module screen
//   Component   — React component rendering the compact working widget
// ---------------------------------------------------------------------------
export const WIDGETS = [
  {
    key: 'water',
    titleKey: 'dashboard.widgets.water',
    moduleRoute: '/health/water',
    Component: WaterWidget,
  },
  {
    key: 'habits',
    titleKey: 'dashboard.widgets.habits',
    moduleRoute: '/health/habits',
    Component: HabitsWidget,
  },
]

// key → descriptor, for O(1) lookup when rendering by config order.
export const WIDGET_MAP = Object.fromEntries(WIDGETS.map((w) => [w.key, w]))

// All registered keys (e.g. to validate config against known widgets).
export const WIDGET_KEYS = WIDGETS.map((w) => w.key)
