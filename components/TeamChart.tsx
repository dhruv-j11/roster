'use client';

import { TeamMetrics } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from 'recharts';

interface TeamChartProps {
  teamMetrics: TeamMetrics[];
}

export default function TeamChart({ teamMetrics }: TeamChartProps) {
  const data = teamMetrics.map((team) => ({
    team: team.team,
    output: Math.round(team.totalOutput),
    cost: Math.round(team.totalCost),
    efficiency: Number((team.avgEfficiency * 100).toFixed(1)),
  }));

  return (
    <div className="rounded-xl bg-slate-900/70 backdrop-blur-sm border border-slate-700 p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Team Performance</h2>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis
            dataKey="team"
            stroke="#94a3b8"
            style={{ fontFamily: 'EB Garamond, serif' }}
          />
          <YAxis
            yAxisId="left"
            stroke="#94a3b8"
            style={{ fontFamily: 'EB Garamond, serif' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#94a3b8"
            style={{ fontFamily: 'EB Garamond, serif' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#f1f5f9',
            }}
          />
          <Legend
            wrapperStyle={{ color: '#94a3b8', fontFamily: 'EB Garamond, serif' }}
          />
          <Bar
            yAxisId="left"
            dataKey="output"
            fill="#8b5cf6"
            name="Total Output"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            yAxisId="left"
            dataKey="cost"
            fill="#4a9eff"
            name="Total Cost ($)"
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="efficiency"
            stroke="#10b981"
            strokeWidth={3}
            name="Avg Efficiency (%)"
            dot={{ fill: '#10b981', r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

