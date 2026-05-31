
import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface CallInSectionProps {
  callInText: string;
  setCallInText: (text: string) => void;
  onSendCallIn: () => void;
  isLoading: boolean;
}

export const CallInSection: React.FC<CallInSectionProps> = ({
  callInText,
  setCallInText,
  onSendCallIn,
  isLoading,
}) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isLoading && callInText.trim()) {
        onSendCallIn();
      }
    }
  };

  return (
    <div className="w-full max-w-2xl bg-gray-800 p-6 rounded-lg shadow-xl my-8 ring-1 ring-gray-700">
      <label htmlFor="call-in-input" className="block text-sm font-medium text-sky-400 mb-2">
        Provoke The Hosts (Your Call-In)
      </label>
      <textarea
        id="call-in-input"
        value={callInText}
        onChange={(e) => setCallInText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your question or provocation here... (Press Enter to send, Shift+Enter for new line)"
        className="w-full h-24 p-3 bg-gray-700 text-gray-200 border border-gray-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-y shadow-inner transition-colors duration-150"
        disabled={isLoading}
        aria-label="Your call-in message"
      />
      <button
        onClick={onSendCallIn}
        disabled={isLoading || !callInText.trim()}
        className="mt-4 w-full bg-sky-600 hover:bg-sky-700 disabled:bg-sky-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75 flex items-center justify-center"
        aria-label="Send your call-in message to the hosts"
      >
        {isLoading ? (
          <>
            <LoadingSpinner />
            Sending...
          </>
        ) : (
          'Provoke Response'
        )}
      </button>
    </div>
  );
};
