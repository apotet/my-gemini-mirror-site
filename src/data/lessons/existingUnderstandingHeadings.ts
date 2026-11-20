// Independently mapped question-to-existing-paragraph routes for Understanding.
// Only exact authored headings are accepted; no auto-generated lesson explanations.
export interface ExistingHeadingLink {
  lessonId: string;
  questionIds: string[];
  anchorId: string;
  afterHeading: {plain: string; professional: string};
}
export const EXISTING_HEADING_LINKS: ExistingHeadingLink[] = [
  {
    "lessonId": "l2-ethernet",
    "questionIds": [
      "l2-04"
    ],
    "anchorId": "in-depth-existing-l2-04",
    "afterHeading": {
      "plain": "Если получатель неизвестен или адресованы все",
      "professional": "Unknown unicast"
    }
  },
  {
    "lessonId": "l3-route-selection",
    "questionIds": [],
    "anchorId": "in-depth-existing-l3-16",
    "afterHeading": {
      "plain": "Сначала совпадение, затем самая длинная маска",
      "professional": "RIB/FIB, route selection и разрешение next hop"
    }
  },
  {
    "lessonId": "l7-http-status-basics",
    "questionIds": [
      "l7-05"
    ],
    "anchorId": "in-depth-existing-l7-05",
    "afterHeading": {
      "plain": "404 Not Found",
      "professional": "404 vs 410"
    }
  },
  {
    "lessonId": "tcpip-encapsulation",
    "questionIds": [
      "new-tcpip-router"
    ],
    "anchorId": "in-depth-existing-new-tcpip-router",
    "afterHeading": {
      "plain": "Порты и адреса на разных участках пути",
      "professional": "Иерархия полей: от Ethernet до приложения"
    }
  },
  {
    "lessonId": "l2-vlan",
    "questionIds": [
      "new-ts-vlan"
    ],
    "anchorId": "in-depth-existing-new-ts-vlan",
    "afterHeading": {
      "plain": "Куда дойдёт сообщение для всех и кто ответит за шлюз",
      "professional": "Access и trunk"
    }
  },
  {
    "lessonId": "l7-dns",
    "questionIds": [
      "new-ts-dns"
    ],
    "anchorId": "in-depth-existing-new-ts-dns",
    "afterHeading": {
      "plain": "Как разбирать ошибку поиска",
      "professional": "Если имя не резолвится"
    }
  },
  {
    "lessonId": "l2-access-auth",
    "questionIds": [
      "review-dot1x-20"
    ],
    "anchorId": "in-depth-existing-review-dot1x-20",
    "afterHeading": {
      "plain": "Разговор по кабелю до открытия доступа",
      "professional": "EAPOL до авторизации"
    }
  },
  {
    "lessonId": "l3-ospf",
    "questionIds": [
      "review-ospf-27"
    ],
    "anchorId": "in-depth-existing-review-ospf-27",
    "afterHeading": {
      "plain": "Как выбирается более короткий путь",
      "professional": "Cost: выбирается сумма"
    }
  },
  {
    "lessonId": "l1-fiber-splicing",
    "questionIds": [
      "l1v2-b-transfer"
    ],
    "anchorId": "in-depth-existing-l1v2-b-transfer",
    "afterHeading": {
      "plain": "КДЗС и нагреватель защищают стык, но не лечат его",
      "professional": "Защита КДЗС, нагрев и кассетирование"
    }
  },
  {
    "lessonId": "l1-fiber-identification",
    "questionIds": [
      "l1v2-c-bidi-wrong-pair"
    ],
    "anchorId": "in-depth-existing-l1v2-c-bidi-wrong-pair",
    "afterHeading": {
      "plain": "Подбирать пару надо по параметрам",
      "professional": "Оптическая совместимость"
    }
  },
  {
    "lessonId": "l2-stp-guard-design",
    "questionIds": [
      "l2-sec-05"
    ],
    "anchorId": "in-depth-existing-l2-sec-05",
    "afterHeading": {
      "plain": "STP · EtherChannel",
      "professional": "STP · EtherChannel"
    }
  },
  {
    "lessonId": "l2-stp-guard-design",
    "questionIds": [
      "l2-sec-08"
    ],
    "anchorId": "in-depth-existing-l2-sec-08",
    "afterHeading": {
      "plain": "MSTP · Граница региона",
      "professional": "MSTP · Граница региона"
    }
  },
  {
    "lessonId": "l2-vlan-security",
    "questionIds": [
      "l2-sec-13"
    ],
    "anchorId": "in-depth-existing-l2-sec-13",
    "afterHeading": {
      "plain": "VLAN · Несовпадение native",
      "professional": "VLAN · Несовпадение native"
    }
  },
  {
    "lessonId": "l2-vlan-security",
    "questionIds": [
      "l2-sec-18"
    ],
    "anchorId": "in-depth-existing-l2-sec-18",
    "afterHeading": {
      "plain": "Port Security · Подмена",
      "professional": "Port Security · Подмена"
    }
  },
  {
    "lessonId": "l3-bgp",
    "questionIds": [
      "l3-bgp-06"
    ],
    "anchorId": "in-depth-existing-l3-bgp-06",
    "afterHeading": {
      "plain": "Достигнуть следующего узла и не принять петлю",
      "professional": "NEXT_HOP и AS_PATH: разные условия пригодности"
    }
  },
  {
    "lessonId": "l4-lb",
    "questionIds": [
      "l4-lb-01"
    ],
    "anchorId": "in-depth-existing-l4-lb-01",
    "afterHeading": {
      "plain": "Проверка сервера и новые подключения",
      "professional": "Health state, eligibility и текущие соединения"
    }
  },
  {
    "lessonId": "l2-stp",
    "questionIds": [
      "l12-x02"
    ],
    "anchorId": "in-depth-existing-l12-x02",
    "afterHeading": {
      "plain": "Порт в резерве, порт выключен и кабель повреждён",
      "professional": "Blocking и Discarding"
    }
  },
  {
    "lessonId": "l2-stp",
    "questionIds": [
      "l12-d05"
    ],
    "anchorId": "in-depth-existing-l12-d05",
    "afterHeading": {
      "plain": "Почему кадр возвращается",
      "professional": "Петля без STP"
    }
  },
  {
    "lessonId": "tls-sni",
    "questionIds": [
      "l57-d02"
    ],
    "anchorId": "in-depth-existing-l57-d02",
    "afterHeading": {
      "plain": "Чем имя сертификата отличается от адреса",
      "professional": "Почему сертификат по умолчанию иногда подходит"
    }
  },
  {
    "lessonId": "l3-vrrp",
    "questionIds": [
      "l3-vrrp02"
    ],
    "anchorId": "in-depth-existing-l3-vrrp02",
    "afterHeading": {
      "plain": "Как выбирают активного участника",
      "professional": "Роли"
    }
  },
  {
    "lessonId": "l3-vrrp",
    "questionIds": [
      "l3-vrrp04"
    ],
    "anchorId": "in-depth-existing-l3-vrrp04",
    "afterHeading": {
      "plain": "Вернуть роль основному или оставить работающий резерв",
      "professional": "Preemption"
    }
  },
  {
    "lessonId": "ts-copp-storm",
    "questionIds": [
      "l12-copp01"
    ],
    "anchorId": "in-depth-existing-l12-copp01",
    "afterHeading": {
      "plain": "Обращение к устройству и передача через него",
      "professional": "Потери до ≠ через"
    }
  },
  {
    "lessonId": "ts-copp-storm",
    "questionIds": [
      "l12-storm01"
    ],
    "anchorId": "in-depth-existing-l12-storm01",
    "afterHeading": {
      "plain": "Почему кадры пропадают без ошибок на порту",
      "professional": "Что такое Storm Control"
    }
  },
  {
    "lessonId": "l7-monitoring-snmp-syslog",
    "questionIds": [
      "mon-snmp-01"
    ],
    "anchorId": "in-depth-existing-mon-snmp-01",
    "afterHeading": {
      "plain": "SNMPv2c против SNMPv3 и ловушка EngineID",
      "professional": "SNMPv3 USM: уровни защиты и конфликт snmpEngineID"
    }
  },
  {
    "lessonId": "l7-monitoring-snmp-syslog",
    "questionIds": [
      "mon-syslog-01"
    ],
    "anchorId": "in-depth-existing-mon-syslog-01",
    "afterHeading": {
      "plain": "Syslog: PRI, Facility и фильтрация по Severity",
      "professional": "Архитектура Syslog: PRI, пороги и выбор транспорта"
    }
  },
  {
    "lessonId": "ts-zabbix-monitoring",
    "questionIds": [
      "mon-zabbix-01"
    ],
    "anchorId": "in-depth-existing-mon-zabbix-01",
    "afterHeading": {
      "plain": "Типы элементов данных Zabbix: пассивный и активный агент, SNMP и Trapper",
      "professional": "Сетевая топология сбора в Zabbix"
    }
  }
];
