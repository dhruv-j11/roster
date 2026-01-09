'use client';

import { useState } from 'react';
import ParticleBackground from '@/components/ParticleBackground';
import CSVUpload from '@/components/CSVUpload';
import KPICards from '@/components/KPICards';
import EmployeeTable from '@/components/EmployeeTable';
import TeamChart from '@/components/TeamChart';
import RecommendationsPanel from '@/components/RecommendationsPanel';
import ExecutiveSummaryModal from '@/components/ExecutiveSummaryModal';
import ScenarioSimulator from '@/components/ScenarioSimulator';
import SmartRanking from '@/components/SmartRanking';
import Navbar from '@/components/Navbar';
import ScrollNavigation from '@/components/ScrollNavigation';
import { downloadCSV, downloadPDFReport } from '@/lib/exportUtils';
import { ProcessedData } from '@/lib/types';

export default function Home() {
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [isExecutiveModalOpen, setIsExecutiveModalOpen] = useState(false);

  const handleDataProcessed = (data: ProcessedData) => {
    setProcessedData(data);
  };

  const sections = processedData
    ? [
        { id: 'kpis', label: 'KPIs' },
        { id: 'rankings', label: 'Rankings' },
        { id: 'employees', label: 'Employees' },
        { id: 'team-chart', label: 'Team Chart' },
        { id: 'scenario-simulator', label: 'Simulator' },
      ]
    : [];

  return (
    <main className="min-h-screen relative">
      <ParticleBackground />
      <Navbar hasData={!!processedData} />
      {processedData && <ScrollNavigation sections={sections} />}
      
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        {!processedData && (
          <div className="mb-12 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-[#00f0ff] via-[#00a0ff] to-[#00f0ff] bg-clip-text text-transparent">
              Roster
            </h1>
            <p className="text-xl text-gray-400 font-garamond">
              Workforce Optimization Dashboard
            </p>
          </div>
        )}

        {/* CSV Upload Section */}
        <div className="mb-12">
          <CSVUpload onDataProcessed={handleDataProcessed} />
        </div>

        {/* Dashboard Content */}
        {processedData && (
          <div className="space-y-8 animate-fadeIn">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => setIsExecutiveModalOpen(true)}
                className="px-6 py-3 bg-[#00f0ff]/20 border-2 border-[#00f0ff] text-[#00f0ff] font-semibold rounded-lg hover:bg-[#00f0ff]/30 hover-lift transition-all"
              >
                Generate Executive Report
              </button>
              <button
                onClick={() => downloadPDFReport(processedData)}
                className="px-6 py-3 bg-gray-800 border-2 border-gray-700 text-white font-semibold rounded-lg hover:border-[#00f0ff] hover-lift transition-all"
              >
                Download PDF Report
              </button>
              <button
                onClick={() => downloadCSV(processedData)}
                className="px-6 py-3 bg-gray-800 border-2 border-gray-700 text-white font-semibold rounded-lg hover:border-[#00f0ff] hover-lift transition-all"
              >
                Download Analyzed CSV
              </button>
            </div>

            {/* KPI Cards */}
            <div id="kpis">
              <KPICards data={processedData} />
            </div>

            {/* Smart Ranking */}
            <SmartRanking employees={processedData.employees} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="employees">
              {/* Employee Table - Takes 2 columns */}
              <div className="lg:col-span-2">
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold text-white">Employees</h2>
                  <p className="text-gray-400 mt-1">
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
            <div id="team-chart">
              <TeamChart teamMetrics={processedData.teamMetrics} />
            </div>

            {/* [Beta] Scenario Simulator */}
            <div>
              <ScenarioSimulator originalData={processedData} />
            </div>
          </div>
        )}

        {/* Executive Summary Modal */}
        {processedData && (
          <ExecutiveSummaryModal
            data={processedData}
            isOpen={isExecutiveModalOpen}
            onClose={() => setIsExecutiveModalOpen(false)}
          />
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
              <h2 className="text-2xl font-semibold text-gray-400 mb-2">
                Upload Your CSV to Get Started
              </h2>
              <p className="text-gray-500">
                Analyze your workforce data and receive actionable insights
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

