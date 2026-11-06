import { useState, useEffect } from 'react'
import './App.css'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import MovieModal from './components/MovieModal.jsx'
import { updateSearchCount, getTrendingMovies } from './supabase.js'
import { API_BASE_URL, API_OPTIONS } from './tmdb.js'

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [movieList, setMovieList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [trendingMovies, setTrendingMovies] = useState([])
  const [selectedMovieId, setSelectedMovieId] = useState(null)

  // Debounce the search input by 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim())
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // fetch movies from TMDB API, with query = searches for movie title, without query = fetches popular movies
  const fetchMovies = async (query = '') => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false&page=1`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&include_adult=false&include_video=false&page=1`

      const response = await fetch(endpoint, API_OPTIONS)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const results = data.results || []
      setMovieList(results)

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

  useEffect(() => {
    fetchMovies(debouncedSearchTerm)
  }, [debouncedSearchTerm])

  // get the top searched movies halin kay supabase
  useEffect(() => {
    getTrendingMovies().then(setTrendingMovies)
  }, [])

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <img src="/hero.png" alt="Hero" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h1>
        </header>

        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

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

      {selectedMovieId && (
        <MovieModal
          movieId={selectedMovieId}
          onClose={() => setSelectedMovieId(null)}
        />
      )}
    </main>
  )
}

export default App