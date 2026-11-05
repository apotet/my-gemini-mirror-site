import { Lesson } from './types';

export const LESSON_L2_ACCESS_GUARD: Lesson = {
  id: 'l2-access-guard',
  title: 'Port Security и DHCP Snooping: защита access-портов',
  category: 'L2 · Коммутация',
  osiLayers: ['L2'],
  difficulty: 'applied',
  summary:
    'Как ограничить MAC на порту, чем отличаются protect, restrict и shutdown, и как DHCP Snooping не даёт чужому серверу раздать клиентам шлюз и DNS.',
  terms: ['Port Security', 'err-disabled', 'sticky', 'DHCP Snooping', 'trusted', 'binding', 'rogue DHCP', 'DAI'],
  blocks: [
    {
      heading: 'Зачем Port Security',
      body: `Port Security ограничивает, какие MAC-адреса допустимы на access-порту и сколько их может быть.

Типичная задача: на рабочем месте должен быть один ПК. Если воткнули чужое устройство, порт не должен молча его принять.`,
    },
    {
      heading: 'Режимы нарушения',
      body: `Protect — неизвестные MAC блокируются, порт остаётся up, счётчик обычно не растёт.

Restrict — тоже блокирует, но считает нарушения и может слать syslog или SNMP.

Shutdown — порт уходит в err-disabled. Это режим по умолчанию на Cisco. Восстановление: убрать причину и сделать shutdown / no shutdown.`,
    },
    {
      heading: 'Static, dynamic и sticky',
      body: `Static MAC задают вручную. Dynamic коммутатор учит сам, но обычно не сохраняет в конфигурации.

Sticky учит MAC и пишет его в running-config. После сохранения конфигурации адрес останется и после перезагрузки.`,
    },
    {
      heading: 'Зачем DHCP Snooping',
      body: `Чужой DHCP-сервер в пользовательском VLAN может выдать клиенту свой шлюз или DNS. Трафик уйдёт не туда.

DHCP Snooping делит порты на trusted и untrusted. Ответы сервера (Offer, Ack) разрешены только с trusted. На untrusted они отбрасываются.`,
    },
    {
      heading: 'Почему после включения пропадает DHCP',
      body: `После включения snooping порты по умолчанию untrusted. Если uplink к серверу или relay не помечен trusted, клиенты перестают получать адреса, хотя сервер жив.

Проверяйте: snooping включён на нужном VLAN, uplink trusted, не зарезан rate limit, Option 82 не ломает relay.`,
    },
    {
      heading: 'Binding и что дальше',
      body: `Коммутатор пишет таблицу: MAC, выданный IP, VLAN, порт. Её используют Dynamic ARP Inspection и IP Source Guard — чтобы пускать только трафик, совпадающий с арендой.

Слишком низкий limit rate на клиентском порту режет и обычные Discover. Симптом тот же: «DHCP не работает».`,
    },
  ],
  commands: [
    { title: 'Port Security', cmd: 'show port-security\nshow port-security interface Gi0/1', note: 'Лимит, режим, sticky и счётчик нарушений' },
    { title: 'err-disabled', cmd: 'show interfaces status err-disabled', note: 'Порты, которые выключил shutdown' },
    { title: 'DHCP Snooping', cmd: 'show ip dhcp snooping\nshow ip dhcp snooping binding', note: 'Trusted-порты и таблица аренд' },
  ],
  relatedQuestionIds: ['l12-ps01', 'l12-ps02', 'l12-ps03', 'l12-ds01', 'l12-ds02', 'l12-ds03', 'l12-ds04'],
  sources: ['Cisco IOS Security Configuration Guide: Port Security', 'Cisco IOS IP Addressing Services: DHCP Snooping', 'RFC 2131'],
};
