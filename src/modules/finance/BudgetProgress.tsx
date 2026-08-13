import { useState, useMemo, useEffect } from 'react';
import { type Transaction } from '../../types';
import { useI18n } from '../../i18n';
import { formatCurrency } from '../../cognitive/helpers';
import { Target, Plus, Trash2, Edit2 } from 'lucide-react';
import { Modal, FormField } from '../../ui';

interface BudgetGoal {
  id: string;
  name: string;
  target: number;
  saved: number;
}

interface BudgetProgressProps {
  transactions: Transaction[];
}

const STORAGE_GOALS_KEY = 'lifeos_finance_goals';

export default function BudgetProgress({ transactions }: BudgetProgressProps) {
  const { t } = useI18n();

  // Load savings goals from local storage
  const [goals, setGoals] = useState<BudgetGoal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_GOALS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_GOALS_KEY, JSON.stringify(goals));
    } catch {
      // ignore
    }
  }, [goals]);

  // Goal Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<BudgetGoal | null>(null);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState<number | ''>('');
  const [goalSaved, setGoalSaved] = useState<number | ''>('');

  // Calculate current month's expense categories
  const currentMonthCategories = useMemo(() => {
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const catMap = new Map<string, number>();
    transactions
      .filter((tx) => tx.type === 'expense' && tx.dateISO.startsWith(currentMonthPrefix))
      .forEach((tx) => {
        const cat = tx.category || 'Other';
        catMap.set(cat, (catMap.get(cat) || 0) + tx.amount);
      });

    return Array.from(catMap.entries())
      .map(([category, amount]) => {
        // Estimated budget baseline for demonstration
        const budgetLimit = Math.max(10000, Math.ceil((amount * 1.25) / 1000) * 1000);
        const percent = Math.min(100, Math.round((amount / budgetLimit) * 100));
        const isOver = amount > budgetLimit;
        return { category, amount, budgetLimit, percent, isOver };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const handleOpenAddGoal = () => {
    setEditingGoal(null);
    setGoalName('');
    setGoalTarget('');
    setGoalSaved('');
    setIsModalOpen(true);
  };

  const handleOpenEditGoal = (g: BudgetGoal) => {
    setEditingGoal(g);
    setGoalName(g.name);
    setGoalTarget(g.target);
    setGoalSaved(g.saved);
    setIsModalOpen(true);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName.trim() || Number(goalTarget) <= 0) return;

    if (editingGoal) {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === editingGoal.id
            ? { ...g, name: goalName.trim(), target: Number(goalTarget), saved: Number(goalSaved) || 0 }
            : g
        )
      );
    } else {
      const newGoal: BudgetGoal = {
        id: `goal_${Date.now()}`,
        name: goalName.trim(),
        target: Number(goalTarget),
        saved: Number(goalSaved) || 0,
      };
      setGoals((prev) => [...prev, newGoal]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex-col-16">
      {/* Category Expenses & Budgets Widget */}
      {currentMonthCategories.length > 0 && (
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span className="section-title" style={{ margin: 0 }}>
              {t('finance.budget.title')}
            </span>
          </div>

          <div className="flex-col-12">
            {currentMonthCategories.slice(0, 4).map((item) => (
              <div key={item.category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.category}</span>
                  <span style={{ color: item.isOver ? 'var(--error)' : 'var(--text-secondary)' }}>
                    {formatCurrency(item.amount)}
                  </span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${item.percent}%`,
                      height: '100%',
                      background: item.percent > 90 ? 'var(--error)' : 'var(--primary)',
                      borderRadius: '3px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Savings Goals Widget */}
      <div className="glass-panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Target size={14} style={{ color: 'var(--accent)' }} />
            <span>{t('finance.budget.goals_title')}</span>
          </span>
          <button
            className="btn btn--secondary"
            style={{ padding: '3px 8px', fontSize: '0.75rem' }}
            onClick={handleOpenAddGoal}
          >
            <Plus size={12} style={{ marginRight: '4px' }} />
            <span>{t('action.add')}</span>
          </button>
        </div>

        <div className="flex-col-10">
          {goals.map((g) => {
            const pct = g.target > 0 ? Math.min(100, Math.round((g.saved / g.target) * 100)) : 0;
            return (
              <div
                key={g.id}
                style={{
                  padding: '10px 12px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{g.name}</strong>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      className="btn btn--secondary"
                      style={{ padding: '2px 4px' }}
                      onClick={() => handleOpenEditGoal(g)}
                    >
                      <Edit2 size={10} />
                    </button>
                    <button
                      className="btn btn--secondary btn-padding-4-6-red"
                      style={{ padding: '2px 4px' }}
                      onClick={() => handleDeleteGoal(g.id)}
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  <span>{formatCurrency(g.saved)}</span>
                  <span>{formatCurrency(g.target)} ({pct}%)</span>
                </div>

                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: pct >= 100 ? 'var(--success)' : 'var(--accent)',
                      borderRadius: '3px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}

          {goals.length === 0 && (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textAlign: 'center', padding: '12px 0' }}>
              {t('finance.budget.no_goals')}
            </div>
          )}
        </div>
      </div>

      {/* Goal Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingGoal ? t('finance.budget.goals_title') : t('finance.budget.add_goal')}
          maxWidth="sm"
        >
          <form onSubmit={handleSaveGoal} className="flex-col-16">
            <FormField label={t('finance.budget.goal_name')} required>
              <input
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="e.g. New Gravel Bike"
                required
                style={{ width: '100%' }}
              />
            </FormField>

            <FormField label={t('finance.budget.goal_target')} required>
              <input
                type="number"
                min="1"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="100000"
                required
                style={{ width: '100%' }}
              />
            </FormField>

            <FormField label={t('finance.budget.goal_saved')}>
              <input
                type="number"
                min="0"
                value={goalSaved}
                onChange={(e) => setGoalSaved(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="25000"
                style={{ width: '100%' }}
              />
            </FormField>

            <div className="modal-form-footer">
              <button type="button" className="btn btn--secondary" onClick={() => setIsModalOpen(false)}>
                {t('action.cancel')}
              </button>
              <button type="submit" className="btn btn--primary">
                {t('action.save')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
