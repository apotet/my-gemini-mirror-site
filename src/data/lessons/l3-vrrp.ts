import { Lesson } from './types';

export const LESSON_L3_VRRP: Lesson = {
  id: 'l3-vrrp',
  title: 'VRRP: один шлюз на несколько маршрутизаторов',
  category: 'L3 · Маршрутизация',
  osiLayers: ['L3'],
  difficulty: 'applied',
  summary:
    'Как несколько маршрутизаторов делят один виртуальный IP, кто становится Master, по какому протоколу идут advertisement и зачем preemption.',
  terms: ['VRRP', 'VIP', 'Master', 'Backup', 'Priority', 'VRID', 'preemption', '224.0.0.18'],
  blocks: [
    {
      heading: 'Зачем VRRP',
      body: `Клиентам нужен один адрес шлюза. Если единственный маршрутизатор упадёт, сеть останется без выхода.

VRRP позволяет нескольким маршрутизаторам использовать один виртуальный IP. Клиенты указывают его как gateway и не знают, какое устройство сейчас активно.`,
    },
    {
      heading: 'Роли',
      body: `Master обслуживает VIP, отвечает на ARP и шлёт advertisement.

Backup слушает и готов принять роль, если Master замолчал.

Priority задаёт предпочтение: выше значение — выше шанс стать Master. По умолчанию 100. 255 обычно у владельца виртуального адреса.`,
    },
    {
      heading: 'Что должно совпадать',
      body: `VRID и виртуальный IP на участниках одной группы должны быть одинаковыми. Разный VRID — это уже другая группа, переключения не будет.

Интерфейсы должны быть up, multicast 224.0.0.18 и IP protocol 112 не должны резаться ACL.`,
    },
    {
      heading: 'Транспорт',
      body: `VRRP идёт напрямую по IP, протокол 112. Это не TCP и не UDP.

Advertisement обычно раз в секунду на multicast 224.0.0.18. В дампе фильтр: ip proto 112.`,
    },
    {
      heading: 'Preemption',
      body: `Если preemption включён (часто так по умолчанию), восстановившийся маршрутизатор с большим Priority снова становится Master.

Если выключен — текущий Master остаётся, пока сам не откажет. Это бывает полезно, чтобы не дёргать трафик при кратковременном восстановлении.`,
    },
  ],
  commands: [
    { title: 'Состояние', cmd: 'show vrrp brief\nshow vrrp', note: 'Кто Master, VIP, Priority, VRID' },
    { title: 'Дамп', cmd: "tcpdump -ni eth0 'ip proto 112'", note: 'Advertisement на линке' },
  ],
  relatedQuestionIds: ['l3-vrrp01', 'l3-vrrp02', 'l3-vrrp03', 'l3-vrrp04'],
  sources: ['RFC 5798 — Virtual Router Redundancy Protocol Version 3', 'Cisco IOS IP Application Services: VRRP'],
};
