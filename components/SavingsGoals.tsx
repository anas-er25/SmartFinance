import React, { useState } from 'react';
import { SavingsGoal, Language, CurrencyCode, CURRENCIES, DICTIONARY } from '../types';
import { Plus, Trash2, Target, Trophy, PiggyBank, X } from 'lucide-react';
import { getIconByKey } from '../utils/icons';

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  onAddGoal: (goal: SavingsGoal) => void;
  onUpdateGoal: (goal: SavingsGoal, amountAdded: number) => void;
  onDeleteGoal: (id: string) => void;
  lang: Language;
  currency: CurrencyCode;
}

export const SavingsGoals: React.FC<SavingsGoalsProps> = ({ goals, onAddGoal, onUpdateGoal, onDeleteGoal, lang, currency }) => {
  const t = DICTIONARY[lang];
  const isRTL = lang === 'ar';
  const currencyConfig = CURRENCIES[currency];
  
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<SavingsGoal>>({ name: '', targetAmount: 0, currentAmount: 0, color: 'bg-indigo-500' });
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);

  const formatMoney = (amount: number) => {
    const val = amount >= 1000 ? `${(amount/1000).toFixed(1)}k` : Math.round(amount).toString();
    return currencyConfig.position === 'prefix' ? `${currencyConfig.symbol}${val}` : `${val}${currencyConfig.symbol}`;
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoal.name && newGoal.targetAmount) {
      onAddGoal({
        id: crypto.randomUUID(),
        name: newGoal.name,
        targetAmount: Number(newGoal.targetAmount),
        currentAmount: Number(newGoal.currentAmount || 0),
        color: newGoal.color || 'bg-indigo-500',
        icon: 'bank'
      });
      setIsAdding(false);
      setNewGoal({ name: '', targetAmount: 0, currentAmount: 0, color: 'bg-indigo-500' });
    }
  };

  const handleDeposit = (goal: SavingsGoal) => {
    if (!depositAmount || isNaN(Number(depositAmount))) return;
    const amount = Number(depositAmount);
    
    // Update goal
    const updated = { ...goal, currentAmount: goal.currentAmount + amount };
    onUpdateGoal(updated, amount);
    
    setDepositAmount('');
    setActiveGoalId(null);
  };

  return (
    <div className="mb-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            {t.savingsGoals}
        </h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
        >
           {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
           {isAdding ? t.cancel : t.addGoal}
        </button>
      </div>

      {isAdding && (
          <form onSubmit={handleCreateGoal} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                  <input 
                      type="text" 
                      placeholder={t.goalName}
                      value={newGoal.name}
                      onChange={e => setNewGoal({...newGoal, name: e.target.value})}
                      className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                      required
                  />
                  <input 
                      type="number" 
                      placeholder={t.targetAmount}
                      value={newGoal.targetAmount || ''}
                      onChange={e => setNewGoal({...newGoal, targetAmount: parseFloat(e.target.value)})}
                      className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                      required
                  />
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-slate-800">
                  {t.save}
              </button>
          </form>
      )}

      {goals.length === 0 && !isAdding ? (
          <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <p className="text-slate-400 text-sm">Set a goal to start saving!</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {goals.map(goal => {
                  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                  const isCompleted = progress >= 100;
                  
                  return (
                      <div key={goal.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative group overflow-hidden">
                          {isCompleted && (
                              <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10 flex items-center gap-1">
                                  <Trophy className="w-3 h-3" /> {t.congrats}
                              </div>
                          )}
                          
                          <div className="flex justify-between items-start mb-2 relative z-10">
                              <div className="flex items-center gap-2">
                                  <div className={`p-2 rounded-lg ${goal.color.replace('bg-', 'bg-opacity-10 text-').replace('500', '600')} bg-opacity-20`}>
                                      <PiggyBank className={`w-5 h-5 ${goal.color.replace('bg-', 'text-')}`} />
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-slate-800 text-sm">{goal.name}</h4>
                                      <p className="text-xs text-slate-400">{formatMoney(goal.currentAmount)} / {formatMoney(goal.targetAmount)}</p>
                                  </div>
                              </div>
                              <button onClick={() => onDeleteGoal(goal.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                              </button>
                          </div>

                          {/* Progress Bar */}
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
                              <div 
                                  className={`h-full ${isCompleted ? 'bg-green-500' : goal.color} transition-all duration-1000`}
                                  style={{ width: `${progress}%` }}
                              ></div>
                          </div>

                          {/* Actions */}
                          {activeGoalId === goal.id ? (
                             <div className="flex gap-2 animate-fade-in">
                                 <input 
                                    type="number"
                                    placeholder="Amount"
                                    autoFocus
                                    value={depositAmount}
                                    onChange={e => setDepositAmount(e.target.value)}
                                    className="w-full px-2 py-1 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                 />
                                 <button 
                                    onClick={() => handleDeposit(goal)}
                                    className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium hover:bg-green-600"
                                 >
                                    <Plus className="w-4 h-4" />
                                 </button>
                                 <button 
                                    onClick={() => setActiveGoalId(null)}
                                    className="bg-slate-200 text-slate-600 px-2 py-1 rounded text-xs hover:bg-slate-300"
                                 >
                                    <X className="w-4 h-4" />
                                 </button>
                             </div>
                          ) : (
                              <button 
                                onClick={() => setActiveGoalId(goal.id)}
                                className="w-full py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center justify-center gap-1"
                              >
                                  <Plus className="w-3 h-3" /> {t.deposit}
                              </button>
                          )}
                      </div>
                  );
              })}
          </div>
      )}
    </div>
  );
};