/**
 * Ollama Service - Connect to Ollama API for LLM inference
 * Default model: qwen2.5:0.5b (fast, ~0.8s short / ~8s ~100-word JSON)
 */

import logger from '../config/logger'

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:0.5b'

export interface OllamaGenerateRequest {
  model?: string
  prompt: string
  stream?: boolean
  temperature?: number
  max_tokens?: number
  system?: string
}

export interface OllamaGenerateResponse {
  model: string
  created_at: string
  response: string
  done: boolean
  context?: number[]
  total_duration?: number
  load_duration?: number
  prompt_eval_duration?: number
}

export class OllamaService {
  private baseUrl: string
  private defaultModel: string

  constructor() {
    this.baseUrl = OLLAMA_BASE_URL
    this.defaultModel = OLLAMA_MODEL
  }

  /**
   * Generate completion from Ollama (timeout: 45s for 5-question fast mode)
   */
  async generate(request: OllamaGenerateRequest): Promise<string> {
    const timeoutMs = 45_000
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    const model = request.model || this.defaultModel
    logger.debug('[Ollama] generate request', { model, promptLength: request.prompt?.length ?? 0 })

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: request.prompt,
          system: request.system,
          stream: false,
          options: {
            temperature: request.temperature ?? 0.7,
            num_predict: request.max_tokens ?? 4096,
          },
        }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        const text = await response.text()
        logger.error('[Ollama] API error response', { status: response.status, message: text?.slice(0, 200) })
        throw new Error(`Ollama API error: ${response.status} ${response.statusText} - ${text.slice(0, 200)}`)
      }

      const data = (await response.json()) as OllamaGenerateResponse
      const out = data.response || ''
      logger.debug('[Ollama] generate response', { length: out.length })
      return out
    } catch (error) {
      clearTimeout(timeoutId)
      const message = error instanceof Error ? error.message : 'Unknown error'
      logger.error('[Ollama] Generation failed', { message })
      throw new Error(`Ollama failed: ${message}`)
    }
  }

  /** Current model in use (e.g. qwen2.5:0.5b) */
  getModelName(): string {
    return this.defaultModel
  }

  /**
   * Check if Ollama is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`)
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`)
      if (!response.ok) return []
      const data = await response.json() as { models?: { name: string }[] }
      return data.models?.map((m) => m.name) || []
    } catch {
      return []
    }
  }
}

export default new OllamaService()
