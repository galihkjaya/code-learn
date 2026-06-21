import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Loader2 } from 'lucide-react'

type HandbookViewerProps = {
  slug?: string
}

type HandbookState =
  | { status: 'idle' | 'loading' }
  | { status: 'ready'; html: string }
  | { status: 'missing' }
  | { status: 'error'; message: string }

const handbookFiles = import.meta.glob('../../handbook/*.html', { query: '?raw', import: 'default' })

export function HandbookViewer({ slug }: HandbookViewerProps) {
  const [state, setState] = useState<HandbookState>({ status: 'idle' })
  const normalizedSlug = useMemo(() => normalizeSlug(slug), [slug])

  useEffect(() => {
    if (!normalizedSlug) {
      setState({ status: 'missing' })
      return
    }

    const loadContent = async () => {
      setState({ status: 'loading' })
      const path = `../../handbook/${normalizedSlug}`
      
      if (!handbookFiles[path]) {
        setState({ status: 'missing' })
        return
      }

      try {
        const rawHtml = await handbookFiles[path]() as string
        const parser = new DOMParser()
        const doc = parser.parseFromString(rawHtml, 'text/html')
        
        // Extract only the main content, ignoring the sidebar and original <style>
        const mainDiv = doc.querySelector('.main')
        const htmlToRender = mainDiv ? mainDiv.innerHTML : rawHtml

        setState({ status: 'ready', html: htmlToRender })
      } catch (error) {
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Unable to load handbook page.',
        })
      }
    }

    loadContent()
  }, [normalizedSlug])

  return (
    <article className="flex h-full min-h-[420px] flex-col overflow-hidden bg-ink text-paper">
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-paper/50" aria-hidden="true" />
          <span className="font-mono-dm text-xs uppercase tracking-widest text-paper/70">Handbook</span>
        </div>
        {normalizedSlug ? (
          <span className="truncate font-mono-dm text-xs text-paper/40">{normalizedSlug}</span>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 overflow-auto p-6">
        {state.status === 'loading' || state.status === 'idle' ? (
          <div className="flex h-64 items-center justify-center gap-2 font-mono-dm text-sm text-paper/40">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading reference…
          </div>
        ) : null}

        {state.status === 'missing' ? (
          <div className="font-mono-dm text-sm text-paper/40">
            Handbook page coming soon.
          </div>
        ) : null}

        {state.status === 'error' ? (
          <div className="font-mono-dm text-sm text-accent">
            {state.message}
          </div>
        ) : null}

        {state.status === 'ready' ? (
          <div className="handbook-content" dangerouslySetInnerHTML={{ __html: state.html }} />
        ) : null}
      </div>
    </article>
  )
}

function normalizeSlug(slug?: string): string {
  return slug?.replace(/^\/+/, '').replace(/\.\.+/g, '').trim() ?? ''
}

