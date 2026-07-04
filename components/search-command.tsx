'use client'

import { File } from 'lucide-react'
import { useQuery } from 'convex/react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'

import { HighlightText } from '@/components/highlight-text'
import { SearchModeToggle } from '@/components/search-mode-toggle'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useSearch } from '@/hooks/use-search'
import {
  getStoredSearchMode,
  SearchMode,
  storeSearchMode,
} from '@/hooks/use-search-mode'
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'

export function SearchCommand() {
  const { user } = useUser()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [searchMode, setSearchMode] = useState<SearchMode>('words')
  const [isMounted, setIsMounted] = useState(false)

  const toggle = useSearch((store) => store.toggle)
  const isOpen = useSearch((store) => store.isOpen)
  const onClose = useSearch((store) => store.onClose)

  const trimmedQuery = debouncedQuery.trim()
  const documents = useQuery(
    api.documents.getSearch,
    trimmedQuery ? { query: trimmedQuery, mode: searchMode } : { mode: searchMode }
  )

  useEffect(() => {
    setIsMounted(true)
    setSearchMode(getStoredSearchMode())
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 200)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setDebouncedQuery('')
    }
  }, [isOpen])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggle()
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [toggle])

  const handleModeChange = (mode: SearchMode) => {
    setSearchMode(mode)
    storeSearchMode(mode)
  }

  const onSelect = (id: Id<'documents'>) => {
    router.push(`/documents/${id}`)
    onClose()
  }

  if (!isMounted) {
    return null
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose} shouldFilter={false}>
      <CommandInput
        placeholder={
          searchMode === 'phrase'
            ? `Search exact phrases in ${user?.fullName ?? 'your'} pages…`
            : `Search ${user?.fullName ?? 'your'} pages and content…`
        }
        value={query}
        onValueChange={setQuery}
      />
      <SearchModeToggle mode={searchMode} onChange={handleModeChange} />
      <CommandList>
        <CommandEmpty>
          {trimmedQuery
            ? searchMode === 'phrase'
              ? 'No pages contain that exact phrase.'
              : 'No pages contain all of those words.'
            : 'No results found.'}
        </CommandEmpty>
        <CommandGroup heading="Documents">
          {documents?.map((document) => (
            <CommandItem
              key={document._id}
              value={document._id}
              onSelect={() => onSelect(document._id)}
              className="flex-col items-start gap-0.5 py-2"
            >
              <div className="flex w-full items-center">
                {document.icon ? (
                  <p className="mr-2 text-[18px]">{document.icon}</p>
                ) : (
                  <File className="mr-2 h-4 w-4 shrink-0" />
                )}
                {trimmedQuery ? (
                  <HighlightText
                    text={document.title}
                    query={trimmedQuery}
                    mode={searchMode}
                    className="truncate"
                  />
                ) : (
                  <span className="truncate">{document.title}</span>
                )}
              </div>
              {document.snippet && trimmedQuery && (
                <HighlightText
                  text={document.snippet}
                  query={trimmedQuery}
                  mode={searchMode}
                  className="ml-6 line-clamp-1 text-xs text-muted-foreground"
                />
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
