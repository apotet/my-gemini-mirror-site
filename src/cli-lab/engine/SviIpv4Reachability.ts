import type { NetworkState, DeviceState } from './types';

/**
 * Deliberately limited IPv4 reachability model for Cisco management SVIs.
 * This is NOT a packet-level ICMP/ARP emulator, nor IP routing.
 */
function toInt(address: string): number {
  return address.split('.').reduce((n, octet) => ((n << 8) | Number(octet)) >>> 0, 0);
}
function sameSubnet(a: string, b: string, prefix: number): boolean {
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return (toInt(a) & mask) === (toInt(b) & mask);
}
function forwardsVlan(dev: DeviceState, name: string, vlanId: number): boolean {
  const port = dev.interfaces[name];
  return !!dev.vlans[vlanId]?.active && !!port?.adminUp &&
    port.switchport?.mode === 'trunk' &&
    (port.switchport.trunkAllowed === undefined || port.switchport.trunkAllowed.includes(vlanId));
}
function svi(dev: DeviceState, vlanId: number) {
  const iface = dev.interfaces[`Vlan${vlanId}`];
  return iface && iface.adminUp && dev.vlans[vlanId]?.active ? iface : undefined;
}
export function trunkNeighbors(state: NetworkState, id: string, vlanId: number): string[] {
  const peers: string[] = [];
  for (const link of state.links) {
    if (!link.up) continue;
    const local = link.a === id ? [link.aIf, link.b, link.bIf] :
      link.b === id ? [link.bIf, link.a, link.aIf] : null;
    if (!local) continue;
    const [port, peerId, peerPort] = local;
    const me = state.devices[id], peer = state.devices[peerId];
    if (me && peer && forwardsVlan(me, port, vlanId) && forwardsVlan(peer, peerPort, vlanId)) peers.push(peerId);
  }
  return peers;
}
export function checkSviIpv4Reachability(
  state: NetworkState, sourceId: string, destinationAddress: string,
): { reachable: boolean; detail: string } {
  const source = state.devices[sourceId];
  if (!source) return { reachable: false, detail: 'Исходный коммутатор не найден' };
  const candidates = Object.values(source.interfaces).filter(iface =>
    /^Vlan\d+$/i.test(iface.name) && iface.adminUp && iface.ipv4 &&
    !!source.vlans[Number(iface.name.slice(4))]?.active &&
    sameSubnet(iface.ipv4.address, destinationAddress, iface.ipv4.prefix)
  );
  for (const origin of candidates) {
    const vlanId = Number(origin.name.slice(4));
    // SVI must have an operational VLAN attachment, not merely adminUp.
    if (trunkNeighbors(state, sourceId, vlanId).length === 0) continue;
    const visited = new Set([sourceId]);
    const queue = [sourceId];
    while (queue.length) {
      const id = queue.shift()!;
      const dev = state.devices[id];
      if (id !== sourceId) {
        const target = svi(dev, vlanId);
        if (target?.ipv4?.address === destinationAddress &&
          sameSubnet(destinationAddress, origin.ipv4!.address, target.ipv4.prefix) &&
          trunkNeighbors(state, id, vlanId).length > 0) {
          return { reachable: true, detail: `SVI IPv4 ${origin.ipv4!.address} → ${destinationAddress}: общая подсеть и VLAN ${vlanId} по рабочим trunk` };
        }
      }
      for (const next of trunkNeighbors(state, id, vlanId)) {
        if (!visited.has(next)) { visited.add(next); queue.push(next); }
      }
    }
  }
  return { reachable: false, detail: `Нет подтверждённого SVI IPv4-пути к ${destinationAddress}. Проверьте IP/маску, VLAN, trunk и линк (маршрутизация/ARP/ICMP не моделируются)` };
}
