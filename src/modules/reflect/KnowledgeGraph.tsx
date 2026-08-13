import { useState, useMemo, useRef, useEffect, type MouseEvent } from 'react';
import { type KnowledgeItem } from '../../types';
import { useI18n } from '../../i18n';
import { ZoomIn, ZoomOut, RotateCcw, ExternalLink, Edit2 } from 'lucide-react';
import { sanitizeUrl } from '../../cognitive/helpers';

interface KnowledgeGraphProps {
  items: KnowledgeItem[];
  onSelectItem: (item: KnowledgeItem) => void;
}

interface GraphNode {
  id: string;
  item: KnowledgeItem;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  category: string;
  color: string;
}

interface GraphEdge {
  source: string;
  target: string;
  sharedTags: string[];
}

const CATEGORY_COLORS: Record<string, string> = {
  'Книги': 'var(--primary, #a78bfa)',
  'Books': 'var(--primary, #a78bfa)',
  'Статьи': 'var(--blue, #82b1ff)',
  'Articles': 'var(--blue, #82b1ff)',
  'Видео': 'var(--error, #f2b8b5)',
  'Videos': 'var(--error, #f2b8b5)',
  'Подкасты': 'var(--warning, #fbbf24)',
  'Podcasts': 'var(--warning, #fbbf24)',
  'Методология': 'var(--success, #81c784)',
  'Methodology': 'var(--success, #81c784)',
};

export default function KnowledgeGraph({ items, onSelectItem }: KnowledgeGraphProps) {
  const { t } = useI18n();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const startPanRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute graph edges based on shared tags & same category
  const { edges, nodeMap } = useMemo(() => {
    const edgeList: GraphEdge[] = [];
    const map = new Map<string, KnowledgeItem>();
    items.forEach((item) => map.set(item.id, item));

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i];
        const b = items[j];

        const aTags = new Set(a.tags.map((t) => t.toLowerCase()));
        const shared = b.tags.filter((t) => aTags.has(t.toLowerCase()));

        if (shared.length > 0) {
          edgeList.push({ source: a.id, target: b.id, sharedTags: shared });
        } else if (a.category === b.category && a.category) {
          // Weak category edge
          edgeList.push({ source: a.id, target: b.id, sharedTags: [] });
        }
      }
    }

    return { edges: edgeList, nodeMap: map };
  }, [items]);

  // Generate initial physics simulation / layout coordinates
  const [nodes, setNodes] = useState<GraphNode[]>([]);

  useEffect(() => {
    if (items.length === 0) {
      setNodes([]);
      return;
    }

    const width = 800;
    const height = 550;
    const centerX = width / 2;
    const centerY = height / 2;

    const initialNodes: GraphNode[] = items.map((item, idx) => {
      const angle = (idx / items.length) * 2 * Math.PI;
      const radiusOffset = 140 + (idx % 3) * 60;
      return {
        id: item.id,
        item,
        x: centerX + Math.cos(angle) * radiusOffset + (Math.random() - 0.5) * 40,
        y: centerY + Math.sin(angle) * radiusOffset + (Math.random() - 0.5) * 40,
        vx: 0,
        vy: 0,
        radius: Math.max(16, Math.min(28, 14 + (item.tags?.length || 0) * 3)),
        category: item.category,
        color: CATEGORY_COLORS[item.category] || 'var(--primary, #a78bfa)',
      };
    });

    const nodeMap = new Map<string, GraphNode>();
    initialNodes.forEach((n) => nodeMap.set(n.id, n));

    // Run relaxation iterations with O(1) node lookup
    for (let iter = 0; iter < 40; iter++) {
      // Repulsion between nodes
      for (let i = 0; i < initialNodes.length; i++) {
        const ni = initialNodes[i];
        for (let j = i + 1; j < initialNodes.length; j++) {
          const nj = initialNodes[j];
          const dx = nj.x - ni.x;
          const dy = nj.y - ni.y;
          const distSq = dx * dx + dy * dy;
          const minDist = ni.radius + nj.radius + 35;
          const minDistSq = minDist * minDist;
          if (distSq < minDistSq && distSq > 0.0001) {
            const dist = Math.sqrt(distSq);
            const force = ((minDist - dist) / dist) * 0.4;
            ni.x -= dx * force;
            ni.y -= dy * force;
            nj.x += dx * force;
            nj.y += dy * force;
          }
        }
      }

      // Edge spring attraction
      for (let e = 0; e < edges.length; e++) {
        const edge = edges[e];
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);
        if (sourceNode && targetNode) {
          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const desiredDist = edge.sharedTags.length > 0 ? 90 : 160;
          const force = (dist - desiredDist) * 0.03;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          sourceNode.x += fx;
          sourceNode.y += fy;
          targetNode.x -= fx;
          targetNode.y -= fy;
        }
      }

      // Gravity towards center
      for (let i = 0; i < initialNodes.length; i++) {
        const node = initialNodes[i];
        node.x += (centerX - node.x) * 0.02;
        node.y += (centerY - node.y) * 0.02;
      }
    }

    setNodes(initialNodes);
  }, [items, edges]);

  // Connected node IDs for highlighted state
  const activeNodeId = hoveredNodeId || selectedNodeId;
  const connectedIds = useMemo(() => {
    if (!activeNodeId) return new Set<string>();
    const set = new Set<string>([activeNodeId]);
    edges.forEach((e) => {
      if (e.source === activeNodeId) set.add(e.target);
      if (e.target === activeNodeId) set.add(e.source);
    });
    return set;
  }, [activeNodeId, edges]);

  // Pan and Zoom handlers
  const handleMouseDown = (e: MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsPanning(true);
      startPanRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPanRef.current.x,
        y: e.clientY - startPanRef.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const selectedItem = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodeMap.get(selectedNodeId) || null;
  }, [selectedNodeId, nodeMap]);

  return (
    <div
      ref={containerRef}
      className="glass-panel"
      style={{
        position: 'relative',
        width: '100%',
        height: '600px',
        overflow: 'hidden',
        padding: 0,
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        cursor: isPanning ? 'grabbing' : 'default',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Controls Overlay */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          display: 'flex',
          gap: '8px',
          zIndex: 10,
        }}
      >
        <button
          className="btn btn--secondary"
          style={{ padding: '8px' }}
          onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          className="btn btn--secondary"
          style={{ padding: '8px' }}
          onClick={() => setZoom((z) => Math.max(0.4, z - 0.2))}
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          className="btn btn--secondary"
          style={{ padding: '8px' }}
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          title="Reset View"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Info Badge */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          background: 'var(--surface)',
          padding: '8px 14px',
          borderRadius: '20px',
          border: '1px solid var(--border)',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          zIndex: 10,
          pointerEvents: 'none',
          backdropFilter: 'blur(8px)',
        }}
      >
        {t('reflect.knowledge.graph_hint')}
      </div>

      {/* Interactive SVG Canvas */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Edges */}
          {edges.map((edge, idx) => {
            const s = nodes.find((n) => n.id === edge.source);
            const tg = nodes.find((n) => n.id === edge.target);
            if (!s || !tg) return null;

            const isHighlighted =
              activeNodeId && (edge.source === activeNodeId || edge.target === activeNodeId);
            const isDimmed = activeNodeId && !isHighlighted;
            const hasSharedTags = edge.sharedTags.length > 0;

            return (
              <line
                key={`edge-${idx}`}
                x1={s.x}
                y1={s.y}
                x2={tg.x}
                y2={tg.y}
                stroke={
                  isHighlighted
                    ? 'var(--accent, #a78bfa)'
                    : hasSharedTags
                      ? 'rgba(255, 255, 255, 0.18)'
                      : 'rgba(255, 255, 255, 0.05)'
                }
                strokeWidth={isHighlighted ? 2.5 : hasSharedTags ? 1.5 : 0.75}
                strokeDasharray={hasSharedTags ? undefined : '3 3'}
                opacity={isDimmed ? 0.15 : 1}
                style={{ transition: 'stroke 0.2s, stroke-width 0.2s, opacity 0.2s' }}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isSelected = node.id === selectedNodeId;
            const isHovered = node.id === hoveredNodeId;
            const isConnected = connectedIds.has(node.id);
            const isDimmed = activeNodeId && !isConnected;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                opacity={isDimmed ? 0.25 : 1}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNodeId(node.id === selectedNodeId ? null : node.id);
                }}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
              >
                {/* Glow ring */}
                {(isSelected || isHovered) && (
                  <circle
                    r={node.radius + 10}
                    fill="none"
                    stroke={node.color}
                    strokeWidth="2"
                    strokeOpacity="0.5"
                    strokeDasharray="4 2"
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  r={node.radius}
                  fill="var(--bg-secondary, #14131c)"
                  stroke={node.color}
                  strokeWidth={isSelected ? 3 : 2}
                  style={{
                    filter: isSelected ? 'drop-shadow(0 0 8px var(--primary-glow))' : undefined,
                  }}
                />

                {/* Inner Category Letter */}
                <text
                  textAnchor="middle"
                  dy="0.35em"
                  fill="var(--text-primary)"
                  fontSize={node.radius * 0.7}
                  fontWeight="700"
                  pointerEvents="none"
                >
                  {node.item.title.slice(0, 1).toUpperCase()}
                </text>

                {/* Node Title Label */}
                <text
                  y={node.radius + 14}
                  textAnchor="middle"
                  fill={isSelected ? 'var(--accent)' : 'var(--text-primary)'}
                  fontSize="11px"
                  fontWeight={isSelected || isHovered ? '700' : '500'}
                  pointerEvents="none"
                  style={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                  }}
                >
                  {node.item.title.length > 20
                    ? node.item.title.slice(0, 18) + '...'
                    : node.item.title}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Selected Node Drawer / Preview Modal */}
      {selectedItem && (
        <div
          className="glass-panel"
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            width: '320px',
            maxHeight: '340px',
            background: 'var(--surface)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 20,
            overflowY: 'auto',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: CATEGORY_COLORS[selectedItem.category] || 'var(--accent)',
                }}
              >
                {selectedItem.category}
              </span>
              <h4 style={{ margin: '4px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>
                {selectedItem.title}
              </h4>
            </div>
            <button
              className="btn btn--secondary"
              style={{ padding: '4px 6px' }}
              onClick={() => onSelectItem(selectedItem)}
              title="Edit"
            >
              <Edit2 size={12} />
            </button>
          </div>

          <p
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.4,
              margin: '10px 0',
              maxHeight: '120px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
            }}
          >
            {selectedItem.content}
          </p>

          {selectedItem.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
              {selectedItem.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: '0.65rem',
                    background: 'rgba(255,255,255,0.06)',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    color: 'var(--accent)',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {selectedItem.url && (
            <a
              href={sanitizeUrl(selectedItem.url)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                color: 'var(--accent)',
                marginTop: '10px',
              }}
            >
              <span>{selectedItem.source || 'Link'}</span>
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
