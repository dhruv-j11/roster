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
    <div className="rounded-xl bg-gray-900/70 backdrop-blur-sm border border-gray-800 p-6 hover-glow">
      <h2 className="text-xl font-semibold text-white mb-6">Team Performance</h2>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="team"
            stroke="#9ca3af"
            style={{ fontFamily: 'EB Garamond, serif' }}
          />
          <YAxis
            yAxisId="left"
            stroke="#9ca3af"
            style={{ fontFamily: 'EB Garamond, serif' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#9ca3af"
            style={{ fontFamily: 'EB Garamond, serif' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#f9fafb',
            }}
          />
          <Legend
            wrapperStyle={{ color: '#9ca3af', fontFamily: 'EB Garamond, serif' }}
          />
          <Bar
            yAxisId="left"
            dataKey="output"
            fill="#00f0ff"
            name="Total Output"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            yAxisId="left"
            dataKey="cost"
            fill="#00a0ff"
            name="Total Cost ($)"
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="efficiency"
            stroke="#00f0ff"
            strokeWidth={3}
            name="Avg Efficiency (%)"
            dot={{ fill: '#00f0ff', r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

