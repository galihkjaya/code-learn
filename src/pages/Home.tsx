import { Link } from 'react-router-dom'
import { ArrowRight, Code2, RefreshCcw } from 'lucide-react'
import { Brief } from '../components/Brief'
import { useAppStore } from '../store/appStore'

export function Home() {
  const { curriculum, clearLearningPlan } = useAppStore()
  const completedPaths = curriculum?.paths.length ?? 0

  return (
    <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(360px,420px)_minmax(0,1fr)] lg:px-8">
      <Brief />

      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white">
            <Code2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Workspace</h2>
            <p className="text-sm text-slate-600">Generate a plan, solve tiers, and review with AI.</p>
          </div>
        </div>

        {curriculum ? (
          <div className="grid gap-4">
            <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
              <p className="text-sm font-semibold uppercase tracking-normal text-teal-700">
                Current plan
              </p>
              <h3 className="mt-1 text-2xl font-semibold text-teal-950">
                {completedPaths} learning paths ready
              </h3>
              <p className="mt-2 text-sm leading-6 text-teal-900">
                Continue from the current unlocked tier or generate a fresh curriculum from the
                brief.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex h-10 items-center gap-2 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800"
                to="/learn"
              >
                Open curriculum
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <button
                className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={clearLearningPlan}
                type="button"
              >
                <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                Reset plan
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">No plan generated</p>
            <p className="text-sm leading-6 text-slate-600">
              Save a provider key, fill the brief, and CodeLearn will create a tiered coding
              curriculum with matching handbook pages.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}
