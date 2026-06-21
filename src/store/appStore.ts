import { create } from 'zustand'
import type { Provider } from '../lib/detectProvider'
import {
  clearCurriculum,
  type Curriculum,
  readCurriculum,
  writeCurriculum,
  type ProblemTier,
} from '../lib/curriculum'
import {
  clearProgress,
  markTierComplete,
  type ProgressMap,
  readProgress,
  writeProgress,
} from '../lib/progress'

export type ApiStorageMode = 'local' | 'session'

type StoredApiConfig = {
  apiKey: string
  provider: Provider
  selectedModel: string
}

type AppState = {
  apiKey: string
  provider: Provider | null
  selectedModel: string
  apiStorageMode: ApiStorageMode
  curriculum: Curriculum | null
  progress: ProgressMap
  setApiConfig: (config: StoredApiConfig & { storageMode: ApiStorageMode }) => void
  setSelectedModel: (model: string) => void
  clearApiKey: () => void
  setCurriculum: (curriculum: Curriculum) => void
  clearLearningPlan: () => void
  completeTier: (pathId: string, tier: ProblemTier) => void
  resetProgress: () => void
}

const API_CONFIG_STORAGE_KEY = 'codelearn.apiConfig'

const savedApiConfig = readApiConfig()

export const useAppStore = create<AppState>((set, get) => ({
  apiKey: savedApiConfig?.config.apiKey ?? '',
  provider: savedApiConfig?.config.provider ?? null,
  selectedModel: savedApiConfig?.config.selectedModel ?? '',
  apiStorageMode: savedApiConfig?.mode ?? 'local',
  curriculum: readCurriculum(),
  progress: readProgress(),
  setApiConfig: ({ storageMode, ...config }) => {
    writeApiConfig(config, storageMode)
    set({
      ...config,
      apiStorageMode: storageMode,
    })
  },
  setSelectedModel: (selectedModel) => {
    const { apiKey, provider, apiStorageMode } = get()

    if (apiKey && provider) {
      writeApiConfig({ apiKey, provider, selectedModel }, apiStorageMode)
    }

    set({ selectedModel })
  },
  clearApiKey: () => {
    clearApiConfig()
    set({
      apiKey: '',
      provider: null,
      selectedModel: '',
      apiStorageMode: 'local',
    })
  },
  setCurriculum: (curriculum) => {
    writeCurriculum(curriculum)
    set({ curriculum })
  },
  clearLearningPlan: () => {
    clearCurriculum()
    clearProgress()
    set({ curriculum: null, progress: {} })
  },
  completeTier: (pathId, tier) => {
    const nextProgress = markTierComplete(get().progress, pathId, tier)
    writeProgress(nextProgress)
    set({ progress: nextProgress })
  },
  resetProgress: () => {
    clearProgress()
    set({ progress: {} })
  },
}))

function readApiConfig(): { config: StoredApiConfig; mode: ApiStorageMode } | null {
  const sessionConfig = readApiConfigFromStorage('session')
  if (sessionConfig) {
    return { config: sessionConfig, mode: 'session' }
  }

  const localConfig = readApiConfigFromStorage('local')
  if (localConfig) {
    return { config: localConfig, mode: 'local' }
  }

  return null
}

function readApiConfigFromStorage(mode: ApiStorageMode): StoredApiConfig | null {
  const storage = getStorage(mode)
  if (!storage) {
    return null
  }

  const raw = storage.getItem(API_CONFIG_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredApiConfig>
    if (
      typeof parsed.apiKey === 'string' &&
      (parsed.provider === 'groq' || parsed.provider === 'gemini') &&
      typeof parsed.selectedModel === 'string'
    ) {
      return {
        apiKey: parsed.apiKey,
        provider: parsed.provider,
        selectedModel: parsed.selectedModel,
      }
    }
  } catch {
    return null
  }

  return null
}

function writeApiConfig(config: StoredApiConfig, mode: ApiStorageMode): void {
  const targetStorage = getStorage(mode)
  const otherStorage = getStorage(mode === 'local' ? 'session' : 'local')

  targetStorage?.setItem(API_CONFIG_STORAGE_KEY, JSON.stringify(config))
  otherStorage?.removeItem(API_CONFIG_STORAGE_KEY)
}

function clearApiConfig(): void {
  getStorage('local')?.removeItem(API_CONFIG_STORAGE_KEY)
  getStorage('session')?.removeItem(API_CONFIG_STORAGE_KEY)
}

function getStorage(mode: ApiStorageMode): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }

  return mode === 'local' ? window.localStorage : window.sessionStorage
}
