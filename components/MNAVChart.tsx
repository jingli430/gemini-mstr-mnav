
import React from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  Line
} from 'recharts';
import { MSTRDataPoint } from '../types';

interface Props {
  data: MSTRDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Safely extract the data point from the first payload item
    const data = payload[0].payload as MSTRDataPoint;
    return (
      <div className="bg-[#1c2128] border border-gray-700 p-3 rounded-lg shadow-xl text-sm">
        <p className="text-gray-400 mb-1 font-medium">{label}</p>
        <p className="text-blue-400 font-bold">MNAV 倍数: {data.mnavRatio.toFixed(2)}x</p>
        <p className="text-emerald-400 font-medium">溢价率: {data.premium.toFixed(2)}%</p>
        <div className="mt-2 pt-2 border-t border-gray-700 space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">MSTR:</span>
            <span className="text-gray-300">${data.mstrPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">BTC:</span>
            <span className="text-gray-300">${data.btcPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const MNAVChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorMnav" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2d333b" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#8b949e', fontSize: 11 }}
            minTickGap={40}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#8b949e', fontSize: 11 }}
            domain={['auto', 'auto']}
            orientation="right"
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area 
            type="monotone" 
            dataKey="mnavRatio" 
            stroke="#3b82f6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorMnav)" 
            name="MNAV Ratio"
            animationDuration={1000}
          />
          {/* Include Line for the tooltip to find the data, even if it's visually hidden or just used for context */}
          <Line 
            type="monotone" 
            dataKey="premium" 
            stroke="transparent" 
            dot={false}
            activeDot={false}
            name="Premium %"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
