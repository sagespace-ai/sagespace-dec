import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface OnboardingTutorialProps {
  steps: TutorialStep[];
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingTutorial({
  steps,
  onComplete,
  onSkip
}: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightPosition, setHighlightPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useEffect(() => {
    if (steps[currentStep]?.target) {
      updateHighlightPosition(steps[currentStep].target!);
    } else {
      setHighlightPosition(null);
    }
  }, [currentStep, steps]);

  const updateHighlightPosition = (selector: string) => {
    const element = document.querySelector(selector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      });
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  if (!currentStepData) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />

      {/* Highlight overlay */}
      {highlightPosition && (
        <div
          className="fixed z-50 border-4 border-blue-500 rounded-lg pointer-events-none shadow-2xl"
          style={{
            top: highlightPosition.top - 4,
            left: highlightPosition.left - 4,
            width: highlightPosition.width + 8,
            height: highlightPosition.height + 8,
          }}
        />
      )}

      {/* Tutorial Card */}
      <div
        className={`fixed z-50 bg-white rounded-lg shadow-2xl p-6 max-w-md ${
          currentStepData.position === 'top' ? 'bottom-full mb-4' :
          currentStepData.position === 'bottom' ? 'top-full mt-4' :
          currentStepData.position === 'left' ? 'right-full mr-4' :
          currentStepData.position === 'right' ? 'left-full ml-4' :
          'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
        }`}
        style={
          highlightPosition && currentStepData.position !== 'center'
            ? {
                top: currentStepData.position === 'bottom' ? highlightPosition.top + highlightPosition.height + 16 : undefined,
                bottom: currentStepData.position === 'top' ? window.innerHeight - highlightPosition.top + 16 : undefined,
                left: highlightPosition.left,
              }
            : {}
        }
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">
              Step {currentStep + 1} of {steps.length}
            </div>
            <h3 className="text-xl font-bold">{currentStepData.title}</h3>
          </div>
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-gray-600 mb-6">{currentStepData.content}</p>

        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </>
  );
}
