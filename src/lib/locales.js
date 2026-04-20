export const LOCALES = [
  { code: 'ru', name: 'Русский', welcome: 'Добро пожаловать', country: 'ru', continueLabel: 'Продолжить' },
  { code: 'uk', name: 'Українська', welcome: 'Ласкаво просимо', country: 'ua', continueLabel: 'Продовжити' },
  { code: 'be', name: 'Беларуская', welcome: 'Сардэчна запрашаем', country: 'by', continueLabel: 'Працягнуць' },
  { code: 'kk', name: 'Қазақша', welcome: 'Қош келдіңіз', country: 'kz', continueLabel: 'Жалғастыру' },
  { code: 'en', name: 'English', welcome: 'Welcome', country: 'gb', continueLabel: 'Continue' },
  { code: 'tr', name: 'Türkçe', welcome: 'Hoş geldiniz', country: 'tr', continueLabel: 'Devam et' },
  { code: 'de', name: 'Deutsch', welcome: 'Willkommen', country: 'de', continueLabel: 'Weiter' },
  { code: 'fr', name: 'Français', welcome: 'Bienvenue', country: 'fr', continueLabel: 'Continuer' },
  { code: 'es', name: 'Español', welcome: 'Bienvenido', country: 'es', continueLabel: 'Continuar' },
  { code: 'it', name: 'Italiano', welcome: 'Benvenuto', country: 'it', continueLabel: 'Continua' },
  { code: 'pt', name: 'Português', welcome: 'Bem-vindo', country: 'pt', continueLabel: 'Continuar' },
  { code: 'uz', name: 'Oʻzbek', welcome: 'Xush kelibsiz', country: 'uz', continueLabel: 'Davom etish' },
  { code: 'ky', name: 'Кыргызча', welcome: 'Кош келиңиз', country: 'kg', continueLabel: 'Улантуу' },
  { code: 'az', name: 'Azərbaycan', welcome: 'Xoş gəlmisiniz', country: 'az', continueLabel: 'Davam et' },
  { code: 'hy', name: 'Հայերեն', welcome: 'Բարի գալուստ', country: 'am', continueLabel: 'Շարունակել' },
  { code: 'ka', name: 'ქართული', welcome: 'კეთილი იყოს თქვენი მობრძანება', country: 'ge', continueLabel: 'გაგრძელება' },
]

export const LOCALE_CODES = LOCALES.map((l) => l.code)
export const DEFAULT_LOCALE = 'ru'
export const LOCALE_STORAGE_KEY = 'donna_locale'

export function getStoredLocale() {
  return localStorage.getItem(LOCALE_STORAGE_KEY)
}

export function setStoredLocale(code) {
  localStorage.setItem(LOCALE_STORAGE_KEY, code)
}
