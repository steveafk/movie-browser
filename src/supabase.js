import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

// ave a search to Supabase increments the count for that term
export const updateSearchCount = async (searchTerm, movie) => {
  if (!supabase) return

  const { error } = await supabase.rpc('increment_search', {
    p_term: searchTerm.toLowerCase(),
    p_movie_id: movie.id,
    p_poster: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : null,
  })

  if (error) console.error('Failed to update search count:', error)
}

// gget the top 5 most searched movies
export const getTrendingMovies = async () => {
  if (!supabase) return []

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