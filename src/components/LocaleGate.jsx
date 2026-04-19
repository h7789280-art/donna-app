import { Navigate } from 'react-router-dom'
import { getStoredLocale } from '../lib/locales'

export default function LocaleGate({ children }) {
  if (!getStoredLocale()) return <Navigate to="/welcome" replace />
  return children
}
