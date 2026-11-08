import { useState, useEffect } from 'react'
import Spinner from './Spinner.jsx'
import { useAuth } from '../AuthContext.jsx'
import { API_BASE_URL, API_OPTIONS } from '../tmdb.js'

const MovieModal = ({ movieId, onClose, watchlist, onRequireAuth }) => {
  const { user } = useAuth()
  const [movie, setMovie] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch details + cast for the selected movie
  useEffect(() => {
    let cancelled = false

    const fetchDetails = async () => {
      setIsLoading(true)
      setError('')
      try {
        const response = await fetch(
          `${API_BASE_URL}/movie/${movieId}?append_to_response=credits`,
          API_OPTIONS
        )
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const data = await response.json()
        if (!cancelled) setMovie(data)
      } catch (err) {
        console.error('Error fetching movie details:', err)
        if (!cancelled) setError('Failed to load movie details.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchDetails()
    return () => {
      cancelled = true
    }
  }, [movieId])

  // Close on Escape + lock background scroll while open
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const cast = movie?.credits?.cast?.slice(0, 10) || []
  const saved = movie ? watchlist.isSaved(movie.id) : false

  // Signed-out users get the sign-in form; signed-in users add/remove
  const handleWatchlist = () => {
    if (!user) return onRequireAuth()
    if (saved) watchlist.remove(movie.id)
    else watchlist.add(movie)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-dark-100 p-6 shadow-inner shadow-light-100/10"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 cursor-pointer text-3xl leading-none text-gray-100 hover:text-white"
        >
          &times;
        </button>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : error ? (
          <p className="py-10 text-center text-white">{error}</p>
        ) : (
          <>
            <img
              src={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                  : '/poster-not-available.png'
              }
              alt={movie.title}
              className="mx-auto max-h-[420px] w-auto rounded-lg object-contain"
            />

            <h2 className="mt-5 text-center">{movie.title}</h2>

            <p className="mt-1 text-center text-gray-100">
              {movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}
              {movie.runtime ? ` • ${movie.runtime} min` : ''}
              {movie.vote_average ? ` • ⭐ ${movie.vote_average.toFixed(1)}` : ''}
            </p>

            <button
              type="button"
              onClick={handleWatchlist}
              className={`mx-auto mt-4 block cursor-pointer rounded-lg px-5 py-2 font-bold text-white ${
                saved ? 'bg-light-100/10' : 'bg-indigo-600'
              }`}
            >
              {saved ? '✓ In your watchlist (remove)' : '+ Add to watchlist'}
            </button>

            <p className="mt-4 leading-relaxed text-light-200">
              {movie.overview || 'No description available.'}
            </p>

            {cast.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 text-lg font-bold text-white">Cast</h3>
                <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {cast.map((actor) => (
                    <li
                      key={actor.cast_id ?? actor.credit_id}
                      className="flex items-center gap-3"
                    >
                      {actor.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                          alt={actor.name}
                          className="h-12 w-12 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-light-100/10 text-white">
                          {actor.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">
                          {actor.name}
                        </p>
                        <p className="truncate text-xs text-gray-100">
                          {actor.character}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default MovieModal