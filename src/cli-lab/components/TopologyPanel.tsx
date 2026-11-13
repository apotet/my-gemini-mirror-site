import React from 'react';
import { NetworkState } from '../engine/types';
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
}

function layoutDevices(devices: Record<string, any>): NodePos[] {
  const ids = Object.keys(devices);
  const n = ids.length;
  if (n === 0) return [];
  if (n === 1) return [{ id: ids[0], x: 200, y: 80, hostname: devices[ids[0]].hostname }];
  if (n === 2) {
    return [
      { id: ids[0], x: 90, y: 80, hostname: devices[ids[0]].hostname },
      { id: ids[1], x: 310, y: 80, hostname: devices[ids[1]].hostname },
    ];
  }
  // 3 or more: simple horizontal
  const start = 60;
  const step = Math.min(140, 280 / (n - 1));
  return ids.map((id, i) => ({
    id,
    x: start + i * step,
    y: 80 + (i % 2 === 1 ? 20 : 0), // slight stagger to reduce label overlap
    hostname: devices[id].hostname,
  }));
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
  const height = 180;

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
          {/* Links */}
          {state.links.map((link, idx) => {
            const na = nodeMap[link.a];
            const nb = nodeMap[link.b];
            if (!na || !nb) return null;
            const aStatus = interfaceStatus(state, state.devices[link.a], state.devices[link.a].interfaces[link.aIf] || { name: link.aIf, adminUp: false });
            const bStatus = interfaceStatus(state, state.devices[link.b], state.devices[link.b].interfaces[link.bIf] || { name: link.bIf, adminUp: false });
            const up = link.up && aStatus.operUp && bStatus.operUp;
            const color = up ? '#10b981' : '#ef4444';
            const midX = (na.x + nb.x) / 2;
            const midY = (na.y + nb.y) / 2;
            const shortA = link.aIf.replace(/FastEthernet/, 'Fa').replace(/GigabitEthernet/, 'Gi');
            const shortB = link.bIf.replace(/FastEthernet/, 'Fa').replace(/GigabitEthernet/, 'Gi');
            return (
              <g key={idx}>
                <line x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke={color} strokeWidth={up ? 3 : 2} strokeDasharray={up ? undefined : '4 3'} />
                <text x={midX} y={midY - 8} textAnchor="middle" fontSize="9" fill="#64748b" className="font-mono">
                  {shortA} ↔ {shortB}
                </text>
              </g>
            );
          })}
          {/* Nodes */}
          {nodes.map(node => {
            const isActive = node.id === activeDeviceId;
            return (
              <g key={node.id} onClick={() => onSelectDevice(node.id)} style={{ cursor: 'pointer' }} role="button" tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectDevice(node.id); } }}>
                <rect x={node.x - 40} y={node.y - 22} width={80} height={44} rx={6}
                  fill={isActive ? '#0e7490' : '#1e293b'} stroke={isActive ? '#22d3ee' : '#475569'} strokeWidth={isActive ? 2.5 : 1.5} />
                <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#f1f5f9" className="font-mono select-none">
                  {node.hostname}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="px-3 py-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono border-t border-slate-100 dark:border-slate-800">
        Клик по коммутатору переключает консоль · зелёный линк = физически up
      </div>
    </div>
  );
};
