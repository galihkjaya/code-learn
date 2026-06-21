import { FormEvent, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpenCheck, Loader2, WandSparkles } from 'lucide-react'
import { callLLM } from '../lib/llm'
import { parseCurriculumResponse } from '../lib/curriculum'
import { useAppStore } from '../store/appStore'

type Level = 'beginner' | 'intermediate' | 'advanced'

const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced']
const GOALS = ['Python', 'SQL', 'FastAPI', 'Docker', 'Git', 'Bash', 'ML/AI']

export function Brief() {
  const navigate = useNavigate()
  const { apiKey, provider, selectedModel, setCurriculum } = useAppStore()
  const [level, setLevel] = useState<Level>('intermediate')
  const [goals, setGoals] = useState<string[]>(['Python', 'ML/AI'])
  const [hoursPerWeek, setHoursPerWeek] = useState(6)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const canGenerate = Boolean(apiKey && provider && selectedModel && goals.length > 0 && hoursPerWeek > 0)
  const selectedGoalsLabel = useMemo(() => goals.join(', '), [goals])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!provider || !selectedModel || !apiKey) {
      setError('Save an API key and model before generating a curriculum.')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const response = await callLLM({
        apiKey,
        provider,
        model: selectedModel,
        systemPrompt: buildCurriculumSystemPrompt(),
        userMessage: [
          `Current level: ${level}`,
          `Goals: ${selectedGoalsLabel}`,
          `Time available: ${hoursPerWeek} hours per week`,
          'Audience: AI/ML and backend engineers who want hands-on coding practice.',
        ].join('\n'),
      })
      const curriculum = parseCurriculumResponse(response.text)

      setCurriculum(curriculum)
      navigate('/learn')
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'The curriculum could not be generated. Try again with a different model.',
      )
    } finally {
      setIsGenerating(false)
    }
  }

  function toggleGoal(goal: string) {
    setGoals((currentGoals) =>
      currentGoals.includes(goal)
        ? currentGoals.filter((currentGoal) => currentGoal !== goal)
        : [...currentGoals, goal],
    )
  }

  return (
    <form
      className="grid gap-5 rounded-lg border border-slate-200 bg-white p-4 shadow-panel sm:p-5"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-amber-100 text-amber-800">
          <BookOpenCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Learning brief</h2>
          <p className="text-sm text-slate-600">Generate a tiered curriculum from your goals.</p>
        </div>
      </div>

      <fieldset className="grid gap-2">
        <legend className="text-sm font-semibold text-slate-800">Current level</legend>
        <div className="grid grid-cols-3 rounded-md border border-slate-300 bg-slate-100 p-1">
          {LEVELS.map((option) => (
            <button
              className={`h-9 rounded-md text-sm font-semibold capitalize transition ${
                level === option ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
              key={option}
              onClick={() => setLevel(option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="grid gap-2">
        <legend className="text-sm font-semibold text-slate-800">Goals</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {GOALS.map((goal) => (
            <label
              className={`flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${
                goals.includes(goal)
                  ? 'border-teal-600 bg-teal-50 text-teal-900'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
              key={goal}
            >
              <input
                checked={goals.includes(goal)}
                className="h-4 w-4 accent-teal-700"
                onChange={() => toggleGoal(goal)}
                type="checkbox"
              />
              {goal}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="grid gap-2 text-sm font-semibold text-slate-800">
        Time per week
        <span className="flex h-11 items-center rounded-md border border-slate-300 bg-white px-3">
          <input
            className="w-full bg-transparent text-slate-950 outline-none"
            max={40}
            min={1}
            onChange={(event) => setHoursPerWeek(Number(event.target.value))}
            type="number"
            value={hoursPerWeek}
          />
          <span className="text-sm font-medium text-slate-500">hours</span>
        </span>
      </label>

      <button
        className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        disabled={!canGenerate || isGenerating}
        type="submit"
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <WandSparkles className="h-4 w-4" aria-hidden="true" />
        )}
        {isGenerating ? 'Generating curriculum' : 'Generate curriculum'}
      </button>

      {!apiKey || !provider || !selectedModel ? (
        <p className="text-sm font-medium text-amber-700">Save an API key and model first.</p>
      ) : null}
      {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
    </form>
  )
}

function buildCurriculumSystemPrompt() {
  return `You are an expert curriculum designer for CodeLearn, a browser-only coding learning platform for AI/ML and backend engineers.

Return ONLY a valid JSON object. Do not include a preamble. Do not include markdown fences.

The JSON must match this exact schema:
{
  "paths": [
    {
      "id": "python-oop",
      "title": "Python OOP",
      "handbookPage": "python-oop.html",
      "topics": ["classes", "inheritance", "dunder methods"],
      "problems": [
        { "tier": 1, "title": "Create a class", "prompt": "Write a Python class called Animal..." },
        { "tier": 2, "title": "Add inheritance", "prompt": "Extend Animal with a Dog class..." },
        { "tier": 3, "title": "Implement __repr__", "prompt": "Add __repr__ and __eq__ to your class..." }
      ]
    }
  ]
}

Rules:
- Create 4 to 6 paths based on the learner brief.
- Every path must have exactly three problems, with tiers 1, 2, and 3.
- Use practical Python, SQL, FastAPI, Docker, Git, Bash, and ML/AI tasks.
- Choose handbookPage filenames that match the path id when possible, such as python-oop.html, sql-joins-relational-thinking.html, fastapi-routing-basics.html, docker-fundamentals.html, git-basics-local-workflow.html, or bash-developer-commands.html.
- Problem prompts must be specific enough to submit code for review.`
}
