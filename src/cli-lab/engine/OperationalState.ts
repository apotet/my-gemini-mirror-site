import { DeviceState, InterfaceState, NetworkState } from './types';
import { trunkNeighbors } from './SviIpv4Reachability';

/**
 * Effective Ethernet status for the limited CLI Lab topology.
 * An unmodeled cable/endpoint is not evidence of carrier. Legacy operUp is
 * ignored: both ends must exist, be administratively enabled, and have an up link.
 * This does not model negotiation, STP forwarding or packet delivery.
 * SVI autostate is approximated by an eligible connected trunk for its VLAN.
 */
export function interfaceStatus(state: NetworkState, device: DeviceState, iface: InterfaceState) {
  const sviId = /^Vlan(\d+)$/i.exec(iface.name);
  if (sviId) {
    const vlanId = Number(sviId[1]);
    const operUp = iface.adminUp && !!device.vlans[vlanId]?.active &&
      trunkNeighbors(state, device.id, vlanId).length > 0;
    return {
      operUp,
      physical: !iface.adminUp ? 'administratively down' : operUp ? 'up' : 'down',
      protocol: operUp ? 'up' : 'down',
    };
  }
  const operUp = iface.adminUp && state.links.some(link => {
    if (!link.up) return false;
    const peer = link.a === device.id && link.aIf === iface.name
      ? { device: link.b, iface: link.bIf }
      : link.b === device.id && link.bIf === iface.name
        ? { device: link.a, iface: link.aIf } : null;
    return peer !== null && state.devices[peer.device]?.interfaces[peer.iface]?.adminUp === true;
  });
  return {
    operUp,
    physical: !iface.adminUp ? 'administratively down' : operUp ? 'up' : 'down',
    protocol: operUp ? 'up' : 'down',
  };
}
