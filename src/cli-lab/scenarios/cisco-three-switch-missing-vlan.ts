import { DeviceState, NetworkState, Scenario } from '../engine/types';

const A = 'FastEthernet0/1';
const LEFT = 'FastEthernet0/23';
const RIGHT = 'FastEthernet0/24';

function makeSwitch(id: string, hasAccess: boolean): DeviceState {
  const ports = hasAccess ? [A] : [];
  if (id !== 'sw1') ports.push(LEFT);
  if (id !== 'sw3') ports.push(RIGHT);
  const interfaces: DeviceState['interfaces'] = {};
  for (const name of ports) {
    const access = name === A;
    interfaces[name] = {
      name, adminUp: true, operUp: true,
      switchport: access
        ? { mode: 'access', accessVlan: 10 }
        : { mode: 'trunk', trunkAllowed: [10] },
    };
  }
  const vlans: DeviceState['vlans'] = { 1: { id: 1, name: 'default', active: true } };
  if (id !== 'sw2') vlans[10] = { id: 10, name: 'USERS', active: true };
  return {
    id, hostname: id.toUpperCase(), vendor: 'cisco-ios', privilege: 0,
    modeCtx: { mode: 'exec' }, interfaces,
    vlans, routes: [],
  };
}

const initialState: NetworkState = {
  activeDeviceId: 'sw1',
  devices: {
    sw1: makeSwitch('sw1', true),
    sw2: makeSwitch('sw2', false),
    sw3: makeSwitch('sw3', true),
  },
  links: [
    { a: 'sw1', aIf: RIGHT, b: 'sw2', bIf: LEFT, up: true },
    { a: 'sw2', aIf: RIGHT, b: 'sw3', bIf: LEFT, up: true },
  ],
};

const pathGoal: Scenario['goals'][number] = {
  type: 'l2.vlanReachable', vlanId: 10,
  fromDevice: 'sw1', fromIf: A, toDevice: 'sw3', toIf: A,
};

export const ciscoThreeSwitchMissingVlanScenario: Scenario = {
  id: 'cisco-three-switch-missing-vlan10',
  title: 'Три коммутатора · потерянный VLAN',
  description: 'SW1 Fa0/24 ↔ SW2 Fa0/23, SW2 Fa0/24 ↔ SW3 Fa0/23. На SW1 и SW3 устройства в VLAN 10 не могут связаться. Trunk на всех узлах разрешает VLAN 10. Найдите причину на транзитном коммутаторе и устраните её. Проверяется конфигурационный L2-путь, не ICMP.',
  vendor: 'cisco-ios',
  concepts: ['vlan', 'trunk', 'diagnostics', 'multi-device', 'l2-path'],
  difficulty: 2,
  modesAllowed: ['learn', 'drill', 'task'],
  initialState,
  steps: [
    {
      id: 'investigate-and-fix',
      instruction: 'Сравните show vlan brief и show interfaces trunk на SW1, SW2 и SW3. Найдите, почему VLAN 10 не проходит от SW1 к SW3, и исправьте транзитный SW2.',
      explanation: 'Allowed VLAN на trunk ещё не означает, что VLAN существует и активен на промежуточном коммутаторе.',
      hint: 'Используйте переключатель консолей. На SW2 проверьте show vlan brief, затем в режиме config создайте недостающий VLAN.',
      accept: [pathGoal],
    },
    {
      id: 'save-repair',
      instruction: 'Путь восстановлен. Сохраните исправление на SW2, чтобы оно не потерялось при перезагрузке.',
      hint: 'Выберите SW2 → end → copy running-config startup-config (или write memory)',
      explanation: 'Оперативная конфигурация работает сразу, но сохранение — отдельное действие.',
      accept: [{ type: 'config.saved', device: 'sw2' }],
    },
  ],
  goals: [pathGoal, { type: 'config.saved', device: 'sw2' }],
  successMessage: 'VLAN 10 проходит через SW1 → SW2 → SW3 по модели L2-конфигурации; исправление SW2 сохранено в startup-config. Ping не эмулируется.',
};
