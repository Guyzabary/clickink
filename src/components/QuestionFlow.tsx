import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Wand2 } from 'lucide-react';

interface QuestionFlowProps {
  onComplete: (prompt: string) => void;
  onBack: () => void;
}

interface Question {
  id: number;
  text: string;
  placeholder: string;
}

const questions: Question[] = [
  {
    id: 1,
    text: "What tattoo would you like to create?",
    placeholder: "e.g., dragon, rose, portrait, quote..."
  },
  {
    id: 2,
    text: "What style do you prefer?",
    placeholder: "e.g., realistic, minimalist, Japanese, watercolor..."
  },
  {
    id: 3,
    text: "Where on your body do you want the tattoo?",
    placeholder: "e.g., arm, back, leg, chest..."
  },
  {
    id: 4,
    text: "Do you want it colorful or black & white?",
    placeholder: "Colorful / Black & White"
  }
];

const QuestionFlow: React.FC<QuestionFlowProps> = ({ onComplete, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(''));
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!answers[currentStep]) {
      setError('Please provide an answer before continuing');
      return;
    }

    setError('');
    if (currentStep === questions.length - 1) {
      // Generate final prompt
      const prompt = generatePrompt(answers);
      onComplete(prompt);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      onBack();
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNext();
    }
  };

  const generatePrompt = (answers: string[]): string => {
    const [subject, style, placement, color] = answers;
    return `Create a ${color.toLowerCase()} tattoo design of a ${subject} in ${style} style, designed to be placed on the ${placement}. The design should be detailed and suitable for a tattoo, with clean lines and proper contrast.`;
  };

  const currentQuestion = questions[currentStep];

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Design Your Tattoo</h2>
          <span className="text-sm text-gray-500">
            Step {currentStep + 1} of {questions.length}
          </span>
        </div>
        
        <div className="relative pt-1 mb-4">
          <div className="flex mb-2">
            <div className="w-full bg-gray-200 rounded-full">
              <div
                className="h-2 bg-purple-600 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <label className="block text-lg font-medium text-gray-700 mb-3">
          {currentQuestion.text}
        </label>
        <input
          type="text"
          value={answers[currentStep]}
          onChange={(e) => {
            const newAnswers = [...answers];
            newAnswers[currentStep] = e.target.value;
            setAnswers(newAnswers);
            setError('');
          }}
          onKeyPress={handleKeyPress}
          placeholder={currentQuestion.placeholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-lg"
          autoFocus
        />
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={handleBack}
          className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 transition"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex items-center bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
        >
          {currentStep === questions.length - 1 ? (
            <>
              Generate
              <Wand2 className="h-5 w-5 ml-2" />
            </>
          ) : (
            <>
              Next
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default QuestionFlow;