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

  // Calculate overall averages
  const overallAvgCostEfficiency = employees.reduce(
    (sum, e) => sum + (e.cost_efficiency || 0),
    0
  ) / employees.length;
  const overallAvgHours = employees.reduce(
    (sum, e) => sum + e.hours_worked,
    0
  ) / employees.length;

  // 1. Overworked/Underused Employee Workload Balancing (Multiple pairs)
  const overworked = employees.filter((e) => e.status === 'Overworked').sort(
    (a, b) => (b.hours_worked || 0) - (a.hours_worked || 0)
  );
  const underused = employees.filter((e) => e.status === 'Underused').sort(
    (a, b) => (a.hours_worked || 0) - (b.hours_worked || 0)
  );

  // Generate multiple workload rebalancing recommendations
  for (let i = 0; i < Math.min(overworked.length, underused.length, 3); i++) {
    const overworkedEmp = overworked[i];
    const underusedEmp = underused[i];
    const teamAvg = employees
      .filter((e) => e.team === overworkedEmp.team)
      .reduce((sum, e) => sum + e.hours_worked, 0) / 
      employees.filter((e) => e.team === overworkedEmp.team).length;
    
    const hoursToShift = Math.min(
      Math.max(1, Math.floor((overworkedEmp.hours_worked - teamAvg) / 2)),
      8
    );
    
    if (hoursToShift > 0 && overworkedEmp.team === underusedEmp.team) {
      recommendations.push(
        `Redistribute ${hoursToShift} hours from ${overworkedEmp.name} to ${underusedEmp.name} (same team)`
      );
    } else if (hoursToShift > 0) {
      recommendations.push(
        `Consider transferring ${hoursToShift} hours from ${overworkedEmp.name} (${overworkedEmp.team}) to ${underusedEmp.name} (${underusedEmp.team})`
      );
    }
  }

  // 2. Team Budget & Cost Efficiency Analysis
  teamMetrics.forEach((team) => {
    const teamEmployees = employees.filter((e) => e.team === team.team);
    if (teamEmployees.length === 0) return;

    const avgCostEfficiency = teamEmployees.reduce(
      (sum, e) => sum + (e.cost_efficiency || 0),
      0
    ) / teamEmployees.length;
    const teamAvgHours = teamEmployees.reduce(
      (sum, e) => sum + e.hours_worked,
      0
    ) / teamEmployees.length;

    if (avgCostEfficiency < overallAvgCostEfficiency * 0.75) {
      const savings = team.totalCost - (team.totalOutput / overallAvgCostEfficiency);
      recommendations.push(
        `Team ${team.team}: ${((overallAvgCostEfficiency / avgCostEfficiency - 1) * 100).toFixed(0)}% below avg cost efficiency - potential savings: $${Math.round(savings)}`
      );
    }

    if (team.avgEfficiency < avgEfficiency * 0.85) {
      recommendations.push(
        `Team ${team.team} efficiency ${((team.avgEfficiency / avgEfficiency) * 100).toFixed(0)}% below average - review processes or training needs`
      );
    }

    // Team workload analysis
    if (teamAvgHours > overallAvgHours * 1.2) {
      recommendations.push(
        `Team ${team.team} averaging ${teamAvgHours.toFixed(1)} hrs/week (${((teamAvgHours / overallAvgHours - 1) * 100).toFixed(0)}% above average) - risk of burnout`
      );
    } else if (teamAvgHours < overallAvgHours * 0.8) {
      recommendations.push(
        `Team ${team.team} underutilized at ${teamAvgHours.toFixed(1)} hrs/week - consider increasing capacity`
      );
    }
  });

  // 3. High-Performing Employees (Top Performers)
  const topPerformers = [...employees]
    .sort((a, b) => (b.efficiency || 0) - (a.efficiency || 0))
    .slice(0, 3);
  
  topPerformers.forEach((emp, idx) => {
    if (emp.efficiency && emp.efficiency > avgEfficiency * 1.3) {
      recommendations.push(
        `${emp.name} (${emp.team}) is a top performer (${((emp.efficiency / avgEfficiency) * 100).toFixed(0)}% above avg) - consider mentoring or leadership role`
      );
    }
  });

  // 4. Inefficient Employees (Bottom Performers - More detailed)
  const inefficient = employees
    .filter((e) => e.status === 'Inefficient')
    .sort((a, b) => (a.cost_efficiency || 0) - (b.cost_efficiency || 0));
  
  inefficient.slice(0, 5).forEach((emp) => {
    const costImpact = emp.hourly_rate * emp.hours_worked;
    const efficiencyRatio = emp.efficiency ? (emp.efficiency / avgEfficiency) : 0;
    
    recommendations.push(
      `${emp.name} (${emp.team}): Cost efficiency ${((emp.cost_efficiency || 0) / overallAvgCostEfficiency * 100).toFixed(0)}% of average - costs $${Math.round(costImpact)}/week for ${emp.output_score} output`
    );
  });

  // 5. Role-Based Recommendations
  const roleGroups = new Map<string, Employee[]>();
  employees.forEach((emp) => {
    if (!roleGroups.has(emp.role)) {
      roleGroups.set(emp.role, []);
    }
    roleGroups.get(emp.role)!.push(emp);
  });

  roleGroups.forEach((roleEmployees, role) => {
    if (roleEmployees.length < 2) return;
    
    const roleAvgEfficiency = roleEmployees.reduce(
      (sum, e) => sum + (e.efficiency || 0),
      0
    ) / roleEmployees.length;
    const roleAvgCost = roleEmployees.reduce(
      (sum, e) => sum + (e.hourly_rate * e.hours_worked),
      0
    ) / roleEmployees.length;

    if (roleAvgEfficiency < avgEfficiency * 0.9) {
      recommendations.push(
        `${role} role performing ${((roleAvgEfficiency / avgEfficiency) * 100).toFixed(0)}% below company average - review role expectations or training`
      );
    }
  });

  // 6. Cost Optimization Opportunities
  const highCostLowOutput = [...employees]
    .filter((e) => {
      const cost = e.hourly_rate * e.hours_worked;
      const avgCost = totalCost / employees.length;
      return cost > avgCost * 1.2 && e.output_score < totalOutput / employees.length * 0.9;
    })
    .sort((a, b) => {
      const costA = a.hourly_rate * a.hours_worked;
      const costB = b.hourly_rate * b.hours_worked;
      return costB - costA;
    })
    .slice(0, 3);

  highCostLowOutput.forEach((emp) => {
    const cost = emp.hourly_rate * emp.hours_worked;
    const avgCost = totalCost / employees.length;
    recommendations.push(
      `${emp.name} costs $${Math.round(cost)}/week but output ${((emp.output_score / (totalOutput / employees.length)) * 100).toFixed(0)}% of average - review role or performance`
    );
  });

  // 7. Best Value Employees (Cost Efficient)
  const bestValue = [...employees]
    .sort((a, b) => (b.cost_efficiency || 0) - (a.cost_efficiency || 0))
    .slice(0, 3);

  bestValue.forEach((emp) => {
    if ((emp.cost_efficiency || 0) > overallAvgCostEfficiency * 1.2) {
      recommendations.push(
        `${emp.name} provides exceptional value (${((emp.cost_efficiency || 0) / overallAvgCostEfficiency * 100).toFixed(0)}% above avg cost efficiency) - consider scaling similar roles`
      );
    }
  });

  // 8. Team Size Optimization
  teamMetrics.forEach((team) => {
    const teamEmployees = employees.filter((e) => e.team === team.team);
    const avgTeamSize = employees.length / teamMetrics.length;
    
    if (team.employeeCount > avgTeamSize * 1.5) {
      recommendations.push(
        `Team ${team.team} has ${team.employeeCount} members (${((team.employeeCount / avgTeamSize - 1) * 100).toFixed(0)}% above avg) - consider if team size is optimal`
      );
    } else if (team.employeeCount < avgTeamSize * 0.7 && team.avgEfficiency < avgEfficiency * 0.95) {
      recommendations.push(
        `Team ${team.team} may be understaffed (${team.employeeCount} members) with below-average efficiency - consider adding capacity`
      );
    }
  });

  // 9. Cross-Team Resource Allocation
  const teamsByEfficiency = [...teamMetrics].sort((a, b) => b.avgEfficiency - a.avgEfficiency);
  const mostEfficientTeam = teamsByEfficiency[0];
  const leastEfficientTeam = teamsByEfficiency[teamsByEfficiency.length - 1];

  if (mostEfficientTeam && leastEfficientTeam && mostEfficientTeam.team !== leastEfficientTeam.team) {
    const efficiencyGap = mostEfficientTeam.avgEfficiency / leastEfficientTeam.avgEfficiency;
    if (efficiencyGap > 1.3) {
      recommendations.push(
        `Consider cross-training: ${mostEfficientTeam.team} (${((efficiencyGap - 1) * 100).toFixed(0)}% more efficient) could mentor ${leastEfficientTeam.team}`
      );
    }
  }

  // 10. Overall Company Health Insights
  const efficiencyVariation = employees.reduce((sum, e) => {
    const diff = Math.abs((e.efficiency || 0) - avgEfficiency);
    return sum + diff;
  }, 0) / employees.length;

  if (efficiencyVariation > avgEfficiency * 0.4) {
    recommendations.push(
      `High efficiency variance detected (${(efficiencyVariation / avgEfficiency * 100).toFixed(0)}% variation) - consider standardized processes or training programs`
    );
  }

  const costEfficiencyRatio = totalOutput / totalCost;
  const idealRatio = avgEfficiency * 0.8; // Rough estimate
  if (costEfficiencyRatio < idealRatio) {
    recommendations.push(
      `Company-wide cost efficiency below optimal - focus on improving output per dollar spent through process optimization or skill development`
    );
  }

  return recommendations; // Return all recommendations (no limit)
}

