'use client';

import { ProcessedData } from '@/lib/types';

interface KPICardsProps {
  data: ProcessedData;
}

export default function KPICards({ data }: KPICardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 2) => {
    return value.toFixed(decimals);
  };

  const cards = [
    {
      title: 'Total Cost',
      value: formatCurrency(data.totalCost),
      gradient: 'from-blue-600 to-cyan-500',
      iconColor: 'text-cyan-400',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Total Output',
      value: formatNumber(data.totalOutput),
      gradient: 'from-purple-600 to-pink-500',
      iconColor: 'text-pink-400',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      title: 'Avg Efficiency',
      value: formatNumber(data.avgEfficiency),
      gradient: 'from-green-600 to-emerald-500',
      iconColor: 'text-emerald-400',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-xl bg-slate-900/70 backdrop-blur-sm border border-slate-700 p-6 hover:border-slate-600 transition-all duration-300"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-10`} />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className={card.iconColor}>
                {card.icon}
              </div>
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">{card.title}</h3>
            <p className="text-3xl font-bold text-white">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

