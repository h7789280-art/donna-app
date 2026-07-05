// Catalog of the "More" tab — a two-level showcase of the whole app.
//
// Groups → modules. Modules aren't built yet, so every entry carries
// { route: null, status: 'soon' }. To ship a real module later, just point its
// `route` at the page and flip `status` to 'live' — MorePage will render it as a
// clickable row automatically, no other change needed.
//
// Titles/subtitles are resolved via i18n: t(`more.groups.${group.key}`),
// t(`more.groups.${group.key}_sub`) and t(`more.modules.${module.key}`).
//
// NOTE: Finance, Planner and Health are intentionally absent — they live in the
// BottomNav and must not be duplicated here.
//
// Icons follow the project convention: 24×24 viewBox, stroke="currentColor",
// strokeWidth 1.5, rounded caps — the same single set used in BottomNav / the
// finance hub.

/* ---- group icons (larger) ---- */

function HomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 11.5 12 4l8 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 20v-5h4v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FoodIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 3v7a2 2 0 0 0 2 2v9M8 3v6M10 3v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 3c-1.5 0-2.5 2-2.5 5s1 4 2.5 4v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FamilyIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16.5" cy="9" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 19v-1a4.5 4.5 0 0 1 9 0v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 19v-1a3.5 3.5 0 0 1 6.5-1.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function GrowthIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20v-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 12c0-3 2.5-5 6-5 0 3-2.5 5-6 5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 14c0-2.5-2-4.5-5-4.5 0 2.5 2 4.5 5 4.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function TravelIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="8" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 8v11M15 8v11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function PetsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="9" r="1.4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="7.5" r="1.4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16.5" cy="9" r="1.4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 15.5c0-1.8 1.3-3 3-3s3 1.2 3 3c0 1.6-1.2 2.5-3 2.5s-3-.9-3-2.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function GamificationIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 4h10v3a5 5 0 0 1-10 0V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7 5H4.5v1.5A2.5 2.5 0 0 0 7 9M17 5h2.5v1.5A2.5 2.5 0 0 1 17 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 12v4M9 20h6M10 20l.5-4h3l.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ---- module icons (compact, reused across groups where sensible) ---- */

function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function ChecklistIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6.5 5.5 8 8 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 13.5 5.5 15 8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 6.5h9M11 13.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function LoopIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 4v4h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 12a8 8 0 0 1-13.7 5.6L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 20v-4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function WrenchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 4a4 4 0 0 0-3.5 6L5 16.5 7.5 19l6.5-6.5A4 4 0 0 0 20 9l-2.5 2.5L15 9l2.5-2.5A4 4 0 0 0 15 4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function DocIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14 3v4h4M8 12h8M8 16h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ContactsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 19a6 6 0 0 1 12 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function LeafIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 4c-9 0-14 4-14 10 0 3 2 6 6 6 6 0 8-8 8-16z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 18c2-5 5-8 9-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 9h16M8 3v3M16 3v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 6c-1.5-1.3-4-2-7-2v13c3 0 5.5.7 7 2 1.5-1.3 4-2 7-2V4c-3 0-5.5.7-7 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 6v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 5h2l1.5 10.5a1 1 0 0 0 1 .9h8a1 1 0 0 0 1-.8L19 8H6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9.5" cy="19.5" r="1.2" fill="currentColor" />
      <circle cx="16.5" cy="19.5" r="1.2" fill="currentColor" />
    </svg>
  )
}

function BoxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 8 12 4l8 4-8 4-8-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M4 8v8l8 4 8-4V8M12 12v8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function ChildIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 20v-1a6 6 0 0 1 12 0v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SparkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6.5 6.5 9 9M15 15l2.5 2.5M17.5 6.5 15 9M9 15l-2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20s-7-4.35-7-9.5A3.5 3.5 0 0 1 12 7a3.5 3.5 0 0 1 7 3.5C19 15.65 12 20 12 20z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function GiftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="9" width="16" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 13h16M12 9v11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 9c-1-3-5-3-5-1s3 1 5 1zm0 0c1-3 5-3 5-1s-3 1-5 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function ConfettiIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20 9 7l8 8-13 5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14 4l.5 1.5L16 6l-1.5.5L14 8l-.5-1.5L12 6l1.5-.5L14 4zM19 9l.5 1.5L21 11l-1.5.5L19 13l-.5-1.5L17 11l1.5-.5L19 9z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  )
}

function MirrorIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="9" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 14v6M9 20h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function JournalIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 3v18M12 8h4M12 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function CapIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5 3 9l9 4 9-4-9-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7 11v4c0 1.5 2.2 2.5 5 2.5s5-1 5-2.5v-4M21 9v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function WheelIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 4v16M4 12h16M6.3 6.3l11.4 11.4M17.7 6.3 6.3 17.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function FlagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 21V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 4.5c3-1.5 6 1.5 9 0V13c-3 1.5-6-1.5-9 0V4.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function ListStarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 6.5 6.5 8 9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 6.5h8M5 13h4M12 13h8M5 18.5h4M12 18.5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function HourglassIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 4h10M7 20h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 4c0 4 8 5 8 8s-8 4-8 8M16 4c0 4-8 5-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function HangerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 8a2 2 0 1 1 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 8 4 15c-1 .9-.4 2.5 1 2.5h14c1.4 0 2-1.6 1-2.5L12 8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function PlaneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10 3.5c.6-.6 1.6-.6 2 .3l2 5.2 5-1c1 0 1.5 1 .8 1.7L15 15l1.2 4.3c.2.7-.6 1.3-1.2.8L12 18l-3 2c-.6.5-1.4-.1-1.2-.8L9 15 4.2 9.7c-.7-.7-.2-1.7.8-1.7l5 1 2-5.2c.4-.9-.6.3 0 0z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function PawIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="9" r="1.3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="7.5" r="1.3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16.5" cy="9" r="1.3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 15.5c0-1.7 1.3-2.8 3-2.8s3 1.1 3 2.8c0 1.5-1.2 2.4-3 2.4s-3-.9-3-2.4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 16V10a6 6 0 1 1 12 0v6l1.5 2.5H4.5L6 16z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function XpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4l2.4 4.9 5.4.8-3.9 3.8.9 5.3L12 16.3 7.2 18.8l.9-5.3L4.2 9.7l5.4-.8L12 4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function MedalIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="14" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 9 7 3M15 9l2-6M12 12l.8 1.6 1.7.2-1.2 1.2.3 1.7L12 16l-1.6.9.3-1.7-1.2-1.2 1.7-.2L12 12z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Each module: { key, icon, route, status }.
// route stays null and status 'soon' until the real page is wired up.
const soon = (key, icon) => ({ key, icon, route: null, status: 'soon' })

export const MORE_GROUPS = [
  {
    key: 'home',
    icon: HomeIcon,
    modules: [
      soon('zones', GridIcon),
      soon('cleaning', ChecklistIcon),
      soon('routines', LoopIcon),
      soon('maintenance', WrenchIcon),
      soon('documents', DocIcon),
      soon('contacts', ContactsIcon),
      soon('seasonal', LeafIcon),
    ],
  },
  {
    key: 'food',
    icon: FoodIcon,
    modules: [
      soon('menu', CalendarIcon),
      soon('recipes', BookIcon),
      soon('shopping', CartIcon),
      soon('pantry', BoxIcon),
    ],
  },
  {
    key: 'family',
    icon: FamilyIcon,
    modules: [
      soon('children', ChildIcon),
      soon('family_activities', SparkIcon),
      soon('quality_time', HeartIcon),
      soon('gifts', GiftIcon),
      soon('celebrations', ConfettiIcon),
    ],
  },
  {
    key: 'growth',
    icon: GrowthIcon,
    modules: [
      soon('reflection', MirrorIcon),
      soon('gratitude', HeartIcon),
      soon('journals', JournalIcon),
      soon('books', BookIcon),
      soon('courses', CapIcon),
      soon('life_wheel', WheelIcon),
      soon('challenges', FlagIcon),
      soon('bucket_list', ListStarIcon),
      soon('time_capsules', HourglassIcon),
      soon('wardrobe', HangerIcon),
    ],
  },
  {
    key: 'travel',
    icon: TravelIcon,
    modules: [
      soon('trips', PlaneIcon),
      soon('travel_checklists', ChecklistIcon),
    ],
  },
  {
    key: 'pets',
    icon: PetsIcon,
    modules: [
      soon('pets', PawIcon),
      soon('pet_events', BellIcon),
    ],
  },
  {
    key: 'gamification',
    icon: GamificationIcon,
    modules: [
      soon('xp', XpIcon),
      soon('badges', MedalIcon),
    ],
  },
]

export function getGroup(groupId) {
  return MORE_GROUPS.find((g) => g.key === groupId) || null
}
