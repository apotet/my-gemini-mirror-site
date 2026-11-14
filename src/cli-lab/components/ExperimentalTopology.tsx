import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Unplug, Cable, Terminal, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { InterfaceState, NetworkState } from '../engine/types';
import type { TopologyLayer } from '../topologyLayers';
import { interfaceStatus } from '../engine/OperationalState';
import { deriveSpanningTree, type SpanningTreeResult } from '../engine/SpanningTree';
import { checkHostIpv4Reachability } from '../engine/HostIpv4Reachability';
import { getPortDetails } from '../portDetails';
import { HostPingPanel } from './HostPingPanel';
import {
  computeGraphBounds,
  computeTopologyLayout,
  placePortLabels,
  shortIf,
  type LayoutNode,
  type PortLabelSpec,
} from './topologyLayout';

interface ExperimentalTopologyProps {
  state: NetworkState;
  layer?: TopologyLayer;
  activeDeviceId: string;
  onSelectDevice: (id: string) => void;
  onToggleLink?: (linkIndex: number) => void;
  /** Natural-size scrollable canvas for a narrow fullscreen rail. */
  scrollable?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

type Selection =
  | { kind: 'port'; deviceId: string; interfaceName: string; linkIndex?: number }
  | { kind: 'link'; linkIndex: number }
  | { kind: 'host'; hostId: string }
  | null;

interface ViewTransform {
  scale: number;
  tx: number;
  ty: number;
}

function vlanAccent(vlanId?: number): string {
  if (vlanId === 10) return '#0ea5e9';
  if (vlanId === 20) return '#a78bfa';
  if (vlanId === 30) return '#14b8a6';
  if (vlanId === 1) return '#64748b';
  return '#10b981';
}

function stpRoleTag(role?: string): string {
  if (role === 'root') return 'RP';
  if (role === 'designated') return 'DP';
  if (role === 'nondesignated') return 'ND';
  return '';
}

function isPhysicalPort(iface: InterfaceState): boolean {
  return !/^Vlan\d+$/i.test(iface.name);
}

export const ExperimentalTopology: React.FC<ExperimentalTopologyProps> = ({
  state,
  layer = 'stp',
  activeDeviceId,
  onSelectDevice,
  onToggleLink,
  collapsed = false,
  scrollable = false,
  onToggleCollapse,
}) => {
  const [selection, setSelection] = useState<Selection>(null);
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 720, height: 360 });
  const [transform, setTransform] = useState<ViewTransform>({ scale: 1, tx: 0, ty: 0 });

  const stageRef = useRef<HTMLDivElement>(null);
  const tree = useMemo<SpanningTreeResult | null>(() => {
    try {
      return deriveSpanningTree(state, { kind: 'cst' });
    } catch {
      return null;
    }
  }, [state]);

  const rootDevices = useMemo(
    () => new Set(Object.values(tree?.bridges ?? {}).map(b => b.rootDevice)),
    [tree],
  );

  const graph = useMemo(() => computeTopologyLayout(state, layer === 'ip'), [state, layer]);

  const labelSpecs = useMemo(() => {
    const specs: Record<string, PortLabelSpec> = {};
    graph.links.forEach(link => {
      const rawLink = state.links[link.index];
      const aDev = state.devices[link.a.deviceId];
      const bDev = state.devices[link.b.deviceId];
      const aIf = aDev?.interfaces[link.a.ifaceName];
      const bIf = bDev?.interfaces[link.b.ifaceName];
      const aStp = tree?.bridges[link.a.deviceId]?.ports[link.a.ifaceName];
      const bStp = tree?.bridges[link.b.deviceId]?.ports[link.b.ifaceName];
      const aBlocked = aStp?.portState === 'blocking' && aStp.portRole !== 'disabled';
      const bBlocked = bStp?.portState === 'blocking' && bStp.portRole !== 'disabled';
      const aStat = interfaceStatus(state, aDev, aIf ?? { name: link.a.ifaceName, adminUp: false });
      const bStat = interfaceStatus(state, bDev, bIf ?? { name: link.b.ifaceName, adminUp: false });
      const phyUp = !!rawLink?.up && aStat.operUp && bStat.operUp;

      const formatEnd = (
        shortName: string,
        devKind: string,
        iface: InterfaceState | undefined,
        stpPort: typeof aStp,
        blocked: boolean,
        adminUp: boolean,
      ): string => {
        if (devKind === 'host') return shortName;
        if (!adminUp) return `${shortName} SHUT`;
        if (!phyUp) return `${shortName} DOWN`;
        if (layer === 'vlan' && iface?.switchport) {
          if (iface.switchport.mode === 'access') return `${shortName} A:${iface.switchport.accessVlan ?? 1}`;
          if (iface.switchport.mode === 'trunk') return `${shortName} TRK`;
        }
        if (layer === 'stp' && stpPort) {
          const role = stpRoleTag(stpPort.portRole);
          if (blocked) return `${shortName} ${role || 'BLK'} ⊘`;
          if (role) return `${shortName} ${role}`;
        }
        return shortName;
      };

      const aKind = graph.nodeMap[link.a.deviceId]?.kind ?? 'switch';
      const bKind = graph.nodeMap[link.b.deviceId]?.kind ?? 'switch';
      specs[link.a.key] = {
        text: formatEnd(link.a.shortName, aKind, aIf, aStp, aBlocked, aIf?.adminUp ?? false),
      };
      specs[link.b.key] = {
        text: formatEnd(link.b.shortName, bKind, bIf, bStp, bBlocked, bIf?.adminUp ?? false),
      };
    });
    return specs;
  }, [graph, state, tree, layer]);

  const placedLabels = useMemo(() => placePortLabels(graph, labelSpecs), [graph, labelSpecs]);
  const fullBounds = useMemo(() => computeGraphBounds(graph, placedLabels), [graph, placedLabels]);

  const computeFitTransform = useCallback((w: number, h: number): ViewTransform => {
    const safeW = Math.max(200, w);
    const safeH = Math.max(180, h);
    const scale = Math.min(1.28, Math.max(0.25, Math.min(safeW / fullBounds.width, safeH / fullBounds.height) * 0.94));
    const cx = fullBounds.minX + fullBounds.width / 2;
    const cy = fullBounds.minY + fullBounds.height / 2;
    return {
      scale,
      tx: safeW / 2 - cx * scale,
      ty: safeH / 2 - cy * scale,
    };
  }, [fullBounds]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };
    update();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [collapsed]);

  // Fit on resize and graph changes; desktop fullscreen wheel zoom is preserved until resize.
  useEffect(() => {
    setTransform(computeFitTransform(containerSize.width, containerSize.height));
  }, [containerSize.width, containerSize.height, computeFitTransform]);

  const handleWheelZoom = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!scrollable || !window.matchMedia('(min-width: 601px)').matches) return;
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const factor = Math.exp(-event.deltaY * 0.0015);
    setTransform(previous => {
      const scale = Math.max(0.2, Math.min(4, previous.scale * factor));
      const ratio = scale / previous.scale;
      return {
        scale,
        tx: x - (x - previous.tx) * ratio,
        ty: y - (y - previous.ty) * ratio,
      };
    });
  };

  const guardClick = (fn: () => void) => fn();

  const modeledHosts = useMemo(
    () => Object.values(state.devices).filter(d => d.vendor === 'linux-host'),
    [state.devices],
  );

  const activeDevice = state.devices[activeDeviceId];
  const selectedPortDetails = selection?.kind === 'port'
    ? getPortDetails(state, selection.deviceId, selection.interfaceName)
    : null;
  const selectedLink = selection?.kind === 'link' ? state.links[selection.linkIndex] : null;
  const selectedLinkDetailsA = selectedLink ? getPortDetails(state, selectedLink.a, selectedLink.aIf) : null;
  const selectedLinkDetailsB = selectedLink ? getPortDetails(state, selectedLink.b, selectedLink.bIf) : null;
  const selectedHost = selection?.kind === 'host' ? state.devices[selection.hostId] : null;

  if (collapsed) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 px-3 py-2 flex items-center justify-between text-xs">
        <span className="font-mono text-slate-600 dark:text-slate-300">Схема топологии скрыта</span>
        {onToggleCollapse && (
          <button type="button" onClick={onToggleCollapse} className="text-cyan-700 dark:text-cyan-300 font-semibold cursor-pointer">
            Показать схему
          </button>
        )}
      </div>
    );
  }

  const layerNames: Record<TopologyLayer, string> = {
    phy: 'Физика',
    vlan: 'VLAN',
    stp: 'STP',
    ip: 'IP',
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/70 overflow-hidden shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/90">
        <div className="flex items-center gap-2 text-xs min-w-0">
          <span className="font-bold text-slate-900 dark:text-white whitespace-nowrap">Макет CLI · Схема</span>
          <span className="text-slate-400" aria-hidden="true">·</span>
          <span className="font-mono text-cyan-700 dark:text-cyan-300 whitespace-nowrap">{layerNames[layer]}</span>
          {layer === 'stp' && rootDevices.size > 0 && (
            <>
              <span className="text-slate-400 hidden sm:inline" aria-hidden="true">·</span>
              <span className="text-emerald-700 dark:text-emerald-300 font-mono truncate hidden sm:inline">
                Root: {[...rootDevices].map(id => state.devices[id]?.hostname ?? id).join(', ')}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="h-8 px-1.5 sm:px-2 text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 whitespace-nowrap cursor-pointer"
            >
              Скрыть
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Zone Workspace */}
      <div className={scrollable ? 'block' : 'grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_310px]'}>
        {/* Interactive Canvas */}
        <div className="flex flex-col min-w-0">
          <div className={scrollable ? 'overflow-x-auto' : undefined} style={scrollable ? { overscrollBehaviorX: 'contain' } : undefined} data-topology-scroll={scrollable || undefined}>
          <div
            ref={stageRef}
            onWheel={handleWheelZoom}
            style={scrollable ? { width: Math.max(640, fullBounds.width + 40), height: Math.max(400, fullBounds.height + 40) } : undefined}
            className="relative w-full h-[210px] sm:h-[350px] lg:h-[400px] bg-[#091220] select-none overflow-hidden touch-auto"
          >
            <svg
              width="100%"
              height="100%"
              className="block w-full h-full"
              role="img"
              aria-label="Интерактивная сетевая топология"
            >
              <defs>
                <pattern id="exp-topo-dots" width="24" height="24" patternUnits="userSpaceOnUse">
                  <circle cx="1.5" cy="1.5" r="1" fill="#1e293b" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#exp-topo-dots)" onClick={() => guardClick(() => setSelection(null))} />

              <g transform={`translate(${transform.tx}, ${transform.ty}) scale(${transform.scale})`}>
                {/* 1. Cables */}
                {graph.links.map(link => {
                  const rawLink = state.links[link.index];
                  const aDev = state.devices[link.a.deviceId];
                  const bDev = state.devices[link.b.deviceId];
                  const aIf = aDev?.interfaces[link.a.ifaceName];
                  const bIf = bDev?.interfaces[link.b.ifaceName];
                  const aStat = interfaceStatus(state, aDev, aIf ?? { name: link.a.ifaceName, adminUp: false });
                  const bStat = interfaceStatus(state, bDev, bIf ?? { name: link.b.ifaceName, adminUp: false });
                  const phyUp = !!rawLink?.up && aStat.operUp && bStat.operUp;

                  const aStp = tree?.bridges[link.a.deviceId]?.ports[link.a.ifaceName];
                  const bStp = tree?.bridges[link.b.deviceId]?.ports[link.b.ifaceName];
                  const aBlocked = aStp?.portState === 'blocking' && aStp.portRole !== 'disabled';
                  const bBlocked = bStp?.portState === 'blocking' && bStp.portRole !== 'disabled';
                  const stpBlocked = layer === 'stp' && phyUp && (aBlocked || bBlocked);

                  const aMode = aIf?.switchport?.mode;
                  const bMode = bIf?.switchport?.mode;
                  const isTrunk = aMode === 'trunk' && bMode === 'trunk';
                  const mismatch = (aMode === 'trunk' && bMode === 'access') || (aMode === 'access' && bMode === 'trunk');
                  const accessVlan = aMode === 'access' ? aIf?.switchport?.accessVlan : bMode === 'access' ? bIf?.switchport?.accessVlan : undefined;

                  let strokeColor = '#10b981';
                  let strokeDash: string | undefined;
                  let strokeW = 3;

                  if (!phyUp) {
                    strokeColor = '#ef4444';
                    strokeDash = '7 5';
                    strokeW = 2.5;
                  } else if (stpBlocked) {
                    strokeColor = '#f59e0b';
                    strokeDash = '9 4 2 4';
                    strokeW = 3;
                  } else if (layer === 'vlan') {
                    if (mismatch) {
                      strokeColor = '#f59e0b';
                      strokeDash = '6 4';
                    } else if (isTrunk) {
                      strokeColor = '#38bdf8';
                      strokeW = 4.2;
                    } else if (accessVlan != null) {
                      strokeColor = vlanAccent(accessVlan);
                    }
                  }

                  const isLinkSelected = selection?.kind === 'link' && selection.linkIndex === link.index;
                  const isEndPortSelected = selection?.kind === 'port' && (
                    (selection.deviceId === link.a.deviceId && selection.interfaceName === link.a.ifaceName) ||
                    (selection.deviceId === link.b.deviceId && selection.interfaceName === link.b.ifaceName)
                  );
                  const highlighted = isLinkSelected || isEndPortSelected;

                  return (
                    <g
                      key={`cable-${link.index}`}
                      role="button"
                      tabIndex={0}
                      aria-label={`Кабель ${aDev?.hostname} ${link.a.shortName} — ${bDev?.hostname} ${link.b.shortName}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        guardClick(() => setSelection({ kind: 'link', linkIndex: link.index }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelection({ kind: 'link', linkIndex: link.index });
                        }
                      }}
                      className="cursor-pointer focus:outline-none"
                    >
                      {highlighted && (
                        <path d={link.pathD} fill="none" stroke="#22d3ee" strokeWidth={9} strokeOpacity={0.35} strokeLinecap="round" strokeLinejoin="round" />
                      )}
                      <path
                        d={link.pathD}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={highlighted ? strokeW + 1.2 : strokeW}
                        strokeDasharray={strokeDash}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {phyUp && !stpBlocked && layer === 'vlan' && isTrunk && (
                        <path
                          d={link.pathD}
                          fill="none"
                          stroke="#0f172a"
                          strokeWidth={1.3}
                          strokeDasharray="4 4"
                          strokeLinecap="round"
                        />
                      )}
                      {/* Transparent hit target */}
                      <path d={link.pathD} fill="none" stroke="transparent" strokeWidth={18} />

                      {/* Distinct state glyph at cable midpoint for non-hue comprehension */}
                      {!phyUp && (
                        <g transform={`translate(${link.midX}, ${link.midY})`} className="pointer-events-none">
                          <circle r={9.5} fill="#450a0a" stroke="#ef4444" strokeWidth={1.6} />
                          <path d="M -3.5 -3.5 L 3.5 3.5 M 3.5 -3.5 L -3.5 3.5" stroke="#fecaca" strokeWidth={1.8} strokeLinecap="round" />
                        </g>
                      )}
                      {stpBlocked && (
                        <g transform={`translate(${link.midX}, ${link.midY})`} className="pointer-events-none">
                          <polygon points="0,-10 9,-4 9,4 0,10 -9,4 -9,-4" fill="#451a03" stroke="#f59e0b" strokeWidth={1.6} />
                          <circle r={4.5} fill="none" stroke="#fde68a" strokeWidth={1.4} />
                          <line x1={-3} y1={3} x2={3} y2={-3} stroke="#fde68a" strokeWidth={1.4} />
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* 2. Devices */}
                {graph.nodes.map(node => renderDeviceNode(
                  node,
                  state,
                  layer,
                  activeDeviceId,
                  rootDevices,
                  tree,
                  selection,
                  guardClick,
                  (id) => {
                    onSelectDevice(id);
                  },
                  (hostId) => setSelection({ kind: 'host', hostId }),
                ))}

                {/* 3. Physical Port Sockets */}
                {graph.links.flatMap(link => [
                  { port: link.a, linkIndex: link.index },
                  { port: link.b, linkIndex: link.index },
                ]).map(({ port, linkIndex }) => {
                  const rawLink = state.links[linkIndex];
                  const dev = state.devices[port.deviceId];
                  const iface = dev?.interfaces[port.ifaceName];
                  const stat = interfaceStatus(state, dev, iface ?? { name: port.ifaceName, adminUp: false });
                  const peerDev = state.devices[port.peerId];
                  const peerIf = peerDev?.interfaces[port.peerIface];
                  const peerStat = interfaceStatus(state, peerDev, peerIf ?? { name: port.peerIface, adminUp: false });
                  const phyUp = !!rawLink?.up && stat.operUp && peerStat.operUp;
                  const stpPort = tree?.bridges[port.deviceId]?.ports[port.ifaceName];
                  const isBlocked = layer === 'stp' && phyUp && stpPort?.portState === 'blocking' && stpPort.portRole !== 'disabled';

                  const isPortSelected =
                    (selection?.kind === 'port' && selection.deviceId === port.deviceId && selection.interfaceName === port.ifaceName) ||
                    (selection?.kind === 'link' && selection.linkIndex === linkIndex);

                  let fill = '#10b981';
                  let border = '#022c22';
                  if (!iface?.adminUp) {
                    fill = '#475569';
                    border = '#94a3b8';
                  } else if (!phyUp) {
                    fill = '#ef4444';
                    border = '#fecaca';
                  } else if (isBlocked) {
                    fill = '#f59e0b';
                    border = '#fef3c7';
                  }

                  return (
                    <g
                      key={`socket-${port.key}`}
                      role="button"
                      tabIndex={0}
                      aria-label={`Порт ${dev?.hostname} ${port.ifaceName}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        guardClick(() => setSelection({ kind: 'port', deviceId: port.deviceId, interfaceName: port.ifaceName, linkIndex }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelection({ kind: 'port', deviceId: port.deviceId, interfaceName: port.ifaceName, linkIndex });
                        }
                      }}
                      className="cursor-pointer focus:outline-none"
                    >
                      <title>{`${dev?.hostname} ${port.ifaceName} · ${stat.physical}/${stat.protocol}${stpPort ? ` · STP ${stpPort.portRole}/${stpPort.portState}` : ''}`}</title>
                      {isPortSelected && (
                        <circle cx={port.x} cy={port.y} r={10} fill="none" stroke="#22d3ee" strokeWidth={2.2} />
                      )}
                      <rect
                        x={port.x - 5.5}
                        y={port.y - 5.5}
                        width={11}
                        height={11}
                        rx={2.5}
                        fill={fill}
                        stroke={isPortSelected ? '#22d3ee' : border}
                        strokeWidth={1.5}
                      />
                      {isBlocked && (
                        <line x1={port.x - 3} y1={port.y + 3} x2={port.x + 3} y2={port.y - 3} stroke="#451a03" strokeWidth={1.6} />
                      )}
                      {!iface?.adminUp && (
                        <path d={`M ${port.x - 2.5} ${port.y - 2.5} L ${port.x + 2.5} ${port.y + 2.5} M ${port.x + 2.5} ${port.y - 2.5} L ${port.x - 2.5} ${port.y + 2.5}`} stroke="#f8fafc" strokeWidth={1.3} />
                      )}
                    </g>
                  );
                })}

                {/* 4. Collision-Free Port Labels Anchored to Sockets */}
                {placedLabels.map(label => {
                  const dev = state.devices[label.deviceId];
                  const rawLink = state.links[label.linkIndex];
                  const iface = dev?.interfaces[label.ifaceName];
                  const stpPort = tree?.bridges[label.deviceId]?.ports[label.ifaceName];
                  const aStat = interfaceStatus(state, dev, iface ?? { name: label.ifaceName, adminUp: false });
                  const link = graph.links[label.linkIndex];
                  const peerPort = link.a.deviceId === label.deviceId && link.a.ifaceName === label.ifaceName ? link.b : link.a;
                  const peerDev = state.devices[peerPort.deviceId];
                  const peerIf = peerDev?.interfaces[peerPort.ifaceName];
                  const peerStat = interfaceStatus(state, peerDev, peerIf ?? { name: peerPort.ifaceName, adminUp: false });
                  const phyUp = !!rawLink?.up && aStat.operUp && peerStat.operUp;
                  const isBlocked = layer === 'stp' && phyUp && stpPort?.portState === 'blocking' && stpPort.portRole !== 'disabled';

                  const isHighlighted =
                    (selection?.kind === 'port' && selection.deviceId === label.deviceId && selection.interfaceName === label.ifaceName) ||
                    (selection?.kind === 'link' && selection.linkIndex === label.linkIndex);

                  const borderStroke = isHighlighted
                    ? '#22d3ee'
                    : !phyUp
                      ? '#ef4444'
                      : isBlocked
                        ? '#f59e0b'
                        : '#334155';
                  const bgFill = isHighlighted ? '#083344' : '#0f172a';
                  const textFill = isHighlighted ? '#ecfeff' : isBlocked ? '#fde68a' : !phyUp ? '#fecaca' : '#e2e8f0';

                  return (
                    <g
                      key={`lbl-${label.key}`}
                      role="button"
                      tabIndex={0}
                      aria-label={`Подпись порта ${dev?.hostname} ${label.ifaceName}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        guardClick(() => setSelection({
                          kind: 'port',
                          deviceId: label.deviceId,
                          interfaceName: label.ifaceName,
                          linkIndex: label.linkIndex,
                        }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelection({
                            kind: 'port',
                            deviceId: label.deviceId,
                            interfaceName: label.ifaceName,
                            linkIndex: label.linkIndex,
                          });
                        }
                      }}
                      className="cursor-pointer focus:outline-none"
                    >
                      {label.leader && (
                        <line
                          x1={label.socketX}
                          y1={label.socketY}
                          x2={label.x}
                          y2={label.y}
                          stroke="#475569"
                          strokeWidth={1}
                          strokeDasharray="2 2"
                          className="pointer-events-none"
                        />
                      )}
                      <rect
                        x={label.x - label.width / 2}
                        y={label.y - label.height / 2}
                        width={label.width}
                        height={label.height}
                        rx={4}
                        fill={bgFill}
                        fillOpacity={0.95}
                        stroke={borderStroke}
                        strokeWidth={isHighlighted ? 1.6 : 1}
                      />
                      <text
                        x={label.x}
                        y={label.y + 3.8}
                        textAnchor="middle"
                        fontSize={10.5}
                        fontWeight={600}
                        fill={textFill}
                        className="font-mono pointer-events-none select-none"
                      >
                        {label.text}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

          </div>
          {/* Legend Strip */}
          <div className="px-3 py-1.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] font-mono text-slate-600 dark:text-slate-400">
            <span><span className="text-emerald-500">━</span> {layer === 'stp' ? 'Forwarding' : 'PHY Up'}</span>
            {layer === 'stp' && <span><span className="text-amber-500">╍⊘</span> STP Blocking</span>}
            <span><span className="text-red-500">╌✕</span> PHY Down</span>
            {layer === 'stp' && <span>★ Root · RP/DP/ND</span>}
            {layer === 'vlan' && <span>A:10 Access · TRK Trunk</span>}
            <span className="ml-auto hidden sm:inline text-slate-500">Колесо — масштаб · Перетаскивание — панорама</span>
          </div>
        </div>

        {/* Mobile compact toggle so CLI stays immediately reachable */}
        {selection === null && (
          <button
            type="button"
            onClick={() => setMobileInspectorOpen(v => !v)}
            className="lg:hidden w-full px-3 py-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <span className="font-mono truncate">
              Инспектор · {activeDevice?.hostname ?? activeDeviceId} (порты и кабели)
            </span>
            {mobileInspectorOpen ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
          </button>
        )}

        {/* Right / Bottom Inspector Panel */}
        <aside
          className={`${selection !== null || mobileInspectorOpen ? 'flex' : 'hidden lg:flex'} border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/80 p-3 flex-col gap-3 lg:h-[429px] lg:overflow-y-auto text-xs`}
          aria-label="Инспектор выбранного элемента"
          aria-live="polite"
        >
          {selectedLink && selectedLinkDetailsA && selectedLinkDetailsB ? (
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-700 dark:text-cyan-300 font-bold">
                    Соединение #{selectedLink && selection?.kind === 'link' ? selection.linkIndex + 1 : ''}
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white font-mono">
                    {selectedLinkDetailsA.deviceName} {shortIf(selectedLink.aIf)} ⇄ {selectedLinkDetailsB.deviceName} {shortIf(selectedLink.bIf)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelection(null)}
                  aria-label="Закрыть панель соединения"
                  className="p-1 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/60 p-2 font-mono text-[11px]">
                {!selectedLink.up
                  ? '✕ Кабель физически отключён'
                  : selectedLinkDetailsA.physical === 'up' && selectedLinkDetailsB.physical === 'up'
                    ? (selectedLinkDetailsA.stp?.state === 'blocking' || selectedLinkDetailsB.stp?.state === 'blocking')
                      ? '⊘ PHY Up · STP Blocking (петля заблокирована)'
                      : '● PHY Up · Линия активна'
                    : '✕ PHY Down (проверьте admin up на обоих концах)'}
              </div>

              {[selectedLinkDetailsA, selectedLinkDetailsB].map((end, i) => (
                <div key={`${end.deviceId}-${end.interfaceName}-${i}`} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 p-2.5 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold font-mono text-slate-900 dark:text-white">
                      {end.deviceName} · {shortIf(end.interfaceName)}
                    </span>
                    {state.devices[end.deviceId]?.vendor === 'cisco-ios' && (
                      <button
                        type="button"
                        onClick={() => onSelectDevice(end.deviceId)}
                        className="text-[11px] font-semibold text-cyan-700 dark:text-cyan-300 hover:underline cursor-pointer"
                      >
                        Консоль
                      </button>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 font-mono space-y-0.5">
                    <div>Admin: {end.admin} · PHY: {end.physical}/{end.protocol}</div>
                    <div>
                      Режим: {end.switchport?.mode ?? 'L3'}
                      {end.switchport?.mode === 'access' ? ` · VLAN ${end.switchport.accessVlan ?? 1}` : ''}
                      {end.switchport?.mode === 'trunk' ? ` · allowed ${end.switchport.trunkAllowed?.join(',') ?? '1-4094'}` : ''}
                    </div>
                    {end.ipv4 && <div>IP: {end.ipv4.address}/{end.ipv4.prefix}</div>}
                    {end.stp && <div>STP: {end.stp.role} · {end.stp.state} (cost {end.stp.pathCost})</div>}
                  </div>
                </div>
              ))}

              {onToggleLink && selection?.kind === 'link' && (
                <button
                  type="button"
                  onClick={() => onToggleLink(selection.linkIndex)}
                  className={selectedLink.up
                    ? 'w-full h-9 rounded-lg border border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300 font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer'
                    : 'w-full h-9 rounded-lg border border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer'}
                >
                  {selectedLink.up ? <Unplug className="w-3.5 h-3.5" /> : <Cable className="w-3.5 h-3.5" />}
                  {selectedLink.up ? 'Отключить кабель' : 'Восстановить кабель'}
                </button>
              )}
            </div>
          ) : selectedPortDetails ? (
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-700 dark:text-cyan-300 font-bold">
                    Порт устройства
                  </div>
                  <div className="font-bold font-mono text-slate-900 dark:text-white">
                    {selectedPortDetails.deviceName} · {selectedPortDetails.interfaceName}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelection(null)}
                  aria-label="Закрыть параметры порта"
                  className="p-1 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <dl className="grid grid-cols-[90px_minmax(0,1fr)] gap-x-2 gap-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                <dt className="text-slate-500">Админ.</dt><dd className="font-mono">{selectedPortDetails.admin}</dd>
                <dt className="text-slate-500">Физика</dt><dd className="font-mono">{selectedPortDetails.physical} / {selectedPortDetails.protocol}</dd>
                <dt className="text-slate-500">Сосед</dt><dd className="font-mono break-words">{selectedPortDetails.peer ?? 'нет линка'}</dd>
                <dt className="text-slate-500">Режим</dt><dd className="font-mono">{selectedPortDetails.switchport?.mode ?? 'L3 / routed'}</dd>
                {selectedPortDetails.switchport?.mode === 'access' && (
                  <><dt className="text-slate-500">Access VLAN</dt><dd className="font-mono">{selectedPortDetails.switchport.accessVlan ?? 1}</dd></>
                )}
                {selectedPortDetails.switchport?.mode === 'trunk' && (
                  <><dt className="text-slate-500">Allowed</dt><dd className="font-mono break-words">{selectedPortDetails.switchport.trunkAllowed?.join(', ') ?? '1-4094 (all)'}</dd></>
                )}
                {selectedPortDetails.ipv4 && (
                  <><dt className="text-slate-500">IPv4</dt><dd className="font-mono">{selectedPortDetails.ipv4.address}/{selectedPortDetails.ipv4.prefix}</dd></>
                )}
                {selectedPortDetails.stp && (
                  <>
                    <dt className="text-slate-500">STP Роль</dt><dd className="font-mono">{selectedPortDetails.stp.role} · {selectedPortDetails.stp.state}</dd>
                    <dt className="text-slate-500">Root / Cost</dt><dd className="font-mono">{state.devices[selectedPortDetails.stp.root]?.hostname ?? selectedPortDetails.stp.root} · {selectedPortDetails.stp.pathCost}</dd>
                    <dt className="text-slate-500">Port Prio</dt><dd className="font-mono">{selectedPortDetails.stp.portPriority}</dd>
                  </>
                )}
                {selectedPortDetails.stpError && <><dt className="text-slate-500">STP</dt><dd>{selectedPortDetails.stpError}</dd></>}
              </dl>
              {state.devices[selectedPortDetails.deviceId]?.vendor === 'cisco-ios' && (
                <button
                  type="button"
                  onClick={() => onSelectDevice(selectedPortDetails.deviceId)}
                  className="w-full h-9 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-800 dark:text-cyan-200 font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  Перейти в консоль {selectedPortDetails.deviceName}
                </button>
              )}
            </div>
          ) : selectedHost ? (
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-700 dark:text-cyan-300 font-bold">
                    Конечный узел
                  </div>
                  <div className="font-bold font-mono text-slate-900 dark:text-white">
                    {selectedHost.hostname}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelection(null)}
                  aria-label="Закрыть панель ПК"
                  className="p-1 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {Object.values(selectedHost.interfaces).map(iface => (
                <div key={iface.name} className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/50 p-2 font-mono text-[11px] space-y-0.5">
                  <div className="font-semibold text-slate-900 dark:text-white">{iface.name}</div>
                  <div>IP: {iface.ipv4 ? `${iface.ipv4.address}/${iface.ipv4.prefix}` : 'не задан'}</div>
                  <div>Статус: {interfaceStatus(state, selectedHost, iface).physical}</div>
                </div>
              ))}
              <HostPingPanel key={selectedHost.id} state={state} hostId={selectedHost.id} />
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Связь с другими ПК</div>
                {modeledHosts.filter(h => h.id !== selectedHost.id).map(peer => {
                  const res = checkHostIpv4Reachability(state, selectedHost.id, peer.id);
                  return (
                    <div key={peer.id} className="flex items-center justify-between gap-2 text-[11px] font-mono py-0.5 border-b border-slate-200/70 dark:border-slate-800">
                      <span className={res.reachable ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400'}>
                        {res.reachable ? '✓' : '✗'} {peer.hostname}
                      </span>
                      <span className="text-slate-500">{res.vlanId ? `VLAN ${res.vlanId}` : '—'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                  Активная консоль
                </div>
                <div className="font-bold font-mono text-sm text-slate-900 dark:text-white flex items-center justify-between mt-0.5">
                  <span>{activeDevice?.hostname ?? activeDeviceId}</span>
                  {layer === 'stp' && rootDevices.has(activeDeviceId) && (
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">★ Root</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Нажмите на кабель, разъём порта или устройство на схеме для подробной проверки.
                </p>
              </div>

              {activeDevice && (
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Интерфейсы {activeDevice.hostname}</div>
                  <div className="space-y-1">
                    {Object.values(activeDevice.interfaces).map(iface => {
                      const st = interfaceStatus(state, activeDevice, iface);
                      const stpPort = tree?.bridges[activeDevice.id]?.ports[iface.name];
                      return (
                        <button
                          key={iface.name}
                          type="button"
                          onClick={() => setSelection({ kind: 'port', deviceId: activeDevice.id, interfaceName: iface.name })}
                          className="w-full text-left px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-cyan-500/60 flex items-center justify-between gap-2 font-mono text-[11px] cursor-pointer"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{shortIf(iface.name)}</span>
                          <span className="text-slate-500 truncate">
                            {iface.ipv4
                              ? `${iface.ipv4.address}/${iface.ipv4.prefix}`
                              : iface.switchport?.mode === 'trunk'
                                ? `TRK`
                                : iface.switchport?.mode === 'access'
                                  ? `A:${iface.switchport.accessVlan ?? 1}`
                                  : 'unset'}
                            {stpPort && layer === 'stp' ? ` · ${stpRoleTag(stpPort.portRole)}${stpPort.portState === 'blocking' ? ' ⊘' : ''}` : ''}
                          </span>
                          <span className={st.operUp ? 'text-emerald-600 dark:text-emerald-400 shrink-0' : 'text-red-500 shrink-0'}>
                            {st.operUp ? 'up' : 'down'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {onToggleLink && state.links.some(l => state.devices[l.a]?.vendor === 'cisco-ios' && state.devices[l.b]?.vendor === 'cisco-ios') && (
                <div className="space-y-1.5 pt-1 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Кабели кольца (тест отказа)</div>
                  <div className="grid grid-cols-1 gap-1">
                    {state.links.map((link, idx) => {
                      if (state.devices[link.a]?.vendor !== 'cisco-ios' || state.devices[link.b]?.vendor !== 'cisco-ios') return null;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => onToggleLink(idx)}
                          className={link.up
                            ? 'px-2 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 text-[11px] font-mono text-left flex items-center justify-between cursor-pointer'
                            : 'px-2 py-1.5 rounded-lg border border-red-500/40 bg-red-500/5 text-red-700 dark:text-red-300 text-[11px] font-mono text-left flex items-center justify-between cursor-pointer'}
                        >
                          <span>{state.devices[link.a].hostname} {shortIf(link.aIf)} ↔ {state.devices[link.b].hostname} {shortIf(link.bIf)}</span>
                          <span>{link.up ? 'вкл' : 'обрыв'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {modeledHosts.length >= 4 && (
                <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Связь ПК (модель IP + VLAN + CST)</div>
                  <div className="grid grid-cols-1 gap-1">
                    {([
                      ['pc1v10', 'pc3v10'],
                      ['pc2v10', 'pc4v10'],
                      ['pc1v20', 'pc3v20'],
                      ['pc2v20', 'pc4v20'],
                    ] as const).map(([a, b]) => {
                      if (!state.devices[a] || !state.devices[b]) return null;
                      const res = checkHostIpv4Reachability(state, a, b);
                      return (
                        <div
                          key={a + b}
                          className={res.reachable
                            ? 'px-2 py-1 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono text-[11px] flex justify-between'
                            : 'px-2 py-1 rounded bg-red-500/10 text-red-700 dark:text-red-300 font-mono text-[11px] flex justify-between'}
                        >
                          <span>{res.reachable ? '✓' : '✗'} {state.devices[a].hostname} ↔ {state.devices[b].hostname}</span>
                          <span>{res.vlanId ? `V${res.vlanId}` : '—'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

function renderDeviceNode(
  node: LayoutNode,
  state: NetworkState,
  layer: TopologyLayer,
  activeDeviceId: string,
  rootDevices: Set<string>,
  tree: SpanningTreeResult | null,
  selection: Selection,
  guardClick: (fn: () => void) => void,
  onSelectSwitch: (id: string) => void,
  onSelectHost: (id: string) => void,
) {
  const dev = state.devices[node.id];
  const isActive = node.id === activeDeviceId;
  const isRoot = layer === 'stp' && rootDevices.has(node.id);
  const hw = node.width / 2;
  const hh = node.height / 2;

  if (node.kind === 'host') {
    const eth = dev.interfaces.Ethernet0 ?? Object.values(dev.interfaces)[0];
    const ipText = eth?.ipv4 ? `${eth.ipv4.address}/${eth.ipv4.prefix}` : 'IP не задан';
    const isHostSelected = selection?.kind === 'host' && selection.hostId === node.id;

    // Infer access VLAN from attached switch port for VLAN layer accent
    const hostLink = state.links.find(l => l.a === node.id || l.b === node.id);
    const swId = hostLink ? (hostLink.a === node.id ? hostLink.b : hostLink.a) : undefined;
    const swIf = hostLink ? (hostLink.a === node.id ? hostLink.bIf : hostLink.aIf) : undefined;
    const accessVlan = swId && swIf ? state.devices[swId]?.interfaces[swIf]?.switchport?.accessVlan : undefined;
    const strokeCol = isHostSelected ? '#22d3ee' : layer === 'vlan' && accessVlan ? vlanAccent(accessVlan) : '#38bdf8';

    return (
      <g
        key={node.id}
        role="button"
        tabIndex={0}
        aria-label={`Компьютер ${node.hostname}, ${ipText}`}
        onClick={(e) => {
          e.stopPropagation();
          guardClick(() => onSelectHost(node.id));
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectHost(node.id);
          }
        }}
        className="cursor-pointer focus:outline-none"
      >
        {/* Original vector workstation: blue screen + dark tower.
            Deliberately simplified for small mobile topology nodes. */}
        <rect x={node.x - hw} y={node.y - hh}
          width={node.width} height={node.height} rx={9}
          fill="#101c32" stroke={strokeCol} strokeWidth={isHostSelected ? 2.5 : 1.5} />
        <g pointerEvents="none">
          {/* System unit */}
          <rect x={node.x - 33} y={node.y - 31}
            width={15} height={38} rx={3} fill="#1d3156"
            stroke="#5b78a9" strokeWidth={1.1} />
          <rect x={node.x - 30} y={node.y - 27}
            width={9} height={5} rx={2} fill="#0c1830"
            stroke="#80b5dd" strokeWidth={0.7} />
          <circle cx={node.x - 25.5} cy={node.y - 14} r={2.1} fill="#38bdf8" />
          <g fill="#607fa7">
            <circle cx={node.x - 29} cy={node.y + 2} r={0.8} />
            <circle cx={node.x - 25.5} cy={node.y + 2} r={0.8} />
            <circle cx={node.x - 22} cy={node.y + 2} r={0.8} />
          </g>
          {/* Monitor and blue glass */}
          <rect x={node.x - 14} y={node.y - 32}
            width={49} height={32} rx={4} fill="#1d3156"
            stroke="#7db7e5" strokeWidth={1.2} />
          <rect x={node.x - 11} y={node.y - 29}
            width={43} height={25} rx={2} fill="#209fce" />
          <path d={`M ${node.x - 9} ${node.y - 27} L ${node.x + 3} ${node.y - 27} L ${node.x + 28} ${node.y - 5} L ${node.x + 17} ${node.y - 5} Z`}
            fill="#8bdbfa" opacity={0.65} />
          <path d={`M ${node.x + 12} ${node.y} V ${node.y + 6} M ${node.x + 2} ${node.y + 6} H ${node.x + 22}`}
            stroke="#7c9bc9" strokeWidth={2.5} strokeLinecap="round" />
        </g>

        {/* Hostname & IP */}
        <text x={node.x} y={node.y + 19} textAnchor="middle" fontSize={12} fontWeight={700} fill="#f8fafc" className="font-mono pointer-events-none select-none">
          {node.hostname}
        </text>
        <text x={node.x} y={node.y + 34} textAnchor="middle" fontSize={10.5} fill="#bae6fd" className="font-mono pointer-events-none select-none">
          {ipText}
        </text>
        {layer === 'vlan' && accessVlan != null && (
          <text x={node.x + hw - 6} y={node.y - hh + 12} textAnchor="end" fontSize={9.5} fontWeight={700} fill={vlanAccent(accessVlan)} className="font-mono pointer-events-none select-none">
            V{accessVlan}
          </text>
        )}
      </g>
    );
  }

  // Physical ports status LEDs for switch faceplate
  const physPorts = Object.values(dev.interfaces).filter(isPhysicalPort).slice(0, 16);
  const ips = layer === 'ip'
    ? Object.values(dev.interfaces)
      .filter(i => i.ipv4)
      .map(i => `${shortIf(i.name)} ${i.ipv4!.address}/${i.ipv4!.prefix}`)
    : [];

  const bodyFill = isActive ? '#0c4a6e' : isRoot ? '#064e3b' : '#132033';
  const bodyStroke = isActive ? '#22d3ee' : isRoot ? '#34d399' : '#64748b';

  return (
    <g
      key={node.id}
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      aria-label={`${node.kind === 'router' ? 'Маршрутизатор' : 'Коммутатор'} ${node.hostname}${isActive ? ', активный' : ''}${isRoot ? ', Root Bridge' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        guardClick(() => onSelectSwitch(node.id));
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectSwitch(node.id);
        }
      }}
      className="cursor-pointer focus:outline-none"
    >
      {/* Original compact Catalyst-inspired SVG faceplate, not a raster image.
          All link endpoints and labels remain anchored by topologyLayout. */}
      <rect
        x={node.x - hw} y={node.y - hh}
        width={node.width} height={node.height} rx={7}
        fill={bodyFill} stroke={bodyStroke}
        strokeWidth={isActive || isRoot ? 2.5 : 1.6}
      />
      <path
        d={`M ${node.x - hw + 7} ${node.y - hh + 3} H ${node.x + hw - 7}`}
        stroke="#94a3b8" strokeOpacity={0.55} strokeWidth={1.3}
        strokeLinecap="round" pointerEvents="none"
      />
      <rect
        x={node.x - hw + 7} y={node.y - hh + 7}
        width={node.width - 14} height={30} rx={3}
        fill="#09111f" stroke="#475569" strokeWidth={0.8}
      />
      {node.kind === 'router' ? (
        <g className="pointer-events-none" stroke="#38bdf8" fill="none" strokeWidth={2}>
          <circle cx={node.x} cy={node.y - hh + 22} r={10} />
          <path d={`M ${node.x - 7} ${node.y - hh + 22} H ${node.x + 7} M ${node.x} ${node.y - hh + 15} V ${node.y - hh + 29}`} />
        </g>
      ) : (
        <>
          {/* Two rows of recessed RJ45 sockets, scaled to the compact schematic.
              Only the actual modeled interfaces receive live status LEDs. */}
          {Array.from({ length: 16 }, (_, idx) => {
            const col = idx % 8;
            const row = Math.floor(idx / 8);
            const px = node.x - hw + 12 + col * ((node.width - 30) / 8);
            const py = node.y - hh + 10 + row * 13;
            const iface = physPorts[idx];
            const st = iface ? interfaceStatus(state, dev, iface) : null;
            const stpPort = iface ? tree?.bridges[node.id]?.ports[iface.name] : null;
            const blocked = layer === 'stp' && !!st?.operUp && stpPort?.portState === 'blocking' && stpPort.portRole !== 'disabled';
            const ledColor = !iface ? '#334155' : !iface.adminUp ? '#64748b' : !st?.operUp ? '#ef4444' : blocked ? '#f59e0b' : '#34d399';
            return (
              <g key={idx} pointerEvents="none">
                <rect x={px} y={py} width={9.5} height={10} rx={1}
                  fill="#020617" stroke="#64748b" strokeWidth={0.7} />
                <path d={`M ${px + 2} ${py + 1} V ${py + 3} H ${px + 7.5} V ${py + 1}`}
                  stroke="#94a3b8" strokeWidth={0.6} fill="none" />
                <rect x={px + 2.2} y={py + 7} width={5} height={1.5} rx={0.4}
                  fill="#475569" />
                <circle cx={px + 4.7} cy={py + 11.1} r={1.1} fill={ledColor} />
              </g>
            );
          })}
          <circle cx={node.x + hw - 11} cy={node.y - hh + 22}
            r={2.5} fill={isActive ? '#22d3ee' : '#34d399'} pointerEvents="none" />
        </>
      )}

      {/* Hostname */}
      <text
        x={node.x}
        y={ips.length > 0 ? node.y + 6 : node.y + 12}
        textAnchor="middle"
        fontSize={14}
        fontWeight={700}
        fill="#f8fafc"
        className="font-mono pointer-events-none select-none"
      >
        {node.hostname}
      </text>

      {/* Active CLI / Root markers as crisp text */}
      <text
        x={node.x}
        y={ips.length > 0 ? node.y + 19 : node.y + 26}
        textAnchor="middle"
        fontSize={9.5}
        fontWeight={600}
        fill={isRoot ? '#6ee7b7' : isActive ? '#67e8f9' : '#94a3b8'}
        className="font-mono pointer-events-none select-none"
      >
        {isRoot && isActive ? '★ ROOT · CLI' : isRoot ? '★ ROOT' : isActive ? '● CLI' : node.kind === 'router' ? 'ROUTER' : 'SWITCH'}
      </text>

      {ips.length > 0 && (
        <text
          x={node.x}
          y={node.y + 32}
          textAnchor="middle"
          fontSize={9.5}
          fill="#bae6fd"
          className="font-mono pointer-events-none select-none"
        >
          {ips[0]}{ips.length > 1 ? ` (+${ips.length - 1})` : ''}
        </text>
      )}
    </g>
  );
}
