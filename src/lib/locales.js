export const LOCALES = [
  { code: 'ru', name: 'Русский', welcome: 'Добро пожаловать', country: 'ru' },
  { code: 'uk', name: 'Українська', welcome: 'Ласкаво просимо', country: 'ua' },
  { code: 'be', name: 'Беларуская', welcome: 'Сардэчна запрашаем', country: 'by' },
  { code: 'kk', name: 'Қазақша', welcome: 'Қош келдіңіз', country: 'kz' },
  { code: 'en', name: 'English', welcome: 'Welcome', country: 'gb' },
  { code: 'tr', name: 'Türkçe', welcome: 'Hoş geldiniz', country: 'tr' },
  { code: 'de', name: 'Deutsch', welcome: 'Willkommen', country: 'de' },
  { code: 'fr', name: 'Français', welcome: 'Bienvenue', country: 'fr' },
  { code: 'es', name: 'Español', welcome: 'Bienvenido', country: 'es' },
  { code: 'it', name: 'Italiano', welcome: 'Benvenuto', country: 'it' },
  { code: 'pt', name: 'Português', welcome: 'Bem-vindo', country: 'pt' },
]

export const DEFAULT_LOCALE = 'ru'
export const LOCALE_STORAGE_KEY = 'donna_locale'

export function getStoredLocale() {
  return localStorage.getItem(LOCALE_STORAGE_KEY)
}

export function setStoredLocale(code) {
  localStorage.setItem(LOCALE_STORAGE_KEY, code)
}
