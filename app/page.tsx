'use client';

import { useState } from 'react';
import ParticleBackground from '@/components/ParticleBackground';
import CSVUpload from '@/components/CSVUpload';
import KPICards from '@/components/KPICards';
import EmployeeTable from '@/components/EmployeeTable';
import TeamChart from '@/components/TeamChart';
import RecommendationsPanel from '@/components/RecommendationsPanel';
import { ProcessedData } from '@/lib/types';

export default function Home() {
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);

  const handleDataProcessed = (data: ProcessedData) => {
    setProcessedData(data);
  };

  return (
    <main className="min-h-screen relative">
      <ParticleBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Roster
          </h1>
          <p className="text-xl text-slate-400 font-garamond">
            Workforce Optimization Dashboard
          </p>
        </div>

        {/* CSV Upload Section */}
        <div className="mb-12">
          <CSVUpload onDataProcessed={handleDataProcessed} />
        </div>

        {/* Dashboard Content */}
        {processedData && (
          <div className="space-y-8 animate-fadeIn">
            {/* KPI Cards */}
            <KPICards data={processedData} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Employee Table - Takes 2 columns */}
              <div className="lg:col-span-2">
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold text-white">Employees</h2>
                  <p className="text-slate-400 mt-1">
                    {processedData.employees.length} employees analyzed
                  </p>
                </div>
                <EmployeeTable employees={processedData.employees} />
              </div>

              {/* Recommendations Panel - Takes 1 column */}
              <div className="lg:col-span-1">
                <RecommendationsPanel recommendations={processedData.recommendations} />
              </div>
            </div>

            {/* Team Chart */}
            <div>
              <TeamChart teamMetrics={processedData.teamMetrics} />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!processedData && (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="mb-6 opacity-50">
                <svg
                  className="w-24 h-24 mx-auto text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-slate-400 mb-2">
                Upload Your CSV to Get Started
              </h2>
              <p className="text-slate-500">
                Analyze your workforce data and receive actionable insights
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

