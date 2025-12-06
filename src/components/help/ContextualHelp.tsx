import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface HelpItem {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  relatedLinks?: { label: string; url: string }[];
}

interface ContextualHelpProps {
  helpId: string;
  items: HelpItem[];
}

export default function ContextualHelp({ helpId, items }: ContextualHelpProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<HelpItem | null>(
    items.find(item => item.id === helpId) || items[0] || null
  );

  if (items.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-40 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Open help"
      >
        <HelpCircle size={24} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Help & Documentation</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close help"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {items.length > 1 && (
                <div className="mb-6 border-b pb-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setCurrentItem(item)}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          currentItem?.id === item.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentItem && (
                <div>
                  <h3 className="text-2xl font-bold mb-4">{currentItem.title}</h3>
                  <div className="prose max-w-none mb-6">
                    <p className="text-gray-700 whitespace-pre-line">{currentItem.content}</p>
                  </div>

                  {currentItem.videoUrl && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-2">Video Guide</h4>
                      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                        <a
                          href={currentItem.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Watch Video →
                        </a>
                      </div>
                    </div>
                  )}

                  {currentItem.relatedLinks && currentItem.relatedLinks.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Related Resources</h4>
                      <ul className="space-y-2">
                        {currentItem.relatedLinks.map((link, index) => (
                          <li key={index}>
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 underline"
                            >
                              {link.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
