import React, { useState } from 'react';
import { Wand2, AlertCircle } from 'lucide-react';
import QuestionFlow from '../components/QuestionFlow';
import GenerationLoader from '../components/GenerationLoader';

const Generate: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [showQuestionFlow, setShowQuestionFlow] = useState(true);
  const [showPremiumLoader, setShowPremiumLoader] = useState(false);

  const handleGenerate = async (generatedPrompt?: string) => {
    // Clear previous states
    setError(null);
    setGeneratedImage(null);

    // Input validation
    const finalPrompt = generatedPrompt || prompt;
    const cleanedPrompt = finalPrompt.trim();
    if (!cleanedPrompt) {
      setError('Please enter a description for your tattoo.');
      return;
    }

    setLoading(true);
    // Only show premium loader for questionnaire flow
    if (generatedPrompt) {
      setShowPremiumLoader(true);
    }

    try {
      const requestBody = {
        prompt: cleanedPrompt,
        n: 1,
        size: '512x512'
      };

      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ OpenAI Error:", errorData);
        throw new Error(errorData.error?.message || 'Failed to generate image');
      }

      const data = await response.json();
      
      if (!data.data?.[0]?.url) {
        throw new Error('No image URL received from the API');
      }

      setGeneratedImage(data.data[0].url);
      setShowQuestionFlow(false);
    } catch (err: any) {
      console.error("❌ Generation Error:", err);
      setError(err.message || 'Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
      setShowPremiumLoader(false);
    }
  };

  const handleQuestionFlowComplete = (generatedPrompt: string) => {
    setPrompt(generatedPrompt);
    handleGenerate(generatedPrompt);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">AI Tattoo Generator</h1>
        <p className="text-gray-600">
          Describe your dream tattoo and let our AI bring it to life
        </p>
      </div>

      {showQuestionFlow ? (
        <QuestionFlow 
          onComplete={handleQuestionFlowComplete}
          onBack={() => setShowQuestionFlow(false)}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Describe your tattoo idea
              </label>
              <textarea
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                rows={4}
                placeholder="E.g., A minimalist geometric wolf design with sacred geometry elements"
              />
              <p className="mt-2 text-sm text-gray-500">
                Be specific about style, elements, and placement for better results
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={() => setShowQuestionFlow(true)}
                className="flex-1 px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition"
              >
                Use Question Flow
              </button>
              <button
                onClick={() => handleGenerate()}
                disabled={loading || !prompt.trim()}
                className={`flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 ${
                  loading || !prompt.trim()
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-purple-700'
                } transition`}
              >
                <Wand2 className="h-5 w-5" />
                {loading ? 'Generating...' : 'Generate Design'}
              </button>
            </div>
          </div>
        </div>
      )}

      {generatedImage && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Generated Design</h2>
          <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 p-4">
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={generatedImage}
                alt="Generated tattoo design"
                className="max-w-full max-h-full object-contain"
                onError={() => {
                  setError('Failed to load the generated image');
                  setGeneratedImage(null);
                }}
              />
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 mb-4">
              To save your design, right-click the image and choose 'Save As'
            </p>
            <button
              onClick={() => {
                setShowQuestionFlow(true);
                setGeneratedImage(null);
              }}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Generate Another Design
            </button>
          </div>
        </div>
      )}

      {showPremiumLoader && <GenerationLoader />}
    </div>
  );
};

export default Generate;