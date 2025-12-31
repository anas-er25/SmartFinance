import React from 'react';
import { LucideIcon } from 'lucide-react';
import { CURRENCIES, CurrencyCode } from '../types';

interface StatsCardProps {
  title: string;
  amount: number;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  currency: CurrencyCode;
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, amount, icon: Icon, colorClass, bgClass, currency }) => {
  const currencyConfig = CURRENCIES[currency];
  
  const formattedAmount = amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const displayAmount = currencyConfig.position === 'prefix' 
    ? `${currencyConfig.symbol}${formattedAmount}` 
    : `${formattedAmount} ${currencyConfig.symbol}`;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow duration-300">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className={`text-2xl font-bold ${colorClass}`}>
          {displayAmount}
        </h3>
      </div>
      <div className={`p-3 rounded-full ${bgClass}`}>
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
    </div>
  );
};
