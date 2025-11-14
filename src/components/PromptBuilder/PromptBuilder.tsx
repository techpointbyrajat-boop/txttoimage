'use client';

import React, { useState, useEffect } from 'react';
import {
  GenerationParameters,
  EnhancementLevel,
  AI_MODEL,
  STYLE_OPTIONS,
  MOOD_OPTIONS,
  COLOR_PALETTE_OPTIONS,
  RESOLUTION_OPTIONS,
  QUALITY_OPTIONS,
  ASPECT_RATIO_OPTIONS,
  LIGHTING_OPTIONS,
  CAMERA_ANGLE_OPTIONS,
  LENS_TYPE_OPTIONS,
  DEPTH_OF_FIELD_OPTIONS
} from '@/lib/types';

interface PromptBuilderProps {
  onGenerate: (prompt: string, model: string, parameters: GenerationParameters) => void;
  onPreview: (prompt: string, parameters: GenerationParameters) => void;
  isGenerating?: boolean;
}

export default function PromptBuilder({ onGenerate, onPreview, isGenerating = false }: PromptBuilderProps) {
  const [parameters, setParameters] = useState<GenerationParameters>({
    subject: '',
    style: 'photorealistic',
    mood: 'dramatic',
    colorPalette: 'warm',
    resolution: '1024x1024',
    quality: 'standard',
    aspectRatio: '1:1',
    lighting: 'natural',
    cameraAngle: 'eye-level',
    lensType: 'standard',
    depthOfField: 'medium',
  });

  const [selectedModel, setSelectedModel] = useState<string>('flux-dev');
  const [enhancementLevel, setEnhancementLevel] = useState<EnhancementLevel>('light');
  const [enhancedPrompt, setEnhancedPrompt] = useState<string>('');
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Generate combined prompt from parameters
  const generateCombinedPrompt = (): string => {
    let prompt = parameters.subject;

    if (parameters.secondaryElements) {
      prompt += `, ${parameters.secondaryElements}`;
    }

    if (parameters.action) {
      prompt += `, ${parameters.action}`;
    }

    return prompt;
  };

  // Update preview when parameters change
  useEffect(() => {
    const prompt = enhancedPrompt || generateCombinedPrompt();
    onPreview(prompt, parameters);
  }, [parameters, enhancedPrompt, onPreview]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!parameters.subject || parameters.subject.trim().length < 10) {
      newErrors.push('Subject description must be at least 10 characters');
    }

    if (parameters.subject.length > 500) {
      newErrors.push('Subject description must be less than 500 characters');
    }

    if (parameters.secondaryElements && parameters.secondaryElements.length > 300) {
      newErrors.push('Secondary elements must be less than 300 characters');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Handle enhancement
  const handleEnhancePrompt = async () => {
    if (enhancementLevel === 'none') return;

    setIsEnhancing(true);
    setErrors([]);

    try {
      const response = await fetch('/api/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: generateCombinedPrompt(),
          enhancementLevel,
          parameters,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setEnhancedPrompt(data.data.optimizedPrompt);
      } else {
        setErrors([data.error || 'Failed to enhance prompt']);
      }
    } catch (error) {
      setErrors(['Network error while enhancing prompt']);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Handle form submission
  const handleGenerate = () => {
    if (!validateForm()) return;

    const finalPrompt = enhancedPrompt || generateCombinedPrompt();
    onGenerate(finalPrompt, selectedModel, parameters);
  };

  // Update parameter
  const updateParameter = (key: keyof GenerationParameters, value: string | number) => {
    setParameters(prev => ({ ...prev, [key]: value }));
  };

  const model = AI_MODELS.find(m => m.id === selectedModel);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">AI Image Prompt Builder</h2>

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          {errors.map((error, index) => (
            <p key={index} className="text-red-600 text-sm">{error}</p>
          ))}
        </div>
      )}

      {/* Subject Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Subject Description</h3>
        <textarea
          value={parameters.subject}
          onChange={(e) => updateParameter('subject', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          placeholder="Describe what you want to generate..."
          maxLength={500}
        />
        <p className="text-sm text-gray-500 mt-1">
          {parameters.subject.length}/500 characters
        </p>
      </div>

      {/* Secondary Elements */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Secondary Elements</h3>
        <textarea
          value={parameters.secondaryElements || ''}
          onChange={(e) => updateParameter('secondaryElements', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={2}
          placeholder="Additional elements in the scene..."
          maxLength={300}
        />
        <p className="text-sm text-gray-500 mt-1">
          {(parameters.secondaryElements || '').length}/300 characters
        </p>
      </div>

      {/* Style Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Art Style</label>
          <select
            value={parameters.style}
            onChange={(e) => updateParameter('style', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            {STYLE_OPTIONS.map(style => (
              <option key={style} value={style}>
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mood</label>
          <select
            value={parameters.mood}
            onChange={(e) => updateParameter('mood', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            {MOOD_OPTIONS.map(mood => (
              <option key={mood} value={mood}>
                {mood.charAt(0).toUpperCase() + mood.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Color Palette</label>
          <select
            value={parameters.colorPalette}
            onChange={(e) => updateParameter('colorPalette', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            {COLOR_PALETTE_OPTIONS.map(palette => (
              <option key={palette} value={palette}>
                {palette.charAt(0).toUpperCase() + palette.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Technical Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Resolution</label>
          <div className="space-y-2">
            {RESOLUTION_OPTIONS.map(res => (
              <label key={res.value} className="flex items-center">
                <input
                  type="radio"
                  value={res.value}
                  checked={parameters.resolution === res.value}
                  onChange={(e) => updateParameter('resolution', e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">{res.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Quality</label>
          <div className="space-y-2">
            {QUALITY_OPTIONS.map(quality => (
              <label key={quality.value} className="flex items-center">
                <input
                  type="radio"
                  value={quality.value}
                  checked={parameters.quality === quality.value}
                  onChange={(e) => updateParameter('quality', e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">{quality.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Aspect Ratio</label>
          <div className="space-y-2">
            {ASPECT_RATIO_OPTIONS.map(ratio => (
              <label key={ratio.value} className="flex items-center">
                <input
                  type="radio"
                  value={ratio.value}
                  checked={parameters.aspectRatio === ratio.value}
                  onChange={(e) => updateParameter('aspectRatio', e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm">{ratio.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Model Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">AI Model</label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          {AI_MODELS.map(model => (
            <option key={model.id} value={model.id}>
              {model.name} - ${model.costPerImage.toFixed(3)} per image
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500 mt-1">
          {model?.description}
        </p>
      </div>

      {/* Advanced Settings */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          <svg
            className={`w-4 h-4 mr-1 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          Advanced Settings
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lighting</label>
                <select
                  value={parameters.lighting}
                  onChange={(e) => updateParameter('lighting', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {LIGHTING_OPTIONS.map(lighting => (
                    <option key={lighting} value={lighting}>
                      {lighting.charAt(0).toUpperCase() + lighting.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Camera Angle</label>
                <select
                  value={parameters.cameraAngle}
                  onChange={(e) => updateParameter('cameraAngle', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {CAMERA_ANGLE_OPTIONS.map(angle => (
                    <option key={angle} value={angle}>
                      {angle.charAt(0).toUpperCase() + angle.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lens Type</label>
                <select
                  value={parameters.lensType}
                  onChange={(e) => updateParameter('lensType', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {LENS_TYPE_OPTIONS.map(lens => (
                    <option key={lens} value={lens}>
                      {lens.charAt(0).toUpperCase() + lens.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Depth of Field</label>
              <div className="flex space-x-4">
                {DEPTH_OF_FIELD_OPTIONS.map(dof => (
                  <label key={dof.value} className="flex items-center">
                    <input
                      type="radio"
                      value={dof.value}
                      checked={parameters.depthOfField === dof.value}
                      onChange={(e) => updateParameter('depthOfField', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">{dof.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Enhancement Section */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">AI Prompt Enhancement</h3>

        <div className="flex items-center space-x-4 mb-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="none"
              checked={enhancementLevel === 'none'}
              onChange={(e) => setEnhancementLevel(e.target.value as EnhancementLevel)}
              className="mr-2"
            />
            <span className="text-sm">None</span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              value="light"
              checked={enhancementLevel === 'light'}
              onChange={(e) => setEnhancementLevel(e.target.value as EnhancementLevel)}
              className="mr-2"
            />
            <span className="text-sm">Light</span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              value="medium"
              checked={enhancementLevel === 'medium'}
              onChange={(e) => setEnhancementLevel(e.target.value as EnhancementLevel)}
              className="mr-2"
            />
            <span className="text-sm">Medium</span>
          </label>

          <label className="flex items-center">
            <input
              type="radio"
              value="heavy"
              checked={enhancementLevel === 'heavy'}
              onChange={(e) => setEnhancementLevel(e.target.value as EnhancementLevel)}
              className="mr-2"
            />
            <span className="text-sm">Heavy</span>
          </label>
        </div>

        <button
          type="button"
          onClick={handleEnhancePrompt}
          disabled={enhancementLevel === 'none' || isEnhancing}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isEnhancing ? 'Enhancing...' : 'Enhance Prompt'}
        </button>

        {enhancedPrompt && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Enhanced Prompt:</p>
            <div className="p-3 bg-white border border-gray-300 rounded-md">
              <p className="text-sm text-gray-800">{enhancedPrompt}</p>
            </div>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Estimated cost: ${model?.costPerImage.toFixed(3)} per image
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating...' : 'Generate Image'}
        </button>
      </div>
    </div>
  );
}