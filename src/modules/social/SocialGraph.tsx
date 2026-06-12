import { useEffect, useRef, useState, useMemo, type MouseEvent } from 'react';
import { type Person, type AppSettings, Depth } from '../../types';
import { computeConnectionScore, isDecaying } from '../../cognitive/social';
import { EmptyState } from '../../ui';
import styles from './SocialGraph.module.css';
import { useI18n } from '../../i18n';

interface SocialGraphProps {
  people: Person[];
  settings: AppSettings;
  activeId: string | null;
  onSelectNode: (id: string) => void;
}

interface Node {
  id: string;
  name: string;
  depth: Depth | 'Me';
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

const depthColors: Record<Depth | 'Me', string> = {
  'Me': 'var(--text-primary)',
  [Depth.CORE]: 'var(--error)',       // Purple/Violet (mapped to error/alert style)
  [Depth.INNER]: 'var(--warning)',      // Orange (mapped to warning/attention style)
  [Depth.SOCIAL]: 'var(--primary)',     // Green (mapped to primary/active style)
  [Depth.PERIPHERY]: 'var(--text-tertiary)',  // Grey (mapped to tertiary/muted style)
};

// Deterministic pseudo-random angle generator
const getPseudoRandom = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
};

export default function SocialGraph({ people, settings, activeId, onSelectNode }: SocialGraphProps) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const wasDraggedRef = useRef(false);


  // Center coordinates
  const centerX = 400;
  const centerY = 300;

  // Compute connections and initialize nodes on change
  const initialData = useMemo(() => {
    const graphNodes: Node[] = [
      {
        id: 'me',
        name: t('social.graph.me'),
        depth: 'Me',
        x: centerX,
        y: centerY,
        vx: 0,
        vy: 0,
        size: 26,
        color: '#ffffff',
      },
    ];

    // Position other nodes in concentric orbits initially
    people.forEach((p, index) => {
      let orbitRadius: number;
      if (p.depth === Depth.CORE) orbitRadius = 75;
      else if (p.depth === Depth.INNER) orbitRadius = 150;
      else if (p.depth === Depth.SOCIAL) orbitRadius = 225;
      else orbitRadius = 300;

      const angle = (index / (people.length || 1)) * Math.PI * 2 + getPseudoRandom(p.id) * 0.5;

      graphNodes.push({
        id: p.id,
        name: p.name.split(' ')[0] || p.name,
        depth: p.depth,
        x: centerX + Math.cos(angle) * orbitRadius,
        y: centerY + Math.sin(angle) * orbitRadius,
        vx: 0,
        vy: 0,
        size: 14 + computeConnectionScore(p, settings.graphWeights) / 10,
        color: depthColors[p.depth],
      });
    });

    const graphLinks: Link[] = [];

    // Link 'Me' to Core ('core')
    people.forEach((p) => {
      if (p.depth === Depth.CORE) {
        graphLinks.push({ source: 'me', target: p.id, value: 3 });
      }
    });

    // Link Core to Inner Circle
    const coreNodes = people.filter((p) => p.depth === Depth.CORE);
    const innerNodes = people.filter((p) => p.depth === Depth.INNER);
    innerNodes.forEach((inner) => {
      const matchingCore = coreNodes.find((c) => c.archetype === inner.archetype) || coreNodes[0];
      if (matchingCore) {
        graphLinks.push({ source: matchingCore.id, target: inner.id, value: 2 });
      } else {
        graphLinks.push({ source: 'me', target: inner.id, value: 1.5 });
      }
    });

    // Link Inner Circle to Social Layer
    const socialNodes = people.filter((p) => p.depth === Depth.SOCIAL);
    socialNodes.forEach((social) => {
      const matchingInner = innerNodes.find((i) => i.archetype === social.archetype) || innerNodes[0];
      if (matchingInner) {
        graphLinks.push({ source: matchingInner.id, target: social.id, value: 1.2 });
      } else {
        graphLinks.push({ source: 'me', target: social.id, value: 0.8 });
      }
    });

    // Link Social Layer to Peripheral
    const peripheralNodes = people.filter((p) => p.depth === Depth.PERIPHERY);
    peripheralNodes.forEach((periph) => {
      const matchingSocial = socialNodes.find((s) => s.archetype === periph.archetype) || socialNodes[0];
      if (matchingSocial) {
        graphLinks.push({ source: matchingSocial.id, target: periph.id, value: 0.8 });
      } else {
        graphLinks.push({ source: 'me', target: periph.id, value: 0.5 });
      }
    });

    // Cross-link nodes with high Resonance (> 75) of the same archetype
    for (let i = 0; i < people.length; i++) {
      for (let j = i + 1; j < people.length; j++) {
        const p1 = people[i];
        const p2 = people[j];
        if (p1.archetype === p2.archetype && p1.resonance > 75 && p2.resonance > 75) {
          graphLinks.push({ source: p1.id, target: p2.id, value: 1.0 });
        }
      }
    }

    return { initialNodes: graphNodes, initialLinks: graphLinks };
  }, [people, centerX, centerY, settings.graphWeights, t]);

  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});

  const nodes = useMemo(() => {
    return initialData.initialNodes.map((node) => {
      const pos = positions[node.id];
      return pos ? { ...node, x: pos.x, y: pos.y } : node;
    });
  }, [initialData.initialNodes, positions]);

  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  // Initialize Web Worker once
  useEffect(() => {
    const worker = new Worker(
      new URL('./graphPhysics.worker.ts', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (e: MessageEvent<{ type: string; nodes: { id: string; x: number; y: number }[] }>) => {
      if (e.data.type === 'TICK') {
        const tickNodes = e.data.nodes;
        setPositions((prev) => {
          const next = { ...prev };
          tickNodes.forEach((n) => {
            next[n.id] = { x: n.x, y: n.y };
          });
          return next;
        });
      }
    };

    workerRef.current = worker;

    return () => {
      worker.postMessage({ type: 'DESTROY' });
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  // Synchronize configuration with worker
  useEffect(() => {
    const worker = workerRef.current;
    if (!worker) return;

    // Send initial configuration to worker
    // targetRadius is determined by Depth
    const workerNodes = initialData.initialNodes.map(node => {
      let targetRadius = 0;
      if (node.depth === Depth.CORE) targetRadius = 75;
      else if (node.depth === Depth.INNER) targetRadius = 150;
      else if (node.depth === Depth.SOCIAL) targetRadius = 225;
      else if (node.depth === Depth.PERIPHERY) targetRadius = 300;

      const idx = initialData.initialNodes.findIndex(n => n.id === node.id);
      const angle = (idx / (initialData.initialNodes.length || 1)) * Math.PI * 2 + getPseudoRandom(node.id) * 0.5;

      return {
        id: node.id,
        targetRadius,
        angle
      };
    });

    worker.postMessage({
      type: 'INIT',
      nodes: workerNodes,
      links: initialData.initialLinks.map(l => ({
        source: l.source,
        target: l.target,
        strength: l.value * 0.01 * (settings.graphSensitivity / 5)
      })),
      centerX,
      centerY,
    });
  }, [initialData, settings.graphSensitivity, centerX, centerY]);

  // Handle Dragging
  const handleMouseDown = (e: MouseEvent<SVGElement>, nodeId: string) => {
    e.preventDefault();
    setDraggedNodeId(nodeId);
    wasDraggedRef.current = false;

    if (workerRef.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const scaleX = 800 / (rect.width || 800);
      const scaleY = 600 / (rect.height || 600);
      const mouseX = (e.clientX - rect.left) * scaleX;
      const mouseY = (e.clientY - rect.top) * scaleY;

      workerRef.current.postMessage({
        type: 'DRAG_START',
        id: nodeId,
        x: mouseX,
        y: mouseY,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent<SVGElement>) => {
    if (!draggedNodeId || !containerRef.current || !workerRef.current) return;
    wasDraggedRef.current = true;

    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = 800 / (rect.width || 800);
    const scaleY = 600 / (rect.height || 600);
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    workerRef.current.postMessage({
      type: 'DRAG_MOVE',
      id: draggedNodeId,
      x: mouseX,
      y: mouseY,
    });
  };

  const handleMouseUp = () => {
    if (draggedNodeId && workerRef.current) {
      workerRef.current.postMessage({ type: 'DRAG_END' });
      setDraggedNodeId(null);
    }
  };

  if (people.length === 0) {
    return (
      <div className={styles.graphCanvasContainer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '350px' }}>
        <EmptyState
          title={t('social.graph.no_contacts_title')}
          description={t('social.graph.no_contacts_desc')}
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={styles.graphCanvasContainer}>
      <svg
        viewBox="0 0 800 600"
        width="100%"
        height="100%"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: draggedNodeId ? 'grabbing' : 'grab' }}
      >
        <defs>
          <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
          <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Concentric rings guidelines */}
        <circle cx={centerX} cy={centerY} r={75} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" strokeDasharray="5,5" />
        <circle cx={centerX} cy={centerY} r={150} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" strokeDasharray="5,5" />
        <circle cx={centerX} cy={centerY} r={225} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" strokeDasharray="5,5" />
        <circle cx={centerX} cy={centerY} r={300} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" strokeDasharray="5,5" />

        {/* Ring labels */}
        <text x={centerX + 8} y={centerY - 75 - 5} fill="var(--text-secondary)" fontSize="0.65rem" opacity="0.4">{t('social.depth.core')}</text>
        <text x={centerX + 8} y={centerY - 150 - 5} fill="var(--text-secondary)" fontSize="0.65rem" opacity="0.4">{t('social.depth.inner')}</text>
        <text x={centerX + 8} y={centerY - 225 - 5} fill="var(--text-secondary)" fontSize="0.65rem" opacity="0.4">{t('social.depth.social')}</text>
        <text x={centerX + 8} y={centerY - 300 - 5} fill="var(--text-secondary)" fontSize="0.65rem" opacity="0.4">{t('social.depth.periphery')}</text>

        {/* Glow halo under active node */}
        {nodes.map((n) => {
          if (n.id !== activeId) return null;
          return (
            <circle
              key={`glow-${n.id}`}
              cx={n.x}
              cy={n.y}
              r={n.size * 2.5}
              fill="url(#glowGrad)"
              pointerEvents="none"
            />
          );
        })}

        {/* Links */}
        {(() => {
          const nodeMap = new Map(nodes.map(n => [n.id, n]));
          return initialData.initialLinks.map((link, i) => {
            const s = nodeMap.get(link.source);
            const t = nodeMap.get(link.target);
            if (!s || !t) return null;

            const isActiveLink = activeId && (link.source === activeId || link.target === activeId);

            return (
              <line
                key={`link-${i}`}
                x1={s.x}
                y1={s.y}
                x2={t.x}
                y2={t.y}
                stroke={isActiveLink ? 'var(--accent)' : 'var(--border)'}
                strokeWidth={isActiveLink ? link.value * 2.0 : link.value * 1.0}
                strokeOpacity={isActiveLink ? 0.75 : 0.15}
                style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
              />
            );
          });
        })()}

        {/* Nodes */}
        {nodes.map((node) => {
          const isActive = node.id === activeId;
          const isCenter = node.depth === 'Me';

          return (
            <g
              key={node.id}
              transform={`translate(${node.x || 0}, ${node.y || 0})`}
              onMouseDown={(e) => handleMouseDown(e, node.id)}
              onClick={() => {
                if (!wasDraggedRef.current && node.id !== 'me') {
                  onSelectNode(node.id);
                }
              }}
              style={{ cursor: isCenter ? 'default' : 'pointer' }}
            >
              {isActive && (
                <circle
                  r={node.size + 5}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  style={{ transition: 'r 0.2s' }}
                />
              )}

              <circle
                r={node.size}
                fill={isCenter ? 'var(--accent)' : 'var(--bg-secondary)'}
                stroke={isCenter ? 'transparent' : node.color}
                strokeWidth={isActive ? 3 : 2}
                filter="url(#shadow)"
                style={{ transition: 'r 0.2s, fill 0.2s' }}
              />

              {!isCenter &&
                (() => {
                  const target = people.find((p) => p.id === node.id);
                  if (!target) return null;
                  if (isDecaying(target)) {
                    return (
                      <circle
                        cx={node.size - 2}
                        cy={-node.size + 2}
                        r={4}
                        fill="var(--error, #ef4444)"
                      />
                    );
                  }
                  return null;
                })()}

              <text
                textAnchor="middle"
                y={node.size + 14}
                fill="var(--bg-primary)"
                stroke="var(--bg-primary)"
                strokeWidth="4"
                strokeLinejoin="round"
                fontSize="0.75rem"
                fontWeight={isActive ? '800' : '600'}
                pointerEvents="none"
                style={{ opacity: 0.9 }}
              >
                {node.name}
              </text>
              <text
                textAnchor="middle"
                y={node.size + 14}
                fill={isActive ? 'var(--accent)' : 'var(--text-primary)'}
                fontSize="0.75rem"
                fontWeight={isActive ? '800' : '600'}
                pointerEvents="none"
                style={{ transition: 'fill 0.2s' }}
              >
                {node.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
