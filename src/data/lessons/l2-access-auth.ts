import { Lesson } from './types';

export const LESSON_L2_ACCESS_AUTH: Lesson = {
  id: 'l2-access-auth',
  title: '802.1X и LLDP-MED: доступ и Voice VLAN',
  category: 'L2 · Коммутация',
  osiLayers: ['L2'],
  difficulty: 'applied',
  summary:
    'Кто участвует в аутентификации 802.1X, как передаются EAPOL и RADIUS и как телефон узнаёт Voice VLAN через LLDP-MED.',
  terms: ['802.1X', 'supplicant', 'authenticator', 'RADIUS', 'EAPOL', '1812', '1813', 'LLDP-MED', 'Voice VLAN', '802.1p', 'DSCP'],
  blocks: [
    {
      heading: 'Supplicant / authenticator / RADIUS',
      body: `Supplicant — клиент 802.1X, например программный компонент на ПК. Authenticator — коммутатор или точка доступа, которые управляют допуском клиента в сеть.

Сервер аутентификации проверяет учётные данные; обычно коммутатор общается с ним через RADIUS. После успешной аутентификации и авторизации обычный доступ разрешается согласно политике, которая может также назначать VLAN или ACL.`,
    },
    {
      heading: 'EAPOL до авторизации',
      body: `Между supplicant и authenticator сообщения EAP передаются через EAPOL непосредственно на L2. В модели 802.1X этот обмен доступен через неконтролируемый порт, пока контролируемый порт ещё не открыт для обычного трафика.

В базовом сценарии до успешной аутентификации обычный IP-трафик блокируется. Нельзя считать, что DHCP всегда разрешён: pre-auth ACL, guest VLAN, voice-доступ и другие исключения определяются настройками и возможностями платформы.`,
    },
    {
      heading: 'Порты RADIUS 1812/1813',
      body: `Для классического RADIUS обычно используют UDP 1812 при аутентификации и авторизации, а UDP 1813 — для accounting, то есть учёта сессий.

Это обмен authenticator с RADIUS-сервером. Клиент не отправляет EAPOL на UDP 1812: EAPOL работает на локальном канале, а коммутатор переносит EAP в RADIUS. Успешный Access-Accept позволяет применить полученную политику доступа; Access-Reject означает отказ.`,
    },
    {
      heading: 'Что делает LLDP-MED',
      body: `LLDP-MED расширяет LLDP для конечных устройств, в том числе IP-телефонов. Network Policy TLV сообщает политику приложения: VLAN ID, tagged/untagged, приоритет L2 (802.1p) и DSCP.

При поддержке LLDP-MED и согласованной конфигурации телефон может отправлять голос с тегом Voice VLAN, а ПК за телефоном — нетегированные кадры в access VLAN. Наличие access VLAN для ПК не исключает отдельно настроенную Voice VLAN для телефона.`,
    },
    {
      heading: 'Чего LLDP-MED не делает',
      body: `LLDP-MED не создаёт VLAN на коммутаторах, не обеспечивает её перенос через аплинки и не выдаёт телефону IP-адрес. VLAN и путь трафика настраивают заранее, а адрес телефон получает отдельно, например через DHCP.

LLDP-MED также не заменяет 802.1X и не доказывает, что телефон прошёл аутентификацию. STP управляет топологией без петель, а DHCP Option 82 добавляет сведения о подключении клиента; эти механизмы не создают Voice VLAN за счёт обнаружения телефона.`,
    },
  ],
  relatedQuestionIds: ['l12-dot1x01', 'l12-lldp01'],
  sources: [
    'IEEE 802.1X — Port-Based Network Access Control',
    'RFC 2865 — Remote Authentication Dial In User Service (RADIUS)',
    'RFC 2866 — RADIUS Accounting',
    'ANSI/TIA-1057 — LLDP for Media Endpoint Devices (LLDP-MED)',
  ],
};
