import type { DeviceState, SavedDeviceConfig } from '../../engine/types';
import { formatAllowedVlans } from './trunkCommands';

/** One IOS-style renderer for both running and startup snapshots. */
export function formatDeviceConfig(config: Pick<SavedDeviceConfig, 'hostname' | 'vlans' | 'interfaces' | 'routes'>): string {
  const lines = ['!', `hostname ${config.hostname}`, '!'];
  for (const vlan of Object.values(config.vlans).sort((a, b) => a.id - b.id)) {
    if (vlan.id === 1) continue;
    lines.push(`vlan ${vlan.id}`);
    if (vlan.name) lines.push(` name ${vlan.name}`);
    lines.push('!');
  }
  for (const iface of Object.values(config.interfaces)) {
    lines.push(`interface ${iface.name}`);
    if (iface.switchport?.mode === 'access') {
      lines.push(' switchport mode access');
      if (iface.switchport.accessVlan != null && iface.switchport.accessVlan !== 1) {
        lines.push(` switchport access vlan ${iface.switchport.accessVlan}`);
      }
    } else if (iface.switchport?.mode === 'trunk') {
      lines.push(' switchport mode trunk');
      if (iface.switchport.trunkAllowed !== undefined) {
        lines.push(` switchport trunk allowed vlan ${formatAllowedVlans(iface.switchport.trunkAllowed)}`);
      }
    }
    if (iface.ipv4) lines.push(` ip address ${iface.ipv4.address} ${iface.ipv4.mask}`);
    lines.push(iface.adminUp ? ' no shutdown' : ' shutdown', '!');
  }
  for (const route of config.routes) {
    const prefix = route.prefixLen;
    const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    const dottedMask = [24, 16, 8, 0].map(shift => (mask >>> shift) & 255).join('.');
    if (route.nextHop) lines.push(`ip route ${route.prefix} ${dottedMask} ${route.nextHop}`);
  }
  lines.push('end');
  return lines.join('\n');
}

export function formatRunningConfig(device: DeviceState): string {
  return ['Building configuration...', '', 'Current configuration:', formatDeviceConfig(device)].join('\n');
}

export function formatStartupConfig(config?: SavedDeviceConfig): string {
  return config ? ['Using saved startup configuration:', formatDeviceConfig(config)].join('\n')
    : '% Non-volatile configuration memory is not available';
}
