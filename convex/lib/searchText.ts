type InlineContent = {
  type?: string
  text?: string
  content?: InlineContent[]
}

type Block = {
  content?: InlineContent[]
  children?: Block[]
}

function extractInlineText(content: InlineContent[] | undefined): string {
  if (!content?.length) return ""
  return content
    .map((item) => item.text ?? extractInlineText(item.content))
    .join("")
}

function extractBlocksText(blocks: Block[]): string {
  return blocks
    .map((block) => {
      const own = extractInlineText(block.content)
      const nested = block.children?.length
        ? extractBlocksText(block.children)
        : ""
      return [own, nested].filter(Boolean).join(" ")
    })
    .join(" ")
}

export function extractSearchTextFromContent(contentJson?: string): string {
  if (!contentJson) return ""
  try {
    const blocks = JSON.parse(contentJson) as Block[]
    return Array.isArray(blocks) ? extractBlocksText(blocks) : ""
  } catch {
    return ""
  }
}

export function buildSearchText(title: string, content?: string): string {
  const body = extractSearchTextFromContent(content)
  return `${title} ${body}`.replace(/\s+/g, " ").trim().toLowerCase()
}

export function parseSearchTerms(query: string): string[] {
  return query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => term.toLowerCase())
}

export function matchesAllSearchTerms(haystack: string, terms: string[]): boolean {
  if (terms.length === 0) return true
  const normalizedHaystack = haystack.toLowerCase()
  return terms.every((term) => normalizedHaystack.includes(term))
}

export function matchesPhrase(haystack: string, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return true
  return haystack.toLowerCase().includes(normalizedQuery)
}

export function getMatchSnippet(
  searchText: string,
  query: string,
  radius = 40
): string | undefined {
  return getMatchSnippetFromOriginal(searchText, query, radius)
}

export function getMatchSnippetFromOriginal(
  originalText: string,
  query: string,
  radius = 40
): string | undefined {
  const terms = parseSearchTerms(query)
  if (terms.length === 0) return undefined

  if (terms.length === 1) {
    const term = terms[0]
    const idx = originalText.toLowerCase().indexOf(term)
    if (idx === -1) return undefined

    const start = Math.max(0, idx - radius)
    const end = Math.min(originalText.length, idx + term.length + radius)
    const snippet = originalText.slice(start, end).trim()
    return `${start > 0 ? "…" : ""}${snippet}${end < originalText.length ? "…" : ""}`
  }

  return getMatchSnippetForTerms(originalText, terms, radius)
}

export function getMatchSnippetForTerms(
  originalText: string,
  terms: string[],
  radius = 40
): string | undefined {
  if (terms.length === 0) return undefined

  const lowerText = originalText.toLowerCase()
  const matches = terms
    .map((term) => {
      const idx = lowerText.indexOf(term)
      return idx === -1 ? null : { idx, end: idx + term.length }
    })
    .filter((match): match is { idx: number; end: number } => match !== null)

  if (matches.length === 0) return undefined

  const firstIdx = Math.min(...matches.map((m) => m.idx))
  const lastEnd = Math.max(...matches.map((m) => m.end))

  const start = Math.max(0, firstIdx - radius)
  const end = Math.min(originalText.length, lastEnd + radius)
  const snippet = originalText.slice(start, end).trim()

  return `${start > 0 ? "…" : ""}${snippet}${end < originalText.length ? "…" : ""}`
}

export function getMatchSnippetForPhrase(
  originalText: string,
  query: string,
  radius = 40
): string | undefined {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return undefined

  const idx = originalText.toLowerCase().indexOf(normalizedQuery)
  if (idx === -1) return undefined

  const start = Math.max(0, idx - radius)
  const end = Math.min(originalText.length, idx + normalizedQuery.length + radius)
  const snippet = originalText.slice(start, end).trim()

  return `${start > 0 ? "…" : ""}${snippet}${end < originalText.length ? "…" : ""}`
}
