import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Lock, Route } from 'lucide-react'
import type { CurriculumPath } from '../lib/curriculum'
import { getCurrentProblem, isTierComplete, isUnlocked } from '../lib/progress'
import { useAppStore } from '../store/appStore'

export function CurriculumView() {
  const navigate = useNavigate()
  const { curriculum, progress } = useAppStore()

  if (!curriculum) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-amber-100 text-amber-800">
            <Route className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">No curriculum yet</h2>
            <p className="mt-1 text-sm text-slate-600">
              Create a learning brief to generate your first path.
            </p>
            <Link
              className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              to="/"
            >
              Open brief
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-teal-700">
            Active curriculum
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-950">Learning paths</h2>
        </div>
        <p className="text-sm font-medium text-slate-600">{curriculum.paths.length} paths generated</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {curriculum.paths.map((path) => (
          <PathCard
            key={path.id}
            onOpen={() => {
              const currentProblem = getCurrentProblem(path, progress)
              navigate(`/learn/${path.id}/${currentProblem.tier}`)
            }}
            path={path}
          />
        ))}
      </div>
    </section>
  )
}

type PathCardProps = {
  path: CurriculumPath
  onOpen: () => void
}

function PathCard({ path, onOpen }: PathCardProps) {
  const progress = useAppStore((state) => state.progress)
  const completedCount = path.problems.filter((problem) =>
    isTierComplete(progress, path.id, problem.tier),
  ).length
  const totalCount = path.problems.length
  const completion = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <button
      className="grid min-h-[260px] gap-4 rounded-lg border border-slate-200 bg-white p-4 text-left shadow-panel transition hover:-translate-y-0.5 hover:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-200"
      onClick={onOpen}
      type="button"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{path.title}</h3>
          <p className="mt-1 text-xs font-medium text-slate-500">{path.handbookPage}</p>
        </div>
        <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-slate-700">Progress</span>
          <span className="font-semibold text-teal-700">
            {completedCount}/{totalCount} tiers complete
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-md bg-slate-100">
          <div className="h-full bg-teal-600 transition-all" style={{ width: `${completion}%` }} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {path.problems.map((problem) => {
          const complete = isTierComplete(progress, path.id, problem.tier)
          const unlocked = isUnlocked(progress, path.id, problem.tier)

          return (
            <span
              className={`inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-md border px-2 text-xs font-semibold ${
                complete
                  ? 'border-teal-600 bg-teal-50 text-teal-800'
                  : unlocked
                    ? 'border-amber-300 bg-amber-50 text-amber-800'
                    : 'border-slate-200 bg-slate-50 text-slate-500'
              }`}
              key={problem.tier}
              title={complete ? 'Completed' : unlocked ? 'Unlocked' : 'Locked'}
            >
              {complete ? <Check className="h-3.5 w-3.5" /> : null}
              {!complete && !unlocked ? <Lock className="h-3.5 w-3.5" /> : null}
              Tier {problem.tier}
            </span>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-2 self-end">
        {path.topics.slice(0, 5).map((topic) => (
          <span
            className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
            key={topic}
          >
            {topic}
          </span>
        ))}
      </div>
    </button>
  )
}
