export const LOCALES = [
  { code: 'ru', name: 'Русский', welcome: 'Добро пожаловать', flag: '🇷🇺' },
  { code: 'uk', name: 'Українська', welcome: 'Ласкаво просимо', flag: '🇺🇦' },
  { code: 'be', name: 'Беларуская', welcome: 'Сардэчна запрашаем', flag: '🇧🇾' },
  { code: 'kk', name: 'Қазақша', welcome: 'Қош келдіңіз', flag: '🇰🇿' },
  { code: 'en', name: 'English', welcome: 'Welcome', flag: '🇬🇧' },
  { code: 'tr', name: 'Türkçe', welcome: 'Hoş geldiniz', flag: '🇹🇷' },
  { code: 'de', name: 'Deutsch', welcome: 'Willkommen', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', welcome: 'Bienvenue', flag: '🇫🇷' },
  { code: 'es', name: 'Español', welcome: 'Bienvenido', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', welcome: 'Benvenuto', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', welcome: 'Bem-vindo', flag: '🇵🇹' },
]

export const DEFAULT_LOCALE = 'ru'
export const LOCALE_STORAGE_KEY = 'donna_locale'

export function getStoredLocale() {
  return localStorage.getItem(LOCALE_STORAGE_KEY)
}

export function setStoredLocale(code) {
  localStorage.setItem(LOCALE_STORAGE_KEY, code)
}
