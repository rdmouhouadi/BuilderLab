import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Search } from 'lucide-react'
import { getArticle, getDefaultSlug, groupFor, DOC_GROUPS } from '@/lib/docs-content'
import {
  colors, radiusMkt, fontSizeMkt, fontFamily, layout, breakpoints,
} from '@/lib/design-tokens'

// Generate static routes for all articles
export function generateStaticParams() {
  return DOC_GROUPS
    .flatMap(g => g.articles.map(a => ({ slug: [a.slug] })))
    .concat([{ slug: [] }]) // /docs with no slug → default article
}

export async function generateMetadata(
  props: { params: Promise<{ slug?: string[] }> }
): Promise<Metadata> {
  const { slug } = await props.params
  const articleSlug = slug?.[0] ?? getDefaultSlug()
  const article = getArticle(articleSlug)
  if (!article) return { title: 'Docs | BuilderLab' }
  return {
    title: article.title,
    description: article.lead,
  }
}

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: '100%', maxWidth: layout.maxWidth,
      margin: '0 auto', padding: `0 ${layout.wrapPadding}`,
    }}>
      {children}
    </div>
  )
}

export default async function DocsPage(
  props: { params: Promise<{ slug?: string[] }> }
) {
  const { slug } = await props.params
  const articleSlug = slug?.[0] ?? getDefaultSlug()
  const article = getArticle(articleSlug)

  if (!article) notFound()

  const currentGroup = groupFor(articleSlug)

  return (
    <div style={{ padding: '48px 0 80px' }}>
      <Wrap>
        <div className="docs-layout" style={{
          display: 'grid',
          gridTemplateColumns: '230px 1fr',
          gap: '44px',
          alignItems: 'start',
        }}>
          {/* ── Sidebar ── */}
          <aside style={{ position: 'sticky', top: '88px' }}>
            {/* Search box (visual-only; real search can be wired later) */}
            <div style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
              padding: '9px 12px', borderRadius: radiusMkt.sm,
              border: `1px solid ${colors.border.mkt}`,
              backgroundColor: colors.bg.mktSurface,
              color: colors.text.dim, fontSize: '13.5px',
              marginBottom: '22px',
            }}>
              <Search size={14} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>Search docs</span>
              <kbd style={{
                fontFamily: fontFamily.mono, fontSize: '11px',
                padding: '2px 6px', borderRadius: '5px',
                border: `1px solid ${colors.border.mkt2}`, color: colors.text.dim,
              }}>⌘K</kbd>
            </div>

            {/* Nav groups */}
            <div className="docs-nav-wrap">
              {DOC_GROUPS.map(group => (
                <div key={group.title} style={{ marginBottom: '22px' }}>
                  <h5 style={{
                    fontSize: '11px', textTransform: 'uppercase' as const,
                    letterSpacing: '0.08em', color: colors.text.dim,
                    margin: '0 0 8px', fontFamily: fontFamily.body, fontWeight: 600,
                  }}>
                    {group.title}
                  </h5>
                  {group.articles.map(({ slug: s, label }) => {
                    const active = s === articleSlug
                    return (
                      <Link
                        key={s}
                        href={`/docs/${s}`}
                        style={{
                          display: 'block',
                          padding: '6px 10px',
                          borderRadius: radiusMkt.xs,
                          color: active ? colors.accent.bright : colors.text.muted2,
                          fontSize: fontSizeMkt.nav,
                          textDecoration: 'none',
                          transition: 'color .15s, background .15s',
                          borderLeft: active
                            ? `2px solid ${colors.accent.bright}`
                            : '2px solid transparent',
                          backgroundColor: active
                            ? `rgba(${colors.accent.glowRgb},0.07)`
                            : 'transparent',
                          marginBottom: '2px',
                        }}
                      >
                        {label}
                      </Link>
                    )
                  })}
                </div>
              ))}
            </div>
          </aside>

          {/* ── Main ── */}
          <main style={{ minWidth: 0, maxWidth: '760px' }}>
            {/* Breadcrumb */}
            <p style={{
              fontFamily: fontFamily.mono, fontSize: '13px',
              color: colors.text.dim, marginBottom: '16px',
            }}>
              <span style={{ color: colors.accent.bright }}>{currentGroup}</span>
              {' / '}
              {article.title}
            </p>

            <h1 style={{
              fontFamily: fontFamily.head,
              fontSize: 'clamp(30px, 4vw, 40px)',
              marginBottom: '14px',
            }}>
              {article.title}
            </h1>

            <p style={{
              color: colors.text.muted2, fontSize: '18px',
              lineHeight: 1.6, marginBottom: '30px',
            }}>
              {article.lead}
            </p>

            {/* Article body — rendered from HTML string */}
            <div
              className="docs-article-body"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Prev / Next */}
            {(article.prev || article.next) && (
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                gap: '16px', marginTop: '48px', paddingTop: '24px',
                borderTop: `1px solid ${colors.border.mkt}`,
              }}>
                <div>
                  {article.prev && (
                    <Link href={`/docs/${article.prev.slug}`} style={{
                      display: 'flex', flexDirection: 'column', gap: '3px',
                      color: colors.text.muted2, fontSize: fontSizeMkt.nav,
                      textDecoration: 'none',
                    }}>
                      <span style={{ fontSize: '12px', color: colors.text.dim, fontFamily: fontFamily.mono }}>← Previous</span>
                      <span>{article.prev.label}</span>
                    </Link>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  {article.next && (
                    <Link href={`/docs/${article.next.slug}`} style={{
                      display: 'flex', flexDirection: 'column', gap: '3px',
                      color: colors.text.muted2, fontSize: fontSizeMkt.nav,
                      textDecoration: 'none', alignItems: 'flex-end',
                    }}>
                      <span style={{ fontSize: '12px', color: colors.text.dim, fontFamily: fontFamily.mono }}>Next →</span>
                      <span>{article.next.label}</span>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </Wrap>

      {/* Docs body typography via scoped styles */}
      <style>{`
        .docs-layout {
          @media (max-width: ${breakpoints.md}) {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
        }
        .docs-nav-wrap {
          @media (max-width: ${breakpoints.md}) {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 16px !important;
          }
        }
        .docs-article-body h2 {
          font-family: var(--font-sora, "Inter", system-ui, sans-serif);
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.025em;
          margin: 38px 0 12px;
          color: ${colors.text.base};
        }
        .docs-article-body h3 {
          font-family: var(--font-sora, "Inter", system-ui, sans-serif);
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.025em;
          margin: 26px 0 8px;
          color: ${colors.text.base};
        }
        .docs-article-body p {
          color: ${colors.text.soft};
          font-size: 15.5px;
          line-height: 1.72;
          margin-bottom: 14px;
        }
        .docs-article-body a {
          color: ${colors.accent.bright};
          text-decoration: underline;
          text-decoration-color: rgba(45,212,191,0.35);
        }
        .docs-article-body a:hover {
          text-decoration-color: ${colors.accent.bright};
        }
        .docs-article-body ul, .docs-article-body ol {
          color: ${colors.text.soft};
          font-size: 15.5px;
          line-height: 1.75;
          padding-left: 22px;
          margin: 0 0 16px;
        }
        .docs-article-body li { margin-bottom: 6px; }
        .docs-article-body li::marker { color: ${colors.accent.bright}; }
        .docs-article-body strong { color: ${colors.text.base}; }
        .callout {
          display: flex;
          gap: 13px;
          align-items: flex-start;
          padding: 16px 18px;
          margin: 20px 0;
          border-radius: ${radiusMkt.sm};
          border: 1px solid ${colors.border.accent};
          background: rgba(${colors.accent.glowRgb}, 0.06);
        }
        .callout .ic { color: ${colors.accent.bright}; flex: none; margin-top: 1px; }
        .callout p { margin: 0; font-size: 14.5px; color: ${colors.text.soft}; }
        .code-block {
          font-family: ${fontFamily.mono};
          font-size: 13.5px;
          line-height: 1.7;
          background: ${colors.bg.mkt2};
          border: 1px solid ${colors.border.mkt};
          border-radius: ${radiusMkt.sm};
          padding: 16px 18px;
          margin: 16px 0;
          color: ${colors.text.soft};
          overflow-x: auto;
          white-space: pre;
        }
        .code-block .c { color: ${colors.text.dim}; }
        .code-block .g { color: ${colors.accent.bright}; }
        .doc-steps {
          counter-reset: ds;
          list-style: none;
          padding: 0;
        }
        .doc-steps li {
          position: relative;
          padding-left: 44px;
          margin-bottom: 18px;
          color: ${colors.text.soft};
          font-size: 15.5px;
          line-height: 1.6;
        }
        .doc-steps li::before {
          counter-increment: ds;
          content: counter(ds);
          position: absolute;
          left: 0;
          top: -2px;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: grid;
          place-items: center;
          font-family: ${fontFamily.mono};
          font-size: 13px;
          font-weight: 600;
          color: ${colors.accent.bright};
          background: rgba(${colors.accent.glowRgb}, 0.1);
          border: 1px solid ${colors.border.accent};
        }
      `}</style>
    </div>
  )
}
