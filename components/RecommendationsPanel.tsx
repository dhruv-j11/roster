'use client';

import { ProcessedData } from '@/lib/types';

interface RecommendationsPanelProps {
  recommendations: string[];
}

export default function RecommendationsPanel({ recommendations }: RecommendationsPanelProps) {
  if (recommendations.length === 0) {
    return (
      <div className="rounded-xl bg-slate-900/70 backdrop-blur-sm border border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recommendations</h2>
        <p className="text-slate-400">No recommendations available. Upload data to see insights.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-slate-900/70 backdrop-blur-sm border border-slate-700 p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Recommendations</h2>
      <ul className="space-y-3">
        {recommendations.map((rec, index) => (
          <li
            key={index}
            className="flex items-start gap-3 text-slate-300 hover:text-white transition-colors"
          >
            <span className="text-blue-400 mt-1">•</span>
            <span className="flex-1">{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

