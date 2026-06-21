import { useEffect, useMemo, useState } from 'react'
import Editor from '@monaco-editor/react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Send } from 'lucide-react'
import type { ProblemTier } from '../lib/curriculum'
import { callLLM } from '../lib/llm'
import { getCurrentProblem, isTierComplete, isUnlocked } from '../lib/progress'
import { useAppStore } from '../store/appStore'
import { HandbookViewer } from './HandbookViewer'

const REVIEW_SYSTEM_PROMPT =
  "You are a code reviewer for a learning platform. Be direct. Point out what's wrong first, then what's right. End your response with exactly PASS or NEEDS_WORK on the last line."

export function ProblemEditor() {
  const navigate = useNavigate()
  const { pathId, tier } = useParams()
  const { apiKey, provider, selectedModel, curriculum, progress, completeTier } = useAppStore()
  const [code, setCode] = useState('')
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [isReviewing, setIsReviewing] = useState(false)
  const [passedTier, setPassedTier] = useState(false)

  const path = useMemo(
    () => curriculum?.paths.find((candidate) => candidate.id === pathId),
    [curriculum, pathId],
  )
  const tierNumber = Number(tier) as ProblemTier
  const problem = path?.problems.find((candidate) => candidate.tier === tierNumber)
  const language = path?.id.startsWith('sql') ? 'sql' : 'python'
  const unlocked = path && problem ? isUnlocked(progress, path.id, problem.tier) : false
  const complete = path && problem ? isTierComplete(progress, path.id, problem.tier) : false
  const canSubmit = Boolean(apiKey && provider && selectedModel && problem && unlocked && code.trim())
  const nextProblem = useMemo(() => {
    if (!path) {
      return null
    }

    const sortedProblems = [...path.problems].sort((a, b) => a.tier - b.tier)
    return sortedProblems.find((candidate) => candidate.tier > tierNumber) ?? null
  }, [path, tierNumber])

  useEffect(() => {
    setFeedback('')
    setError('')
    setPassedTier(false)
    setCode(getStarterCode(language))
  }, [language, pathId, tier])

  if (!curriculum || !path || !problem) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
        <h2 className="text-lg font-semibold text-slate-950">Problem not found</h2>
        <p className="mt-1 text-sm text-slate-600">Open a generated curriculum path to continue.</p>
        <Link
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          to="/learn"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to paths
        </Link>
      </section>
    )
  }

  if (!unlocked) {
    const currentProblem = getCurrentProblem(path, progress)

    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-lg font-semibold text-amber-950">Tier locked</h2>
        <p className="mt-1 text-sm font-medium text-amber-800">
          Complete the previous tier before opening this problem.
        </p>
        <button
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-amber-700 px-4 text-sm font-semibold text-white transition hover:bg-amber-800"
          onClick={() => navigate(`/learn/${path.id}/${currentProblem.tier}`)}
          type="button"
        >
          Go to current tier
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </section>
    )
  }

  async function handleSubmit() {
    if (!provider || !apiKey || !selectedModel || !problem || !path) {
      setError('Save an API key and model before submitting code.')
      return
    }

    setIsReviewing(true)
    setFeedback('')
    setError('')
    setPassedTier(false)

    try {
      const response = await callLLM({
        apiKey,
        provider,
        model: selectedModel,
        systemPrompt: REVIEW_SYSTEM_PROMPT,
        userMessage: `Problem: ${problem.prompt}\nTier: ${problem.tier}\nCode:\n${code}`,
      })
      const review = response.text.trim()

      setFeedback(review)

      if (review.endsWith('PASS')) {
        completeTier(path.id, problem.tier)
        setPassedTier(true)
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'The review could not be completed. Try again.',
      )
    } finally {
      setIsReviewing(false)
    }
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
      <div className="grid gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              to="/learn"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Paths
            </Link>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold uppercase tracking-normal text-slate-600">
              {language}
            </span>
          </div>

          <div className="mt-4">
            <p className="text-sm font-semibold text-teal-700">{path.title}</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950">{problem.title}</h1>
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">
              {problem.prompt}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {path.problems.map((candidate) => (
              <span
                className={`rounded-md border px-2 py-1 text-xs font-semibold ${
                  candidate.tier === problem.tier
                    ? 'border-slate-950 bg-slate-950 text-white'
                    : isTierComplete(progress, path.id, candidate.tier)
                      ? 'border-teal-600 bg-teal-50 text-teal-800'
                      : 'border-slate-200 bg-slate-50 text-slate-500'
                }`}
                key={candidate.tier}
              >
                Tier {candidate.tier}
              </span>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 shadow-panel">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <h2 className="text-sm font-semibold text-white">Solution editor</h2>
            <span className="text-xs font-medium text-slate-400">{selectedModel || 'No model saved'}</span>
          </div>
          <Editor
            height="460px"
            language={language}
            onChange={(value) => setCode(value ?? '')}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
            }}
            theme="vs-dark"
            value={code}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="inline-flex h-11 items-center gap-2 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={!canSubmit || isReviewing}
            onClick={handleSubmit}
            type="button"
          >
            {isReviewing ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
            {isReviewing ? 'Reviewing' : complete ? 'Review again' : 'Submit for review'}
          </button>
          {!apiKey || !provider || !selectedModel ? (
            <p className="text-sm font-medium text-amber-700">Save an API key and model first.</p>
          ) : null}
        </div>

        {passedTier ? (
          <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-teal-950">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-teal-700" aria-hidden="true" />
              <div>
                <h2 className="font-semibold">Tier complete</h2>
                <p className="mt-1 text-sm leading-6">
                  Nice work. The next tier is unlocked for this path.
                </p>
                {nextProblem ? (
                  <button
                    className="mt-3 inline-flex h-10 items-center gap-2 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800"
                    onClick={() => navigate(`/learn/${path.id}/${nextProblem.tier}`)}
                    type="button"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                ) : (
                  <Link
                    className="mt-3 inline-flex h-10 items-center gap-2 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800"
                    to="/learn"
                  >
                    Back to paths
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {feedback ? (
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
            <h2 className="text-sm font-semibold text-slate-950">Review feedback</h2>
            <pre className="mt-3 whitespace-pre-wrap rounded-md bg-slate-100 p-3 font-sans text-sm leading-6 text-slate-800">
              {feedback}
            </pre>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}
      </div>

      <div className="min-h-[620px]">
        <HandbookViewer slug={path.handbookPage} />
      </div>
    </section>
  )
}

function getStarterCode(language: 'python' | 'sql') {
  if (language === 'sql') {
    return '-- Write your SQL solution here\n'
  }

  return '# Write your Python solution here\n'
}
