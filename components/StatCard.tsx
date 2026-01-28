
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, icon, color = 'blue' }) => {
  const colors: Record<string, string> = {
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400',
  };

  return (
    <div className="glass-card p-6 rounded-2xl flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <span className="text-gray-400 text-sm font-medium">{label}</span>
        {icon && <div className={`${colors[color]} opacity-80`}>{icon}</div>}
      </div>
      <div className={`text-2xl font-bold tracking-tight ${colors[color]}`}>
        {value}
      </div>
      {subValue && (
        <div className="text-xs text-gray-500 mt-1 font-medium">
          {subValue}
        </div>
      )}
    </div>
  );
};
