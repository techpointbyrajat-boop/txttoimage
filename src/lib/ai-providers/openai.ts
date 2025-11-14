import OpenAI from 'openai';
import { GenerationParameters } from '../types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateImageWithDALLE(
  prompt: string,
  options: Partial<GenerationParameters>
): Promise<string[]> {
  const size = getDALLESize(options.resolution || '1024x1024');
  const quality = options.quality as 'standard' | 'hd' || 'standard';
  const style = options.style === 'photorealistic' ? 'natural' : 'vivid';

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: formatPromptForDALLE(prompt, options),
      n: 1,
      size: size as '1024x1024' | '1024x1792' | '1792x1024',
      quality,
      style,
      response_format: 'url',
    });

    return response.data.map(img => img.url!);
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
    throw new Error('Failed to generate image with DALL-E');
  }
}

export function formatPromptForDALLE(
  prompt: string,
  options: Partial<GenerationParameters>
): string {
  let formattedPrompt = prompt;

  // Add style information for DALL-E
  if (options.style && options.style !== 'photorealistic') {
    formattedPrompt += `, ${options.style} art style`;
  }

  // Add mood
  if (options.mood) {
    formattedPrompt += `, ${options.mood} atmosphere`;
  }

  // Add lighting
  if (options.lighting) {
    formattedPrompt += `, ${options.lighting} lighting`;
  }

  // Add color palette
  if (options.colorPalette) {
    formattedPrompt += `, ${options.colorPalette} colors`;
  }

  // Add camera angle
  if (options.cameraAngle) {
    formattedPrompt += `, ${options.cameraAngle} perspective`;
  }

  // Add artistic elements based on style
  if (options.style === 'oil painting') {
    formattedPrompt += ', oil painting masterpiece, canvas texture, brush strokes visible';
  } else if (options.style === 'watercolor') {
    formattedPrompt += ', watercolor painting, paper texture, soft edges, watercolor washes';
  } else if (options.style === 'anime') {
    formattedPrompt += ', anime style, manga art, Japanese animation style';
  } else if (options.style === 'digital art') {
    formattedPrompt += ', digital artwork, high detail, modern digital illustration';
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

function getDALLESize(resolution: string): string {
  switch (resolution) {
    case '1024x1024':
      return '1024x1024';
    case '1024x1792':
      return '1024x1792';
    case '1792x1024':
      return '1792x1024';
    case '512x512':
    default:
      return '1024x1024'; // DALL-E 3 minimum is 1024x1024
  }
}

export function validateDALLEParameters(
  parameters: Partial<GenerationParameters>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate resolution for DALL-E 3
  const validSizes = ['1024x1024', '1024x1792', '1792x1024'];
  if (parameters.resolution && !validSizes.includes(parameters.resolution)) {
    errors.push('DALL-E 3 supports only 1024x1024, 1024x1792, or 1792x1024 resolutions');
  }

  // Validate quality
  const validQualities = ['standard', 'hd'];
  if (parameters.quality && !validQualities.includes(parameters.quality)) {
    errors.push('Quality must be either "standard" or "hd"');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}