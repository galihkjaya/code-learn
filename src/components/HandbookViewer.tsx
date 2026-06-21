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

export function HandbookViewer({ slug }: HandbookViewerProps) {
  const [state, setState] = useState<HandbookState>({ status: 'idle' })
  const normalizedSlug = useMemo(() => normalizeSlug(slug), [slug])

  useEffect(() => {
    if (!normalizedSlug) {
      setState({ status: 'missing' })
      return
    }

    const controller = new AbortController()
    const baseUrl = import.meta.env.BASE_URL.endsWith('/')
      ? import.meta.env.BASE_URL
      : `${import.meta.env.BASE_URL}/`

    setState({ status: 'loading' })

    fetch(`${baseUrl}handbook/${normalizedSlug}`, { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 404) {
          setState({ status: 'missing' })
          return
        }

        if (!response.ok) {
          throw new Error(`Unable to load handbook page (${response.status})`)
        }

        setState({ status: 'ready', html: await response.text() })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return
        }

        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'Unable to load handbook page.',
        })
      })

    return () => controller.abort()
  }, [normalizedSlug])

  return (
    <article className="grid h-full min-h-[420px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-panel">
      <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-teal-700" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-slate-950">Handbook</h2>
        </div>
        {normalizedSlug ? (
          <span className="truncate text-xs font-medium text-slate-500">{normalizedSlug}</span>
        ) : null}
      </header>

      <div className="min-h-0 overflow-auto p-4">
        {state.status === 'loading' || state.status === 'idle' ? (
          <div className="flex h-64 items-center justify-center text-sm font-semibold text-slate-600">
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-teal-700" aria-hidden="true" />
            Loading handbook
          </div>
        ) : null}

        {state.status === 'missing' ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
            Handbook page coming soon
          </div>
        ) : null}

        {state.status === 'error' ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
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
