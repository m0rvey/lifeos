import { useState, useMemo, useCallback } from 'react';
import { type MaintenanceRecord } from '../../types';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { Plus, Wrench, AlertTriangle, CheckCircle, Trash2, Edit2 } from 'lucide-react';
import { StatCard, DataTable, EmptyState, ConfirmDialog } from '../../ui';
import { formatDate, formatCurrency, uid, nowISO } from '../../cognitive/helpers';
import MaintenanceModal from './MaintenanceModal';

const typeLabels = {
  inspection: 'Осмотр / Диагностика',
  cleaning: 'Чистка / Смазка',
  service: 'Настройка / Сервис',
  repair: 'Ремонт поломки',
  replace: 'Замена детали',
  upgrade: 'Апгрейд'
};

export default function MaintenancePage() {
  const { data, dispatch } = useData();
  const { addToast } = useApp();
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);

  const totalCost = useMemo(() => {
    return data.maintenance
      .filter(m => m.isDone)
      .reduce((acc, m) => acc + m.cost, 0);
  }, [data.maintenance]);

  const activeAlerts = useMemo(() => {
    return data.maintenance.filter(m => !m.isDone).length;
  }, [data.maintenance]);

  const handleAddNew = () => {
    setEditingRecord(null);
    setIsOpen(true);
  };

  const handleEdit = (record: MaintenanceRecord) => {
    setEditingRecord(record);
    setIsOpen(true);
  };

  const handleSaveRecord = useCallback((recordData: Partial<MaintenanceRecord>) => {
    if (editingRecord) {
      dispatch({
        type: 'UPDATE_ENTITY',
        entity: 'maintenance',
        id: editingRecord.id,
        payload: { ...recordData, updatedAt: nowISO() }
      });
      addToast('Запись ТО успешно обновлена', 'success');
    } else {
      const newRecord: MaintenanceRecord = {
        id: `maint_${uid()}`,
        bikePart: recordData.bikePart || '',
        type: recordData.type || 'service',
        description: recordData.description || '',
        cost: recordData.cost || 0,
        dateISO: recordData.dateISO || new Date().toISOString(),
        isDone: recordData.isDone || false,
        createdAt: nowISO(),
        updatedAt: nowISO()
      };
      dispatch({
        type: 'ADD_ENTITY',
        entity: 'maintenance',
        payload: newRecord
      });
      addToast('Добавлена новая запись обслуживания велосипеда', 'success');
    }
    setIsOpen(false);
  }, [editingRecord, dispatch, addToast]);

  const handleDelete = useCallback((id: string) => {
    dispatch({
      type: 'DELETE_ENTITY',
      entity: 'maintenance',
      id
    });
    addToast('Запись о ТО удалена', 'warning');
  }, [dispatch, addToast]);

  const handleConfirmDelete = useCallback(() => {
    if (recordToDelete) {
      handleDelete(recordToDelete);
      setRecordToDelete(null);
    }
  }, [recordToDelete, handleDelete]);

  const handleToggleDone = useCallback((record: MaintenanceRecord) => {
    dispatch({
      type: 'UPDATE_ENTITY',
      entity: 'maintenance',
      id: record.id,
      payload: { isDone: !record.isDone, updatedAt: nowISO() }
    });
    addToast(record.isDone ? 'Работы отмечены как запланированные' : 'Обслуживание отмечено как выполненное', 'success');
  }, [dispatch, addToast]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="fade-in-entry">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Техническое обслуживание (ТО)
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Контроль износа деталей, учет расходов на ремонт и планирование сервисных регламентов велосипеда
          </p>
        </div>
        <button className="btn btn--primary" onClick={handleAddNew} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} />
          <span>Добавить запись ТО</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <StatCard
          label="Всего вложено в сервис"
          value={formatCurrency(totalCost)}
          subtitle="Сумма завершенных ремонтов и деталей"
          icon={<Wrench size={20} />}
          accent
        />
        <StatCard
          label="Активных предупреждений"
          value={activeAlerts}
          subtitle="Запланированные сервисные работы"
          icon={<AlertTriangle size={20} />}
          trend={activeAlerts > 0 ? 'down' : 'neutral'}
        />
      </div>

      {/* Roster Area */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        {data.maintenance.length > 0 ? (
          <DataTable
            columns={[
              { key: 'bikePart', label: 'Узел / Запчасть', render: (v) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wrench size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <span style={{ fontWeight: 600 }}>{v as string}</span>
                </div>
              )},
              { key: 'type', label: 'Вид работ', render: (v) => typeLabels[v as keyof typeof typeLabels] || v as string },
              { key: 'cost', label: 'Затраты', render: (v) => formatCurrency(v as number) },
              { key: 'dateISO', label: 'Дата проведения', render: (v) => formatDate(v as string) },
              { key: 'isDone', label: 'Статус', render: (v, row) => {
                const record = row as MaintenanceRecord;
                return (
                  <button 
                    onClick={() => handleToggleDone(record)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.8rem',
                      color: record.isDone ? 'var(--success, #16a34a)' : 'var(--warning, #f59e0b)'
                    }}
                  >
                    {record.isDone ? (
                      <>
                        <CheckCircle size={14} />
                        <span>Выполнено</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={14} />
                        <span>В планах</span>
                      </>
                    )}
                  </button>
                );
              }},
              { key: 'description', label: 'Примечание' },
              { key: 'id', label: 'Действия', render: (_, row) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn--secondary" style={{ padding: '4px 6px' }} onClick={() => handleEdit(row as MaintenanceRecord)}>
                    <Edit2 size={12} />
                  </button>
                  <button className="btn btn--secondary" style={{ padding: '4px 6px', color: 'var(--error, #ef4444)' }} onClick={() => setRecordToDelete((row as MaintenanceRecord).id)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            ]}
            data={data.maintenance}
            emptyMessage="Записей о ТО велосипеда не найдено."
          />
        ) : (
          <EmptyState
            icon={<Wrench size={48} />}
            title="История обслуживания пуста"
            description="Запишите информацию о замене цепи, обслуживании вилки или чистке трансмиссии велосипеда."
            action={
              <button className="btn btn--primary" onClick={handleAddNew}>
                <Plus size={14} />
                <span>Добавить запись ТО</span>
              </button>
            }
          />
        )}
      </div>

        {isOpen && (
          <MaintenanceModal
            isOpen={isOpen}
            record={editingRecord}
            onClose={() => setIsOpen(false)}
            onSave={handleSaveRecord}
          />
        )}

        {recordToDelete !== null && (
          <ConfirmDialog
            isOpen={recordToDelete !== null}
            onConfirm={handleConfirmDelete}
            onCancel={() => setRecordToDelete(null)}
            title="Удалить запись ТО?"
            message="Вы действительно хотите удалить эту запись о техническом обслуживании? Это действие необратимо."
            variant="danger"
          />
        )}
    </div>
  );
}
