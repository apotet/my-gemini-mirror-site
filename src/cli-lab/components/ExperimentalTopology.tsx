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

const NODE_W = 140;
const NODE_H = 72;

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

  // Larger spacing so labels fit next to ends
  if (n === 1) return [make(ids[0], 300, 180)];
  if (n === 2) return [make(ids[0], 160, 180), make(ids[1], 480, 180)];
  if (n === 3) return [make(ids[0], 120, 180), make(ids[1], 340, 180), make(ids[2], 560, 180)];
  if (n === 4) {
    return [
      make(ids[0], 160, 100),
      make(ids[1], 480, 100),
      make(ids[2], 480, 280),
      make(ids[3], 160, 280),
    ];
  }
  const cols = Math.ceil(Math.sqrt(n));
  return ids.map((id, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return make(id, 140 + col * 220, 100 + row * 160);
  });
}

/** Attachment point on the side of the chassis facing the other device. */
function borderPoint(node: NodePos, other: NodePos): { x: number; y: number; side: 'left' | 'right' | 'top' | 'bottom' } {
  const dx = other.x - node.x;
  const dy = other.y - node.y;
  const hw = node.width / 2;
  const hh = node.height / 2;
  if (Math.abs(dx) >= Math.abs(dy)) {
    const side = dx > 0 ? 'right' : 'left';
    const x = node.x + (dx > 0 ? hw : -hw);
    const y = node.y + Math.max(-hh + 12, Math.min(hh - 12, (dy / (Math.abs(dx) || 1)) * hh * 0.3));
    return { x, y, side };
  } else {
    const side = dy > 0 ? 'bottom' : 'top';
    const y = node.y + (dy > 0 ? hh : -hh);
    const x = node.x + Math.max(-hw + 12, Math.min(hw - 12, (dx / (Math.abs(dy) || 1)) * hw * 0.3));
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
  const [pan, setPan] = useState({ x: 20, y: 20 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const contentBounds = useMemo(() => {
    if (nodes.length === 0) return { minX: 0, minY: 0, maxX: 600, maxY: 300 };
    const minX = Math.min(...nodes.map(n => n.x - n.width / 2)) - 60;
    const maxX = Math.max(...nodes.map(n => n.x + n.width / 2)) + 60;
    const minY = Math.min(...nodes.map(n => n.y - n.height / 2)) - 40;
    const maxY = Math.max(...nodes.map(n => n.y + n.height / 2)) + 50;
    return { minX, maxX, minY, maxY };
  }, [nodes]);

  const fitToScreen = () => {
    if (!containerRef.current || nodes.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const contentW = contentBounds.maxX - contentBounds.minX;
    const contentH = contentBounds.maxY - contentBounds.minY;
    const s = Math.min((rect.width - 24) / contentW, (rect.height - 24) / contentH, 1.6);
    setScale(Math.max(0.5, s));
    setPan({
      x: (rect.width - contentW * s) / 2 - contentBounds.minX * s,
      y: (rect.height - contentH * s) / 2 - contentBounds.minY * s,
    });
  };

  useEffect(() => {
    const t = setTimeout(fitToScreen, 50);
    return () => clearTimeout(t);
  }, [nodes.length, contentBounds.maxX]);

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

  const svgW = Math.max(700, contentBounds.maxX + 40);
  const svgH = Math.max(360, contentBounds.maxY + 40);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 overflow-hidden flex flex-col" style={{ minHeight: 340 }}>
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Топология · экспериментальная</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setScale(s => Math.min(2.2, s + 0.2))} className="text-xs px-2 py-0.5 rounded border border-slate-300 dark:border-slate-600">+</button>
          <button type="button" onClick={() => setScale(s => Math.max(0.4, s - 0.2))} className="text-xs px-2 py-0.5 rounded border border-slate-300 dark:border-slate-600">−</button>
          <button type="button" onClick={fitToScreen} className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold px-2">Вписать</button>
          {onToggleCollapse && (
            <button type="button" onClick={onToggleCollapse} className="text-[11px] text-slate-500">Скрыть</button>
          )}
        </div>
      </div>
      <div
        ref={containerRef}
        className="relative overflow-hidden bg-slate-950/30"
        style={{ height: 300 }}
        onMouseDown={(e) => { setDragging(true); setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y }); }}
        onMouseMove={(e) => { if (dragging) setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); }}
        onMouseUp={() => setDragging(false)}
        onMouseLeave={() => setDragging(false)}
        onWheel={(e) => { e.preventDefault(); setScale(s => Math.max(0.35, Math.min(2.5, s - e.deltaY * 0.0012))); }}
      >
        <svg
          width={svgW}
          height={svgH}
          className="absolute"
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

            const color = !phyUp ? '#ef4444' : (aBlocked || bBlocked) ? '#f59e0b' : '#22c55e';
            const dash = !phyUp ? '6 3' : (aBlocked || bBlocked) ? '5 3' : undefined;

            const labelPos = (side: string, px: number, py: number) => {
              if (side === 'left') return { x: px - 6, y: py - 8, anchor: 'end' as const };
              if (side === 'right') return { x: px + 6, y: py - 8, anchor: 'start' as const };
              if (side === 'top') return { x: px, y: py - 10, anchor: 'middle' as const };
              return { x: px, y: py + 14, anchor: 'middle' as const };
            };
            const la = labelPos(pa.side, pa.x, pa.y);
            const lb = labelPos(pb.side, pb.x, pb.y);

            const roleA = aStp?.portRole;
            const roleB = bStp?.portRole;
            const roleShort = (r?: string) => r === 'root' ? 'RP' : r === 'designated' ? 'DP' : r === 'nondesignated' ? 'ND' : '';

            return (
              <g key={`link-${idx}`}>
                <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke={color} strokeWidth={phyUp ? 3 : 2} strokeDasharray={dash} />
                <circle cx={pa.x} cy={pa.y} r={5} fill={color} stroke="#020617" strokeWidth={1.5} />
                <circle cx={pb.x} cy={pb.y} r={5} fill={color} stroke="#020617" strokeWidth={1.5} />
                <text x={la.x} y={la.y} textAnchor={la.anchor} fontSize="11" fontWeight="600" fill="#f1f5f9" className="font-mono pointer-events-none">
                  {shortIf(link.aIf)}{roleShort(roleA) ? ` ${roleShort(roleA)}` : ''}{aBlocked ? ' ⊘' : ''}
                </text>
                <text x={lb.x} y={lb.y} textAnchor={lb.anchor} fontSize="11" fontWeight="600" fill="#f1f5f9" className="font-mono pointer-events-none">
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
                  rx={10}
                  fill={isActive ? '#0e7490' : isRoot ? '#064e3b' : '#1e293b'}
                  stroke={isActive ? '#22d3ee' : isRoot ? '#34d399' : '#64748b'}
                  strokeWidth={isActive || isRoot ? 3 : 2}
                />
                <text x={node.x} y={node.y + 5} textAnchor="middle" fontSize="15" fontWeight="bold" fill="#f8fafc" className="font-mono pointer-events-none">
                  {node.hostname}{isRoot ? ' ★' : ''}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="px-3 py-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono border-t border-slate-100 dark:border-slate-800">
        ★ Root · RP/DP/ND · ⊘ STP Block · красный = PHY down · колесо/кнопки — масштаб · перетаскивание · Вписать
      </div>
    </div>
  );
};
