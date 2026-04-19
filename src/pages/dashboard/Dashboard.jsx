import { useAuth } from '../../contexts/AuthContext'

export default function Dashboard() {
  const { user, signOut } = useAuth()

  return (
    <div className="p-6 pb-24">
      <h1 className="mb-4 text-2xl text-gold" style={{ fontFamily: 'Playfair Display, serif' }}>
        Donna
      </h1>
      <p className="text-sm text-white/60">
        Добро пожаловать{user?.email ? `, ${user.email}` : ''}. Дашборд — Задание 3.
      </p>
      <button
        onClick={signOut}
        className="mt-6 rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 hover:text-white"
      >
        Выйти
      </button>
    </div>
  )
}
