import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export const updateSearchCount = async (searchTerm, movie) => {
  const { error } = await supabase.rpc('increment_search', {
    p_term: searchTerm.toLowerCase(),
    p_movie_id: movie.id,
    p_poster: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : null,
  })
  if (error) console.error('Failed to update search count:', error)
}

export const getTrendingMovies = async () => {
  const { data, error } = await supabase
    .from('metrics')
    .select('*')
    .order('count', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Failed to load trending:', error)
    return []
  }
  return data
}