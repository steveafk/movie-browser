import { useState, useEffect } from 'react'
import './App.css'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import MovieModal from './components/MovieModal.jsx'
import AuthModal from './components/AuthModal.jsx'
import WatchlistPanel from './components/WatchlistPanel.jsx'
import { useAuth } from './AuthContext.jsx'
import { useWatchlist } from './hooks/useWatchlist.js'
import { updateSearchCount, getTrendingMovies } from './supabase.js'
import { API_BASE_URL, API_OPTIONS } from './tmdb.js'

function App() {
  // Current signed-in user (null when signed out) and the sign out function
  const { user, signOut } = useAuth()

  // One shared watchlist instance, passed down to the modal and the panel
  const watchlist = useWatchlist()

  // What the user is currently typing in the search box
  const [searchTerm, setSearchTerm] = useState('')

  // The search term after the user stops typing for 500ms (used for the API call)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  const [errorMessage, setErrorMessage] = useState('')

  // Movies shown in the "All Movies" grid
  const [movieList, setMovieList] = useState([])

  // True while movies are being fetched (shows the spinner)
  const [isLoading, setIsLoading] = useState(false)

  // Top 5 most searched movies from Supabase
  const [trendingMovies, setTrendingMovies] = useState([])

  // TMDB id of the clicked movie; null means the details modal is closed
  const [selectedMovieId, setSelectedMovieId] = useState(null)

  // Which popups are open
  const [showAuth, setShowAuth] = useState(false)
  const [showWatchlist, setShowWatchlist] = useState(false)

  // DEBOUNCE: wait 500ms after the user stops typing before searching
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim())
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch movies from TMDB: search with a query, or popular movies without one
  const fetchMovies = async (query = '') => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false&page=1`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&include_adult=false&include_video=false&page=1`

      const response = await fetch(endpoint, API_OPTIONS)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()
      const results = data.results || []
      setMovieList(results)

      // Count this search toward Trending
      if (query && results.length > 0) {
        updateSearchCount(query, results[0])
      }
    } catch (error) {
      console.error('Error fetching movies:', error)
      setErrorMessage('Failed to fetch movies. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Runs on page load and whenever the debounced search term changes
  useEffect(() => {
    fetchMovies(debouncedSearchTerm)
  }, [debouncedSearchTerm])

  // Runs once on page load: load the trending list from Supabase
  useEffect(() => {
    getTrendingMovies().then(setTrendingMovies)
  }, [])

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        {/* Top bar: sign in, or watchlist + sign out */}
        <nav className="flex items-center justify-end gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-gray-100 sm:block">
                {user.email}
              </span>
              <button
                type="button"
                onClick={() => setShowWatchlist(true)}
                className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white"
              >
                My Watchlist ({watchlist.items.length})
              </button>
              <button
                type="button"
                onClick={signOut}
                className="cursor-pointer rounded-lg bg-light-100/10 px-4 py-2 text-sm text-white"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowAuth(true)}
              className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white"
            >
              Sign in
            </button>
          )}
        </nav>

        {/* Hero image and title */}
        <header>
          <img src="/hero.png" alt="Hero" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h1>
        </header>

        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        {/* Trending: only shown when Supabase returned data */}
        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedMovieId(movie.movie_id)}
                    className="flex flex-row items-center cursor-pointer text-left"
                  >
                    <p>{index + 1}</p>
                    <img
                      src={movie.poster_url || '/poster-not-available.png'}
                      alt={movie.search_term}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* All movies: spinner, error, or the grid */}
        <section className="all-movies">
          <h2 className="mt-[40px]">All Movies</h2>
          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-white">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onSelect={setSelectedMovieId}
                />
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Popups. Order matters: later ones sit on top of earlier ones. */}
      {showWatchlist && user && (
        <WatchlistPanel
          watchlist={watchlist}
          onOpenMovie={setSelectedMovieId}
          onClose={() => setShowWatchlist(false)}
        />
      )}

      {selectedMovieId && (
        <MovieModal
          movieId={selectedMovieId}
          onClose={() => setSelectedMovieId(null)}
          watchlist={watchlist}
          onRequireAuth={() => setShowAuth(true)}
        />
      )}

      {showAuth && !user && <AuthModal onClose={() => setShowAuth(false)} />}
    </main>
  )
}

export default App