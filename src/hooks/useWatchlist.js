import { useState, useEffect } from 'react'
import { supabase } from '../supabase.js'
import { useAuth } from '../AuthContext.jsx'

export const useWatchlist = () => {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Load this user's list whenever they sign in or out
  useEffect(() => {
    if (!user || !supabase) {
      setItems([])
      return
    }

    setIsLoading(true)
    supabase
      .from('watchlist')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error('Failed to load watchlist:', error)
        else setItems(data)
        setIsLoading(false)
      })
  }, [user])

  const isSaved = (movieId) => items.some((i) => i.movie_id === movieId)

  const add = async (movie) => {
    const { data, error } = await supabase
      .from('watchlist')
      .insert({
        movie_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date || null,
      })
      .select()
      .single()

    if (error) return console.error('Failed to add:', error)
    setItems((prev) => [data, ...prev])
  }

  const remove = async (movieId) => {
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('movie_id', movieId)

    if (error) return console.error('Failed to remove:', error)
    setItems((prev) => prev.filter((i) => i.movie_id !== movieId))
  }

  // changes example: { watched: true } or { rating: 8 }
  const update = async (movieId, changes) => {
    const { error } = await supabase
      .from('watchlist')
      .update(changes)
      .eq('movie_id', movieId)

    if (error) return console.error('Failed to update:', error)
    setItems((prev) =>
      prev.map((i) => (i.movie_id === movieId ? { ...i, ...changes } : i))
    )
  }

  return { items, isLoading, isSaved, add, remove, update }
}