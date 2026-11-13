import React, { useState } from 'react';
import { getPortDetails } from '../portDetails';
import { DeviceState, NetworkState, NetworkLink } from '../engine/types';
import { interfaceStatus } from '../engine/OperationalState';
import { deriveSpanningTree, type SpanningTreeResult } from '../engine/SpanningTree';
import type { TopologyLayer } from '../topologyLayers';

interface TopologyPanelProps {
  state: NetworkState;
  layer?: TopologyLayer;
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

const NODE_W = 128;
const NODE_H = 72;

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

  if (n === 1) return [make(ordered[0], 380, 210)];
  if (n === 2) return [make(ordered[0], 185, 210), make(ordered[1], 575, 210)];
  if (n === 3) return [make(ordered[0], 140, 210), make(ordered[1], 380, 210), make(ordered[2], 620, 210)];
  if (n === 4) {
    // Follow physical adjacency for a readable square ring.
    return [
      make(ordered[0], 185, 115),
      make(ordered[1], 575, 115),
      make(ordered[2], 575, 330),
      make(ordered[3], 185, 330),
    ];
  }
  // Larger topologies use a two-row grid instead of shrinking devices to dots.
  return ordered.map((id, i) => make(id, 130 + (i % 3) * 250, 115 + Math.floor(i / 3) * 210));
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
  const outward = 21;
  const perpendicular = 24;
  return {
    x: edge.x + (dx / len) * outward - (dy / len) * perpendicular,
    y: edge.y + (dy / len) * outward + (dx / len) * perpendicular,
  };
}

export const TopologyPanel: React.FC<TopologyPanelProps> = ({
  state,
  layer = 'stp',
  activeDeviceId,
  onSelectDevice,
  collapsed = false,
  onToggleCollapse,
}) => {
  const [selection, setSelection] = useState<{ deviceId: string; interfaceName: string } | null>(null);
  const details = selection ? getPortDetails(state, selection.deviceId, selection.interfaceName) : null;
  const selectPort = (deviceId: string, interfaceName: string) => {
    setSelection(current => current?.deviceId === deviceId && current?.interfaceName === interfaceName
      ? null : { deviceId, interfaceName });
  };
  const nodes = layoutDevices(state.devices, state.links);
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));

  // Pure call — no cached runtime, recomputed every render from NetworkState.
  let tree: SpanningTreeResult | null = null;
  try {
    if (layer === 'stp') tree = deriveSpanningTree(state, { kind: 'cst' });
  } catch {
    tree = null;
  }
  // Every disconnected STP component elects its own root. Never infer a
  // single global root from the first bridge in the result.
  const rootDevices = new Set(
    Object.values(tree?.bridges ?? {}).map(bridge => bridge.rootDevice),
  );

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

  const width = 760;
  const height = nodes.length > 4 ? 110 + Math.ceil(nodes.length / 3) * 210 : nodes.length === 4 ? 445 : 420;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">Схема соединений</span>
        {onToggleCollapse && (
          <button type="button" onClick={onToggleCollapse} className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            Скрыть
          </button>
        )}
      </div>
      <div className="p-2 overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="block w-full h-auto min-h-[260px] max-h-[600px]" role="img" aria-label="Сетевая топология">
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
            const stpBlocked = layer === 'stp' && phyUp && (aBlocked || bBlocked);

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
            const portInfo = (iface: typeof aIf) => {
              if (layer !== 'vlan') return '';
              if (!iface?.switchport) return '';
              const sw = iface.switchport;
              if (sw.mode === 'access') return ` A:${sw.accessVlan ?? 1}`;
              if (sw.mode === 'trunk') return ' TRK';
              return '';
            };
            const la = labelNearEnd(na, p1);
            const lb = labelNearEnd(nb, p2);

            const roleA = aStp?.portRole;
            const roleB = bStp?.portRole;
            const roleLabel = (r?: string) => r === 'root' ? 'RP' : r === 'designated' ? 'DP' : r === 'nondesignated' ? 'ND' : '';

            return (
              <g key={`link-${idx}`}>
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={color} strokeWidth={Math.max(width, 4)} strokeDasharray={dash} />
                <g role="button" tabIndex={0} aria-label={`Параметры порта ${aDev.hostname} ${link.aIf}`}
                  onClick={() => selectPort(link.a, link.aIf)}
                  onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectPort(link.a, link.aIf); } }}
                  className="cursor-pointer focus:outline-none">
                  <circle cx={la.x} cy={la.y - 4} r={24} fill="transparent" stroke={selection?.deviceId === link.a && selection.interfaceName === link.aIf ? '#22d3ee' : 'transparent'} strokeWidth={1.5} />
                  <text x={la.x} y={la.y - 2} textAnchor="middle" fontSize="14" fill="#e2e8f0" paintOrder="stroke" stroke="#0f172a" strokeWidth="3" strokeLinejoin="round" className="font-mono pointer-events-none">
                  {shortA}{portInfo(aIf)}{roleLabel(roleA) ? ` ${roleLabel(roleA)}` : ''}{aBlocked && layer === 'stp' ? ' ⊘' : ''}
                  </text>
                </g>
                <g role="button" tabIndex={0} aria-label={`Параметры порта ${bDev.hostname} ${link.bIf}`}
                  onClick={() => selectPort(link.b, link.bIf)}
                  onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectPort(link.b, link.bIf); } }}
                  className="cursor-pointer focus:outline-none">
                  <circle cx={lb.x} cy={lb.y - 4} r={24} fill="transparent" stroke={selection?.deviceId === link.b && selection.interfaceName === link.bIf ? '#22d3ee' : 'transparent'} strokeWidth={1.5} />
                  <text x={lb.x} y={lb.y - 2} textAnchor="middle" fontSize="14" fill="#e2e8f0" paintOrder="stroke" stroke="#0f172a" strokeWidth="3" strokeLinejoin="round" className="font-mono pointer-events-none">
                  {shortB}{portInfo(bIf)}{roleLabel(roleB) ? ` ${roleLabel(roleB)}` : ''}{bBlocked && layer === 'stp' ? ' ⊘' : ''}
                  </text>
                </g>
              </g>
            );
          })}
          {nodes.map(node => {
            const isActive = node.id === activeDeviceId;
            const isRoot = layer === 'stp' && rootDevices.has(node.id);
            const ip = layer === 'ip'
              ? Object.values(state.devices[node.id].interfaces)
                .filter(iface => iface.ipv4)
                .map(iface => `${shortIf(iface.name)} ${iface.ipv4!.address}/${iface.ipv4!.prefix}`)
              : [];
            const firstIp = ip[0] ?? '';
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
                {/* Actual switch chassis, not a tiny abstract pill. */}
                <rect x={node.x - node.width/2} y={node.y - node.height/2}
                  width={node.width} height={node.height} rx={12}
                  fill={isActive ? '#155e75' : isRoot ? '#14532d' : '#1e293b'}
                  stroke={isActive ? '#22d3ee' : isRoot ? '#34d399' : '#94a3b8'}
                  strokeWidth={isActive || isRoot ? 3 : 2} />
                <rect x={node.x-51} y={node.y-25} width={102} height={28}
                  rx={4} fill="#0b1220" stroke="#64748b" />
                {Array.from({length: 8}, (_, index) => (
                  <rect key={index} x={node.x-43+index*12} y={node.y-19}
                    width={8} height={13} rx={1} fill="#334155" stroke="#94a3b8" strokeWidth={0.6}/>
                ))}
                <circle cx={node.x+47} cy={node.y-19} r={2.5} fill="#34d399" />
                <text x={node.x} y={node.y+22} textAnchor="middle"
                  fontSize={17} fontWeight="bold" fill="#f8fafc"
                  className="font-mono select-none pointer-events-none">
                  {node.hostname}{isRoot ? ' ★' : ''}
                </text>
                {firstIp && (
                  <text x={node.x} y={node.y+48} textAnchor="middle" fontSize={13}
                    fill="#bae6fd" paintOrder="stroke" stroke="#0f172a" strokeWidth={2.5}
                    className="font-mono pointer-events-none">
                    {firstIp.length > 25 ? `${firstIp.slice(0,24)}…` : firstIp}{ip.length > 1 ? ' (+)' : ''}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      {state.links.length > 0 && (
        <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-1.5" aria-label="Порты соединений">
          {state.links.flatMap((link, index) => ([
            { id: link.a, iface: link.aIf, key: `${index}-a` },
            { id: link.b, iface: link.bIf, key: `${index}-b` },
          ])).map(item => (
            <button key={item.key} type="button" onClick={() => selectPort(item.id, item.iface)}
              aria-pressed={selection?.deviceId === item.id && selection.interfaceName === item.iface}
              className={selection?.deviceId === item.id && selection.interfaceName === item.iface
                ? 'rounded-lg bg-cyan-500 px-2 py-1 text-[11px] font-semibold text-slate-950'
                : 'rounded-lg border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] text-slate-700 dark:text-slate-300'}>
              {state.devices[item.id]?.hostname} {shortIf(item.iface)}
            </button>
          ))}
        </div>
      )}
      {details && (
        <section className="mx-3 my-2 rounded-xl border border-cyan-500/40 bg-slate-50 dark:bg-slate-950/60 p-3 space-y-2 text-xs"
          aria-label="Параметры выбранного порта" aria-live="polite">
          <div className="flex items-center justify-between gap-2">
            <strong className="text-slate-900 dark:text-white">{details.deviceName} · {details.interfaceName}</strong>
            <button type="button" onClick={() => setSelection(null)} aria-label="Закрыть параметры порта"
              className="text-cyan-700 dark:text-cyan-300 font-semibold">Закрыть ×</button>
          </div>
          <dl className="grid grid-cols-[minmax(95px,auto)_minmax(0,1fr)] gap-x-3 gap-y-1 text-slate-700 dark:text-slate-300">
            <dt>Админ.</dt><dd>{details.admin}</dd>
            <dt>Физика</dt><dd>{details.physical} · protocol {details.protocol}</dd>
            <dt>Сосед</dt><dd>{details.peer ?? 'нет смоделированного линка'}</dd>
            <dt>Режим</dt><dd>{details.switchport?.mode ?? 'L3 / без switchport'}</dd>
            {details.switchport?.mode === 'access' && (
              <><dt>Access VLAN</dt><dd>{details.switchport.accessVlan ?? 1}</dd></>
            )}
            {details.switchport?.mode === 'trunk' && (
              <><dt>Allowed VLAN</dt><dd>{details.switchport.trunkAllowed?.join(', ') ?? 'all (по умолчанию)'}</dd></>
            )}
            {details.ipv4 && (
              <><dt>IPv4</dt><dd>{details.ipv4.address}/{details.ipv4.prefix} · {details.ipv4.mask}</dd></>
            )}
            {details.stp && (
              <>
                <dt>STP CST</dt><dd>{details.stp.role} · {details.stp.state}</dd>
                <dt>Root / Cost</dt><dd>{state.devices[details.stp.root]?.hostname ?? details.stp.root} · {details.stp.pathCost}</dd>
                <dt>Port Priority</dt><dd>{details.stp.portPriority}</dd>
              </>
            )}
            {details.stpError && <><dt>STP ошибка</dt><dd>{details.stpError}</dd></>}
          </dl>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Read-only: параметры из текущего NetworkState. PHY up не гарантирует STP forwarding или связь между VLAN.
          </p>
          <button type="button" onClick={() => onSelectDevice(details.deviceId)}
            className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 underline">
            Перейти в консоль {details.deviceName}
          </button>
        </section>
      )}
      <div className="px-3 py-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono border-t border-slate-100 dark:border-slate-800 space-y-0.5">
        <div>Клик по устройству — консоль · по порту — параметры{layer === 'stp' ? ' · ★ Root Bridge' : ''}</div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          <span><span className="text-emerald-500">━</span> {layer === 'stp' ? 'STP Forwarding' : 'PHY up'}</span>
          {layer === 'stp' && <span><span className="text-amber-500">━</span> STP Blocking ⊘</span>}
          <span><span className="text-red-500">━</span> PHY down</span>
          {layer === 'stp' && <span>RP Root · DP Designated · ND Non-des</span>}
          {layer === 'vlan' && <span>A:10 — access VLAN 10 · TRK — trunk (allowed VLAN проверяй в CLI)</span>}
          {layer === 'ip' && <span>IP — адрес интерфейса из конфигурации, не гарантия доступности</span>}
        </div>
      </div>
    </div>
  );
};
