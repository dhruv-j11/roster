'use client';

import { Employee } from '@/lib/types';

interface EmployeeTableProps {
  employees: Employee[];
}

export default function EmployeeTable({ employees }: EmployeeTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Overworked':
        return 'bg-orange-900/30 text-orange-300 border-orange-700';
      case 'Underused':
        return 'bg-blue-900/30 text-blue-300 border-blue-700';
      case 'Inefficient':
        return 'bg-red-900/30 text-red-300 border-red-700';
      default:
        return 'bg-slate-800/30 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="rounded-xl bg-slate-900/70 backdrop-blur-sm border border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/50 border-b border-slate-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Team
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Efficiency
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {employees.map((employee) => (
              <tr
                key={employee.employee_id}
                className="hover:bg-slate-800/30 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{employee.name}</div>
                  <div className="text-sm text-slate-500">{employee.role}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-300">{employee.team}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-300">
                    {(employee.efficiency || 0).toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                      employee.status || 'Normal'
                    )}`}
                  >
                    {employee.status || 'Normal'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

