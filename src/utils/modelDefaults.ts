/**
 * Model Defaults Utility
 * Provides free/cheapest model defaults for each AI provider
 */

export type ProviderType = 'gemini' | 'openai' | 'anthropic' | 'local' | 'ollama' | 'lm_studio';

export interface ModelInfo {
  id: string;
  name: string;
  provider: ProviderType;
  isFree: boolean;
  costTier: 'free' | 'low' | 'medium' | 'high';
  description?: string;
}

/**
 * Free/cheapest models per provider
 */
export const FREE_MODELS: Record<ProviderType, ModelInfo> = {
  gemini: {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash (Experimental)',
    provider: 'gemini',
    isFree: true,
    costTier: 'free',
    description: 'Free tier model with fast responses',
  },
  openai: {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    isFree: false,
    costTier: 'low',
    description: 'Most cost-effective OpenAI model',
  },
  anthropic: {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    isFree: false,
    costTier: 'low',
    description: 'Fastest and cheapest Claude model',
  },
  local: {
    id: 'local-default',
    name: 'Local Model (LM Studio)',
    provider: 'local',
    isFree: true,
    costTier: 'free',
    description: 'Free local model via LM Studio',
  },
  ollama: {
    id: 'ollama-default',
    name: 'Ollama Local',
    provider: 'ollama',
    isFree: true,
    costTier: 'free',
    description: 'Free local model via Ollama',
  },
  lm_studio: {
    id: 'lm-studio-default',
    name: 'LM Studio Local',
    provider: 'lm_studio',
    isFree: true,
    costTier: 'free',
    description: 'Free local model via LM Studio',
  },
};

/**
 * Fallback models if primary free model is unavailable
 */
export const FALLBACK_MODELS: Record<ProviderType, string[]> = {
  gemini: ['gemini-2.5-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-flash'],
  openai: ['gpt-3.5-turbo', 'gpt-4o-mini'],
  anthropic: ['claude-3-haiku', 'claude-3-sonnet'],
  local: ['local-default'],
  ollama: ['ollama-default'],
  lm_studio: ['lm-studio-default'],
};

/**
 * Get the default free/cheapest model for a provider
 */
export function getDefaultModel(provider: ProviderType): ModelInfo {
  return FREE_MODELS[provider];
}

/**
 * Get model ID for a provider (for use in dropdowns)
 */
export function getDefaultModelId(provider: ProviderType): string {
  return FREE_MODELS[provider].id;
}

/**
 * Check if a model ID is free
 */
export function isFreeModel(modelId: string, provider: ProviderType): boolean {
  const defaultModel = FREE_MODELS[provider];
  if (defaultModel.id === modelId) {
    return defaultModel.isFree;
  }
  
  // Check fallback models
  const fallbacks = FALLBACK_MODELS[provider];
  if (fallbacks.includes(modelId)) {
    return provider === 'gemini' || provider === 'local' || provider === 'ollama' || provider === 'lm_studio';
  }
  
  // Gemini free models
  if (provider === 'gemini') {
    return modelId.includes('flash') && !modelId.includes('pro');
  }
  
  return false;
}

/**
 * Get cheapest available model from a list
 */
export function getCheapestModel(
  availableModels: string[],
  provider: ProviderType
): string {
  // Prefer free models first
  const freeModel = FREE_MODELS[provider];
  if (availableModels.includes(freeModel.id)) {
    return freeModel.id;
  }
  
  // Check fallbacks
  for (const fallback of FALLBACK_MODELS[provider]) {
    if (availableModels.includes(fallback)) {
      return fallback;
    }
  }
  
  // Return first available if no match
  return availableModels[0] || freeModel.id;
}

/**
 * Get model display name
 */
export function getModelDisplayName(modelId: string, provider: ProviderType): string {
  const defaultModel = FREE_MODELS[provider];
  if (defaultModel.id === modelId) {
    return defaultModel.name;
  }
  
  // Format model ID for display
  return modelId
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

