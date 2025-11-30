// WEEKLY PATTERNS - REDESIGNED
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/soloist/_components/WeeklyPatterns.tsx

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface WeeklyPatternsProps {
  data: {
    date: string;
    day: string;
    emotionScore: number | null;
    isFuture: boolean;
  }[];
}

export default function WeeklyPatterns({ data }: WeeklyPatternsProps) {
  // Prepare data for chart
  const chartData = data.map(d => ({
    name: d.day,
    Actual: !d.isFuture ? d.emotionScore : null,
    Forecast: d.isFuture ? d.emotionScore : null,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%" minHeight={120}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#525252" opacity={0.3} />
        <XAxis
          dataKey="name"
          tick={{ fill: '#a3a3a3', fontSize: 10 }}
          axisLine={{ stroke: '#525252' }}
          tickLine={{ stroke: '#525252' }}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: '#a3a3a3', fontSize: 10 }}
          axisLine={{ stroke: '#525252' }}
          tickLine={{ stroke: '#525252' }}
          width={30}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#262626',
            border: '1px solid #404040',
            borderRadius: 0,
            fontSize: 11,
            padding: '4px 8px'
          }}
          labelStyle={{ color: '#e5e5e5' }}
        />
        <Legend
          wrapperStyle={{ fontSize: 10, paddingTop: 4 }}
          iconSize={8}
        />
        <Line
          type="monotone"
          dataKey="Actual"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ r: 3, fill: '#6366f1' }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="Forecast"
          stroke="#f59e0b"
          strokeWidth={2}
          strokeDasharray="4 2"
          dot={{ r: 3, fill: '#f59e0b' }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

