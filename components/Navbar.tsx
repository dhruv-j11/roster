'use client';

import { ProcessedData } from '@/lib/types';

interface NavbarProps {
  hasData: boolean;
}

export default function Navbar({ hasData }: NavbarProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!hasData) {
    return (
      <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00f0ff] via-[#00a0ff] to-[#00f0ff] bg-clip-text text-transparent">
              Roster
            </h1>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00f0ff] via-[#00a0ff] to-[#00f0ff] bg-clip-text text-transparent">
            Roster
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => scrollToSection('rankings')}
              className="px-4 py-2 text-sm text-gray-300 hover:text-[#00f0ff] transition-colors"
            >
              Rankings
            </button>
            <button
              onClick={() => scrollToSection('employees')}
              className="px-4 py-2 text-sm text-gray-300 hover:text-[#00f0ff] transition-colors"
            >
              Employees
            </button>
            <button
              onClick={() => scrollToSection('team-chart')}
              className="px-4 py-2 text-sm text-gray-300 hover:text-[#00f0ff] transition-colors"
            >
              Team Chart
            </button>
            <button
              onClick={() => scrollToSection('scenario-simulator')}
              className="px-4 py-2 text-sm text-gray-300 hover:text-[#00f0ff] transition-colors"
            >
              Simulator
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
