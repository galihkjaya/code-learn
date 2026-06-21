export type ProblemTier = 1 | 2 | 3

export type Problem = {
  tier: ProblemTier
  title: string
  prompt: string
}

export type CurriculumPath = {
  id: string
  title: string
  handbookPage: string
  topics: string[]
  problems: Problem[]
}

export type Curriculum = {
  paths: CurriculumPath[]
}

const CURRICULUM_STORAGE_KEY = 'pygrind.curriculum'

export function readCurriculum(): Curriculum | null {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(CURRICULUM_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    return normalizeCurriculum(JSON.parse(raw))
  } catch {
    return null
  }
}

export function writeCurriculum(curriculum: Curriculum): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(CURRICULUM_STORAGE_KEY, JSON.stringify(curriculum))
}

export function clearCurriculum(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(CURRICULUM_STORAGE_KEY)
}

export function parseCurriculumResponse(text: string): Curriculum {
  const trimmed = text.trim()

  try {
    return normalizeCurriculum(JSON.parse(trimmed))
  } catch {
    const firstBrace = trimmed.indexOf('{')
    const lastBrace = trimmed.lastIndexOf('}')

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error('The model did not return a JSON curriculum.')
    }

    return normalizeCurriculum(JSON.parse(trimmed.slice(firstBrace, lastBrace + 1)))
  }
}

export function normalizeCurriculum(value: unknown): Curriculum {
  if (!isRecord(value) || !Array.isArray(value.paths)) {
    throw new Error('Curriculum must include a paths array.')
  }

  const paths = value.paths.map(normalizePath).filter((path): path is CurriculumPath => Boolean(path))

  if (paths.length === 0) {
    throw new Error('Curriculum must include at least one path.')
  }

  return { paths }
}

function normalizePath(value: unknown): CurriculumPath | null {
  if (!isRecord(value)) {
    return null
  }

  const id = asNonEmptyString(value.id)
  const title = asNonEmptyString(value.title)
  const handbookPage = asNonEmptyString(value.handbookPage)

  if (!id || !title || !handbookPage || !Array.isArray(value.problems)) {
    return null
  }

  const topics = Array.isArray(value.topics)
    ? value.topics.map(asNonEmptyString).filter((topic): topic is string => Boolean(topic))
    : []

  const problems = value.problems
    .map(normalizeProblem)
    .filter((problem): problem is Problem => Boolean(problem))
    .sort((a, b) => a.tier - b.tier)

  if (problems.length === 0) {
    return null
  }

  return {
    id,
    title,
    handbookPage,
    topics,
    problems,
  }
}

function normalizeProblem(value: unknown): Problem | null {
  if (!isRecord(value)) {
    return null
  }

  const tier = Number(value.tier)
  const title = asNonEmptyString(value.title)
  const prompt = asNonEmptyString(value.prompt)

  if (!isProblemTier(tier) || !title || !prompt) {
    return null
  }

  return { tier, title, prompt }
}

function isProblemTier(value: number): value is ProblemTier {
  return value === 1 || value === 2 || value === 3
}

function asNonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
