export interface WorkerInitMessage {
  type: 'INIT';
  centerX: number;
  centerY: number;
  nodes: { id: string; targetRadius: number; angle: number }[];
  links: { source: string; target: string; strength: number }[];
}

export interface WorkerDragStartMessage {
  type: 'DRAG_START';
  id: string;
  x: number;
  y: number;
}

export interface WorkerDragMoveMessage {
  type: 'DRAG_MOVE';
  id: string;
  x: number;
  y: number;
}

export interface WorkerDragEndMessage {
  type: 'DRAG_END';
}

export interface WorkerDestroyMessage {
  type: 'DESTROY';
}

export interface WorkerTickMessage {
  type: 'TICK';
}

export interface WorkerPinMessage {
  type: 'PIN';
  id: string;
  isPinned: boolean;
  x?: number;
  y?: number;
}

export interface WorkerPinAllResetMessage {
  type: 'PIN_ALL_RESET';
}

export type WorkerIncomingMessage =
  | WorkerInitMessage
  | WorkerTickMessage
  | WorkerDragStartMessage
  | WorkerDragMoveMessage
  | WorkerDragEndMessage
  | WorkerDestroyMessage
  | WorkerPinMessage
  | WorkerPinAllResetMessage;

const ctx = self as unknown as DedicatedWorkerGlobalScope;

interface NodeState {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetRadius: number;
  angle: number;
  isPinned?: boolean;
}

let nodes: NodeState[] = [];
let links: { source: string; target: string; strength: number }[] = [];
let centerX = 0;
let centerY = 0;
let dragId: string | null = null;
let tickCount = 0;
const MAX_TICKS = 300;
let intervalId: ReturnType<typeof setInterval> | null = null;

function tick() {
  if (tickCount >= MAX_TICKS) {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    return;
  }
  tickCount++;

  // Coulomb repulsion
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[j].x - nodes[i].x;
      const dy = nodes[j].y - nodes[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = 500 / (dist * dist);
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      nodes[i].vx -= fx;
      nodes[i].vy -= fy;
      nodes[j].vx += fx;
      nodes[j].vy += fy;
    }
  }

  // Radial gravity (toward target radius)
  for (const node of nodes) {
    if (node.id === dragId || node.isPinned) continue;
    const dx = centerX - node.x;
    const dy = centerY - node.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const targetDist = node.targetRadius;
    const diff = (dist - targetDist) * 0.05;
    node.vx += (dx / dist) * diff;
    node.vy += (dy / dist) * diff;
    // Center gravity
    node.vx += (centerX - node.x) * 0.001;
    node.vy += (centerY - node.y) * 0.001;
  }

  // Spring tension for links
  for (const link of links) {
    const source = nodes.find((n) => n.id === link.source);
    const target = nodes.find((n) => n.id === link.target);
    if (!source || !target) continue;
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const force = (dist - 60) * link.strength;
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;
    source.vx += fx;
    source.vy += fy;
    target.vx -= fx;
    target.vy -= fy;
  }

  // Velocity damping + position update
  for (const node of nodes) {
    if (node.id === dragId || node.isPinned) continue;
    node.vx *= 0.85;
    node.vy *= 0.85;
    node.x += node.vx;
    node.y += node.vy;
    // Boundary containment
    node.x = Math.max(0, Math.min(800, node.x));
    node.y = Math.max(0, Math.min(600, node.y));
  }

  ctx.postMessage({
    type: 'TICK',
    nodes: nodes.map((n) => ({ id: n.id, x: n.x, y: n.y, vx: n.vx, vy: n.vy })),
  });
}

ctx.onmessage = (e: MessageEvent<WorkerIncomingMessage>) => {
  const msg = e.data;
  if (!msg || typeof msg !== 'object') return;

  switch (msg.type) {
    case 'INIT': {
      if (
        typeof msg.centerX !== 'number' ||
        typeof msg.centerY !== 'number' ||
        !Array.isArray(msg.nodes) ||
        !Array.isArray(msg.links)
      )
        return;
      centerX = msg.centerX;
      centerY = msg.centerY;

      // Reconcile nodes to keep pre-existing physics positions
      const reconciledNodes = msg.nodes.map((n) => {
        const existing = nodes.find((oldNode) => oldNode.id === n.id);
        if (existing) {
          return {
            ...existing,
            targetRadius: n.targetRadius,
            angle: n.angle,
          };
        } else {
          return {
            id: n.id,
            x: centerX + Math.cos(n.angle) * n.targetRadius,
            y: centerY + Math.sin(n.angle) * n.targetRadius,
            vx: 0,
            vy: 0,
            targetRadius: n.targetRadius,
            angle: n.angle,
            isPinned: false,
          };
        }
      });

      nodes = reconciledNodes;
      links = msg.links;
      tickCount = 0;
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(tick, 16);
      break;
    }
    case 'TICK':
      tick();
      break;
    case 'DRAG_START':
      if (typeof msg.id !== 'string') return;
      dragId = msg.id;
      // Reset tick count to animate when drag starts
      tickCount = 0;
      if (!intervalId) {
        intervalId = setInterval(tick, 16);
      }
      break;
    case 'DRAG_MOVE': {
      if (typeof msg.id !== 'string' || typeof msg.x !== 'number' || typeof msg.y !== 'number')
        return;
      const node = nodes.find((n) => n.id === msg.id);
      if (node) {
        node.x = msg.x;
        node.y = msg.y;
        node.vx = 0;
        node.vy = 0;
      }
      break;
    }
    case 'DRAG_END':
      dragId = null;
      break;
    case 'PIN': {
      if (typeof msg.id !== 'string') return;
      const node = nodes.find((n) => n.id === msg.id);
      if (node) {
        node.isPinned = msg.isPinned;
        if (typeof msg.x === 'number' && typeof msg.y === 'number') {
          node.x = msg.x;
          node.y = msg.y;
        }
        if (msg.isPinned) {
          node.vx = 0;
          node.vy = 0;
        }
      }
      // Re-trigger physics calculations on pinning state change
      tickCount = 0;
      if (!intervalId) {
        intervalId = setInterval(tick, 16);
      }
      break;
    }
    case 'PIN_ALL_RESET': {
      nodes.forEach((n) => {
        n.isPinned = false;
      });
      tickCount = 0;
      if (!intervalId) {
        intervalId = setInterval(tick, 16);
      }
      break;
    }
    case 'DESTROY':
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      self.close();
      break;
  }
};
export {};
