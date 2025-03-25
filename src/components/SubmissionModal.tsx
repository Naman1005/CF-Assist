import React from 'react';
import { X } from 'lucide-react';
import { Submission } from '../types/codeforces';
import { format } from 'date-fns';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissions: Submission[];
  date: Date;
}

export default function SubmissionModal({ isOpen, onClose, submissions, date }: SubmissionModalProps) {
  if (!isOpen) return null;

  const convertToIST = (timestamp: number) => {
    // Convert Unix timestamp to Date and add IST offset (+5:30)
    const utcDate = new Date(timestamp * 1000);
    return utcDate; 
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Submissions for {format(date, 'MMMM d, yyyy')}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <a
                    href={`https://codeforces.com/contest/${submission.contestId}/problem/${submission.problem.index}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                  >
                    {submission.problem.name}
                  </a>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    submission.verdict === 'OK'
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  }`}>
                    {submission.verdict}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {submission.problem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {format(convertToIST(submission.creationTimeSeconds), 'h:mm a')} IST
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}