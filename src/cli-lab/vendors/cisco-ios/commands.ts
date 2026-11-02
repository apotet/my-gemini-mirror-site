import { CommandResult, CommandSpec, DeviceState, NetworkState } from '../../engine/types';
import { ciscoIosProfile } from './profile';

function commitDevice(state: NetworkState, device: DeviceState): NetworkState {
  return {
    ...state,
    devices: {
      ...state.devices,
      [device.id]: { ...device },
    },
  };
}

function ensureVlan(device: DeviceState, id: number): void {
  if (!device.vlans[id]) {
    device.vlans[id] = { id, active: true, name: undefined };
  }
}

export const ciscoIosCommands: CommandSpec[] = [
  {
    id: 'cisco.enable',
    match: ['enable'],
    modes: ['exec'],
    handler: (_tokens, state, device) => {
      device.privilege = 15;
      device.modeCtx = { mode: 'privileged' };
      return { output: '', state: commitDevice(state, device) };
    },
  },
  {
    id: 'cisco.disable',
    match: ['disable'],
    modes: ['privileged'],
    minPrivilege: 1,
    handler: (_tokens, state, device) => {
      device.privilege = 0;
      device.modeCtx = { mode: 'exec' };
      return { output: '', state: commitDevice(state, device) };
    },
  },
  {
    id: 'cisco.exit',
    match: ['exit'],
    modes: ['exec', 'privileged', 'config', 'config-if', 'config-vlan'],
    handler: (_tokens, state, device) => {
      const m = device.modeCtx.mode;
      if (m === 'config-if' || m === 'config-vlan') {
        device.modeCtx = { mode: 'config' };
      } else if (m === 'config') {
        device.modeCtx = { mode: 'privileged' };
      } else if (m === 'privileged') {
        device.modeCtx = { mode: 'exec' };
        device.privilege = 0;
      }
      return { output: '', state: commitDevice(state, device) };
    },
  },
  {
    id: 'cisco.end',
    match: ['end'],
    modes: ['config', 'config-if', 'config-vlan'],
    minPrivilege: 15,
    handler: (_tokens, state, device) => {
      device.modeCtx = { mode: 'privileged' };
      return { output: '', state: commitDevice(state, device) };
    },
  },
  {
    id: 'cisco.configure_terminal',
    match: ['configure', 'terminal'],
    modes: ['privileged'],
    minPrivilege: 15,
    handler: (_tokens, state, device) => {
      device.modeCtx = { mode: 'config' };
      return { output: 'Enter configuration commands, one per line. End with CNTL/Z.', state: commitDevice(state, device) };
    },
  },
  {
    id: 'cisco.configure_terminal_short',
    match: ['conf', 't'],
    modes: ['privileged'],
    minPrivilege: 15,
    handler: (_tokens, state, device) => {
      device.modeCtx = { mode: 'config' };
      return { output: 'Enter configuration commands, one per line. End with CNTL/Z.', state: commitDevice(state, device) };
    },
  },
  {
    id: 'cisco.hostname',
    match: ['hostname'],
    modes: ['config'],
    minPrivilege: 15,
    handler: (tokens, state, device) => {
      if (tokens.length < 2) {
        return { output: ciscoIosProfile.messages.incomplete, error: true };
      }
      device.hostname = tokens[1];
      return { output: '', state: commitDevice(state, device) };
    },
  },
  {
    id: 'cisco.vlan',
    match: ['vlan'],
    modes: ['config'],
    minPrivilege: 15,
    handler: (tokens, state, device) => {
      if (tokens.length < 2) {
        return { output: ciscoIosProfile.messages.incomplete, error: true };
      }
      const id = Number(tokens[1]);
      if (!Number.isInteger(id) || id < 1 || id > 4094) {
        return { output: '% Invalid VLAN id', error: true };
      }
      ensureVlan(device, id);
      device.modeCtx = { mode: 'config-vlan', vlanId: id };
      return { output: '', state: commitDevice(state, device) };
    },
  },
  {
    id: 'cisco.vlan_name',
    match: ['name'],
    modes: ['config-vlan'],
    minPrivilege: 15,
    handler: (tokens, state, device) => {
      if (tokens.length < 2) {
        return { output: ciscoIosProfile.messages.incomplete, error: true };
      }
      const id = device.modeCtx.vlanId;
      if (id == null || !device.vlans[id]) {
        return { output: ciscoIosProfile.messages.invalid, error: true };
      }
      device.vlans[id] = { ...device.vlans[id], name: tokens[1] };
      return { output: '', state: commitDevice(state, device) };
    },
  },
  {
    id: 'cisco.interface',
    match: ['interface'],
    modes: ['config'],
    minPrivilege: 15,
    handler: (tokens, state, device) => {
      if (tokens.length < 2) {
        return { output: ciscoIosProfile.messages.incomplete, error: true };
      }
      // Support: interface FastEthernet0/1 | Fa0/1 | GigabitEthernet0/1 | Gi0/1
      const name = normalizeIfaceName(tokens.slice(1).join(' '));
      if (!device.interfaces[name]) {
        return { output: `% Invalid interface type and number\n${ciscoIosProfile.messages.invalid}`, error: true };
      }
      device.modeCtx = { mode: 'config-if', ifName: name };
      return { output: '', state: commitDevice(state, device) };
    },
  },
  {
    id: 'cisco.no_shutdown',
    match: ['no', 'shutdown'],
    modes: ['config-if'],
    minPrivilege: 15,
    handler: (_tokens, state, device) => {
      const ifName = device.modeCtx.ifName;
      if (!ifName || !device.interfaces[ifName]) {
        return { output: ciscoIosProfile.messages.invalid, error: true };
      }
      const iface = { ...device.interfaces[ifName], adminUp: true, operUp: true };
      device.interfaces = { ...device.interfaces, [ifName]: iface };
      return { output: '', state: commitDevice(state, device) };
    },
  },
  {
    id: 'cisco.shutdown',
    match: ['shutdown'],
    modes: ['config-if'],
    minPrivilege: 15,
    handler: (_tokens, state, device) => {
      const ifName = device.modeCtx.ifName;
      if (!ifName || !device.interfaces[ifName]) {
        return { output: ciscoIosProfile.messages.invalid, error: true };
      }
      const iface = { ...device.interfaces[ifName], adminUp: false, operUp: false };
      device.interfaces = { ...device.interfaces, [ifName]: iface };
      return { output: '', state: commitDevice(state, device) };
    },
  },
  {
    id: 'cisco.switchport_mode_access',
    match: ['switchport', 'mode', 'access'],
    modes: ['config-if'],
    minPrivilege: 15,
    handler: (_tokens, state, device) => {
      const ifName = device.modeCtx.ifName;
      if (!ifName || !device.interfaces[ifName]) {
        return { output: ciscoIosProfile.messages.invalid, error: true };
      }
      const prev = device.interfaces[ifName];
      const iface = {
        ...prev,
        switchport: {
          mode: 'access' as const,
          accessVlan: prev.switchport?.accessVlan ?? 1,
        },
      };
      device.interfaces = { ...device.interfaces, [ifName]: iface };
      return { output: '', state: commitDevice(state, device) };
    },
  },
  {
    id: 'cisco.switchport_access_vlan',
    match: ['switchport', 'access', 'vlan'],
    modes: ['config-if'],
    minPrivilege: 15,
    handler: (tokens, state, device) => {
      if (tokens.length < 4) {
        return { output: ciscoIosProfile.messages.incomplete, error: true };
      }
      const vlanId = Number(tokens[3]);
      if (!Number.isInteger(vlanId) || vlanId < 1 || vlanId > 4094) {
        return { output: '% Invalid VLAN id', error: true };
      }
      const ifName = device.modeCtx.ifName;
      if (!ifName || !device.interfaces[ifName]) {
        return { output: ciscoIosProfile.messages.invalid, error: true };
      }
      ensureVlan(device, vlanId);
      const prev = device.interfaces[ifName];
      const iface = {
        ...prev,
        switchport: {
          mode: 'access' as const,
          accessVlan: vlanId,
        },
      };
      device.interfaces = { ...device.interfaces, [ifName]: iface };
      return { output: '', state: commitDevice(state, device) };
    },
  },
  {
    id: 'cisco.show_vlan_brief',
    match: ['show', 'vlan', 'brief'],
    modes: ['exec', 'privileged'],
    handler: (_tokens, state, device) => {
      const lines = [
        'VLAN Name                             Status    Ports',
        '---- -------------------------------- --------- -------------------------------',
      ];
      const ids = Object.keys(device.vlans)
        .map(Number)
        .sort((a, b) => a - b);
      for (const id of ids) {
        const v = device.vlans[id];
        const name = (v.name || (id === 1 ? 'default' : `VLAN${id}`)).padEnd(32, ' ');
        const ports = Object.values(device.interfaces)
          .filter((i) => i.switchport?.mode === 'access' && i.switchport.accessVlan === id)
          .map((i) => i.name)
          .join(', ');
        lines.push(`${String(id).padEnd(4, ' ')} ${name} active    ${ports}`);
      }
      return { output: lines.join('\n') };
    },
  },
  {
    id: 'cisco.show_vlan',
    match: ['show', 'vlan'],
    modes: ['exec', 'privileged'],
    handler: (tokens, state, device, profile) => {
      // if more specific command matched elsewhere, fine; bare show vlan → brief-like
      if (tokens.length > 2) {
        return { output: profile.messages.invalid, error: true };
      }
      const brief = ciscoIosCommands.find((c) => c.id === 'cisco.show_vlan_brief');
      return brief ? brief.handler(tokens, state, device, profile) : { output: '' };
    },
  },
  {
    id: 'cisco.show_ip_interface_brief',
    match: ['show', 'ip', 'interface', 'brief'],
    modes: ['exec', 'privileged'],
    handler: (_tokens, _state, device) => {
      const lines = [
        'Interface                  IP-Address      OK? Method Status                Protocol',
      ];
      for (const iface of Object.values(device.interfaces)) {
        const ip = iface.ipv4?.address ?? 'unassigned';
        const status = iface.adminUp ? 'up' : 'administratively down';
        const proto = iface.operUp ? 'up' : 'down';
        lines.push(
          `${iface.name.padEnd(26, ' ')} ${ip.padEnd(15, ' ')} YES unset  ${status.padEnd(22, ' ')} ${proto}`
        );
      }
      return { output: lines.join('\n') };
    },
  },
  {
    id: 'cisco.show_running_config',
    match: ['show', 'running-config'],
    modes: ['privileged'],
    minPrivilege: 15,
    handler: (_tokens, _state, device) => {
      const lines = ['Building configuration...', '', 'Current configuration:', '!'];
      lines.push(`hostname ${device.hostname}`, '!');
      const vlanIds = Object.keys(device.vlans)
        .map(Number)
        .filter((id) => id !== 1)
        .sort((a, b) => a - b);
      for (const id of vlanIds) {
        lines.push(`vlan ${id}`);
        if (device.vlans[id].name) lines.push(` name ${device.vlans[id].name}`);
        lines.push('!');
      }
      for (const iface of Object.values(device.interfaces)) {
        lines.push(`interface ${iface.name}`);
        if (iface.switchport?.mode === 'access') {
          lines.push(' switchport mode access');
          if (iface.switchport.accessVlan && iface.switchport.accessVlan !== 1) {
            lines.push(` switchport access vlan ${iface.switchport.accessVlan}`);
          }
        }
        lines.push(iface.adminUp ? ' no shutdown' : ' shutdown');
        lines.push('!');
      }
      lines.push('end');
      return { output: lines.join('\n') };
    },
  },
  {
    id: 'cisco.help_question',
    match: ['?'],
    modes: ['exec', 'privileged', 'config', 'config-if', 'config-vlan'],
    handler: (_tokens, _state, device) => {
      const m = device.modeCtx.mode;
      const map: Record<string, string> = {
        exec: 'enable  show  ?',
        privileged: 'configure terminal  show  disable  ?',
        config: 'hostname  vlan  interface  exit  end  ?',
        'config-if': 'switchport mode access  switchport access vlan  shutdown  no shutdown  exit  end  ?',
        'config-vlan': 'name  exit  end  ?',
      };
      return {
        output: `Supported in this lab (${m}):\n  ${(map[m] || '').replace(/  /g, '\n  ')}\n\nOnly a documented subset of IOS is implemented.`,
      };
    },
  },
];

function normalizeIfaceName(raw: string): string {
  const s = raw.replace(/\s+/g, '');
  const m = s.match(/^(FastEthernet|Fa|GigabitEthernet|Gi|Ethernet|Eth)([0-9/]+)$/i);
  if (!m) return s;
  const type = m[1].toLowerCase();
  const num = m[2];
  if (type === 'fa' || type === 'fastethernet') return `FastEthernet${num}`;
  if (type === 'gi' || type === 'gigabitethernet') return `GigabitEthernet${num}`;
  if (type === 'eth' || type === 'ethernet') return `Ethernet${num}`;
  return s;
}

export { normalizeIfaceName };
