import React from 'react';
import { DeviceState, NetworkState, NetworkLink } from '../engine/types';
import { interfaceStatus } from '../engine/OperationalState';

interface TopologyPanelProps {
  state: NetworkState;
  activeDeviceId: string;
  onSelectDevice: (id: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NodePos {
  id: string;
  x: number;
  y: number;
  hostname: string;
  width: number;
  height: number;
}

const NODE_W = 88;
const NODE_H = 46;

function shortIf(name: string): string {
  return name
    .replace(/FastEthernet/g, 'Fa')
    .replace(/GigabitEthernet/g, 'Gi')
    .replace(/Ethernet/g, 'Et')
    .replace(/Port-channel/g, 'Po');
}

/** Order nodes for a cycle/ring by following links when possible. */
function orderByGraph(ids: string[], links: NetworkLink[]): string[] {
  if (ids.length <= 2) return ids.slice().sort();
  const adj = new Map<string, string[]>();
  for (const id of ids) adj.set(id, []);
  for (const l of links) {
    if (adj.has(l.a) && adj.has(l.b)) {
      adj.get(l.a)!.push(l.b);
      adj.get(l.b)!.push(l.a);
    }
  }
  // Prefer a cycle walk if degrees allow
  const start = ids.slice().sort()[0];
  const visited = new Set<string>();
  const order: string[] = [];
  function dfs(cur: string) {
    if (visited.has(cur)) return;
    visited.add(cur);
    order.push(cur);
    const neighbors = (adj.get(cur) || []).slice().sort();
    for (const n of neighbors) dfs(n);
  }
  dfs(start);
  // Append any unconnected
  for (const id of ids.slice().sort()) if (!visited.has(id)) order.push(id);
  return order;
}

function layoutDevices(devices: Record<string, DeviceState>, links: NetworkLink[]): NodePos[] {
  const ids = Object.keys(devices);
  const n = ids.length;
  if (n === 0) return [];

  const ordered = orderByGraph(ids, links);

  const make = (id: string, x: number, y: number): NodePos => ({
    id,
    x,
    y,
    hostname: devices[id].hostname,
    width: NODE_W,
    height: NODE_H,
  });

  if (n === 1) return [make(ordered[0], 200, 100)];
  if (n === 2) return [make(ordered[0], 90, 115), make(ordered[1], 310, 115)];
  if (n === 3) return [make(ordered[0], 55, 115), make(ordered[1], 200, 115), make(ordered[2], 345, 115)];
  if (n === 4) {
    // Square ring, order follows graph walk to reduce crossings
    return [
      make(ordered[0], 100, 60),
      make(ordered[1], 300, 60),
      make(ordered[2], 300, 160),
      make(ordered[3], 100, 160),
    ];
  }
  const start = 60;
  const step = Math.min(110, 280 / Math.max(1, n - 1));
  return ordered.map((id, i) => make(id, start + i * step, 100));
}

function edgePoint(node: NodePos, other: NodePos): { x: number; y: number } {
  const dx = other.x - node.x;
  const dy = other.y - node.y;
  const hw = node.width / 2;
  const hh = node.height / 2;
  if (dx === 0 && dy === 0) return { x: node.x, y: node.y };
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const scale = Math.max(absDx / hw, absDy / hh);
  return { x: node.x + dx / scale, y: node.y + dy / scale };
}

/** Place label just outside the node edge, slightly off the link line. */
function labelNearEnd(node: NodePos, edge: { x: number; y: number }, other: NodePos, outward = 18): { x: number; y: number } {
  const dx = edge.x - node.x;
  const dy = edge.y - node.y;
  const len = Math.hypot(dx, dy) || 1;
  // outward from node center through the edge point
  const ox = (dx / len) * outward;
  const oy = (dy / len) * outward;
  // small perpendicular nudge so it doesn't sit exactly on the line
  const px = -dy / len * 8;
  const py = dx / len * 8;
  return { x: edge.x + ox + px, y: edge.y + oy + py };
}

export const TopologyPanel: React.FC<TopologyPanelProps> = ({
  state,
  activeDeviceId,
  onSelectDevice,
  collapsed = false,
  onToggleCollapse,
}) => {
  const nodes = layoutDevices(state.devices, state.links);
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  if (collapsed) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-2 flex items-center justify-between text-xs">
        <span className="font-mono text-slate-500">Топология скрыта</span>
        {onToggleCollapse && (
          <button type="button" onClick={onToggleCollapse} className="text-cyan-600 dark:text-cyan-400 font-semibold">
            Показать схему
          </button>
        )}
      </div>
    );
  }

  const width = 400;
  const height = nodes.some(n => n.y > 130) ? 240 : 200;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Топология</span>
        {onToggleCollapse && (
          <button type="button" onClick={onToggleCollapse} className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            Скрыть
          </button>
        )}
      </div>
      <div className="p-2 overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-full h-auto" role="img" aria-label="Сетевая топология">
          {state.links.map((link, idx) => {
            const na = nodeMap[link.a];
            const nb = nodeMap[link.b];
            if (!na || !nb) return null;
            const aDev = state.devices[link.a];
            const bDev = state.devices[link.b];
            const aIf = aDev?.interfaces[link.aIf];
            const bIf = bDev?.interfaces[link.bIf];
            const aStatus = interfaceStatus(state, aDev, aIf ?? { name: link.aIf, adminUp: false });
            const bStatus = interfaceStatus(state, bDev, bIf ?? { name: link.bIf, adminUp: false });
            const up = link.up && aStatus.operUp && bStatus.operUp;
            const color = up ? '#10b981' : '#ef4444';
            const p1 = edgePoint(na, nb);
            const p2 = edgePoint(nb, na);
            const shortA = shortIf(link.aIf);
            const shortB = shortIf(link.bIf);
            const la = labelNearEnd(na, p1, nb, 20);
            const lb = labelNearEnd(nb, p2, na, 20);
            return (
              <g key={`link-${idx}`}>
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={color} strokeWidth={up ? 3 : 2} strokeDasharray={up ? undefined : '5 3'} />
                <text x={la.x} y={la.y - 2} textAnchor="middle" fontSize="7.5" fill="#cbd5e1" className="font-mono pointer-events-none">
                  {shortA}
                </text>
                <text x={lb.x} y={lb.y - 2} textAnchor="middle" fontSize="7.5" fill="#cbd5e1" className="font-mono pointer-events-none">
                  {shortB}
                </text>
              </g>
            );
          })}
          {nodes.map(node => {
            const isActive = node.id === activeDeviceId;
            return (
              <g
                key={node.id}
                onClick={() => onSelectDevice(node.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectDevice(node.id);
                  }
                }}
                style={{ cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
                aria-label={`Коммутатор ${node.hostname}${isActive ? ', активный' : ''}`}
                className="focus:outline-none"
              >
                <rect
                  x={node.x - node.width / 2}
                  y={node.y - node.height / 2}
                  width={node.width}
                  height={node.height}
                  rx={6}
                  fill={isActive ? '#0e7490' : '#1e293b'}
                  stroke={isActive ? '#22d3ee' : '#475569'}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="bold"
                  fill="#f1f5f9"
                  className="font-mono select-none pointer-events-none"
                >
                  {node.hostname}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="px-3 py-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono border-t border-slate-100 dark:border-slate-800">
        Клик или Enter/Space по коммутатору переключает консоль · зелёный линк = физически up
      </div>
    </div>
  );
};
