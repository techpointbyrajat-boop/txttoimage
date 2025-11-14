import { NextResponse } from 'next/server';
import { getPredictionStatus } from '@/lib/ai-providers';
import { APIResponse, PredictionResponse } from '@/lib/types';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Prediction ID is required' },
        { status: 400 }
      );
    }

    const prediction = await getPredictionStatus(id);

    const response: APIResponse<PredictionResponse> = {
      success: true,
      data: prediction
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Replicate status check error:', error);

    const response: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get prediction status'
    };

    return NextResponse.json(response, { status: 500 });
  }
}