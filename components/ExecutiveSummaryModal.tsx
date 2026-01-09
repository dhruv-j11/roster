'use client';

import { ProcessedData } from '@/lib/types';
import { generateExecutiveSummary, ExecutiveSummary } from '@/lib/executiveSummary';

interface ExecutiveSummaryModalProps {
  data: ProcessedData;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExecutiveSummaryModal({ data, isOpen, onClose }: ExecutiveSummaryModalProps) {
  if (!isOpen) return null;

  const summary: ExecutiveSummary = generateExecutiveSummary(data);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto bg-black border-2 border-[#00f0ff] rounded-xl p-8 shadow-[0_0_30px_rgba(0,240,255,0.3)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-[#00f0ff] transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-3xl font-bold mb-6 text-[#00f0ff]">Executive Summary</h2>

        <div className="space-y-6">
          {/* Company Health */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover-lift">
            <h3 className="text-xl font-semibold text-white mb-2">Company Health</h3>
            <p className="text-gray-300">{summary.companyHealth}</p>
          </div>

          {/* Top 3 Employees */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover-lift">
            <h3 className="text-xl font-semibold text-white mb-4">Top 3 Best Employees</h3>
            <div className="space-y-3">
              {summary.topEmployees.map((emp, idx) => (
                <div key={emp.employee_id} className="flex justify-between items-center">
                  <div>
                    <span className="text-[#00f0ff] font-semibold">{idx + 1}. {emp.name}</span>
                    <span className="text-gray-400 ml-2">({emp.team})</span>
                  </div>
                  <span className="text-white">Efficiency: {(emp.efficiency || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Drains */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover-lift">
            <h3 className="text-xl font-semibold text-white mb-4">Top 3 Cost Drains</h3>
            <div className="space-y-3">
              {summary.costDrains.map((emp, idx) => (
                <div key={emp.employee_id} className="flex justify-between items-center">
                  <div>
                    <span className="text-red-400 font-semibold">{idx + 1}. {emp.name}</span>
                    <span className="text-gray-400 ml-2">({emp.team})</span>
                  </div>
                  <span className="text-white">
                    Cost: ${(emp.hourly_rate * emp.hours_worked).toFixed(0)} | Output: {emp.output_score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Most Inefficient Team */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover-lift">
            <h3 className="text-xl font-semibold text-white mb-2">Most Inefficient Team</h3>
            <p className="text-gray-300">{summary.mostInefficientTeam}</p>
          </div>

          {/* Suggested Headcount Change */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover-lift">
            <h3 className="text-xl font-semibold text-white mb-2">Suggested Headcount Change</h3>
            <p className="text-gray-300">{summary.suggestedHeadcountChange}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
