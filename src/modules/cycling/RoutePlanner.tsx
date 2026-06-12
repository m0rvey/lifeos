import { useState, useCallback } from 'react';
import { type CycleRoute } from '../../types';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { Plus, Map, Trash2, Edit2, CheckCircle2, AlertCircle } from 'lucide-react';
import { DataTable, EmptyState, ConfirmDialog } from '../../ui';
import { uid, nowISO } from '../../cognitive/helpers';
import { useI18n } from '../../i18n';
import RouteModal from './RouteModal';

const diffColors = {
  easy: 'var(--success, #16a34a)',
  medium: 'var(--accent)',
  hard: 'var(--warning, #f59e0b)',
  extreme: 'var(--error, #ef4444)'
};

export default function RoutePlanner() {
  const { t } = useI18n();
  const { data, dispatch } = useData();
  const { addToast } = useApp();

  const diffLabels: Record<string, string> = {
    easy: t('cycling.routes.difficulty.easy'),
    medium: t('cycling.routes.difficulty.medium'),
    hard: t('cycling.routes.difficulty.hard'),
    extreme: t('cycling.routes.difficulty.extreme')
  };

  const [isOpen, setIsOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<CycleRoute | null>(null);
  const [routeToDelete, setRouteToDelete] = useState<string | null>(null);

  const handleAddNew = () => {
    setEditingRoute(null);
    setIsOpen(true);
  };

  const handleEdit = (route: CycleRoute) => {
    setEditingRoute(route);
    setIsOpen(true);
  };

  const handleSaveRoute = useCallback((routeData: Partial<CycleRoute>) => {
    if (editingRoute) {
      dispatch({
        type: 'UPDATE_ENTITY',
        entity: 'routes',
        id: editingRoute.id,
        payload: { ...routeData, updatedAt: nowISO() }
      });
      addToast(t('cycling.routes.toastUpdated'), 'success');
    } else {
      const newRoute: CycleRoute = {
        id: `route_${uid()}`,
        name: routeData.name || t('cycling.routes.defaultName'),
        distanceKm: routeData.distanceKm || 0,
        elevationGainM: routeData.elevationGainM || 0,
        difficulty: routeData.difficulty || 'medium',
        waypoints: routeData.waypoints || [],
        isCompleted: routeData.isCompleted || false,
        createdAt: nowISO(),
        updatedAt: nowISO()
      };
      dispatch({
        type: 'ADD_ENTITY',
        entity: 'routes',
        payload: newRoute
      });
      addToast(t('cycling.routes.toastCreated'), 'success');
    }
    setIsOpen(false);
  }, [editingRoute, dispatch, addToast, t]);

  const handleDelete = useCallback((id: string) => {
    dispatch({
      type: 'DELETE_ENTITY',
      entity: 'routes',
      id
    });
    addToast(t('cycling.routes.toastDeleted'), 'warning');
  }, [dispatch, addToast, t]);

  const handleConfirmDelete = useCallback(() => {
    if (routeToDelete) {
      handleDelete(routeToDelete);
      setRouteToDelete(null);
    }
  }, [routeToDelete, handleDelete]);

  return (
    <div className="flex-col-24 fade-in-entry">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {t('cycling.routes.title')}
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            {t('cycling.routes.subtitle')}
          </p>
        </div>
        <button className="btn btn--primary" onClick={handleAddNew} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} />
          <span>{t('cycling.routes.planRoute')}</span>
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '20px' }}>
        {data.routes.length > 0 ? (
          <DataTable
            columns={[
              { key: 'name', label: t('cycling.routes.colName'), render: (v) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Map size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <span style={{ fontWeight: 600 }}>{v as string}</span>
                </div>
              )},
              { key: 'distanceKm', label: t('cycling.routes.colDistance'), render: (v) => `${(v as number).toFixed(1)} ${t('cycling.common.km')}` },
              { key: 'elevationGainM', label: t('cycling.dashboard.elevationGain'), render: (v) => `${(v as number).toFixed(1)} ${t('cycling.common.m')}` },
              { key: 'difficulty', label: t('cycling.routes.colDifficulty'), render: (v) => (
                <span 
                  className="badge" 
                  style={{ 
                    background: `rgba(255,255,255,0.03)`, 
                    color: diffColors[v as keyof typeof diffColors], 
                    border: `1px solid ${diffColors[v as keyof typeof diffColors]}` 
                  }}
                >
                  {diffLabels[v as keyof typeof diffLabels]}
                </span>
              )},
              { key: 'waypoints', label: t('cycling.routes.colWaypoints'), render: (v) => {
                const arr = v as string[];
                return arr.length > 0 ? (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {arr.join(' → ')}
                  </span>
                ) : (
                  <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{t('cycling.routes.directRide')}</span>
                );
              }},
              { key: 'isCompleted', label: t('cycling.routes.colStatus'), render: (v) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                  {v ? (
                    <>
                      <CheckCircle2 size={14} style={{ color: 'var(--success, #16a34a)' }} />
                      <span style={{ color: 'var(--success, #16a34a)' }}>{t('cycling.routes.completed')}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={14} style={{ color: 'var(--warning, #f59e0b)' }} />
                      <span style={{ color: 'var(--warning, #f59e0b)' }}>{t('cycling.routes.inPlan')}</span>
                    </>
                  )}
                </div>
              )},
              { key: 'id', label: t('cycling.routes.colActions'), render: (_, row) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn--secondary" style={{ padding: '4px 6px' }} onClick={() => handleEdit(row as CycleRoute)}>
                    <Edit2 size={12} />
                  </button>
                  <button className="btn btn--secondary btn-padding-4-6-red" onClick={() => setRouteToDelete((row as CycleRoute).id)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            ]}
            data={data.routes}
            emptyMessage={t('cycling.routes.emptyMessage')}
          />
        ) : (
          <EmptyState
            icon={<Map size={48} />}
            title={t('cycling.routes.emptyTitle')}
            description={t('cycling.routes.emptyDescription')}
            action={
              <button className="btn btn--primary" onClick={handleAddNew}>
                <Plus size={14} />
                <span>{t('cycling.routes.planRoute')}</span>
              </button>
            }
          />
        )}
      </div>

        {isOpen && (
          <RouteModal
            isOpen={isOpen}
            route={editingRoute}
            onClose={() => setIsOpen(false)}
            onSave={handleSaveRoute}
          />
        )}

        {routeToDelete !== null && (
          <ConfirmDialog
            isOpen={routeToDelete !== null}
            onConfirm={handleConfirmDelete}
            onCancel={() => setRouteToDelete(null)}
            title={t('cycling.routes.deleteConfirmTitle')}
            message={t('cycling.routes.deleteConfirmMessage')}
            variant="danger"
          />
        )}
    </div>
  );
}
