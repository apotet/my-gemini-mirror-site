import React, { useMemo, useState, useRef, useEffect } from 'react';
import { DeviceState, NetworkState, NetworkLink } from '../engine/types';
import { interfaceStatus } from '../engine/OperationalState';
import { deriveSpanningTree, type SpanningTreeResult } from '../engine/SpanningTree';

interface ExperimentalTopologyProps {
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

const NODE_W = 110;
const NODE_H = 60;

function shortIf(name: string): string {
  return name
    .replace(/FastEthernet/g, 'Fa')
    .replace(/GigabitEthernet/g, 'Gi')
    .replace(/Ethernet/g, 'Et')
    .replace(/Port-channel/g, 'Po');
}

function layoutDevices(devices: Record<string, DeviceState>, links: NetworkLink[]): NodePos[] {
  const ids = Object.keys(devices).sort();
  const n = ids.length;
  if (n === 0) return [];

  const make = (id: string, x: number, y: number): NodePos => ({
    id, x, y,
    hostname: devices[id].hostname,
    width: NODE_W,
    height: NODE_H,
  });

  if (n === 1) return [make(ids[0], 200, 140)];
  if (n === 2) return [make(ids[0], 120, 140), make(ids[1], 340, 140)];
  if (n === 3) return [make(ids[0], 80, 140), make(ids[1], 230, 140), make(ids[2], 380, 140)];
  if (n === 4) {
    return [
      make(ids[0], 100, 80),
      make(ids[1], 340, 80),
      make(ids[2], 340, 220),
      make(ids[3], 100, 220),
    ];
  }
  const cols = Math.ceil(Math.sqrt(n));
  return ids.map((id, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return make(id, 80 + col * 160, 70 + row * 120);
  });
}

/** Compute attachment point on the device border facing the other device. */
function borderPoint(node: NodePos, other: NodePos): { x: number; y: number; side: 'left' | 'right' | 'top' | 'bottom' } {
  const dx = other.x - node.x;
  const dy = other.y - node.y;
  const hw = node.width / 2;
  const hh = node.height / 2;
  if (Math.abs(dx) > Math.abs(dy)) {
    const side = dx > 0 ? 'right' : 'left';
    const x = node.x + (dx > 0 ? hw : -hw);
    const y = node.y + Math.max(-hh + 8, Math.min(hh - 8, (dy / Math.abs(dx || 1)) * hh * 0.4));
    return { x, y, side };
  } else {
    const side = dy > 0 ? 'bottom' : 'top';
    const y = node.y + (dy > 0 ? hh : -hh);
    const x = node.x + Math.max(-hw + 8, Math.min(hw - 8, (dx / Math.abs(dy || 1)) * hw * 0.4));
    return { x, y, side };
  }
}

export const ExperimentalTopology: React.FC<ExperimentalTopologyProps> = ({
  state,
  activeDeviceId,
  onSelectDevice,
  collapsed = false,
  onToggleCollapse,
}) => {
  const nodes = useMemo(() => layoutDevices(state.devices, state.links), [state.devices, state.links]);
  const nodeMap = useMemo(() => Object.fromEntries(nodes.map(n => [n.id, n])), [nodes]);

  const tree = useMemo<SpanningTreeResult | null>(() => {
    try { return deriveSpanningTree(state, { kind: 'cst' }); } catch { return null; }
  }, [state]);
  const rootDevice = tree ? Object.values(tree.bridges)[0]?.rootDevice ?? null : null;

  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const fitToScreen = () => {
    if (!containerRef.current || nodes.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const minX = Math.min(...nodes.map(n => n.x - n.width / 2)) - 40;
    const maxX = Math.max(...nodes.map(n => n.x + n.width / 2)) + 40;
    const minY = Math.min(...nodes.map(n => n.y - n.height / 2)) - 40;
    const maxY = Math.max(...nodes.map(n => n.y + n.height / 2)) + 60;
    const contentW = maxX - minX;
    const contentH = maxY - minY;
    const s = Math.min(rect.width / contentW, rect.height / contentH, 1.4);
    setScale(s);
    setPan({ x: (rect.width - contentW * s) / 2 - minX * s, y: (rect.height - contentH * s) / 2 - minY * s });
  };

  useEffect(() => { fitToScreen(); }, [nodes.length]);

  if (collapsed) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-2 flex items-center justify-between text-xs">
        <span className="font-mono text-slate-500">Топология скрыта</span>
        {onToggleCollapse && (
          <button type="button" onClick={onToggleCollapse} className="text-cyan-600 dark:text-cyan-400 font-semibold">Показать схему</button>
        )}
      </div>
    );
  }

  const width = 500;
  const height = 320;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 overflow-hidden flex flex-col h-full min-h-[280px]">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Топология · экспериментальная</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setScale(s => Math.min(2, s + 0.15))} className="text-xs px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600">+</button>
          <button type="button" onClick={() => setScale(s => Math.max(0.5, s - 0.15))} className="text-xs px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600">−</button>
          <button type="button" onClick={fitToScreen} className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold">Вписать</button>
          {onToggleCollapse && (
            <button type="button" onClick={onToggleCollapse} className="text-[11px] text-slate-500">Скрыть</button>
          )}
        </div>
      </div>
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-slate-950/20 cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => { setDragging(true); setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y }); }}
        onMouseMove={(e) => { if (dragging) setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); }}
        onMouseUp={() => setDragging(false)}
        onMouseLeave={() => setDragging(false)}
        onWheel={(e) => { e.preventDefault(); setScale(s => Math.max(0.4, Math.min(2.2, s - e.deltaY * 0.001))); }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="absolute inset-0 w-full h-full"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, transformOrigin: '0 0' }}
        >
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

            const pa = borderPoint(na, nb);
            const pb = borderPoint(nb, na);

            const color = !phyUp ? '#ef4444' : (aBlocked || bBlocked) ? '#f59e0b' : '#10b981';
            const dash = !phyUp ? '6 3' : (aBlocked || bBlocked) ? '4 2' : undefined;

            const labelOffset = (side: string, isA: boolean) => {
              const ox = side === 'left' ? -28 : side === 'right' ? 28 : 0;
              const oy = side === 'top' ? -16 : side === 'bottom' ? 16 : 0;
              return { ox, oy };
            };
            const la = labelOffset(pa.side, true);
            const lb = labelOffset(pb.side, false);

            const roleA = aStp?.portRole;
            const roleB = bStp?.portRole;
            const roleShort = (r?: string) => r === 'root' ? 'RP' : r === 'designated' ? 'DP' : r === 'nondesignated' ? 'ND' : '';

            return (
              <g key={`link-${idx}`}>
                <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke={color} strokeWidth={phyUp ? 2.5 : 1.5} strokeDasharray={dash} />
                {/* Port markers on chassis */}
                <circle cx={pa.x} cy={pa.y} r={3.5} fill={color} stroke="#0f172a" strokeWidth={1} />
                <circle cx={pb.x} cy={pb.y} r={3.5} fill={color} stroke="#0f172a" strokeWidth={1} />
                {/* Labels tightly next to ends */}
                <text x={pa.x + la.ox} y={pa.y + la.oy} textAnchor={pa.side === 'left' ? 'end' : pa.side === 'right' ? 'start' : 'middle'} fontSize="9" fill="#e2e8f0" className="font-mono pointer-events-none">
                  {shortIf(link.aIf)}{roleShort(roleA) ? ` ${roleShort(roleA)}` : ''}{aBlocked ? ' ⊘' : ''}
                </text>
                <text x={pb.x + lb.ox} y={pb.y + lb.oy} textAnchor={pb.side === 'left' ? 'end' : pb.side === 'right' ? 'start' : 'middle'} fontSize="9" fill="#e2e8f0" className="font-mono pointer-events-none">
                  {shortIf(link.bIf)}{roleShort(roleB) ? ` ${roleShort(roleB)}` : ''}{bBlocked ? ' ⊘' : ''}
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
                style={{ cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                aria-label={`${node.hostname}${isRoot ? ' Root' : ''}`}
              >
                <rect
                  x={node.x - node.width / 2}
                  y={node.y - node.height / 2}
                  width={node.width}
                  height={node.height}
                  rx={8}
                  fill={isActive ? '#0e7490' : isRoot ? '#064e3b' : '#1e293b'}
                  stroke={isActive ? '#22d3ee' : isRoot ? '#34d399' : '#475569'}
                  strokeWidth={isActive || isRoot ? 2.5 : 1.5}
                />
                <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#f1f5f9" className="font-mono pointer-events-none">
                  {node.hostname}{isRoot ? ' ★' : ''}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="px-3 py-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono border-t border-slate-100 dark:border-slate-800">
        ★ Root · RP/DP/ND · ⊘ STP Block · красный = PHY down · колесо/кнопки — масштаб · перетаскивание
      </div>
    </div>
  );
};
