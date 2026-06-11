import { useState, useCallback } from 'react';
import { type CycleRoute } from '../../types';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import { Plus, Map, Trash2, Edit2, CheckCircle2, AlertCircle } from 'lucide-react';
import { DataTable, EmptyState, ConfirmDialog } from '../../ui';
import { uid, nowISO } from '../../cognitive/helpers';
import RouteModal from './RouteModal';

const diffLabels = {
  easy: 'Легкий',
  medium: 'Средний',
  hard: 'Сложный',
  extreme: 'Экстремальный'
};

const diffColors = {
  easy: 'var(--success, #16a34a)',
  medium: 'var(--accent)',
  hard: 'var(--warning, #f59e0b)',
  extreme: 'var(--error, #ef4444)'
};

export default function RoutePlanner() {
  const { data, dispatch } = useData();
  const { addToast } = useApp();

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
      addToast('Маршрут успешно обновлен', 'success');
    } else {
      const newRoute: CycleRoute = {
        id: `route_${uid()}`,
        name: routeData.name || 'Новый маршрут',
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
      addToast('Запланирован новый маршрут', 'success');
    }
    setIsOpen(false);
  }, [editingRoute, dispatch, addToast]);

  const handleDelete = useCallback((id: string) => {
    dispatch({
      type: 'DELETE_ENTITY',
      entity: 'routes',
      id
    });
    addToast('Маршрут удален из плана', 'warning');
  }, [dispatch, addToast]);

  const handleConfirmDelete = useCallback(() => {
    if (routeToDelete) {
      handleDelete(routeToDelete);
      setRouteToDelete(null);
    }
  }, [routeToDelete, handleDelete]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="fade-in-entry">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Планировщик маршрутов
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Проектирование новых велотрасс, составление контрольных точек и ведение статистики прохождений
          </p>
        </div>
        <button className="btn btn--primary" onClick={handleAddNew} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} />
          <span>Планировать маршрут</span>
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '20px' }}>
        {data.routes.length > 0 ? (
          <DataTable
            columns={[
              { key: 'name', label: 'Название трассы', render: (v) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Map size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <span style={{ fontWeight: 600 }}>{v as string}</span>
                </div>
              )},
              { key: 'distanceKm', label: 'Дистанция', render: (v) => `${(v as number).toFixed(1)} км` },
              { key: 'elevationGainM', label: 'Набор высоты', render: (v) => `${(v as number).toFixed(1)} м` },
              { key: 'difficulty', label: 'Сложность', render: (v) => (
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
              { key: 'waypoints', label: 'Ключевые точки', render: (v) => {
                const arr = v as string[];
                return arr.length > 0 ? (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {arr.join(' → ')}
                  </span>
                ) : (
                  <span style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Прямой заезд</span>
                );
              }},
              { key: 'isCompleted', label: 'Статус', render: (v) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                  {v ? (
                    <>
                      <CheckCircle2 size={14} style={{ color: 'var(--success, #16a34a)' }} />
                      <span style={{ color: 'var(--success, #16a34a)' }}>Пройден</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={14} style={{ color: 'var(--warning, #f59e0b)' }} />
                      <span style={{ color: 'var(--warning, #f59e0b)' }}>В планах</span>
                    </>
                  )}
                </div>
              )},
              { key: 'id', label: 'Действия', render: (_, row) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn--secondary" style={{ padding: '4px 6px' }} onClick={() => handleEdit(row as CycleRoute)}>
                    <Edit2 size={12} />
                  </button>
                  <button className="btn btn--secondary" style={{ padding: '4px 6px', color: 'var(--error, #ef4444)' }} onClick={() => setRouteToDelete((row as CycleRoute).id)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            ]}
            data={data.routes}
            emptyMessage="У вас пока нет сохраненных маршрутов."
          />
        ) : (
          <EmptyState
            icon={<Map size={48} />}
            title="Список маршрутов пуст"
            description="Спланируйте контрольные точки и набор высоты для вашей следующей велопоездки."
            action={
              <button className="btn btn--primary" onClick={handleAddNew}>
                <Plus size={14} />
                <span>Запланировать маршрут</span>
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
            title="Удалить маршрут?"
            message="Вы действительно хотите удалить этот велосипедный маршрут? Это действие необратимо."
            variant="danger"
          />
        )}
    </div>
  );
}
