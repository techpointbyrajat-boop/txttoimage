import Replicate from 'replicate';
import { AIModel, GenerationParameters, PredictionResponse } from '../types';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export const modelVersionMap = {
  'flux-dev': '8beff3369e81422112d93b89ca01426147de542cd4684c244b673b105188fe5f',
  'stability-ai': 'ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
};

export async function generateImageWithReplicate(
  prompt: string,
  model: string,
  options: Partial<GenerationParameters>
): Promise<string> {
  const replicateOptions = {
    version: modelVersionMap[model as keyof typeof modelVersionMap],
    input: {
      prompt: formatPromptForReplicate(prompt, options),
      num_inference_steps: options.steps || 40,
      guidance_scale: options.guidance || 4.5,
      aspect_ratio: options.aspectRatio || "1:1",
      output_format: options.format || "webp",
      output_quality: options.outputQuality || 80,
    },
  };

  // Add webhook for production deployments
  if (process.env.VERCEL_URL) {
    (replicateOptions as any).webhook = `${process.env.VERCEL_URL}/api/webhooks/replicate`;
    (replicateOptions as any).webhook_events_filter = ['start', 'completed'];
  }

  const prediction = await replicate.predictions.create(replicateOptions);

  if (prediction?.error) {
    throw new Error(prediction.error);
  }

  return prediction.id;
}

export async function getPredictionStatus(id: string): Promise<PredictionResponse> {
  const prediction = await replicate.predictions.get(id);

  if (prediction?.error) {
    throw new Error(prediction.error);
  }

  return {
    id: prediction.id,
    status: prediction.status as PredictionResponse['status'],
    output: prediction.output as string[] | undefined,
    created_at: prediction.created_at,
    completed_at: prediction.completed_at || undefined,
    urls: prediction.urls ? {
      get: prediction.urls.get,
      cancel: prediction.urls.cancel,
    } : undefined,
  };
}

export function formatPromptForReplicate(
  prompt: string,
  options: Partial<GenerationParameters>
): string {
  let formattedPrompt = prompt;

  // Add style information
  if (options.style) {
    formattedPrompt += `, ${options.style} style`;
  }

  // Add mood information
  if (options.mood) {
    formattedPrompt += `, ${options.mood} mood`;
  }

  // Add lighting information
  if (options.lighting) {
    formattedPrompt += `, ${options.lighting} lighting`;
  }

  // Add color palette
  if (options.colorPalette) {
    formattedPrompt += `, ${options.colorPalette} color palette`;
  }

  // Add camera angle
  if (options.cameraAngle) {
    formattedPrompt += `, ${options.cameraAngle} camera angle`;
  }

  // Add lens type
  if (options.lensType) {
    formattedPrompt += `, ${options.lensType} lens`;
  }

  // Add depth of field
  if (options.depthOfField) {
    formattedPrompt += `, ${options.depthOfField} depth of field`;
  }

  // Add secondary elements
  if (options.secondaryElements) {
    formattedPrompt += `, ${options.secondaryElements}`;
  }

  // Add action
  if (options.action) {
    formattedPrompt += `, ${options.action}`;
  }

  return formattedPrompt;
}

export function validateReplicateParameters(
  model: string,
  parameters: Partial<GenerationParameters>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate model
  if (!modelVersionMap[model as keyof typeof modelVersionMap]) {
    errors.push(`Unsupported model: ${model}`);
  }

  // Validate steps
  if (parameters.steps && (parameters.steps < 1 || parameters.steps > 100)) {
    errors.push('Steps must be between 1 and 100');
  }

  // Validate guidance scale
  if (parameters.guidance && (parameters.guidance < 1 || parameters.guidance > 20)) {
    errors.push('Guidance scale must be between 1 and 20');
  }

  // Validate output quality
  if (parameters.outputQuality && (parameters.outputQuality < 1 || parameters.outputQuality > 100)) {
    errors.push('Output quality must be between 1 and 100');
  }

  // Validate aspect ratio
  const validAspectRatios = ['1:1', '16:9', '9:16', '4:3'];
  if (parameters.aspectRatio && !validAspectRatios.includes(parameters.aspectRatio)) {
    errors.push('Invalid aspect ratio');
  }

  // Validate format
  const validFormats = ['webp', 'jpg', 'png'];
  if (parameters.format && !validFormats.includes(parameters.format)) {
    errors.push('Invalid output format');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}