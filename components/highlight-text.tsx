'use client'

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function parseHighlightTerms(query: string): string[] {
  return query.trim().split(/\s+/).filter(Boolean)
}

function isHighlightedTerm(part: string, terms: string[]): boolean {
  const normalizedPart = part.toLowerCase()
  return terms.some((term) => term.toLowerCase() === normalizedPart)
}

export type HighlightMode = 'words' | 'phrase'

interface HighlightTextProps {
  text: string
  query: string
  mode?: HighlightMode
  className?: string
}

export function HighlightText({
  text,
  query,
  mode = 'words',
  className,
}: HighlightTextProps) {
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    return <span className={className}>{text}</span>
  }

  if (mode === 'phrase') {
    const parts = text.split(new RegExp(`(${escapeRegex(trimmedQuery)})`, 'gi'))

    return (
      <span className={className}>
        {parts.map((part, index) =>
          part.toLowerCase() === trimmedQuery.toLowerCase() ? (
            <mark key={index} className="search-highlight">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    )
  }

  const terms = parseHighlightTerms(query)
  const pattern = terms.map(escapeRegex).join('|')
  const parts = text.split(new RegExp(`(${pattern})`, 'gi'))

  return (
    <span className={className}>
      {parts.map((part, index) =>
        isHighlightedTerm(part, terms) ? (
          <mark key={index} className="search-highlight">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  )
}
