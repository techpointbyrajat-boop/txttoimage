import OpenAI from 'openai';
import { EnhancementLevel, GenerationParameters } from '../types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface PromptOptimizationRequest {
  basePrompt: string;
  enhancementLevel: EnhancementLevel;
  parameters: Partial<GenerationParameters>;
}

export async function optimizePrompt(
  basePrompt: string,
  enhancementLevel: EnhancementLevel,
  parameters: Partial<GenerationParameters>
): Promise<string> {
  if (enhancementLevel === 'none') {
    return basePrompt;
  }

  const enhancementInstruction = getEnhancementInstruction(enhancementLevel);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert prompt engineer for AI image generation models. Your task is to enhance user prompts to create better, more detailed, and more visually interesting images. ${enhancementInstruction}`
        },
        {
          role: 'user',
          content: `Enhance this prompt for image generation: "${basePrompt}"

Additional context:
- Style: ${parameters.style || 'Not specified'}
- Mood: ${parameters.mood || 'Not specified'}
- Lighting: ${parameters.lighting || 'Not specified'}
- Color palette: ${parameters.colorPalette || 'Not specified'}
- Camera angle: ${parameters.cameraAngle || 'Not specified'}
- Lens type: ${parameters.lensType || 'Not specified'}
- Secondary elements: ${parameters.secondaryElements || 'Not specified'}
- Action: ${parameters.action || 'Not specified'}

Return only the enhanced prompt without any additional text or explanation.`
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content?.trim() || basePrompt;
  } catch (error) {
    console.error('Error optimizing prompt:', error);
    return basePrompt; // Return original prompt if optimization fails
  }
}

function getEnhancementInstruction(level: EnhancementLevel): string {
  switch (level) {
    case 'light':
      return `For "light" enhancement: Add basic descriptive details and clarity to make the prompt more specific.
      Example: "a dog" becomes "a friendly golden retriever with soft fur and expressive eyes".
      Focus on clarity and basic descriptive elements without overwhelming detail.`;

    case 'medium':
      return `For "medium" enhancement: Add artistic style, mood elements, and environmental details.
      Example: "a dog" becomes "a friendly golden retriever with soft golden fur sitting in a sun-drenched park with lush green grass, warm afternoon lighting creating gentle shadows, capturing a joyful and peaceful moment".
      Include lighting, composition, and emotional qualities.`;

    case 'heavy':
      return `For "heavy" enhancement: Create a full cinematic description with professional photography terms.
      Example: "a dog" becomes "A majestic golden retriever with flowing golden coat captured in cinematic golden hour lighting, shallow depth of field with a 85mm f/1.4 lens, warm soft directional light creating rim lighting on the fur, blurred background with autumn bokeh, professional portrait composition using rule of thirds, rich color grading with warm golden tones, hyperrealistic detail with every strand of fur visible, award-winning wildlife photography style".
      Include camera settings, lighting setup, atmosphere, and professional photography terminology.`;

    default:
      return '';
  }
}

export function generatePromptVariations(
  basePrompt: string,
  count: number = 3
): string[] {
  // Simple variation generation - in a real implementation, this could use AI
  const variations: string[] = [];

  for (let i = 0; i < count; i++) {
    const variations = [
      `${basePrompt}, with a unique perspective`,
      `${basePrompt}, featuring dramatic lighting`,
      `${basePrompt}, with artistic composition`,
      `${basePrompt}, showcasing fine details`,
      `${basePrompt}, in an unexpected setting`
    ];

    variations.push(variations[i % variations.length]);
  }

  return variations;
}

export function validatePrompt(prompt: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!prompt || prompt.trim().length === 0) {
    errors.push('Prompt cannot be empty');
  }

  if (prompt.length < 10) {
    errors.push('Prompt must be at least 10 characters long');
  }

  if (prompt.length > 4000) {
    errors.push('Prompt must be less than 4000 characters');
  }

  // Check for potentially problematic content
  const problematicWords = ['nsfw', 'explicit', 'adult', 'violent', 'gore'];
  const lowerPrompt = prompt.toLowerCase();

  for (const word of problematicWords) {
    if (lowerPrompt.includes(word)) {
      errors.push(`Prompt contains potentially problematic content: ${word}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}