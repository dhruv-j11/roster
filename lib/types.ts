export interface Employee {
  employee_id: string;
  name: string;
  role: string;
  hourly_rate: number;
  hours_worked: number;
  output_score: number;
  team: string;
  efficiency?: number;
  cost_efficiency?: number;
  status?: 'Overworked' | 'Underused' | 'Inefficient' | 'Normal';
}

export interface TeamMetrics {
  team: string;
  totalOutput: number;
  totalCost: number;
  avgEfficiency: number;
  employeeCount: number;
}

export interface ProcessedData {
  employees: Employee[];
  teamMetrics: TeamMetrics[];
  totalCost: number;
  totalOutput: number;
  avgEfficiency: number;
  recommendations: string[];
}

