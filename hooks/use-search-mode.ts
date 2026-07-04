'use client'

export type SearchMode = 'words' | 'phrase'

const SEARCH_MODE_KEY = 'notation-search-mode'

export function getStoredSearchMode(): SearchMode {
  if (typeof window === 'undefined') return 'words'
  const stored = localStorage.getItem(SEARCH_MODE_KEY)
  return stored === 'phrase' ? 'phrase' : 'words'
}

export function storeSearchMode(mode: SearchMode) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SEARCH_MODE_KEY, mode)
  }
}
