import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useApp } from '../../context/AppContext';
import PersonList from './PersonList';
import SocialGraph from './SocialGraph';
import PersonModal from './PersonModal';
import { isDecaying, computeConnectionScore } from '../../cognitive/social';
import { uid, nowISO, todayISO } from '../../cognitive/helpers';
import { Depth, Person, Archetype, PersonStatus } from '../../types';

export default function SocialPage() {
  const { data, dispatch } = useData();
  const { addToast } = useApp();
  const navigate = useNavigate();

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Statistics
  const avgScore = useMemo(() => {
    if (data.people.length === 0) return 0;
    const total = data.people.reduce((acc, p) => acc + computeConnectionScore(p, data.settings.graphWeights), 0);
    return Math.round(total / data.people.length);
  }, [data.people, data.settings.graphWeights]);

  const needingAttentionCount = useMemo(() => {
    return data.people.filter(p => isDecaying(p)).length;
  }, [data.people]);

  const depthDistribution = useMemo(() => {
    const depths = [Depth.CORE, Depth.INNER, Depth.SOCIAL, Depth.PERIPHERY];
    const total = data.people.length || 1;
    const colors: Record<Depth, string> = {
      [Depth.CORE]: '#bb86fc',      // Purple
      [Depth.INNER]: '#ff6d00',     // Orange
      [Depth.SOCIAL]: '#2e7d32',    // Green
      [Depth.PERIPHERY]: '#9aa0a6', // Grey
    };
    const labels: Record<Depth, string> = {
      [Depth.CORE]: 'Ядро',
      [Depth.INNER]: 'Ближний круг',
      [Depth.SOCIAL]: 'Социальный слой',
      [Depth.PERIPHERY]: 'Периферия',
    };

    return {
      segments: depths.map((d) => {
        const count = data.people.filter((p) => p.depth === d).length;
        const pct = (count / total) * 100;
        return { depth: d, label: labels[d], count, pct, color: colors[d] };
      }),
      total: data.people.length,
    };
  }, [data.people]);

  const handleSelectNode = useCallback((id: string) => {
    navigate(`/social/${id}`);
  }, [navigate]);

  const handleAddNew = useCallback(() => {
    setIsCreateOpen(true);
  }, []);

  const handleSaveNewPerson = useCallback((personData: Partial<Person>) => {
    const newPerson: Person = {
      id: `p_${uid()}`,
      name: personData.name || '',
      depth: personData.depth || Depth.INNER,
      archetype: personData.archetype || Archetype.INTELLECTUAL,
      status: personData.status || PersonStatus.ACTIVE,
      energy: personData.energy ?? 60,
      resonance: personData.resonance ?? 60,
      reciprocity: personData.reciprocity ?? 60,
      volatility: personData.volatility ?? 30,
      lastContactISO: personData.lastContactISO || todayISO(),
      reflection: personData.reflection || '',
      notes: personData.notes || '',
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };

    dispatch({
      type: 'ADD_ENTITY',
      entity: 'people',
      payload: newPerson,
    });
    setIsCreateOpen(false);
    addToast('Новое знакомство успешно зарегистрировано', 'success');
  }, [dispatch, addToast]);

  return (
    <div className="fade-in-entry social-page-container">
      {/* Sidebar - list of people */}
      <div className="social-sidebar">
        <PersonList 
          people={data.people} 
          activeId={null} 
          onSelect={handleSelectNode} 
          onAddNew={handleAddNew}
          graphWeights={data.settings.graphWeights}
        />
      </div>

      {/* Main workspace */}
      <div className="social-main">
        
        {/* Stats Row */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
          <div className="glass-panel social-stat-card" style={{ borderLeft: '3px solid var(--accent)' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{data.people.length}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Всего контактов</span>
          </div>

          <div className="glass-panel social-stat-card" style={{ borderLeft: `3px solid ${avgScore >= 50 ? 'var(--success, #16a34a)' : 'var(--error, #ef4444)'}` }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: avgScore >= 50 ? 'var(--success, #16a34a)' : 'var(--error, #ef4444)' }}>{avgScore}%</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Индекс ресурса</span>
          </div>

          <div className="glass-panel social-stat-card" style={{ borderLeft: needingAttentionCount > 0 ? '3px solid var(--error, #ef4444)' : '3px solid var(--success, #16a34a)' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: needingAttentionCount > 0 ? 'var(--error, #ef4444)' : 'var(--success, #16a34a)' }}>{needingAttentionCount}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Остывающие связи</span>
          </div>

          <div className="glass-panel social-stat-card" style={{ minWidth: '200px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>Круги близости</span>
            <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)', marginBottom: '8px' }}>
              {depthDistribution.segments.map(seg => (
                seg.pct > 0 && (
                  <div key={seg.depth} style={{ width: `${seg.pct}%`, background: seg.color, height: '100%' }} />
                )
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.65rem' }}>
              {depthDistribution.segments.map(seg => (
                <span key={seg.depth} style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--text-secondary)' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: seg.color, display: 'inline-block' }} />
                  {seg.label} ({seg.count})
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Force graph panel */}
        <div className="glass-panel social-graph-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)' }}>
              Карта социального поля
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Перетаскивайте узлы, кликните на контакт для диагностики
            </span>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <SocialGraph 
              people={data.people} 
              settings={data.settings}
              activeId={null} 
              onSelectNode={handleSelectNode} 
            />
          </div>
        </div>
      </div>

      {isCreateOpen && (
        <PersonModal
          isOpen={isCreateOpen}
          person={null}
          onClose={() => setIsCreateOpen(false)}
          onSave={handleSaveNewPerson}
        />
      )}
    </div>
  );
}


