import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { HandbookViewer } from '../components/HandbookViewer'

export function Handbook() {
  const { slug } = useParams()

  return (
    <main className="mx-auto grid max-w-5xl gap-4 px-4 py-6 sm:px-6 lg:px-8">
      <Link
        className="inline-flex h-10 w-fit items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        to="/learn"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to learning
      </Link>
      <HandbookViewer slug={slug} />
    </main>
  )
}
