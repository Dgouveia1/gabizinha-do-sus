import { useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useNotebookStore } from '@/stores/notebookStore'

export function useNotebookSearch() {
  const { searchQuery, searchResults, searchLoading, setSearchQuery, setSearchResults, setSearchLoading } =
    useNotebookStore()
  const debounceRef = useRef(null)

  const search = useCallback(
    async (query) => {
      setSearchQuery(query)
      if (!query.trim()) {
        setSearchResults([])
        setSearchLoading(false)
        return
      }

      setSearchLoading(true)
      const { data, error } = await supabase.rpc('search_notebook_pages', {
        search_term: query.trim(),
      })

      if (!error) setSearchResults(data || [])
      setSearchLoading(false)
    },
    [setSearchQuery, setSearchResults, setSearchLoading]
  )

  const debouncedSearch = useCallback(
    (query) => {
      setSearchQuery(query)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => search(query), 400)
    },
    [search, setSearchQuery]
  )

  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setSearchResults([])
    setSearchLoading(false)
  }, [setSearchQuery, setSearchResults, setSearchLoading])

  return { searchQuery, searchResults, searchLoading, search, debouncedSearch, clearSearch }
}
