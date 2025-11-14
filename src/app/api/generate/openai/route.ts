import { NextResponse } from 'next/server';
import { generateImageWithDALLE, validateDALLEParameters } from '@/lib/ai-providers';
import { APIResponse, GenerationParameters } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { prompt, options } = await request.json();

    // Validate request
    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Validate parameters for DALL-E
    const validation = validateDALLEParameters(options);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(', ') },
        { status: 400 }
      );
    }

    // Generate image with DALL-E
    const imageUrls = await generateImageWithDALLE(prompt, options);

    const response: APIResponse<{ images: string[] }> = {
      success: true,
      data: { images: imageUrls }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('DALL-E generation error:', error);

    const response: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate image with DALL-E'
    };

    return NextResponse.json(response, { status: 500 });
  }
}