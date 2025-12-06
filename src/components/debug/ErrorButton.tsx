import * as Sentry from '@sentry/react';

/**
 * Test button component to verify Sentry error tracking is working.
 * This component throws an error when clicked to test error capture.
 */
export function ErrorButton() {
  return (
    <button
      onClick={() => {
        const error = new Error('This is your first error!');
        // Explicitly capture the error with Sentry before throwing
        Sentry.captureException(error, {
          tags: {
            feature: 'testing',
            source: 'error-button',
          },
          extra: {
            testError: true,
            timestamp: new Date().toISOString(),
          },
        });
        // Then throw it so it can be caught by ErrorBoundary
        throw error;
      }}
      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
    >
      Break the world
    </button>
  );
}
