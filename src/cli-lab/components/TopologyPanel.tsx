import React from 'react';
import { DeviceState, NetworkState } from '../engine/types';
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

const NODE_W = 90;
const NODE_H = 48;

function layoutDevices(devices: Record<string, DeviceState>): NodePos[] {
  const ids = Object.keys(devices).sort(); // stable order
  const n = ids.length;
  if (n === 0) return [];

  const make = (id: string, x: number, y: number): NodePos => ({
    id,
    x,
    y,
    hostname: devices[id].hostname,
    width: NODE_W,
    height: NODE_H,
  });

  if (n === 1) return [make(ids[0], 200, 90)];
  if (n === 2) {
    return [make(ids[0], 100, 90), make(ids[1], 300, 90)];
  }
  if (n === 3) {
    return [make(ids[0], 70, 90), make(ids[1], 200, 90), make(ids[2], 330, 90)];
  }
  // 4 devices: square ring
  if (n === 4) {
    return [
      make(ids[0], 90, 50),   // top-left
      make(ids[1], 310, 50),  // top-right
      make(ids[2], 310, 150), // bottom-right
      make(ids[3], 90, 150),  // bottom-left
    ];
  }
  // fallback linear for >4
  const start = 50;
  const step = Math.min(120, 300 / Math.max(1, n - 1));
  return ids.map((id, i) => make(id, start + i * step, 90));
}

/** Compute point on the border of the rect closest to the direction toward `other`. */
function edgePoint(node: NodePos, other: NodePos): { x: number; y: number } {
  const dx = other.x - node.x;
  const dy = other.y - node.y;
  const hw = node.width / 2;
  const hh = node.height / 2;
  if (dx === 0 && dy === 0) return { x: node.x, y: node.y };
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const scale = Math.max(absDx / hw, absDy / hh);
  return {
    x: node.x + dx / scale,
    y: node.y + dy / scale,
  };
}

function shortIf(name: string): string {
  return name
    .replace(/FastEthernet/g, 'Fa')
    .replace(/GigabitEthernet/g, 'Gi')
    .replace(/Ethernet/g, 'Et');
}

export const TopologyPanel: React.FC<TopologyPanelProps> = ({
  state,
  activeDeviceId,
  onSelectDevice,
  collapsed = false,
  onToggleCollapse,
}) => {
  const nodes = layoutDevices(state.devices);
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
  const height = nodes.some(n => n.y > 120) ? 220 : 180;

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
          {/* Links first (behind nodes) */}
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
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            const shortA = shortIf(link.aIf);
            const shortB = shortIf(link.bIf);
            // Offset labels slightly perpendicular to avoid overlap with line
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const len = Math.hypot(dx, dy) || 1;
            const ox = (-dy / len) * 10;
            const oy = (dx / len) * 10;
            return (
              <g key={`link-${idx}`}>
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={color} strokeWidth={up ? 3 : 2} strokeDasharray={up ? undefined : '5 3'} />
                <text x={midX + ox} y={midY + oy} textAnchor="middle" fontSize="8.5" fill="#64748b" className="font-mono pointer-events-none">
                  {shortA} ↔ {shortB}
                </text>
              </g>
            );
          })}
          {/* Nodes */}
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
                  className={isActive ? '' : 'focus-within:stroke-cyan-400'}
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
