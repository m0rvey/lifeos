import { useState, useMemo, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { type Transaction } from '../../types';
import { Plus, Wallet, TrendingUp, TrendingDown, Edit2, Trash2, Search } from 'lucide-react';
import { StatCard, DataTable, EmptyState, ConfirmDialog } from '../../ui';
import { formatDate, formatCurrency, uid, nowISO, todayISO } from '../../cognitive/helpers';
import BalanceChart from './BalanceChart';
import ReminderList from './ReminderList';
import TransactionModal from './TransactionModal';

export default function CapitalPage() {
  const { data, dispatch } = useData();
  const { addToast } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [txToDelete, setTxToDelete] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');

  const categories = useMemo(() => {
    const cats = new Set(data.transactions.map((t) => t.category));
    return ['Все', ...Array.from(cats)];
  }, [data.transactions]);

  // Financial calculations
  const totalIncome = useMemo(() => {
    return data.transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [data.transactions]);

  const totalExpenses = useMemo(() => {
    return data.transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [data.transactions]);

  const balance = useMemo(() => {
    return totalIncome - totalExpenses;
  }, [totalIncome, totalExpenses]);

  const filteredTransactions = useMemo(() => {
    return data.transactions.filter((t) => {
      const matchesSearch = 
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'Все' || t.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [data.transactions, searchQuery, selectedCategory]);

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort(
      (a, b) => b.dateISO.localeCompare(a.dateISO)
    );
  }, [filteredTransactions]);

  const handleAddNewClick = () => {
    setEditingTx(null);
    setShowForm(true);
  };

  const handleEditClick = (tx: Transaction) => {
    setEditingTx(tx);
    setShowForm(true);
  };

  const handleSaveTransaction = useCallback((txData: Partial<Transaction>) => {
    if (editingTx) {
      dispatch({
        type: 'UPDATE_ENTITY',
        entity: 'transactions',
        id: editingTx.id,
        payload: { ...txData, updatedAt: nowISO() }
      });
      addToast('Транзакция успешно обновлена', 'success');
    } else {
      const newTx: Transaction = {
        id: `tx_${uid()}`,
        type: txData.type || 'expense',
        amount: txData.amount !== undefined && txData.amount > 0 ? txData.amount : 1,
        category: txData.category || '',
        description: txData.description || '',
        dateISO: txData.dateISO || todayISO(),
        createdAt: nowISO(),
        updatedAt: nowISO()
      };
      dispatch({
        type: 'ADD_ENTITY',
        entity: 'transactions',
        payload: newTx
      });
      addToast('Транзакция добавлена на баланс', 'success');
    }
    setShowForm(false);
  }, [editingTx, dispatch, addToast]);

  const handleDelete = useCallback((id: string) => {
    dispatch({
      type: 'DELETE_ENTITY',
      entity: 'transactions',
      id
    });
    addToast('Транзакция удалена с баланса', 'warning');
  }, [dispatch, addToast]);

  const handleConfirmDelete = useCallback(() => {
    if (txToDelete) {
      handleDelete(txToDelete);
      setTxToDelete(null);
    }
  }, [txToDelete, handleDelete]);

  return (
    <div className="fade-in-entry flex-col-24">
      {/* Page Header */}
      <div className="flex-row-between">
        <div>
          <h1 className="text-xl-scale text-bold no-margin">
            Капитал & Бюджет
          </h1>
          <span className="text-sm-scale text-secondary">
            Мониторинг денежных потоков и планирование платежей
          </span>
        </div>
        <button className="btn btn--primary flex-row-center-gap6" onClick={handleAddNewClick}>
          <Plus size={16} />
          <span>Добавить операцию</span>
        </button>
      </div>

      {/* Stat Cards Overview */}
      <div className="grid-cols-stats">
        <StatCard 
          label="Общий баланс" 
          value={formatCurrency(balance)} 
          icon={<Wallet size={20} />} 
          accent 
        />
        <StatCard 
          label="Всего доходов" 
          value={formatCurrency(totalIncome)} 
          icon={<TrendingUp size={20} />} 
          trend="up" 
        />
        <StatCard 
          label="Всего расходов" 
          value={formatCurrency(totalExpenses)} 
          icon={<TrendingDown size={20} />} 
          trend="down" 
        />
      </div>

      {/* Main Workspace Layout Split */}
      <div className="flex-layout-split">
        {/* Left Side (Charts & Lists) */}
        <div className="flex-layout-left">
          {/* SVG Dynamics Line Chart */}
          <BalanceChart transactions={data.transactions} />

          {/* Transactions DataTable */}
          <div className="glass-panel padding-16-flex-col-12">
            <span className="section-title">
              Журнал операций
            </span>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '12px', alignItems: 'center' }}>
              <div className="glass-panel" style={{ flex: 2, display: 'flex', alignItems: 'center', padding: '0 12px', height: '40px', minWidth: '200px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                <Search size={16} style={{ color: 'var(--text-secondary)', marginRight: '8px' }} />
                <input
                  type="text"
                  placeholder="Искать по описанию или категории..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'inherit',
                    outline: 'none',
                    width: '100%',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Категория:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ height: '40px', padding: '0 12px', fontSize: '0.85rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {sortedTransactions.length > 0 ? (
              <DataTable
                columns={[
                  { key: 'dateISO', label: 'Дата', render: (v) => formatDate(v as string) },
                  { key: 'category', label: 'Категория' },
                  { key: 'amount', label: 'Сумма', render: (v, row) => (
                    <span className={row.type === 'income' ? 'text-semibold text-success' : 'text-semibold text-error'}>
                      {row.type === 'income' ? '+' : '-'}{formatCurrency(v as number)}
                    </span>
                  )},
                  { key: 'description', label: 'Описание' },
                  { key: 'id', label: 'Действия', render: (_, row) => (
                    <div className="action-btn-row">
                      <button 
                        className="btn btn--secondary btn-padding-4-6" 
                        onClick={() => handleEditClick(row as Transaction)}
                        aria-label="Редактировать операцию"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button 
                        className="btn btn--secondary btn-padding-4-6-red" 
                        onClick={() => setTxToDelete((row as Transaction).id)}
                        aria-label="Удалить операцию"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )},
                ]}
                data={sortedTransactions}
                emptyMessage="Транзакций пока нет."
              />
            ) : (
              <EmptyState 
                icon={<Wallet size={48} />}
                title="История операций пуста"
                description="Начните добавлять доходы и расходы, чтобы увидеть аналитику капитала."
                action={
                  <button className="btn btn--primary flex-row-center-gap6" onClick={handleAddNewClick}>
                    <Plus size={16} />
                    <span>Добавить транзакцию</span>
                  </button>
                }
              />
            )}
          </div>
        </div>

        {/* Right Side (Reminders Sidebar) */}
        <div className="flex-layout-right">
          <ReminderList />
        </div>
      </div>

        {showForm && (
          <TransactionModal
            isOpen={showForm}
            transaction={editingTx}
            onClose={() => setShowForm(false)}
            onSave={handleSaveTransaction}
          />
        )}

        {txToDelete !== null && (
          <ConfirmDialog
            isOpen={txToDelete !== null}
            onConfirm={handleConfirmDelete}
            onCancel={() => setTxToDelete(null)}
            title="Удалить операцию?"
            message="Вы действительно хотите удалить эту финансовую транзакцию? Это действие необратимо."
            variant="danger"
          />
        )}
    </div>
  );
}
