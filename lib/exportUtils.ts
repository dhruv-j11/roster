import { ProcessedData, Employee } from './types';
import { generateExecutiveSummary } from './executiveSummary';
import Papa from 'papaparse';

export function downloadCSV(data: ProcessedData) {
  const csvData = data.employees.map((emp) => ({
    employee_id: emp.employee_id,
    name: emp.name,
    role: emp.role,
    team: emp.team,
    hourly_rate: emp.hourly_rate,
    hours_worked: emp.hours_worked,
    output_score: emp.output_score,
    efficiency: (emp.efficiency || 0).toFixed(2),
    cost_efficiency: (emp.cost_efficiency || 0).toFixed(2),
    status: emp.status || 'Normal',
  }));

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `roster_analysis_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadPDFReport(data: ProcessedData) {
  const summary = generateExecutiveSummary(data);
  
  // Create HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #000;
            padding: 20px;
            background: #fff;
          }
          h1 { color: #00f0ff; }
          h2 { color: #333; margin-top: 20px; }
          .section { margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Executive Workforce Report</h1>
        <p>Generated: ${new Date().toLocaleDateString()}</p>
        
        <div class="section">
          <h2>Company Health</h2>
          <p>${summary.companyHealth}</p>
        </div>
        
        <div class="section">
          <h2>Top 3 Best Employees</h2>
          <table>
            <tr><th>Name</th><th>Team</th><th>Efficiency</th></tr>
            ${summary.topEmployees.map(emp => `
              <tr>
                <td>${emp.name}</td>
                <td>${emp.team}</td>
                <td>${(emp.efficiency || 0).toFixed(2)}</td>
              </tr>
            `).join('')}
          </table>
        </div>
        
        <div class="section">
          <h2>Top 3 Cost Drains</h2>
          <table>
            <tr><th>Name</th><th>Team</th><th>Cost</th><th>Output</th></tr>
            ${summary.costDrains.map(emp => `
              <tr>
                <td>${emp.name}</td>
                <td>${emp.team}</td>
                <td>$${(emp.hourly_rate * emp.hours_worked).toFixed(0)}</td>
                <td>${emp.output_score}</td>
              </tr>
            `).join('')}
          </table>
        </div>
        
        <div class="section">
          <h2>Most Inefficient Team</h2>
          <p>${summary.mostInefficientTeam}</p>
        </div>
        
        <div class="section">
          <h2>Suggested Headcount Change</h2>
          <p>${summary.suggestedHeadcountChange}</p>
        </div>
        
        <div class="section">
          <h2>Key Metrics</h2>
          <table>
            <tr><th>Metric</th><th>Value</th></tr>
            <tr><td>Total Cost</td><td>$${data.totalCost.toFixed(0)}</td></tr>
            <tr><td>Total Output</td><td>${data.totalOutput.toFixed(0)}</td></tr>
            <tr><td>Average Efficiency</td><td>${data.avgEfficiency.toFixed(2)}</td></tr>
            <tr><td>Total Employees</td><td>${data.employees.length}</td></tr>
          </table>
        </div>
      </body>
    </html>
  `;

  // Open in new window and print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  }
}
