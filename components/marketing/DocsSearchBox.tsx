'use client'

// DocsSearchBox — interactive search for the docs sidebar.
// Runs entirely in the browser: no server round-trip needed because all
// article content is already bundled via getSearchIndex().
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { getSearchIndex, type DocSearchItem } from '@/lib/docs-content'
import { colors, radiusMkt, fontSizeMkt, fontFamily } from '@/lib/design-tokens'

// Build the search index once when the module loads (not on every render)
const SEARCH_INDEX: DocSearchItem[] = getSearchIndex()

// Return up to maxResults articles whose title, lead, or body contain the query
function search(query: string, maxResults = 6): DocSearchItem[] {
  const q = query.toLowerCase().trim()
  if (!q) return []

  return SEARCH_INDEX.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.lead.toLowerCase().includes(q) ||
    item.contentText.toLowerCase().includes(q)
  ).slice(0, maxResults)
}

// Extract a short snippet of text around the first match in contentText
function snippet(text: string, query: string, radius = 80): string {
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text.slice(0, radius * 2) + '…'
  const start = Math.max(0, idx - radius)
  const end = Math.min(text.length, idx + query.length + radius)
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '')
}

export default function DocsSearchBox() {
  const [query, setQuery]         = useState('')
  const inputRef                  = useRef<HTMLInputElement>(null)
  const containerRef              = useRef<HTMLDivElement>(null)
  const router                    = useRouter()

  // Results and open state are now derived directly from query via useMemo,
  // instead of being copied into their own state and synced through an effect.
  // This removes the setState-in-effect pattern entirely — query is the
  // single source of truth, and results/open are just computed from it.
  const results = useMemo(() => search(query), [query])
  const [activeIdx, setActiveIdxRaw] = useState(0)
  const [prevResults, setPrevResults] = useState(results)
  const open = results.length > 0

  // Reset the active index whenever the result set changes
  if (results !== prevResults) {
    setPrevResults(results)
    setActiveIdxRaw(0)
  }

  function setActiveIdx(value: number | ((prev: number) => number)) {
    setActiveIdxRaw(value)
  }

  // ⌘K / Ctrl+K opens the search box
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Close the dropdown when clicking outside the component
  const [forceClosed, setForceClosed] = useState(false)
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setForceClosed(true)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  // The dropdown is open only if there are results AND the user
  // hasn't explicitly closed it (click outside, Escape, or clear)
  const isOpen = open && !forceClosed

  // Navigate to a result article
  const navigate = useCallback((slug: string) => {
    setQuery('')
    setForceClosed(true)
    router.push(`/docs/${slug}`)
  }, [router])

  // Handle keyboard navigation inside the dropdown
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[activeIdx]) navigate(results[activeIdx].slug)
    } else if (e.key === 'Escape') {
      setForceClosed(true)
      setQuery('')
    }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', marginBottom: '22px' }}>
      {/* Search input row */}
      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '9px 12px',
        borderRadius: radiusMkt.sm,
        border: `1px solid ${isOpen ? colors.accent.bright : colors.border.mkt}`,
        backgroundColor: colors.bg.mktSurface,
        color: colors.text.dim,
        fontSize: '13.5px',
        transition: 'border-color 0.15s',
        cursor: 'text',
      }}
        onClick={() => inputRef.current?.focus()}
      >
        <Search size={14} style={{ flexShrink: 0, color: colors.text.dim }} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setForceClosed(false) }}
          onFocus={() => { if (results.length > 0) setForceClosed(false) }}
          onKeyDown={onKeyDown}
          placeholder="Search docs"
          aria-label="Search documentation"
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            color: colors.text.soft,
            fontSize: '13.5px',
            fontFamily: fontFamily.body,
          }}
        />
        {/* Show a clear button while typing */}
        {query && (
          <button
            onClick={() => { setQuery(''); setForceClosed(true) }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: colors.text.dim, padding: 0, display: 'flex',
            }}
            aria-label="Clear search"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Dropdown results list */}
      {isOpen && results.length > 0 && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          backgroundColor: colors.bg.elevated,
          border: `1px solid ${colors.border.mkt2}`,
          borderRadius: radiusMkt.md,
          boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
          zIndex: 100,
          overflow: 'hidden',
        }}>
          {results.map((item, idx) => (
            <button
              key={item.slug}
              onClick={() => navigate(item.slug)}
              onMouseEnter={() => setActiveIdx(idx)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '10px 14px',
                background: idx === activeIdx
                  ? `rgba(${colors.accent.glowRgb}, 0.08)`
                  : 'transparent',
                border: 'none',
                borderBottom: idx < results.length - 1
                  ? `1px solid ${colors.border.mkt}`
                  : 'none',
                cursor: 'pointer',
              }}
            >
              {/* Article group label */}
              <span style={{
                display: 'block',
                fontSize: '10px',
                fontFamily: fontFamily.mono,
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                color: colors.accent.bright,
                marginBottom: '2px',
              }}>
                {item.group}
              </span>

              {/* Article title */}
              <span style={{
                display: 'block',
                fontSize: fontSizeMkt.nav,
                fontWeight: 600,
                color: colors.text.base,
                marginBottom: '3px',
              }}>
                {item.title}
              </span>

              {/* Short content snippet */}
              <span style={{
                display: 'block',
                fontSize: '12px',
                color: colors.text.dim,
                lineHeight: 1.45,
              }}>
                {query
                  ? snippet(item.contentText, query)
                  : item.lead}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}