import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { detectProvider, providerLabel } from '../lib/detectProvider'
import { fetchGroqModels, GEMINI_MODELS } from '../lib/llm'
import { type ApiStorageMode, useAppStore } from '../store/appStore'

const REPO_URL = 'https://github.com/galihkjaya/code-learn.git'

export function Setup() {
  const navigate = useNavigate()
  const {
    apiKey,
    provider,
    selectedModel,
    apiStorageMode,
    setApiConfig,
    setSelectedModel,
    clearApiKey,
  } = useAppStore()
  
  const [draftKey, setDraftKey] = useState(apiKey)
  const [draftModel, setDraftModel] = useState(selectedModel)
  const [storageMode, setStorageMode] = useState<ApiStorageMode>(apiStorageMode)
  const [models, setModels] = useState<string[]>(provider === 'gemini' ? GEMINI_MODELS : [])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [modelError, setModelError] = useState('')
  const requestIdRef = useRef(0)

  const detectedProvider = useMemo(() => detectProvider(draftKey), [draftKey])
  const canSave = Boolean(draftKey.trim() && detectedProvider && draftModel)

  useEffect(() => {
    if (apiKey !== draftKey) {
      setDraftKey(apiKey)
    }
  }, [apiKey])

  useEffect(() => {
    setStorageMode(apiStorageMode)
  }, [apiStorageMode])

  useEffect(() => {
    if (selectedModel !== draftModel) {
      setDraftModel(selectedModel)
    }
  }, [selectedModel])

  useEffect(() => {
    setModelError('')

    if (detectedProvider === 'gemini') {
      setModels(GEMINI_MODELS)
      setDraftModel((current) => (GEMINI_MODELS.includes(current) ? current : GEMINI_MODELS[0]))
      setIsLoadingModels(false)
      return
    }

    if (detectedProvider !== 'groq') {
      setModels([])
      setDraftModel('')
      setIsLoadingModels(false)
      return
    }

    const trimmedKey = draftKey.trim()
    if (trimmedKey.length < 10) {
      setModels([])
      setDraftModel('')
      return
    }

    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    setIsLoadingModels(true)

    const timeout = window.setTimeout(() => {
      fetchGroqModels(trimmedKey)
        .then((modelList) => {
          if (requestIdRef.current !== requestId) return
          setModels(modelList)
          setDraftModel((current) => (current && modelList.includes(current) ? current : modelList[0] ?? ''))
        })
        .catch((error: unknown) => {
          if (requestIdRef.current !== requestId) return
          setModels([])
          setDraftModel('')
          setModelError(error instanceof Error ? error.message : 'Unable to load Groq models.')
        })
        .finally(() => {
          if (requestIdRef.current === requestId) {
            setIsLoadingModels(false)
          }
        })
    }, 450)

    return () => window.clearTimeout(timeout)
  }, [detectedProvider, draftKey])

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!detectedProvider || !draftModel) return

    setApiConfig({
      apiKey: draftKey.trim(),
      provider: detectedProvider,
      selectedModel: draftModel,
      storageMode,
    })
    
    navigate('/brief')
  }

  function handleClear() {
    clearApiKey()
    setDraftKey('')
    setDraftModel('')
    setModels([])
    setModelError('')
  }

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      <div className="flex w-full flex-col lg:flex-row">
        {/* Left Form Panel */}
        <div className="flex flex-1 flex-col justify-center px-8 py-12 lg:px-24">
          <div className="w-full max-w-md">
            <h1 className="mb-2 font-playfair text-3xl font-bold">API Setup</h1>
            <p className="mb-10 font-mono-dm text-sm text-ink-light">Connect your provider to begin training.</p>
            
            <form onSubmit={handleSave} className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <label className="font-mono-dm text-xs uppercase tracking-wider text-ink-light">API Key</label>
                <div className="relative">
                  <input
                    className="input-base w-full py-2 font-mono-dm placeholder:text-ink-light/50"
                    onChange={(event) => setDraftKey(event.target.value)}
                    placeholder="gsk_... or AIza..."
                    type="password"
                    value={draftKey}
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono-dm text-xs uppercase tracking-wider text-ink-light">Provider</label>
                <div className="input-base w-full py-2 font-mono-dm text-ink">
                  {detectedProvider ? providerLabel(detectedProvider) : 'Auto-detected from key'}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono-dm text-xs uppercase tracking-wider text-ink-light">Model</label>
                <div className="relative">
                  <select
                    className="input-base w-full appearance-none py-2 font-mono-dm disabled:text-ink-light/50"
                    disabled={!detectedProvider || isLoadingModels || models.length === 0}
                    onChange={(event) => {
                      setDraftModel(event.target.value)
                      if (apiKey && event.target.value) {
                        setSelectedModel(event.target.value)
                      }
                    }}
                    value={draftModel}
                  >
                    {models.length === 0 ? (
                      <option value="">Waiting for API key...</option>
                    ) : (
                      models.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))
                    )}
                  </select>
                  {isLoadingModels && (
                    <Loader2 className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink-light" />
                  )}
                </div>
                {modelError && <p className="mt-1 font-mono-dm text-xs text-accent">{modelError}</p>}
              </div>

              <div className="flex items-center gap-3">
                <input
                  checked={storageMode === 'session'}
                  className="h-4 w-4 accent-ink"
                  onChange={(event) => setStorageMode(event.target.checked ? 'session' : 'local')}
                  type="checkbox"
                  id="storage-toggle"
                />
                <label htmlFor="storage-toggle" className="font-mono-dm text-sm text-ink-light cursor-pointer">
                  Save to session only
                </label>
              </div>

              <div className="mt-4 flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={!canSave}
                  className="btn-primary w-full py-3 font-mono-dm text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save & Continue
                </button>
                {draftKey && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="self-center font-mono-dm text-xs text-ink-light hover:text-accent transition-colors"
                  >
                    Clear API Key
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Info Panel */}
        <div className="hidden flex-1 flex-col justify-center border-l border-ink-light/20 bg-ink px-8 py-12 text-paper lg:flex lg:px-24">
          <div className="w-full max-w-md">
            <h2 className="mb-6 font-playfair text-2xl font-bold">Security Notice</h2>
            <ul className="mb-8 flex flex-col gap-4 font-mono-dm text-sm leading-relaxed text-paper/80">
              <li>— Your API key never leaves your browser.</li>
              <li>— All requests go directly to Groq or Gemini.</li>
              <li>— No backend. No database. No proxy.</li>
            </ul>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 font-mono-dm text-sm text-paper hover:text-accent transition-colors"
            >
              Audit the source code →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
