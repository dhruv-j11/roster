'use client';

import { useState, useMemo } from 'react';
import { ProcessedData, Employee, TeamMetrics } from '@/lib/types';

interface ScenarioSimulatorProps {
  originalData: ProcessedData;
}

interface TeamAdjustment {
  team: string;
  hoursMultiplier: number;
  headcountMultiplier: number;
}

interface ScenarioAnalysis {
  totalCost: number;
  totalOutput: number;
  avgEfficiency: number;
  costSavings: number;
  outputChange: number;
  outputChangePercent: number;
  efficiencyChange: number;
  roi: number;
  recommendation: string;
  warnings: string[];
}

export default function ScenarioSimulator({ originalData }: ScenarioSimulatorProps) {
  const [teamAdjustments, setTeamAdjustments] = useState<Map<string, TeamAdjustment>>(() => {
    const map = new Map();
    originalData.teamMetrics.forEach((team) => {
      map.set(team.team, {
        team: team.team,
        hoursMultiplier: 1,
        headcountMultiplier: 1,
      });
    });
    return map;
  });

  const scenarioResults = useMemo((): ScenarioAnalysis => {
    // Calculate base team averages for context
    const teamAverages = new Map<string, { avgHours: number; avgEfficiency: number; avgCost: number }>();
    originalData.teamMetrics.forEach((team) => {
      const teamEmployees = originalData.employees.filter((e) => e.team === team.team);
      if (teamEmployees.length > 0) {
        const avgHours = teamEmployees.reduce((sum, e) => sum + e.hours_worked, 0) / teamEmployees.length;
        const avgEfficiency = teamEmployees.reduce((sum, e) => sum + (e.efficiency || 0), 0) / teamEmployees.length;
        const avgCost = team.totalCost / team.employeeCount;
        teamAverages.set(team.team, { avgHours, avgEfficiency, avgCost });
      }
    });

    // Apply realistic adjustments with productivity models
    const adjustedEmployees: Employee[] = originalData.employees.map((emp) => {
      const adjustment = teamAdjustments.get(emp.team);
      if (!adjustment) return emp;

      const baseHours = emp.hours_worked;
      const baseOutput = emp.output_score;
      const baseEfficiency = emp.efficiency || 0;
      const teamAvg = teamAverages.get(emp.team);

      // Calculate new hours
      const newHours = baseHours * adjustment.hoursMultiplier;
      const hoursChange = newHours - baseHours;

      // Productivity model: Diminishing returns after 40 hours, efficiency drops
      // Efficiency multiplier based on hours worked (overtime reduces productivity)
      let efficiencyMultiplier = 1;
      if (newHours > 40) {
        // Overtime penalty: 5% efficiency loss per hour over 40
        const overtimeHours = newHours - 40;
        efficiencyMultiplier = Math.max(0.7, 1 - (overtimeHours * 0.05));
      } else if (newHours < 30) {
        // Underutilization: slight efficiency gain (more focused work)
        efficiencyMultiplier = Math.min(1.1, 1 + ((30 - newHours) * 0.01));
      }

      // Headcount adjustment
      const headcountChange = adjustment.headcountMultiplier - 1;
      const actualHeadcountMultiplier = adjustment.headcountMultiplier;

      // New output calculation with realistic productivity curves
      // If reducing hours, output scales but efficiency might improve (less burnout)
      // If increasing hours, output increases but efficiency may decrease (overtime fatigue)
      let newOutput = baseOutput * actualHeadcountMultiplier;
      
      // Apply efficiency multiplier to account for productivity changes
      newOutput = newOutput * efficiencyMultiplier;

      // Headcount change costs (hiring/firing, onboarding)
      // For simplicity, we'll account for this in the final cost calculation
      const newHoursWorked = newHours * actualHeadcountMultiplier;
      
      // Calculate new metrics
      const newEfficiency = newHoursWorked > 0 ? newOutput / newHoursWorked : 0;
      const newCostEfficiency = (emp.hourly_rate * newHoursWorked) > 0
        ? newOutput / (emp.hourly_rate * newHoursWorked)
        : 0;

      return {
        ...emp,
        hours_worked: newHoursWorked,
        output_score: newOutput,
        efficiency: newEfficiency,
        cost_efficiency: newCostEfficiency,
      };
    });

    // Recalculate metrics
    const totalCost = adjustedEmployees.reduce(
      (sum, emp) => sum + emp.hourly_rate * emp.hours_worked,
      0
    );

    // Add one-time costs for headcount changes
    let oneTimeCosts = 0;
    teamAdjustments.forEach((adjustment, teamName) => {
      const headcountChange = adjustment.headcountMultiplier - 1;
      if (Math.abs(headcountChange) > 0.05) { // More than 5% change
        const teamEmployees = originalData.employees.filter((e) => e.team === teamName);
        const currentHeadcount = teamEmployees.length;
        const changeCount = Math.round(currentHeadcount * Math.abs(headcountChange));
        
        if (headcountChange > 0) {
          // Hiring costs: onboarding, training (estimate $5000 per new hire)
          oneTimeCosts += changeCount * 5000;
        } else {
          // Firing costs: severance, knowledge loss (estimate $3000 per fired employee)
          oneTimeCosts += changeCount * 3000;
        }
      }
    });

    const totalOutput = adjustedEmployees.reduce(
      (sum, emp) => sum + emp.output_score,
      0
    );
    const avgEfficiency = adjustedEmployees.length > 0
      ? adjustedEmployees.reduce((sum, emp) => sum + (emp.efficiency || 0), 0) / adjustedEmployees.length
      : 0;

    const originalCost = originalData.totalCost;
    const originalOutput = originalData.totalOutput;
    const originalEfficiency = originalData.avgEfficiency;

    const costSavings = originalCost - totalCost;
    const outputChange = totalOutput - originalOutput;
    const outputChangePercent = originalOutput > 0 ? (outputChange / originalOutput) * 100 : 0;
    const efficiencyChange = avgEfficiency - originalEfficiency;
    const efficiencyChangePercent = originalEfficiency > 0 ? (efficiencyChange / originalEfficiency) * 100 : 0;

    // Calculate ROI (return on investment)
    // ROI = (Output Change Value - Cost Change) / Investment
    // Simplified: treat output as value, calculate net benefit
    const netBenefit = outputChange - Math.abs(costSavings) - oneTimeCosts;
    const investment = Math.abs(costSavings) + oneTimeCosts;
    const roi = investment > 0 ? (netBenefit / investment) * 100 : 0;

    // Generate recommendations and warnings
    const warnings: string[] = [];
    let recommendation = '';

    if (oneTimeCosts > 0) {
      warnings.push(`One-time costs: $${oneTimeCosts.toFixed(0)} (hiring/firing)`);
    }

    teamAdjustments.forEach((adjustment, teamName) => {
      const teamAvg = teamAverages.get(teamName);
      if (!teamAvg) return;

      const newAvgHours = teamAvg.avgHours * adjustment.hoursMultiplier;
      if (newAvgHours > 45) {
        warnings.push(`${teamName}: High overtime may cause burnout and reduce long-term productivity`);
      }
      if (adjustment.headcountMultiplier < 0.8) {
        warnings.push(`${teamName}: Significant headcount reduction may impact team capacity`);
      }
    });

    if (roi > 20 && outputChangePercent > 0) {
      recommendation = '✓ High ROI scenario - Recommended implementation';
    } else if (roi > 0 && outputChangePercent > 0) {
      recommendation = '→ Positive ROI but consider long-term impacts';
    } else if (costSavings > 0 && outputChangePercent < -5) {
      recommendation = '⚠ Cost savings but significant output loss - Not recommended';
    } else if (costSavings < 0 && outputChangePercent < 0) {
      recommendation = '✗ Increased costs with reduced output - Not viable';
    } else {
      recommendation = '→ Review additional factors before decision';
    }

    return {
      totalCost: totalCost + oneTimeCosts, // Include one-time costs
      totalOutput,
      avgEfficiency,
      costSavings: costSavings - oneTimeCosts, // Net savings after one-time costs
      outputChange,
      outputChangePercent,
      efficiencyChange: efficiencyChangePercent,
      roi,
      recommendation,
      warnings,
    };
  }, [originalData, teamAdjustments]);

  const updateTeamAdjustment = (team: string, field: 'hoursMultiplier' | 'headcountMultiplier', value: number) => {
    setTeamAdjustments((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(team) || { team, hoursMultiplier: 1, headcountMultiplier: 1 };
      newMap.set(team, { ...current, [field]: value });
      return newMap;
    });
  };

  // Get first 2 teams for compact display
  const teamsToShow = originalData.teamMetrics.slice(0, 2);

  return (
    <div className="rounded-xl bg-gray-900/70 backdrop-blur-sm border border-gray-800 p-4 hover-glow" id="scenario-simulator">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-semibold text-white">[Beta] Scenario Simulator</h2>
        <span className="text-xs bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded border border-yellow-700">
          Experimental
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sliders - 2x2 grid */}
        <div className="grid grid-cols-2 gap-3">
          {teamsToShow.map((team) => {
            const adjustment = teamAdjustments.get(team.team) || { hoursMultiplier: 1, headcountMultiplier: 1 };
            const hoursPercent = ((adjustment.hoursMultiplier - 1) * 100).toFixed(0);
            const headcountPercent = ((adjustment.headcountMultiplier - 1) * 100).toFixed(0);

            return (
              <div key={team.team} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 space-y-3">
                <h3 className="text-sm font-semibold text-[#00f0ff]">{team.team}</h3>
                
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Hours: {hoursPercent}%
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    value={adjustment.hoursMultiplier}
                    onChange={(e) => updateTeamAdjustment(team.team, 'hoursMultiplier', parseFloat(e.target.value))}
                    className="w-full accent-[#00f0ff]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Headcount: {headcountPercent}%
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.05"
                    value={adjustment.headcountMultiplier}
                    onChange={(e) => updateTeamAdjustment(team.team, 'headcountMultiplier', parseFloat(e.target.value))}
                    className="w-full accent-[#00f0ff]"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Results */}
        <div className="p-4 bg-gray-800/50 rounded-lg border border-[#00f0ff]/30">
          <h3 className="text-lg font-semibold text-white mb-3">Projected Impact</h3>
          <div className="space-y-2 text-sm mb-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Cost:</span>
              <span className="text-white">${scenarioResults.totalCost.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Output:</span>
              <span className="text-white">{scenarioResults.totalOutput.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Efficiency:</span>
              <span className={`${scenarioResults.efficiencyChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {scenarioResults.avgEfficiency.toFixed(2)} ({scenarioResults.efficiencyChange >= 0 ? '+' : ''}{scenarioResults.efficiencyChange.toFixed(1)}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Output Change:</span>
              <span className={scenarioResults.outputChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}>
                {scenarioResults.outputChangePercent >= 0 ? '+' : ''}{scenarioResults.outputChangePercent.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Net Savings:</span>
              <span className={scenarioResults.costSavings >= 0 ? 'text-green-400' : 'text-red-400'}>
                {scenarioResults.costSavings >= 0 ? '+' : ''}${scenarioResults.costSavings.toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">ROI:</span>
              <span className={scenarioResults.roi >= 0 ? 'text-green-400' : 'text-red-400'}>
                {scenarioResults.roi >= 0 ? '+' : ''}{scenarioResults.roi.toFixed(1)}%
              </span>
            </div>
          </div>

          {scenarioResults.warnings.length > 0 && (
            <div className="mt-3 p-2 bg-yellow-900/20 rounded border border-yellow-700/50 mb-3">
              <p className="text-yellow-400 text-xs font-semibold mb-1">⚠ Warnings:</p>
              <ul className="text-yellow-300/80 text-xs space-y-1">
                {scenarioResults.warnings.map((warning, idx) => (
                  <li key={idx}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-3 p-2 bg-black/50 rounded border border-[#00f0ff]/20">
            <p className="text-[#00f0ff] font-semibold text-xs leading-relaxed mb-1">
              Recommendation:
            </p>
            <p className="text-white text-xs leading-relaxed">
              {scenarioResults.recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
