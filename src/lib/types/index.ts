export interface PromptData {
  id: string;
  originalPrompt: string;
  enhancedPrompt: string;
  model: string;
  parameters: GenerationParameters;
  generatedImages: string[];
  timestamp: string;
  enhancementLevel: 'none' | 'light' | 'medium' | 'heavy';
}

export interface GenerationParameters {
  subject: string;
  secondaryElements?: string;
  action?: string;
  style: string;
  mood: string;
  colorPalette: string;
  resolution: string;
  quality: string;
  aspectRatio: string;
  lighting: string;
  cameraAngle: string;
  lensType: string;
  depthOfField: string;
  steps?: number;
  guidance?: number;
  format?: string;
  outputQuality?: number;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: 'replicate' | 'openai' | 'stability';
  costPerImage: number;
  supportedFeatures: string[];
  maxResolution?: string;
  defaultParameters: Partial<GenerationParameters>;
}

export interface StoredHistory {
  promptHistory: PromptData[];
  favoritePrompts: FavoritePrompt[];
  userPreferences: UserPreferences;
}

export interface FavoritePrompt {
  id: string;
  title: string;
  prompt: string;
  settings: GenerationParameters;
  model: string;
}

export interface UserPreferences {
  defaultModel: string;
  defaultEnhancement: 'none' | 'light' | 'medium' | 'heavy';
  preferredAspectRatio: string;
  preferredQuality: string;
}

export interface PredictionResponse {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string[];
  error?: string;
  created_at: string;
  completed_at?: string;
  urls?: {
    get: string;
    cancel: string;
  };
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  detail?: string;
}

export type EnhancementLevel = 'none' | 'light' | 'medium' | 'heavy';

export const AI_MODELS: AIModel[] = [
  {
    id: 'flux-dev',
    name: 'FLUX Dev',
    description: 'High quality, fast generation',
    provider: 'replicate',
    costPerImage: 0.004,
    supportedFeatures: ['aspect_ratio', 'output_format', 'output_quality'],
    maxResolution: '1024x1024',
    defaultParameters: {
      steps: 40,
      guidance: 4.5,
      format: 'webp',
      outputQuality: 80
    }
  },
  {
    id: 'stability-ai',
    name: 'Stable Diffusion XL',
    description: 'Photorealistic style',
    provider: 'replicate',
    costPerImage: 0.006,
    supportedFeatures: ['negative_prompt', 'sampler', 'scheduler'],
    maxResolution: '1024x1024',
    defaultParameters: {
      steps: 30,
      guidance: 7.5,
      format: 'png',
      outputQuality: 90
    }
  },
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    description: 'Natural style, great for creative prompts',
    provider: 'openai',
    costPerImage: 0.04,
    supportedFeatures: ['style', 'quality', 'size'],
    maxResolution: '1024x1792',
    defaultParameters: {
      quality: 'standard',
      style: 'natural'
    }
  }
];

export const STYLE_OPTIONS = [
  'photorealistic', 'digital art', 'oil painting', 'anime',
  'watercolor', 'cartoon', '3D render', 'concept art'
];

export const MOOD_OPTIONS = [
  'dramatic', 'peaceful', 'energetic', 'mysterious',
  'romantic', 'melancholic', 'vibrant', 'serene'
];

export const COLOR_PALETTE_OPTIONS = [
  'warm', 'cool', 'monochrome', 'vibrant', 'pastel', 'neon'
];

export const RESOLUTION_OPTIONS = [
  { label: '512x512', value: '512x512' },
  { label: '1024x1024', value: '1024x1024' },
  { label: '1024x1792', value: '1024x1792' },
  { label: '1792x1024', value: '1792x1024' }
];

export const QUALITY_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Standard', value: 'standard' },
  { label: 'High', value: 'high' }
];

export const ASPECT_RATIO_OPTIONS = [
  { label: '1:1', value: '1:1' },
  { label: '16:9', value: '16:9' },
  { label: '9:16', value: '9:16' },
  { label: '4:3', value: '4:3' }
];

export const LIGHTING_OPTIONS = [
  'natural', 'dramatic', 'soft', 'studio', 'neon', 'golden hour'
];

export const CAMERA_ANGLE_OPTIONS = [
  'eye-level', 'low angle', 'high angle', 'aerial', 'dutch angle'
];

export const LENS_TYPE_OPTIONS = [
  'wide', 'standard', 'telephoto', 'macro', 'fisheye'
];

export const DEPTH_OF_FIELD_OPTIONS = [
  { label: 'Shallow', value: 'shallow' },
  { label: 'Medium', value: 'medium' },
  { label: 'Deep', value: 'deep' }
];