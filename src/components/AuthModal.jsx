import { useState } from 'react'
import { useAuth } from '../AuthContext.jsx'

const AuthModal = ({ onClose }) => {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')

    const { data, error } =
      mode === 'signin'
        ? await signIn(email, password)
        : await signUp(email, password)

    setBusy(false)

    if (error) return setError(error.message)

    if (mode === 'signup' && !data.session) {
      // Email confirmation is on: no session until they click the link
      return setMessage('Check your email to confirm your account, then sign in.')
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-dark-100 p-6 shadow-inner shadow-light-100/10"
      >
        <h2 className="text-center">
          {mode === 'signin' ? 'Sign in' : 'Create account'}
        </h2>

        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-5 w-full rounded-lg bg-light-100/10 px-4 py-3 text-white placeholder-light-200 outline-none"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-3 w-full rounded-lg bg-light-100/10 px-4 py-3 text-white placeholder-light-200 outline-none"
        />

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        {message && <p className="mt-3 text-sm text-green-400">{message}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full cursor-pointer rounded-lg bg-indigo-600 py-3 font-bold text-white disabled:opacity-50"
        >
          {busy ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Sign up'}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setError('')
            setMessage('')
          }}
          className="mt-4 w-full cursor-pointer text-sm text-gray-100 hover:text-white"
        >
          {mode === 'signin'
            ? 'No account? Sign up'
            : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  )
}

export default AuthModal