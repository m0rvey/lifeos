import { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { type Transaction } from '../../types';
import { Plus, Wallet, TrendingUp, TrendingDown, Edit2, Trash2, Search } from 'lucide-react';
import { StatCard, DataTable, EmptyState, ConfirmDialog } from '../../ui';
import { formatDate, formatCurrency, uid, nowISO, todayISO } from '../../cognitive/helpers';
import { useI18n } from '../../i18n';
import BalanceChart from './BalanceChart';
import ReminderList from './ReminderList';
import TransactionModal from './TransactionModal';

import { useCrudModal } from '../../hooks/useCrudModal';

export default function CapitalPage() {
  const { data } = useData();
  const { t } = useI18n();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const {
    isOpen: showForm,
    editingItem: editingTx,
    isDeleteOpen,
    openAdd: handleAddNewClick,
    openEdit: handleEditClick,
    openDelete: setTxToDelete,
    handleSave: handleSaveTransaction,
    confirmDelete: handleConfirmDelete,
    closeAll,
  } = useCrudModal<Transaction>({
    entity: 'transactions',
    toastKeys: {
      created: 'toast.transaction.added',
      updated: 'toast.transaction.updated',
      deleted: 'toast.transaction.deleted',
    },
    createDefaults: (txData) => ({
      id: `tx_${uid()}`,
      type: txData?.type || 'expense',
      amount: txData?.amount !== undefined && txData.amount > 0 ? txData.amount : 1,
      category: txData?.category || '',
      description: txData?.description || '',
      dateISO: txData?.dateISO || todayISO(),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    }),
  });

  const categories = useMemo(() => {
    const cats = new Set(data.transactions.map((t) => t.category));
    return ['ALL', ...Array.from(cats)];
  }, [data.transactions]);

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

      const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [data.transactions, searchQuery, selectedCategory]);

  const sortedTransactions = useMemo(() => {
    return [...filteredTransactions].sort((a, b) => b.dateISO.localeCompare(a.dateISO));
  }, [filteredTransactions]);

  return (
    <div className="fade-in-entry flex-col-24">
      {/* Page Header */}
      <div className="flex-row-between">
        <div>
          <h1 className="text-xl-scale text-bold no-margin">{t('finance.page.title')}</h1>
          <span className="text-sm-scale text-secondary">{t('finance.page.subtitle')}</span>
        </div>
        <button className="btn btn--primary flex-row-center-gap6" onClick={handleAddNewClick}>
          <Plus size={16} />
          <span>{t('finance.add.operation')}</span>
        </button>
      </div>

      {/* Stat Cards Overview */}
      <div className="grid-cols-stats">
        <StatCard
          label={t('finance.stat.totalBalance')}
          value={formatCurrency(balance)}
          icon={<Wallet size={20} />}
          accent
        />
        <StatCard
          label={t('finance.stat.totalIncome')}
          value={formatCurrency(totalIncome)}
          icon={<TrendingUp size={20} />}
          trend="up"
        />
        <StatCard
          label={t('finance.stat.totalExpenses')}
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
            <span className="section-title">{t('finance.journal')}</span>

            <div
              style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
                marginBottom: '12px',
                alignItems: 'center',
              }}
            >
              <div
                className="glass-panel"
                style={{
                  flex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 12px',
                  height: '40px',
                  minWidth: '200px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border)',
                }}
              >
                <Search size={16} style={{ color: 'var(--text-secondary)', marginRight: '8px' }} />
                <input
                  type="text"
                  placeholder={t('finance.search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'inherit',
                    outline: 'none',
                    width: '100%',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {t('finance.category.label')}
                </span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    height: '40px',
                    padding: '0 34px 0 12px',
                    fontSize: '0.85rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-sm)',
                    outline: 'none',
                  }}
                >
                  <option value="ALL">{t('filter.all')}</option>
                  {categories
                    .filter((cat) => cat !== 'ALL')
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {sortedTransactions.length > 0 ? (
              <DataTable
                columns={[
                  {
                    key: 'dateISO',
                    label: t('finance.column.date'),
                    render: (v) => formatDate(v as string),
                  },
                  { key: 'category', label: t('finance.column.category') },
                  {
                    key: 'amount',
                    label: t('finance.column.amount'),
                    render: (v, row) => (
                      <span
                        className="text-semibold"
                        style={{ color: row.type === 'income' ? 'var(--success)' : 'var(--error)' }}
                      >
                        {row.type === 'income' ? '+' : '-'}
                        {formatCurrency(v as number)}
                      </span>
                    ),
                  },
                  { key: 'description', label: t('finance.column.description') },
                  {
                    key: 'id',
                    label: t('finance.column.actions'),
                    render: (_, row) => (
                      <div className="action-btn-row">
                        <button
                          className="btn btn--secondary btn-padding-4-6"
                          onClick={() => handleEditClick(row as Transaction)}
                          aria-label={t('finance.action.editOperation')}
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          className="btn btn--secondary btn-padding-4-6-red"
                          onClick={() => setTxToDelete((row as Transaction).id)}
                          aria-label={t('finance.action.deleteOperation')}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ),
                  },
                ]}
                data={sortedTransactions}
                emptyMessage={t('finance.empty.transactions')}
              />
            ) : (
              <EmptyState
                icon={<Wallet size={48} />}
                title={t('finance.empty.history')}
                description={t('finance.empty.historyDescription')}
                action={
                  <button
                    className="btn btn--primary flex-row-center-gap6"
                    onClick={handleAddNewClick}
                  >
                    <Plus size={16} />
                    <span>{t('finance.add.transaction')}</span>
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
          onClose={closeAll}
          onSave={handleSaveTransaction}
        />
      )}

      {isDeleteOpen && (
        <ConfirmDialog
          isOpen={isDeleteOpen}
          onConfirm={handleConfirmDelete}
          onCancel={closeAll}
          title={t('finance.confirm.deleteTitle')}
          message={t('finance.confirm.deleteMessage')}
          variant="danger"
        />
      )}
    </div>
  );
}
