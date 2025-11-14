'use client';

import React, { useState, useEffect } from 'react';
import PromptBuilder from '@/components/PromptBuilder';
import ImageGallery from '@/components/ImageGallery';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { GenerationParameters, PromptData, AI_MODELS } from '@/lib/types';

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [previewPrompt, setPreviewPrompt] = useState('');
  const [previewParameters, setPreviewParameters] = useState<GenerationParameters | null>(null);
  const [currentGenerationId, setCurrentGenerationId] = useState<string | null>(null);

  const { addToHistory, data } = useLocalStorage();

  // Load recent images from history
  useEffect(() => {
    const recentImages = data.promptHistory
      .slice(0, 12) // Show last 12 images
      .map(item => ({
        id: item.id,
        url: item.generatedImages[0], // Take first image from each generation
        prompt: item.enhancedPrompt || item.originalPrompt,
        model: item.model,
        timestamp: item.timestamp
      }))
      .filter(item => item.url); // Only include items with actual images

    setImages(recentImages);
  }, [data.promptHistory]);

  // Handle image generation
  const handleGenerate = async (prompt: string, model: string, parameters: GenerationParameters) => {
    setIsGenerating(true);
    setCurrentGenerationId(null);

    try {
      const selectedModel = AI_MODELS.find(m => m.id === model);

      if (selectedModel?.provider === 'openai') {
        // Direct generation with OpenAI
        const response = await fetch('/api/generate/openai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            options: parameters
          }),
        });

        const result = await response.json();

        if (result.success) {
          const imageData = {
            id: `img-${Date.now()}`,
            url: result.data.images[0],
            prompt,
            model,
            timestamp: new Date().toISOString()
          };

          setImages(prev => [imageData, ...prev]);

          // Add to history
          addToHistory({
            originalPrompt: prompt,
            enhancedPrompt: prompt,
            model,
            parameters,
            generatedImages: result.data.images,
            enhancementLevel: 'none' // Could be tracked if needed
          });
        } else {
          console.error('Generation failed:', result.error);
        }
      } else {
        // Replicate generation (async)
        const response = await fetch('/api/generate/replicate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            model,
            options: parameters
          }),
        });

        const result = await response.json();

        if (result.success) {
          const predictionId = result.data.predictionId;
          setCurrentGenerationId(predictionId);

          // Poll for completion
          await pollReplicatePrediction(predictionId, prompt, model, parameters);
        } else {
          console.error('Generation failed:', result.error);
        }
      }
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
      setCurrentGenerationId(null);
    }
  };

  // Poll Replicate prediction for completion
  const pollReplicatePrediction = async (
    predictionId: string,
    prompt: string,
    model: string,
    parameters: GenerationParameters
  ) => {
    const maxAttempts = 60; // 5 minutes max wait
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        console.error('Prediction timeout');
        return;
      }

      try {
        const response = await fetch(`/api/generate/replicate/${predictionId}`);
        const result = await response.json();

        if (result.success) {
          const prediction = result.data;

          if (prediction.status === 'succeeded' && prediction.output) {
            const imageUrl = prediction.output[0];

            const imageData = {
              id: `img-${Date.now()}`,
              url: imageUrl,
              prompt,
              model,
              timestamp: new Date().toISOString()
            };

            setImages(prev => [imageData, ...prev]);

            // Add to history
            addToHistory({
              originalPrompt: prompt,
              enhancedPrompt: prompt,
              model,
              parameters,
              generatedImages: [imageUrl],
              enhancementLevel: 'none'
            });
          } else if (prediction.status === 'failed') {
            console.error('Prediction failed:', prediction.error);
          } else if (prediction.status === 'processing' || prediction.status === 'starting') {
            // Still processing, continue polling
            attempts++;
            setTimeout(poll, 5000); // Wait 5 seconds
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    poll();
  };

  // Handle preview updates
  const handlePreview = (prompt: string, parameters: GenerationParameters) => {
    setPreviewPrompt(prompt);
    setPreviewParameters(parameters);
  };

  // Format JSON for display
  const formatParametersForDisplay = (params: GenerationParameters) => {
    return JSON.stringify({
      prompt: previewPrompt,
      subject: params.subject,
      style: params.style,
      mood: params.mood,
      lighting: params.lighting,
      camera: {
        angle: params.cameraAngle,
        lens: params.lensType,
        depthOfField: params.depthOfField
      },
      technical: {
        resolution: params.resolution,
        quality: params.quality,
        aspectRatio: params.aspectRatio
      }
    }, null, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">AI Text-to-Image Generator</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {data.promptHistory.length} images generated
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Generation Progress */}
        {isGenerating && currentGenerationId && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <p className="text-blue-800">Generating image... This may take a few moments.</p>
            </div>
          </div>
        )}

        {/* Main Layout - Split Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Prompt Builder - Left Side (60% on desktop) */}
          <div className="lg:col-span-2">
            <PromptBuilder
              onGenerate={handleGenerate}
              onPreview={handlePreview}
              isGenerating={isGenerating}
            />
          </div>

          {/* Preview Panel - Right Side (40% on desktop) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Live Preview</h3>

                {previewPrompt ? (
                  <div>
                    {/* Formatted JSON Preview */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Structured Prompt</h4>
                      <pre className="bg-gray-50 p-3 rounded text-xs text-gray-800 overflow-x-auto whitespace-pre-wrap">
                        {previewParameters && formatParametersForDisplay(previewParameters)}
                      </pre>
                    </div>

                    {/* Character Count */}
                    <div className="text-sm text-gray-600">
                      <p>Characters: {previewPrompt.length}</p>
                      <p>Tokens: ~{Math.ceil(previewPrompt.length / 4)}</p>
                    </div>

                    {/* Copy to Clipboard */}
                    <button
                      onClick={() => navigator.clipboard.writeText(previewPrompt)}
                      className="mt-3 w-full px-3 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors text-sm"
                    >
                      Copy Prompt
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    Start typing in the prompt builder to see a live preview here.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Generated Images Gallery */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Recent Generations</h2>
          <ImageGallery images={images} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>AI Text-to-Image Generator • Powered by Replicate, OpenAI, and Stable Diffusion</p>
          </div>
        </div>
      </footer>
    </div>
  );
}