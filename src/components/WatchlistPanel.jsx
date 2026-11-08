import { useState } from 'react'
import Spinner from './Spinner.jsx'

const WatchlistPanel = ({ watchlist, onOpenMovie, onClose }) => {
  const { items, isLoading, remove, update } = watchlist
  const [filter, setFilter] = useState('all') // 'all' | 'todo' | 'watched'

  const visible = items.filter((i) =>
    filter === 'all' ? true : filter === 'watched' ? i.watched : !i.watched
  )

  // Un-watching also clears the rating (the database requires it)
  const toggleWatched = (item) =>
    update(
      item.movie_id,
      item.watched ? { watched: false, rating: null } : { watched: true }
    )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-dark-100 p-6 shadow-inner shadow-light-100/10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 cursor-pointer text-3xl leading-none text-gray-100 hover:text-white"
        >
          &times;
        </button>

        <h2>My Watchlist</h2>

        {/* Filter tabs */}
        <div className="mt-4 flex gap-2">
          {[
            ['all', 'All'],
            ['todo', 'To watch'],
            ['watched', 'Watched'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`cursor-pointer rounded-full px-4 py-1 text-sm ${
                filter === value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-light-100/10 text-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : visible.length === 0 ? (
          <p className="py-10 text-center text-gray-100">
            Nothing here yet. Open a movie and tap "Add to watchlist".
          </p>
        ) : (
          <ul className="mt-5 space-y-4">
            {visible.map((item) => (
              <li key={item.id} className="flex items-center gap-4">
                <img
                  src={
                    item.poster_path
                      ? `https://image.tmdb.org/t/p/w185${item.poster_path}`
                      : '/poster-not-available.png'
                  }
                  alt={item.title}
                  className="h-24 w-16 shrink-0 rounded-lg object-cover"
                />

                <div className="min-w-0 flex-1">
                  {/* Clicking the title opens the full details modal */}
                  <button
                    type="button"
                    onClick={() => onOpenMovie(item.movie_id)}
                    className="block max-w-full cursor-pointer truncate text-left font-bold text-white hover:underline"
                  >
                    {item.title}
                  </button>
                  <p className="text-sm text-gray-100">
                    {item.release_date ? item.release_date.split('-')[0] : 'N/A'}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                    <label className="flex cursor-pointer items-center gap-2 text-light-200">
                      <input
                        type="checkbox"
                        checked={item.watched}
                        onChange={() => toggleWatched(item)}
                      />
                      Watched
                    </label>

                    {/* Rating is only enabled once the movie is marked watched */}
                    <select
                      value={item.rating ?? ''}
                      disabled={!item.watched}
                      onChange={(e) =>
                        update(item.movie_id, {
                          rating: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      className="rounded-lg bg-light-100/10 px-2 py-1 text-white disabled:opacity-40"
                    >
                      <option value="" className="text-black">
                        Rate
                      </option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n} className="text-black">
                          {n} / 10
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => remove(item.movie_id)}
                  className="cursor-pointer text-sm text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default WatchlistPanel