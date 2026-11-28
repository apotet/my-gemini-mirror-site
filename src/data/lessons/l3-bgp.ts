import type { Lesson } from './types';

export const LESSON_L3_BGP: Lesson = {
  "id": "l3-bgp",
  "title": "BGP: соседство, распространение и выбор выхода",
  "category": "L3 · Маршрутизация",
  "osiLayers": [
    "L3"
  ],
  "difficulty": "applied",
  "summary": "Как отличить работающий сеанс от пригодного маршрута, передать путь внутри автономной системы и понять, почему выбран именно этот выход.",
  "terms": [
    "BGP",
    "iBGP",
    "eBGP",
    "OpenSent",
    "OpenConfirm",
    "Established",
    "Route Reflector",
    "AS_PATH",
    "NEXT_HOP",
    "Weight",
    "Local Preference"
  ],
  "blocks": [
    {
      "heading": "Сеанс и маршрут — разные проверки",
      "body": "Сначала BGP устанавливает транспортное соединение, затем стороны обмениваются параметрами и подтверждениями. После отправки OPEN ожидается ответ в OpenSent; после принятия допустимого OPEN — подтверждение в OpenConfirm. Established означает, что сеанс установлен, но не обещает ни одного принятого маршрута.\n\nТип сеанса определяется номерами AS: одинаковые — iBGP, разные — eBGP. Loopback не превращает внешний сеанс во внутренний. У обычного Cisco IOS eBGP использует TTL 1, поэтому для пути через транзит одного IP-маршрута недостаточно: нужны подходящие настройки транспорта и обратная связность."
    },
    {
      "heading": "Пример: OPEN соседа принят, а его KEEPALIVE ещё нет",
      "body": "В журнале из условия уже есть Idle → Connect → OpenSent: TCP-соединение установлено, и наш маршрутизатор отправил соседу OPEN. Это только транспорт для сообщений BGP — сессия соседства ещё не установлена.\n\nДальше идут два разных шага:\n1. Принят корректный OPEN соседа — маршрутизатор отправляет свой KEEPALIVE и переходит из OpenSent в OpenConfirm.\n2. Принят KEEPALIVE соседа — только теперь сессия установлена: Established. UPDATE для этого не нужен.\n\nВ условии выполнен только первый шаг: наш KEEPALIVE отправлен, а KEEPALIVE соседа ещё не пришёл. Значит, состояние — OpenConfirm. Вариант «Established после OPEN» пропускает второй шаг, а Connect и Active относятся к установке TCP-соединения, а не к ожиданию UPDATE."
    },
    {
      "heading": "Почему цепочки iBGP недостаточно",
      "body": "Если R1 передал маршрут R2 по обычному iBGP, R2 не раздаёт его следующему iBGP-соседу только потому, что соединение с ним работает. Так ограничивается распространение маршрутов внутри системы.\n\nРешение — полная логическая связность сеансов или Route Reflector. Отражатель может передать выбранный путь от клиента другим клиентам и обычным соседям. Это меняет правила рекламы, а не физическую топологию: отдельный кабель между каждой парой участников не требуется."
    },
    {
      "heading": "Пример: кому RR отдаст путь, полученный от клиента C1",
      "body": "Условие: у Route Reflector есть сеансы с клиентами C1 и C2 и с обычным соседом N (non-client). Сеанса C1—C2 нет. RR выбрал лучший путь P, полученный от C1.\n\nПравило отражения: путь от клиента RR передаёт остальным клиентам и всем обычным соседям. Поэтому P получают C2 и N — отдельный сеанс C1—C2 не нужен. Источнику C1 путь назад не отправляют.\n\nОткуда ошибочные варианты: «только N» переносит на путь клиента ограничение для пути от non-client (тот RR отражает только клиентам); «только C2» незаслуженно исключает N; «никому» означает, что роль RR не учтена.\n\nЗащита от петель: внутри AS номер AS в путь не дописывается, поэтому обычная проверка AS_PATH таких петель не видит. RR помечает отражённый путь атрибутами ORIGINATOR_ID — идентификатор того, кто принёс путь (здесь C1), — и CLUSTER_LIST — список отражателей, которые его уже передали. Получатель отбрасывает путь, если видит в ORIGINATOR_ID себя или в CLUSTER_LIST свой кластер."
    },
    {
      "heading": "Достигнуть следующего узла и не принять петлю",
      "body": "Полученный префикс может оказаться непригодным, если адрес NEXT_HOP неизвестен внутренней маршрутизации. В обычном случае путь от внешнего соседа передаётся внутрь без замены этого адреса. На границе next-hop-self к внутреннему соседу может подставить достижимый адрес самого пограничного маршрутизатора.\n\nОтдельно проверяется история AS_PATH. Если внешний путь уже содержит собственный AS, он по обычным правилам отклоняется как потенциальная петля. Рабочий сеанс и доступный следующий узел не отменяют эту проверку."
    },
    {
      "heading": "Локальный выбор и политика для всей системы",
      "body": "На Cisco IOS больший Weight сравнивается раньше большего Local Preference. Поэтому при путях Weight 200 / Local Preference 100 и Weight 0 / Local Preference 300 первый выиграет на этом маршрутизаторе.\n\nWeight не передаётся соседям: его действие локально. Local Preference помогает согласовать предпочтительный выход внутри AS. Алгоритм не складывает атрибуты и не считает два пути равными лишь потому, что каждый выигрывает по одному полю."
    },
    {
      "heading": "Пример: Weight 200 у пути A против Weight 0 у пути B",
      "body": "Условие: на маршрутизаторе R с Cisco IOS два пригодных пути к сети P, NEXT_HOP обоих достижим:\n• путь A — Weight 200, Local Preference 100;\n• путь B — Weight 0, Local Preference 300.\n\nАлгоритм не «голосует» по числу выигранных полей, а сравнивает атрибуты по очереди. На Cisco IOS первый критерий — больший Weight: 200 против 0, побеждает A. Local Preference 100 против 300 здесь вообще не сравнивалась бы: до неё очередь доходит только при равном Weight. AS_PATH проверяется ещё позже.\n\nРазные Weight исключают и multipath: пути не равны, один из них лучший.\n\nWeight — локальная настройка самого R, а не стандартный атрибут BGP: соседям она не передаётся. Поэтому нельзя считать, что другие маршрутизаторы AS сделают тот же выбор. А сам порядок «Weight раньше Local Preference» — правило Cisco IOS: у других производителей Weight может не быть."
    }
  ],
  "relatedQuestionIds": [
    "l3-bgp-01",
    "l3-bgp-02",
    "l3-bgp-03",
    "l3-bgp-04",
    "l3-bgp-05",
    "l3-bgp-06",
    "l3-bgp-07"
  ],
  "sources": [
    "RFC 4271 — A Border Gateway Protocol 4 (BGP-4): https://www.rfc-editor.org/rfc/rfc4271",
    "RFC 4456 — BGP Route Reflection: https://www.rfc-editor.org/rfc/rfc4456",
    "Cisco — BGP Best Path Selection Algorithm: https://www.cisco.com/c/en/us/support/docs/ip/border-gateway-protocol-bgp/13753-25.html"
  ],
  "professional": {
    "summary": "BGP FSM, стандартные Cisco iBGP/eBGP параметры, правила Route Reflection, рекурсивный NEXT_HOP, AS_PATH loop detection и область действия Weight/Local Preference.",
    "terms": [
      "BGP",
      "iBGP",
      "eBGP",
      "OpenSent",
      "OpenConfirm",
      "Established",
      "Route Reflector",
      "AS_PATH",
      "NEXT_HOP",
      "Weight",
      "Local Preference"
    ],
    "blocks": [
      {
        "heading": "FSM и стандартные параметры Cisco",
        "body": "Успешный проход FSM может идти Idle → Connect → OpenSent → OpenConfirm → Established. Active также существует, но не является обязательной ступенью этого прохода. Корректный OPEN в OpenSent вызывает отправку KEEPALIVE и переход в OpenConfirm; полученный KEEPALIVE завершает установление. UPDATE не требуется для достижения Established.\n\nПри обычных настройках Cisco IOS external BGP AD=20, TTL=1; internal BGP AD=200, TTL=255. Это стандартные значения без изменённых distance, eBGP multihop и TTL security. Loopback-соседство требует подходящего update-source и обратной маршрутизации; AD влияет на RIB, а не исправляет транспорт TCP-сеанса."
      },
      {
        "heading": "OpenSent → OpenConfirm → Established по RFC 4271 §8.2.2",
        "body": "Условие: TCP установлен, локальный OPEN отправлен, состояние OpenSent; пришёл корректный OPEN соседа, его KEEPALIVE ещё нет. По RFC 4271 §8.2.2 в OpenSent говорящий ждёт OPEN: при ошибке он отправляет NOTIFICATION и переходит в Idle, а без ошибок отправляет KEEPALIVE и переходит в OpenConfirm. Если согласованное время удержания ненулевое, HoldTimer выставляется на этот интервал.\n\nВ состоянии OpenConfirm (тот же §8.2.2) говорящий ждёт KEEPALIVE или NOTIFICATION; в Established он переходит только после получения KEEPALIVE. UPDATE для этого не требуется: сеанс может быть Established с нулём префиксов. TCP-соединение и BGP-сессия — не одно и то же: OPEN передаётся только по уже готовому TCP, а Established означает готовность BGP.\n\nПроверка на Cisco IOS: `show ip bgp summary` показывает состояние соседа в колонке State/PfxRcd, а `show ip bgp neighbors` — в строке `BGP state`. Connect и Active — фазы установки TCP; вариант «Active до первого UPDATE» подменяет состояние транспорта этапом обмена маршрутами."
      },
      {
        "heading": "iBGP advertisement и Route Reflection",
        "body": "Без RR или иной предусмотренной архитектуры iBGP-learned path не рекламируется другому iBGP peer даже при best-path статусе и достижимом NEXT_HOP. Full mesh — логические сеансы между каждой парой участников.\n\nПо RFC 4456 RR отражает выбранный путь от client другим clients и non-clients; путь от non-client — clients. ORIGINATOR_ID и CLUSTER_LIST защищают от петель отражения. next-hop-self и send-community не снимают обычный запрет повторной iBGP-рекламы. Отражение одного best path также может скрывать альтернативные пути."
      },
      {
        "heading": "Отражение пути клиента C1 клиентам C2 и non-client N (RFC 4456 §6, §8)",
        "body": "Условие: C1 и C2 — клиенты RR, N — non-client, сеанса C1—C2 нет; P — выбранный путь от C1, фильтров нет. По RFC 4456 §6 путь, полученный от клиента, RR отражает остальным клиентам и всем non-client-соседям (и eBGP-соседям, если они есть); путь от non-client — только клиентам. Источнику C1 маршрут не возвращается, поэтому ответ — C2 и N.\n\nRFC 4456 §8: внутри AS путь не пополняется номерами AS, и AS_PATH петли отражения не ловит. ORIGINATOR_ID (optional non-transitive) — BGP Identifier говорящего, первым внёсшего путь в AS; получатель с тем же BGP Identifier путь отбрасывает. CLUSTER_LIST (optional non-transitive) — последовательность CLUSTER_ID отражателей: RR дописывает в начало списка свой CLUSTER_ID, а путь с собственным CLUSTER_ID в этом списке отбрасывается. Здесь C2 получает P с ORIGINATOR_ID равным идентификатору C1 и CLUSTER_LIST с CLUSTER_ID самого RR; в eBGP оба атрибута не передаются.\n\nПроверка на Cisco IOS: `show ip bgp <префикс>` для отражённого пути выводит поля `Originator:` и `Cluster list:`, а `show ip bgp neighbors <адрес>` помечает клиента строкой `Route-Reflector Client`. Отражение NEXT_HOP не меняет."
      },
      {
        "heading": "NEXT_HOP и AS_PATH: разные условия пригодности",
        "body": "В обычной рекламе внешнего пути по iBGP NEXT_HOP сохраняется. Требуется его рекурсивная достижимость, а не только Established к отправителю UPDATE. next-hop-self на границе к нужному внутреннему peer должен объявить адрес, который получатель действительно достигает. Обычный eBGP часто переписывает следующий узел, но third-party next hop на общей сети и явные политики являются исключениями.\n\nAS_PATH проверяют независимо: собственный AS в полученном AS_SEQUENCE по умолчанию исключает путь. eBGP добавляет собственный AS при внешней рекламе, а iBGP не дополняет путь каждым внутренним переходом. allowas-in и AS override — явные специальные сценарии, не стандартное разрешение петель. Длина AS_PATH не равна IP TTL пакета UPDATE."
      },
      {
        "heading": "Weight перед Local Preference",
        "body": "В обычном Cisco IOS best-path higher Weight предшествует higher Local Preference. Поэтому путь A с Weight 200 / LP 100 локально выигрывает у B с Weight 0 / LP 300 без сравнения последующих критериев, включая AS_PATH.\n\nWeight — локальная Cisco-настройка, а не атрибут UPDATE. Local Preference передаётся по iBGP для согласования исходящего выбора внутри AS и обычно не передаётся обычным eBGP-соседям. Различающиеся значения Weight не создают равноправные multipath-пути; локальную политику выхода нельзя приписывать всем маршрутизаторам AS или считать прямым управлением входящим трафиком извне."
      },
      {
        "heading": "Best path на Cisco IOS: Weight 200 у пути A против Weight 0 у пути B",
        "body": "Условие: пути A и B к P допустимы, NEXT_HOP достижимы, более ранних политик нет. По алгоритму Cisco «BGP Best Path Selection Algorithm» критерии применяются строго по порядку: сначала больший Weight, затем большая Local Preference, и только потом AS_PATH и остальные. A: Weight 200, Local Preference 100; B: Weight 0, Local Preference 300. На первом шаге 200 > 0 — побеждает A; Local Preference не сравнивалась. Разные Weight исключают и multipath: такие пути не равнозначны.\n\nWeight — проприетарная локальная настройка Cisco IOS, а не атрибут пути BGP: в UPDATE она не передаётся, соседи её не видят. У полученных путей Weight по умолчанию равен 0, однако его можно задать локально. Local Preference — стандартный атрибут (well-known discretionary), который передаётся по iBGP и согласует выход из AS; обычным eBGP-соседям он не отправляется. Поэтому выбор на R по Weight нельзя переносить на всю AS.\n\nПорядок «Weight раньше Local Preference» — особенность Cisco IOS, а не универсальное правило: в других реализациях Weight может отсутствовать, и первым сравнивается другой атрибут. Контроль: в `show ip bgp <префикс>` на R видны колонки Weight и LocPrf, лучший путь помечен `>`."
      }
    ],
    "sources": [
      "RFC 4271 — A Border Gateway Protocol 4 (BGP-4): https://www.rfc-editor.org/rfc/rfc4271",
      "RFC 4456 — BGP Route Reflection: https://www.rfc-editor.org/rfc/rfc4456",
      "Cisco — BGP Best Path Selection Algorithm: https://www.cisco.com/c/en/us/support/docs/ip/border-gateway-protocol-bgp/13753-25.html"
    ],
    "sourceCommit": "new-2026-11-13"
  }
};
