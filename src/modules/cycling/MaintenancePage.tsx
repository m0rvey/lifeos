import { useState, useMemo, useCallback } from 'react';
import { type MaintenanceRecord } from '../../types';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { Plus, Wrench, AlertTriangle, CheckCircle, Trash2, Edit2 } from 'lucide-react';
import { StatCard, DataTable, EmptyState, ConfirmDialog } from '../../ui';
import { formatDate, formatCurrency, uid, nowISO } from '../../cognitive/helpers';
import { useI18n } from '../../i18n';
import MaintenanceModal from './MaintenanceModal';

export default function MaintenancePage() {
  const { t } = useI18n();
  const { data, dispatch } = useData();
  const { addToast } = useApp();
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  const typeLabels: Record<string, string> = {
    inspection: t('cycling.maintenance.type.inspection'),
    cleaning: t('cycling.maintenance.type.cleaning'),
    service: t('cycling.maintenance.type.service'),
    repair: t('cycling.maintenance.type.repair'),
    replace: t('cycling.maintenance.type.replace'),
    upgrade: t('cycling.maintenance.type.upgrade'),
  };

  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);

  const totalCost = useMemo(() => {
    return data.maintenance.filter((m) => m.isDone).reduce((acc, m) => acc + m.cost, 0);
  }, [data.maintenance]);

  const activeAlerts = useMemo(() => {
    return data.maintenance.filter((m) => !m.isDone).length;
  }, [data.maintenance]);

  const handleAddNew = () => {
    setEditingRecord(null);
    setIsOpen(true);
  };

  const handleEdit = (record: MaintenanceRecord) => {
    setEditingRecord(record);
    setIsOpen(true);
  };

  const handleSaveRecord = useCallback(
    (recordData: Partial<MaintenanceRecord>) => {
      if (editingRecord) {
        dispatch({
          type: 'UPDATE_ENTITY',
          entity: 'maintenance',
          id: editingRecord.id,
          payload: { ...recordData, updatedAt: nowISO() },
        });
        addToast(t('cycling.maintenance.toastUpdated'), 'success');
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
          updatedAt: nowISO(),
        };
        dispatch({
          type: 'ADD_ENTITY',
          entity: 'maintenance',
          payload: newRecord,
        });
        addToast(t('cycling.maintenance.toastCreated'), 'success');
      }
      setIsOpen(false);
    },
    [editingRecord, dispatch, addToast, t]
  );

  const handleDelete = useCallback(
    (id: string) => {
      dispatch({
        type: 'DELETE_ENTITY',
        entity: 'maintenance',
        id,
      });
      addToast(t('cycling.maintenance.toastDeleted'), 'warning');
    },
    [dispatch, addToast, t]
  );

  const handleConfirmDelete = useCallback(() => {
    if (recordToDelete) {
      handleDelete(recordToDelete);
      setRecordToDelete(null);
    }
  }, [recordToDelete, handleDelete]);

  const handleToggleDone = useCallback(
    (record: MaintenanceRecord) => {
      dispatch({
        type: 'UPDATE_ENTITY',
        entity: 'maintenance',
        id: record.id,
        payload: { isDone: !record.isDone, updatedAt: nowISO() },
      });
      addToast(
        record.isDone
          ? t('cycling.maintenance.toastMarkedPlanned')
          : t('cycling.maintenance.toastMarkedDone'),
        'success'
      );
    },
    [dispatch, addToast, t]
  );

  return (
    <div className="flex-col-24 fade-in-entry">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2
            style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}
          >
            {t('cycling.maintenance.title')}
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            {t('cycling.maintenance.subtitle')}
          </p>
        </div>
        <button
          className="btn btn--primary"
          onClick={handleAddNew}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} />
          <span>{t('cycling.maintenance.addRecord')}</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <StatCard
          label={t('cycling.maintenance.totalInvested')}
          value={formatCurrency(totalCost)}
          subtitle={t('cycling.maintenance.totalInvestedSub')}
          icon={<Wrench size={20} />}
          accent
        />
        <StatCard
          label={t('cycling.maintenance.activeAlerts')}
          value={activeAlerts}
          subtitle={t('cycling.maintenance.activeAlertsSub')}
          icon={<AlertTriangle size={20} />}
          trend={activeAlerts > 0 ? 'down' : 'neutral'}
        />
      </div>

      {/* Roster Area */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        {data.maintenance.length > 0 ? (
          <DataTable
            columns={[
              {
                key: 'bikePart',
                label: t('cycling.maintenance.colPart'),
                render: (v) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Wrench size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600 }}>{v as string}</span>
                  </div>
                ),
              },
              {
                key: 'type',
                label: t('cycling.maintenance.colType'),
                render: (v) => typeLabels[v as keyof typeof typeLabels] || (v as string),
              },
              {
                key: 'cost',
                label: t('cycling.maintenance.colCost'),
                render: (v) => formatCurrency(v as number),
              },
              {
                key: 'dateISO',
                label: t('cycling.maintenance.colDate'),
                render: (v) => formatDate(v as string),
              },
              {
                key: 'isDone',
                label: t('cycling.maintenance.colStatus'),
                render: (_, row) => {
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
                        color: record.isDone
                          ? 'var(--success, #16a34a)'
                          : 'var(--warning, #f59e0b)',
                      }}
                    >
                      {record.isDone ? (
                        <>
                          <CheckCircle size={14} />
                          <span>{t('cycling.maintenance.done')}</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={14} />
                          <span>{t('cycling.maintenance.inPlan')}</span>
                        </>
                      )}
                    </button>
                  );
                },
              },
              { key: 'description', label: t('cycling.maintenance.colNote') },
              {
                key: 'id',
                label: t('cycling.maintenance.colActions'),
                render: (_, row) => (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn btn--secondary"
                      style={{ padding: '4px 6px' }}
                      onClick={() => handleEdit(row as MaintenanceRecord)}
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      className="btn btn--secondary btn-padding-4-6-red"
                      onClick={() => setRecordToDelete((row as MaintenanceRecord).id)}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ),
              },
            ]}
            data={data.maintenance}
            emptyMessage={t('cycling.maintenance.emptyMessage')}
          />
        ) : (
          <EmptyState
            icon={<Wrench size={48} />}
            title={t('cycling.maintenance.emptyTitle')}
            description={t('cycling.maintenance.emptyDescription')}
            action={
              <button className="btn btn--primary" onClick={handleAddNew}>
                <Plus size={14} />
                <span>{t('cycling.maintenance.addRecord')}</span>
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
          title={t('cycling.maintenance.deleteConfirmTitle')}
          message={t('cycling.maintenance.deleteConfirmMessage')}
          variant="danger"
        />
      )}
    </div>
  );
}
