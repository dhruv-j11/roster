import { Employee, TeamMetrics, ProcessedData } from './types';

export function processEmployeeData(rawData: any[]): ProcessedData {
  // Parse and validate data
  const employees: Employee[] = rawData.map((row) => ({
    employee_id: String(row.employee_id || ''),
    name: String(row.name || ''),
    role: String(row.role || ''),
    hourly_rate: parseFloat(row.hourly_rate) || 0,
    hours_worked: parseFloat(row.hours_worked) || 0,
    output_score: parseFloat(row.output_score) || 0,
    team: String(row.team || ''),
  })).filter(emp => emp.employee_id && emp.name);

  // Calculate efficiency and cost_efficiency
  employees.forEach((emp) => {
    emp.efficiency = emp.hours_worked > 0 
      ? emp.output_score / emp.hours_worked 
      : 0;
    emp.cost_efficiency = (emp.hourly_rate * emp.hours_worked) > 0
      ? emp.output_score / (emp.hourly_rate * emp.hours_worked)
      : 0;
  });

  // Calculate team metrics
  const teamsMap = new Map<string, TeamMetrics>();
  
  employees.forEach((emp) => {
    if (!teamsMap.has(emp.team)) {
      teamsMap.set(emp.team, {
        team: emp.team,
        totalOutput: 0,
        totalCost: 0,
        avgEfficiency: 0,
        employeeCount: 0,
      });
    }
    
    const team = teamsMap.get(emp.team)!;
    team.totalOutput += emp.output_score;
    team.totalCost += emp.hourly_rate * emp.hours_worked;
    team.employeeCount += 1;
  });

  // Calculate average efficiency per team and average hours per team
  const teamMetrics: TeamMetrics[] = Array.from(teamsMap.values()).map((team) => {
    const teamEmployees = employees.filter((e) => e.team === team.team);
    team.avgEfficiency = teamEmployees.length > 0
      ? teamEmployees.reduce((sum, e) => sum + (e.efficiency || 0), 0) / teamEmployees.length
      : 0;
    return team;
  });

  // Create a map of team averages for quick lookup
  const teamAverages = new Map<string, { avgHours: number; avgEfficiency: number }>();
  teamMetrics.forEach((team) => {
    const teamEmployees = employees.filter((e) => e.team === team.team);
    const avgHours = teamEmployees.length > 0
      ? teamEmployees.reduce((sum, e) => sum + e.hours_worked, 0) / teamEmployees.length
      : 0;
    teamAverages.set(team.team, {
      avgHours,
      avgEfficiency: team.avgEfficiency,
    });
  });

  // Calculate overall metrics
  const totalCost = employees.reduce(
    (sum, emp) => sum + emp.hourly_rate * emp.hours_worked,
    0
  );
  const totalOutput = employees.reduce(
    (sum, emp) => sum + emp.output_score,
    0
  );
  const avgEfficiency = employees.length > 0
    ? employees.reduce((sum, emp) => sum + (emp.efficiency || 0), 0) / employees.length
    : 0;

  // Categorize employees based on team averages
  employees.forEach((emp) => {
    const teamAvg = teamAverages.get(emp.team);
    if (!teamAvg) {
      emp.status = 'Normal';
      return;
    }

    if (emp.hours_worked > teamAvg.avgHours && emp.efficiency !== undefined && emp.efficiency < teamAvg.avgEfficiency) {
      emp.status = 'Overworked';
    } else if (emp.hours_worked < teamAvg.avgHours && emp.efficiency !== undefined && emp.efficiency > teamAvg.avgEfficiency) {
      emp.status = 'Underused';
    } else {
      emp.status = 'Normal';
    }
  });

  // Mark inefficient employees (bottom 25% cost_efficiency)
  const sortedByCostEfficiency = [...employees].sort(
    (a, b) => (a.cost_efficiency || 0) - (b.cost_efficiency || 0)
  );
  const inefficientThreshold = sortedByCostEfficiency[
    Math.floor(sortedByCostEfficiency.length * 0.25)
  ];
  employees.forEach((emp) => {
    if (emp.cost_efficiency !== undefined && 
        inefficientThreshold.cost_efficiency !== undefined &&
        emp.cost_efficiency <= inefficientThreshold.cost_efficiency) {
      emp.status = 'Inefficient';
    }
  });

  // Generate recommendations
  const recommendations = generateRecommendations(
    employees,
    teamMetrics,
    avgEfficiency,
    totalCost,
    totalOutput
  );

  return {
    employees,
    teamMetrics,
    totalCost,
    totalOutput,
    avgEfficiency,
    recommendations,
  };
}

function generateRecommendations(
  employees: Employee[],
  teamMetrics: TeamMetrics[],
  avgEfficiency: number,
  totalCost: number,
  totalOutput: number
): string[] {
  const recommendations: string[] = [];

  // Find overworked and underused employees
  const overworked = employees.filter((e) => e.status === 'Overworked');
  const underused = employees.filter((e) => e.status === 'Underused');

  // Recommend shifting hours
  if (overworked.length > 0 && underused.length > 0) {
    const overworkedEmp = overworked[0];
    const underusedEmp = underused[0];
    const teamAvg = teamMetrics.find((t) => t.team === overworkedEmp.team);
    if (teamAvg) {
      const avgHours = employees
        .filter((e) => e.team === overworkedEmp.team)
        .reduce((sum, e) => sum + e.hours_worked, 0) / 
        employees.filter((e) => e.team === overworkedEmp.team).length;
      const hoursToShift = Math.min(
        Math.max(1, Math.floor((overworkedEmp.hours_worked - avgHours) / 2)),
        5
      );
      if (hoursToShift > 0) {
        recommendations.push(
          `Shift ${hoursToShift} hours from ${overworkedEmp.name} to ${underusedEmp.name}`
        );
      }
    }
  }

  // Team budget recommendations
  teamMetrics.forEach((team) => {
    const teamEmployees = employees.filter((e) => e.team === team.team);
    if (teamEmployees.length === 0) return;

    const avgCostEfficiency = teamEmployees.reduce(
      (sum, e) => sum + (e.cost_efficiency || 0),
      0
    ) / teamEmployees.length;
    const overallAvgCostEfficiency = employees.reduce(
      (sum, e) => sum + (e.cost_efficiency || 0),
      0
    ) / employees.length;

    if (avgCostEfficiency < overallAvgCostEfficiency * 0.8) {
      recommendations.push(
        `Team ${team.team} is over budget for its output`
      );
    }
  });

  // Individual employee recommendations
  const inefficient = employees.filter((e) => e.status === 'Inefficient');
  inefficient.slice(0, 3).forEach((emp) => {
    recommendations.push(
      `${emp.name} is high cost, low return (cost efficiency: ${(emp.cost_efficiency || 0).toFixed(2)})`
    );
  });

  // Team efficiency recommendations
  teamMetrics.forEach((team) => {
    if (team.avgEfficiency < avgEfficiency * 0.9) {
      recommendations.push(
        `Team ${team.team} efficiency is ${((team.avgEfficiency / avgEfficiency) * 100).toFixed(0)}% of average - consider optimization`
      );
    }
  });

  return recommendations.slice(0, 10); // Limit to 10 recommendations
}

