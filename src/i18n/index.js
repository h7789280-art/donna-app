import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import ru from '../locales/ru/common.json'
import uk from '../locales/uk/common.json'
import be from '../locales/be/common.json'
import kk from '../locales/kk/common.json'
import en from '../locales/en/common.json'
import tr from '../locales/tr/common.json'
import de from '../locales/de/common.json'
import fr from '../locales/fr/common.json'
import es from '../locales/es/common.json'
import it from '../locales/it/common.json'
import pt from '../locales/pt/common.json'
import uz from '../locales/uz/common.json'
import ky from '../locales/ky/common.json'
import az from '../locales/az/common.json'
import hy from '../locales/hy/common.json'
import ka from '../locales/ka/common.json'

const resources = {
  ru: { common: ru },
  uk: { common: uk },
  be: { common: be },
  kk: { common: kk },
  en: { common: en },
  tr: { common: tr },
  de: { common: de },
  fr: { common: fr },
  es: { common: es },
  it: { common: it },
  pt: { common: pt },
  uz: { common: uz },
  ky: { common: ky },
  az: { common: az },
  hy: { common: hy },
  ka: { common: ka },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: ['ru', 'uk', 'be', 'kk', 'en', 'tr', 'de', 'fr', 'es', 'it', 'pt', 'uz', 'ky', 'az', 'hy', 'ka'],
    fallbackLng: 'ru',
    defaultNS: 'common',
    ns: ['common'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'donna_locale',
      caches: ['localStorage'],
    },
    returnNull: false,
  })

export default i18n
