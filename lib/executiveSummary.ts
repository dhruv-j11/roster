import { Employee, TeamMetrics, ProcessedData } from './types';

export interface ExecutiveSummary {
  companyHealth: string;
  topEmployees: Employee[];
  costDrains: Employee[];
  mostInefficientTeam: string;
  suggestedHeadcountChange: string;
}

export function generateExecutiveSummary(data: ProcessedData): ExecutiveSummary {
  const { employees, teamMetrics, avgEfficiency, totalCost, totalOutput } = data;

  // Calculate ideal efficiency (top 25% average)
  const sortedByEfficiency = [...employees].sort(
    (a, b) => (b.efficiency || 0) - (a.efficiency || 0)
  );
  const topQuartile = sortedByEfficiency.slice(0, Math.ceil(employees.length * 0.25));
  const idealEfficiency = topQuartile.reduce((sum, e) => sum + (e.efficiency || 0), 0) / topQuartile.length;

  // Company health
  const efficiencyRatio = avgEfficiency / idealEfficiency;
  let healthStatus: string;
  if (efficiencyRatio >= 0.9) {
    healthStatus = 'Excellent';
  } else if (efficiencyRatio >= 0.75) {
    healthStatus = 'Good';
  } else if (efficiencyRatio >= 0.6) {
    healthStatus = 'Fair';
  } else {
    healthStatus = 'Needs Improvement';
  }

  const companyHealth = `Overall efficiency is ${(efficiencyRatio * 100).toFixed(1)}% compared to ideal (${healthStatus})`;

  // Top 3 best employees (by efficiency)
  const topEmployees = [...employees]
    .sort((a, b) => (b.efficiency || 0) - (a.efficiency || 0))
    .slice(0, 3);

  // Top 3 cost drains (highest cost, lowest output)
  const costDrains = [...employees]
    .map((emp) => ({
      ...emp,
      costOutputRatio: emp.output_score / (emp.hourly_rate * emp.hours_worked || 1),
    }))
    .sort((a, b) => a.costOutputRatio - b.costOutputRatio)
    .slice(0, 3)
    .map(({ costOutputRatio, ...emp }) => emp);

  // Most inefficient team
  const teamEfficiencyMap = new Map<string, number>();
  teamMetrics.forEach((team) => {
    const teamEmployees = employees.filter((e) => e.team === team.team);
    if (teamEmployees.length > 0) {
      const teamAvgEfficiency = teamEmployees.reduce(
        (sum, e) => sum + (e.efficiency || 0),
        0
      ) / teamEmployees.length;
      teamEfficiencyMap.set(team.team, teamAvgEfficiency);
    }
  });

  const mostInefficientTeam = Array.from(teamEfficiencyMap.entries())
    .sort((a, b) => a[1] - b[1])[0]?.[0] || 'N/A';

  // Suggested headcount change
  const teamCostEfficiency = teamMetrics.map((team) => {
    const teamEmployees = employees.filter((e) => e.team === team.team);
    const avgCostEfficiency = teamEmployees.length > 0
      ? teamEmployees.reduce((sum, e) => sum + (e.cost_efficiency || 0), 0) / teamEmployees.length
      : 0;
    return {
      team: team.team,
      avgCostEfficiency,
      totalCost: team.totalCost,
      employeeCount: team.employeeCount,
    };
  });

  const worstTeam = teamCostEfficiency.sort((a, b) => a.avgCostEfficiency - b.avgCostEfficiency)[0];
  const bestTeam = teamCostEfficiency.sort((a, b) => b.avgCostEfficiency - a.avgCostEfficiency)[0];

  let suggestedHeadcountChange = 'No significant changes recommended';
  if (worstTeam && bestTeam && worstTeam.team !== bestTeam.team) {
    const reduction = Math.min(10, Math.floor(worstTeam.employeeCount * 0.1));
    if (reduction > 0) {
      suggestedHeadcountChange = `Reduce ${worstTeam.team} hours by ${reduction * 5}%, reallocate to ${bestTeam.team}`;
    }
  }

  return {
    companyHealth,
    topEmployees,
    costDrains,
    mostInefficientTeam,
    suggestedHeadcountChange,
  };
}
