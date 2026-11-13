import React from 'react';
import { DeviceState, NetworkState, NetworkLink } from '../engine/types';
import { interfaceStatus } from '../engine/OperationalState';
import { deriveSpanningTree, type SpanningTreeResult } from '../engine/SpanningTree';

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

/**
 * Position each port label outside its node and on the opposite side of the
 * link from the label at the far end. This matters on short 3-switch links:
 * placing both labels on the centerline makes Fa0/24 and Fa0/23 collide.
 */
function labelNearEnd(node: NodePos, edge: { x: number; y: number }): { x: number; y: number } {
  const dx = edge.x - node.x;
  const dy = edge.y - node.y;
  const len = Math.hypot(dx, dy) || 1;
  const outward = 10;
  const perpendicular = 16;
  return {
    x: edge.x + (dx / len) * outward - (dy / len) * perpendicular,
    y: edge.y + (dy / len) * outward + (dx / len) * perpendicular,
  };
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

  // Pure call — no cached runtime, recomputed every render from NetworkState.
  let tree: SpanningTreeResult | null = null;
  try {
    tree = deriveSpanningTree(state, { kind: 'cst' });
  } catch {
    tree = null;
  }
  const rootDevice = tree ? Object.values(tree.bridges)[0]?.rootDevice ?? null : null;

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
            const phyUp = link.up && aStatus.operUp && bStatus.operUp;

            const aStp = tree?.bridges[link.a]?.ports[link.aIf];
            const bStp = tree?.bridges[link.b]?.ports[link.bIf];
            const aBlocked = aStp?.portState === 'blocking' && aStp.portRole !== 'disabled';
            const bBlocked = bStp?.portState === 'blocking' && bStp.portRole !== 'disabled';
            const stpBlocked = phyUp && (aBlocked || bBlocked);

            let color = '#ef4444';
            let dash: string | undefined = '5 3';
            let width = 2;
            if (phyUp && !stpBlocked) {
              color = '#10b981';
              dash = undefined;
              width = 3;
            } else if (stpBlocked) {
              color = '#f59e0b';
              dash = '4 2';
              width = 2.5;
            }

            const p1 = edgePoint(na, nb);
            const p2 = edgePoint(nb, na);
            const shortA = shortIf(link.aIf);
            const shortB = shortIf(link.bIf);
            const la = labelNearEnd(na, p1);
            const lb = labelNearEnd(nb, p2);

            const roleA = aStp?.portRole;
            const roleB = bStp?.portRole;
            const roleLabel = (r?: string) => r === 'root' ? 'RP' : r === 'designated' ? 'DP' : r === 'nondesignated' ? 'ND' : '';

            return (
              <g key={`link-${idx}`}>
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={color} strokeWidth={width} strokeDasharray={dash} />
                <text x={la.x} y={la.y - 2} textAnchor="middle" fontSize="8" fill="#e2e8f0" className="font-mono pointer-events-none">
                  {shortA}{roleLabel(roleA) ? ` ${roleLabel(roleA)}` : ''}{aBlocked ? ' ⊘' : ''}
                </text>
                <text x={lb.x} y={lb.y - 2} textAnchor="middle" fontSize="8" fill="#e2e8f0" className="font-mono pointer-events-none">
                  {shortB}{roleLabel(roleB) ? ` ${roleLabel(roleB)}` : ''}{bBlocked ? ' ⊘' : ''}
                </text>
              </g>
            );
          })}
          {nodes.map(node => {
            const isActive = node.id === activeDeviceId;
            const isRoot = node.id === rootDevice;
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
                aria-label={`Коммутатор ${node.hostname}${isActive ? ', активный' : ''}${isRoot ? ', Root Bridge' : ''}`}
                className="focus:outline-none"
              >
                <rect
                  x={node.x - node.width / 2}
                  y={node.y - node.height / 2}
                  width={node.width}
                  height={node.height}
                  rx={6}
                  fill={isActive ? '#0e7490' : isRoot ? '#064e3b' : '#1e293b'}
                  stroke={isActive ? '#22d3ee' : isRoot ? '#34d399' : '#475569'}
                  strokeWidth={isActive || isRoot ? 2.5 : 1.5}
                />
                <text
                  x={node.x}
                  y={node.y + 4}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="bold"
                  fill="#f1f5f9"
                  className="font-mono select-none pointer-events-none"
                >
                  {node.hostname}{isRoot ? ' ★' : ''}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="px-3 py-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono border-t border-slate-100 dark:border-slate-800 space-y-0.5">
        <div>Клик / Enter — консоль · ★ Root Bridge</div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          <span><span className="text-emerald-500">━</span> Forwarding</span>
          <span><span className="text-amber-500">━</span> STP Blocking ⊘</span>
          <span><span className="text-red-500">━</span> PHY down</span>
          <span>RP Root · DP Designated · ND Non-des</span>
        </div>
      </div>
    </div>
  );
};
