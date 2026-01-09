'use client';

import { useState } from 'react';
import { Employee } from '@/lib/types';

interface SmartRankingProps {
  employees: Employee[];
}

type RankingType = 'efficient' | 'expensive' | 'value';

export default function SmartRanking({ employees }: SmartRankingProps) {
  const [activeTab, setActiveTab] = useState<RankingType>('efficient');
  const [isOpen, setIsOpen] = useState(false);

  const getRankedEmployees = (): Employee[] => {
    switch (activeTab) {
      case 'efficient':
        return [...employees].sort((a, b) => (b.efficiency || 0) - (a.efficiency || 0));
      case 'expensive':
        return [...employees].sort((a, b) => {
          const costA = a.hourly_rate * a.hours_worked;
          const costB = b.hourly_rate * b.hours_worked;
          return costB - costA;
        });
      case 'value':
        return [...employees].sort((a, b) => (b.cost_efficiency || 0) - (a.cost_efficiency || 0));
      default:
        return employees;
    }
  };

  const rankedEmployees = getRankedEmployees();

  const getTabLabel = (tab: RankingType) => {
    switch (tab) {
      case 'efficient': return 'Most Efficient';
      case 'expensive': return 'Most Expensive';
      case 'value': return 'Best Value';
    }
  };

  return (
    <div className="rounded-xl bg-gray-900/70 backdrop-blur-sm border border-gray-800 overflow-hidden hover-glow" id="rankings">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Employee Rankings</h2>
          <div className="flex items-center gap-3">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as RankingType)}
              className="bg-gray-800 border border-gray-700 text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-[#00f0ff]"
            >
              <option value="efficient">Most Efficient</option>
              <option value="expensive">Most Expensive</option>
              <option value="value">Best Value</option>
            </select>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 text-white text-sm rounded hover:border-[#00f0ff] transition-colors"
            >
              {isOpen ? 'Hide' : 'Show'} Rankings
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="overflow-x-auto max-h-96">
          <table className="w-full">
            <thead className="bg-gray-800/50 border-b border-gray-700 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Rank</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Team</th>
                {activeTab === 'efficient' && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Efficiency</th>
                )}
                {activeTab === 'expensive' && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Total Cost</th>
                )}
                {activeTab === 'value' && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Cost Efficiency</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {rankedEmployees.slice(0, 10).map((employee, index) => (
                <tr
                  key={employee.employee_id}
                  className="hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className="text-[#00f0ff] font-semibold text-sm">#{index + 1}</span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{employee.name}</div>
                    <div className="text-xs text-gray-500">{employee.role}</div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                    {employee.team}
                  </td>
                  {activeTab === 'efficient' && (
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-white">
                      {(employee.efficiency || 0).toFixed(2)}
                    </td>
                  )}
                  {activeTab === 'expensive' && (
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-white">
                      ${(employee.hourly_rate * employee.hours_worked).toFixed(0)}
                    </td>
                  )}
                  {activeTab === 'value' && (
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-white">
                      {(employee.cost_efficiency || 0).toFixed(2)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
