import { NextResponse } from 'next/server';
import { optimizePrompt, validatePrompt } from '@/lib/prompt-engineering';
import { APIResponse, EnhancementLevel, GenerationParameters } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { prompt, enhancementLevel, parameters } = await request.json();

    // Validate request
    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!enhancementLevel || !['none', 'light', 'medium', 'heavy'].includes(enhancementLevel)) {
      return NextResponse.json(
        { success: false, error: 'Valid enhancement level is required (none, light, medium, heavy)' },
        { status: 400 }
      );
    }

    // Validate the prompt
    const validation = validatePrompt(prompt);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Optimize the prompt
    const optimizedPrompt = await optimizePrompt(
      prompt,
      enhancementLevel as EnhancementLevel,
      parameters as Partial<GenerationParameters>
    );

    const response: APIResponse<{ optimizedPrompt: string }> = {
      success: true,
      data: { optimizedPrompt }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Prompt optimization error:', error);

    const response: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to optimize prompt'
    };

    return NextResponse.json(response, { status: 500 });
  }
}