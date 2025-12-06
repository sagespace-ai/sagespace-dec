import { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';

interface FeatureTip {
  id: string;
  feature: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface FeatureDiscoveryProps {
  tips: FeatureTip[];
  onDismiss: (tipId: string) => void;
}

export default function FeatureDiscovery({ tips, onDismiss }: FeatureDiscoveryProps) {
  const [currentTip, setCurrentTip] = useState<FeatureTip | null>(null);
  const [dismissedTips, setDismissedTips] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load dismissed tips from localStorage
    const saved = localStorage.getItem('dismissedFeatureTips');
    if (saved) {
      setDismissedTips(new Set(JSON.parse(saved)));
    }

    // Find first non-dismissed tip
    const availableTip = tips.find(tip => !dismissedTips.has(tip.id));
    if (availableTip) {
      setCurrentTip(availableTip);
    }
  }, [tips, dismissedTips]);

  const handleDismiss = () => {
    if (currentTip) {
      const newDismissed = new Set(dismissedTips);
      newDismissed.add(currentTip.id);
      setDismissedTips(newDismissed);
      localStorage.setItem('dismissedFeatureTips', JSON.stringify(Array.from(newDismissed)));
      onDismiss(currentTip.id);

      // Show next tip
      const nextTip = tips.find(tip => !newDismissed.has(tip.id));
      setCurrentTip(nextTip || null);
    }
  };

  if (!currentTip) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold text-sm">{currentTip.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{currentTip.description}</p>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 ml-2"
              >
                <X size={16} />
              </button>
            </div>
            {currentTip.action && (
              <button
                onClick={() => {
                  currentTip.action?.onClick();
                  handleDismiss();
                }}
                className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                {currentTip.action.label} →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
