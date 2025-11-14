import { NextResponse } from 'next/server';
import { generateImageWithReplicate, validateReplicateParameters } from '@/lib/ai-providers';
import { APIResponse, GenerationParameters } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { prompt, model, options } = await request.json();

    // Validate request
    if (!prompt || !model) {
      return NextResponse.json(
        { success: false, error: 'Prompt and model are required' },
        { status: 400 }
      );
    }

    // Validate parameters for Replicate
    const validation = validateReplicateParameters(model, options);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Generate image
    const predictionId = await generateImageWithReplicate(prompt, model, options);

    const response: APIResponse<{ predictionId: string }> = {
      success: true,
      data: { predictionId }
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Replicate generation error:', error);

    const response: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate image'
    };

    return NextResponse.json(response, { status: 500 });
  }
}