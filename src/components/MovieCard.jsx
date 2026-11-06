const MovieCard = ({
  movie: { id, title, vote_average, poster_path, release_date, original_language },
  onSelect,
}) => {
  return (
    <li>
      <div
        className="movie-card cursor-pointer transition hover:scale-[1.03]"
        onClick={() => onSelect(id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect(id)
          }
        }}
        role="button"
        tabIndex={0}
      >
        <img
          src={
            poster_path
              ? `https://image.tmdb.org/t/p/w500${poster_path}`
              : '/poster-not-available.png'
          }
          alt={title}
        />

        <div className="mt-4">
          <h3>{title}</h3>

          <div className="content">
            <div className="rating">
              <img src="/star.svg" alt="Star" />
              <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
            </div>
            <span>•</span>
            <p className="lang">{original_language}</p>
            <span>•</span>
            <p className="year">{release_date ? release_date.split('-')[0] : 'N/A'}</p>
          </div>
        </div>
      </div>
    </li>
  )
}

export default MovieCard