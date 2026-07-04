'use client'

import { AlignLeft, Quote } from 'lucide-react'

import { cn } from '@/lib/utils'
import { SearchMode } from '@/hooks/use-search-mode'

const MODES: {
  value: SearchMode
  label: string
  hint: string
  icon: typeof AlignLeft
}[] = [
  {
    value: 'words',
    label: 'All words',
    hint: 'Each word can appear anywhere',
    icon: AlignLeft,
  },
  {
    value: 'phrase',
    label: 'Exact phrase',
    hint: 'Words must appear together, in order',
    icon: Quote,
  },
]

interface SearchModeToggleProps {
  mode: SearchMode
  onChange: (mode: SearchMode) => void
}

export function SearchModeToggle({ mode, onChange }: SearchModeToggleProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b bg-muted/30 px-3 py-2">
      <div
        className="inline-flex rounded-lg bg-muted p-0.5"
        role="tablist"
        aria-label="Search mode"
      >
        {MODES.map(({ value, label, icon: Icon }) => {
          const isActive = mode === value

          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onChange(value)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                isActive
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {label}
            </button>
          )
        })}
      </div>
      <p className="hidden min-w-0 truncate text-[11px] text-muted-foreground sm:block">
        {MODES.find((item) => item.value === mode)?.hint}
      </p>
    </div>
  )
}
