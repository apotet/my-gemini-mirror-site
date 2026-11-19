# Углублённый L2 — первоначальная содержательная инвентаризация

Baseline staging main: d08d24c814c4a60731d42addeb7ef7b4b3a16cef. Реестр ASSIGNED learningLevel=2 точно совпадает с getTestingPool('mixed', 'in-depth'):160/160. Источники учебного контента при аудите не менялись.

Статусы исходного состояния: {"REVIEW":9,"FIX":141,"PASS":10}. Эти статусы не являются разрешением на merge: браузерная проверка и независимая приёмка конечного SHA ещё не выполнены. Все160 условий/ключей/вариантов прочитаны; подтверждённых неправильных ключей нет. Для l4-x03/l4-x04 подтверждён дефект правдоподобности отдельных дистракторов; планируется изменение только неправильных вариантов с сохранением ключей/индексов и старых снимков.

Исходное структурное покрытие:136 individual,104 pro,58 question→lesson;55 из58 связей имеют оба стиля. Это инвентарные показатели, не содержательный PASS. Поимённые доказательства всех12 пунктов, фотографии и проверенные технические источники — в четырёх соседних initial-group JSON.

Отложенный TODO «разобраться с Базой и фильтрами уровней» сохранён в начале ROADMAP; его выполнение разрешено только после закрытия L2. Фильтры/реестр/готовые Base-разборы не меняются.

| ID | Начальный статус | Подтверждённые замечания / контекст | Отчёт |
| --- | --- | --- | --- |
| gap-pack2-05 | REVIEW |  | [evidence](initial-group-1.json) |
| gap-pack2-10 | FIX | CONTEXTUAL_GLOSSARY_DEFECT; CONTEXTUAL_GLOSSARY_DEFECT | [evidence](initial-group-1.json) |
| gap-pack2-11 | FIX | LESSON_MISSING_PRO | [evidence](initial-group-1.json) |
| gap-pack2-16 | FIX | LESSON_MISSING_PRO; CONTEXTUAL_GLOSSARY_DEFECT | [evidence](initial-group-1.json) |
| gap-pack2-21 | FIX | LESSON_MISSING_PRO | [evidence](initial-group-1.json) |
| gap-pack2-27 | FIX | MISSING_LESSON | [evidence](initial-group-1.json) |
| gap-pack3-08 | FIX | MISSING_LESSON | [evidence](initial-group-1.json) |
| gap-pack3-12 | FIX | MISSING_LESSON; CONTEXTUAL_GLOSSARY_DEFECT | [evidence](initial-group-1.json) |
| gap-pack3-15 | FIX | MISSING_LESSON | [evidence](initial-group-1.json) |
| gen-diag-0 | FIX | MISSING_LESSON | [evidence](initial-group-1.json) |
| gen-diag-10 | FIX | MISSING_LESSON | [evidence](initial-group-1.json) |
| gen-diag-13 | FIX | MISSING_LESSON | [evidence](initial-group-1.json) |
| gen-diag-2 | REVIEW |  | [evidence](initial-group-1.json) |
| gen-diag-5 | FIX | MISSING_LESSON | [evidence](initial-group-1.json) |
| gen-diag-6 | FIX | MISSING_LESSON | [evidence](initial-group-1.json) |
| gen-diag-7 | FIX | MISSING_LESSON; MISSING_PRO; CONTEXTUAL_GLOSSARY_DEFECT | [evidence](initial-group-1.json) |
| gen-diag-9 | FIX | MISSING_LESSON | [evidence](initial-group-1.json) |
| gen-osi-a-18 | FIX | MISSING_LESSON; MISSING_PRO | [evidence](initial-group-1.json) |
| gen-osi-a-19 | FIX | CONTEXTUAL_GLOSSARY_DEFECT | [evidence](initial-group-1.json) |
| gen-osi-a-2 | FIX | MISSING_LESSON; MISSING_PRO | [evidence](initial-group-1.json) |
| gen-port-11 | FIX | MISSING_LESSON; MISSING_PRO; CONTEXTUAL_GLOSSARY_DEFECT | [evidence](initial-group-1.json) |
| gen-port-14 | FIX | MISSING_LESSON; MISSING_PRO; CONTEXTUAL_GLOSSARY_DEFECT | [evidence](initial-group-1.json) |
| gen-transport-1 | FIX | MISSING_LESSON; MISSING_PRO | [evidence](initial-group-1.json) |
| gen-transport-14 | FIX | MISSING_LESSON; MISSING_PRO; CONTEXTUAL_GLOSSARY_DEFECT | [evidence](initial-group-1.json) |
| gen-transport-16 | FIX | MISSING_LESSON; MISSING_PRO | [evidence](initial-group-1.json) |
| gen-transport-17 | FIX | MISSING_LESSON; MISSING_PRO; WHY_TOO_GENERIC; CONTEXTUAL_GLOSSARY_DEFECT | [evidence](initial-group-1.json) |
| gen-transport-5 | FIX | MISSING_LESSON; MISSING_PRO | [evidence](initial-group-1.json) |
| gen-transport-7 | FIX | MISSING_LESSON | [evidence](initial-group-1.json) |
| k-01 | FIX | MISSING_LESSON; MISSING_PRO | [evidence](initial-group-1.json) |
| k-02 | FIX | MISSING_LESSON; MISSING_PRO; WRONG_PAYLOAD_BOUNDARY | [evidence](initial-group-1.json) |
| k-03 | FIX | MISSING_LESSON; MISSING_PRO | [evidence](initial-group-1.json) |
| k-04 | FIX | MISSING_PRO | [evidence](initial-group-1.json) |
| k-05 | FIX | MISSING_LESSON; MISSING_PRO | [evidence](initial-group-1.json) |
| k-06 | REVIEW |  | [evidence](initial-group-1.json) |
| k-07 | FIX | MISSING_PRO; CONTEXTUAL_GLOSSARY_DEFECT | [evidence](initial-group-1.json) |
| l1-02 | FIX | MISSING_LESSON | [evidence](initial-group-1.json) |
| l1-04 | FIX | MISSING_LESSON; CONTEXTUAL_GLOSSARY_DEFECT | [evidence](initial-group-1.json) |
| l12-copp01 | REVIEW |  | [evidence](initial-group-1.json) |
| l12-d05 | FIX | PRO_TOO_SHALLOW_FOR_STEM; CONTEXTUAL_GLOSSARY_DEFECT | [evidence](initial-group-1.json) |
| l12-ds04 | FIX | LESSON_PLATFORM_EFFECT_MISSING; CONTEXTUAL_GLOSSARY_DEFECT | [evidence](initial-group-1.json) |
| l12-storm01 | PASS |  | [evidence](initial-group-2.json) |
| l12-x02 | FIX | PRO_INCOMPLETE | [evidence](initial-group-2.json) |
| l12-x03 | FIX | PRO_MISSING; LESSON_MISSING; LESSON_SECTION_MISSING | [evidence](initial-group-2.json) |
| l1v2-a-category-limit | FIX | FOREIGN_FALLBACK; PLAIN_INCOMPLETE; PRO_MISSING; LESSON_MISSING; TOOLTIP_GAP | [evidence](initial-group-2.json) |
| l1v2-a-jacket-kink | FIX | FOREIGN_FALLBACK; PLAIN_INCOMPLETE; PRO_MISSING; LESSON_MISSING; LESSON_SECTION_MISSING | [evidence](initial-group-2.json) |
| l1v2-a-jacket-limit | FIX | FOREIGN_FALLBACK; PLAIN_INCOMPLETE; PRO_MISSING; LESSON_MISSING; TOOLTIP_GAP | [evidence](initial-group-2.json) |
| l1v2-a-label-sftp | FIX | FOREIGN_FALLBACK; PLAIN_INCOMPLETE; PRO_MISSING; LESSON_MISSING; MISLEADING_PARTIAL_TOOLTIP | [evidence](initial-group-2.json) |
| l1v2-a-pairs | FIX | FOREIGN_FALLBACK; PLAIN_INCOMPLETE; PRO_MISSING; LESSON_MISSING; LESSON_SECTION_MISSING | [evidence](initial-group-2.json) |
| l1v2-a-solid-use | FIX | FOREIGN_FALLBACK; PLAIN_INCOMPLETE; PRO_MISSING; LESSON_MISSING; TOOLTIP_GAP | [evidence](initial-group-2.json) |
| l1v2-a-strain-view | FIX | FOREIGN_FALLBACK; PLAIN_INCOMPLETE; PRO_MISSING; LESSON_MISSING | [evidence](initial-group-2.json) |
| l1v2-b-bend-loss | FIX | FOREIGN_FALLBACK; PLAIN_INCOMPLETE; PRO_MISSING; LESSON_MISSING; TOOLTIP_GAP | [evidence](initial-group-2.json) |
| l1v2-b-position-cause | FIX | FOREIGN_FALLBACK; PLAIN_INCOMPLETE; PRO_MISSING; LESSON_MISSING; LESSON_SECTION_MISSING | [evidence](initial-group-2.json) |
| l1v2-b-screen-xy | FIX | FOREIGN_FALLBACK; PLAIN_INCOMPLETE; PRO_MISSING; LESSON_MISSING | [evidence](initial-group-2.json) |
| l1v2-b-transfer | FIX | FOREIGN_FALLBACK; PLAIN_INCOMPLETE; PRO_MISSING; LESSON_MISSING | [evidence](initial-group-2.json) |
| l1v2-c-bidi-wrong-pair | FIX | FOREIGN_FALLBACK; PLAIN_INCOMPLETE; PRO_MISSING; LESSON_MISSING; TOOLTIP_GAP | [evidence](initial-group-2.json) |
| l1v2-c-closure-service | FIX | FOREIGN_FALLBACK; PLAIN_INCOMPLETE; PRO_MISSING; LESSON_MISSING; LESSON_SECTION_MISSING | [evidence](initial-group-2.json) |
| l1v2-c-converter-polarity | FIX | LESSON_MISSING | [evidence](initial-group-2.json) |
| l1v2-c-industrial-fiber-ports | FIX | FOREIGN_FALLBACK; PLAIN_INCOMPLETE; PRO_MISSING; LESSON_MISSING | [evidence](initial-group-2.json) |
| l1v2-c-splitter-role | FIX | FOREIGN_FALLBACK; PLAIN_INCOMPLETE; PRO_MISSING; LESSON_MISSING; LESSON_SECTION_MISSING | [evidence](initial-group-2.json) |
| l2-04 | PASS |  | [evidence](initial-group-2.json) |
| l2-12 | FIX | PRO_MISSING; LESSON_MISSING; LESSON_SECTION_MISSING; TOOLTIP_GAP | [evidence](initial-group-2.json) |
| l2-sec-05 | PASS |  | [evidence](initial-group-2.json) |
| l2-sec-08 | PASS |  | [evidence](initial-group-2.json) |
| l2-sec-13 | PASS |  | [evidence](initial-group-2.json) |
| l2-sec-18 | PASS |  | [evidence](initial-group-2.json) |
| l3-16 | FIX | LESSON_MISSING | [evidence](initial-group-2.json) |
| l3-bgp-06 | PASS |  | [evidence](initial-group-2.json) |
| l3-d04 | FIX | PRO_MISSING; LESSON_MISSING; LESSON_SECTION_MISSING | [evidence](initial-group-2.json) |
| l3-d07 | FIX | PRO_INCOMPLETE; LESSON_MISSING; LESSON_SECTION_MISSING | [evidence](initial-group-2.json) |
| l3-d08 | FIX | PLAIN_INCOMPLETE; PRO_MISSING; LESSON_MISSING; LESSON_SECTION_MISSING | [evidence](initial-group-2.json) |
| l3-ospf-03 | FIX | LESSON_SECTION_MISSING | [evidence](initial-group-2.json) |
| l3-vrrp02 | FIX | LESSON_PRO_INACCURATE | [evidence](initial-group-2.json) |
| l3-vrrp04 | FIX | PRO_INACCURATE; LESSON_PRO_INACCURATE | [evidence](initial-group-2.json) |
| l4-03 | PASS |  | [evidence](initial-group-2.json) |
| l4-04 | FIX | PRO_MISSING; LESSON_MISSING; LESSON_SECTION_MISSING | [evidence](initial-group-2.json) |
| l4-d04 | FIX | WHY_UNSPECIFIC | [evidence](initial-group-2.json) |
| l4-d06 | FIX | PRO_INCOMPLETE; LESSON_SECTION_MISSING; TOOLTIP_GAP | [evidence](initial-group-2.json) |
| l4-lb-01 | FIX | WHY_TAUTOLOGY | [evidence](initial-group-2.json) |
| l4-new-05 | FIX | PLAIN_INCOMPLETE; PRO_MISSING; LESSON_MISSING; LESSON_SECTION_MISSING | [evidence](initial-group-2.json) |
| l4-new-07 | FIX | PLAIN_INCOMPLETE; PRO_MISSING; LESSON_MISSING; LESSON_SECTION_MISSING; TOOLTIP_GAP | [evidence](initial-group-2.json) |
| l4-x03 | FIX | Plain is only «Нет handshake/retransmit в транспорте»: no causal explanation of latency/order/loss or application responsibility.; No professional layer.; Wrong option «Нужен только RST» is a toy distractor; quality REVIEW, root has independently accepted targeted replacement.; Runtime getLessonForQuestion returns no lesson despite existing suitable material. | [evidence](initial-group-3.json) |
| l4-x04 | FIX | No professional layer.; Distractors VLAN/ARP/LED color do not test realistic TCP misunderstandings; root accepted wrong-option-only repair.; Runtime getLessonForQuestion returns no lesson despite existing suitable material. | [evidence](initial-group-3.json) |
| l5-02 | FIX | No professional layer.; Runtime getLessonForQuestion returns no lesson despite existing suitable material. | [evidence](initial-group-3.json) |
| l57-d02 | FIX | Question pro says SAN/CN without legacy qualification.; Linked lesson pro repeatedly permits CN-or-SAN for modern hostname verification; RFC9525 requires subjectAltName. | [evidence](initial-group-3.json) |
| l57-d04 | FIX | Runtime getLessonForQuestion returns no lesson despite existing suitable material. | [evidence](initial-group-3.json) |
| l57-x04 | FIX | Why only says first change occurred/response lost; it does not state the idempotent same-state consequence.; Runtime getLessonForQuestion returns no lesson despite existing suitable material. | [evidence](initial-group-3.json) |
| l57-x05 | FIX | Runtime getLessonForQuestion returns no lesson despite existing suitable material. | [evidence](initial-group-3.json) |
| l57-x06 | FIX | Runtime getLessonForQuestion returns no lesson despite existing suitable material. | [evidence](initial-group-3.json) |
| l57-x19 | FIX | Runtime getLessonForQuestion returns no lesson despite existing suitable material. | [evidence](initial-group-3.json) |
| l6-01 | FIX | No professional layer.; UTF-8 glossary entry exists but has no tooltip metadata; UTF-16LE needs intelligible contextual expansion.; Runtime getLessonForQuestion returns no lesson despite existing suitable material.; Essential terminology/interactive definition work: UTF-16LE, UTF-8 tooltip metadata | [evidence](initial-group-3.json) |
| l7-01 | FIX | No professional layer.; Why «У клиента уже есть документ» omits validator/unchanged-representation mechanism.; Runtime getLessonForQuestion returns no lesson despite existing suitable material.; Essential terminology/interactive definition work: ETag, If-None-Match | [evidence](initial-group-3.json) |
| l7-02 | FIX | Existing lesson does not explain NAK→INIT, DHCPINFORM distinction or rejection versus silent timeout in either style. | [evidence](initial-group-3.json) |
| l7-03 | FIX | Existing lesson DORA names messages but neither style explains SELECTING broadcast versus unicast renewal, essential to distinguishing options. | [evidence](initial-group-3.json) |
| l7-05 | FIX | No professional layer.; Runtime getLessonForQuestion returns no lesson despite existing suitable material. | [evidence](initial-group-3.json) |
| l7-new-02 | FIX | Plain duplicates Why verbatim; no independent beginner causal layer.; No professional layer.; Runtime getLessonForQuestion returns no lesson despite existing suitable material.; Essential terminology/interactive definition work: OPT, PMTU | [evidence](initial-group-3.json) |
| l7-new-03 | FIX | Plain duplicates Why verbatim.; No professional layer.; Runtime getLessonForQuestion returns no lesson despite existing suitable material.; Essential terminology/interactive definition work: DS, DNSKEY, RRSIG, RRset, bogus | [evidence](initial-group-3.json) |
| l7-new-04 | FIX | Plain duplicates Why verbatim.; No professional layer.; Runtime getLessonForQuestion returns no lesson despite existing suitable material. | [evidence](initial-group-3.json) |
| mon-snmp-01 | FIX | Pro and lesson prescribe AES128/256 without explaining that RFC3826 standardizes AES-CFB128 and other lengths require matching implementation support.; Lesson wrongly presents periodic polling as guaranteed convergence and temporal order alone as proof of incident causation. | [evidence](initial-group-3.json) |
| mon-syslog-01 | FIX | Shared lesson contains confirmed security/guarantee/causal overclaims listed in sharedLessonFindings; threshold explanation itself is sound. | [evidence](initial-group-3.json) |
| mon-syslog-05 | FIX | Shared lesson contains confirmed security/guarantee/causal overclaims listed in sharedLessonFindings; the four common IOS destinations are correctly distinguished. | [evidence](initial-group-3.json) |
| mon-zabbix-01 | FIX | Pro places StartAgents=0 beside agent2 configuration without restriction; it applies to classic agentd, while Agent2 omits Server to disable passive checks.; Shared lesson incorrectly equates every ifOutDiscards increase with full egress buffers and treats ping success as exclusion of relevant route problems. | [evidence](initial-group-3.json) |
| new-tcpip-router | FIX | Runtime getLessonForQuestion returns no lesson despite existing suitable material. | [evidence](initial-group-3.json) |
| new-ts-dns | FIX | Runtime getLessonForQuestion returns no lesson despite existing suitable material. | [evidence](initial-group-3.json) |
| new-ts-duplex | FIX | Runtime getLessonForQuestion returns no lesson despite existing suitable material. | [evidence](initial-group-3.json) |
| new-ts-photo-panel | FIX | Runtime getLessonForQuestion returns no lesson despite existing suitable material. | [evidence](initial-group-3.json) |
| new-ts-vlan | FIX | Runtime getLessonForQuestion returns no lesson despite existing suitable material. | [evidence](initial-group-3.json) |
| photo-formfactor-compat | FIX | Runtime getLessonForQuestion returns no lesson despite existing suitable material. | [evidence](initial-group-3.json) |
| photo-otdr-end | FIX | Plain adds unrelated generic polish/marking advice rather than causal trace interpretation.; No professional layer.; Linked OTDR lesson has seven tags absent from glossary and tooltip metadata.; Essential terminology/interactive definition work: reflectance, pulse width, stacked, overlay, SM, MM, IOR | [evidence](initial-group-3.json) |
| photo-otdr-slope | FIX | Plain is Why plus generic connector advice, not a separate causal account of backscatter/attenuation.; No professional layer.; Runtime getLessonForQuestion returns no lesson despite existing suitable material.; Recommended OTDR lesson also needs missing glossary tags repaired. | [evidence](initial-group-3.json) |
| photo-otdr-use | FIX | Runtime getLessonForQuestion returns no lesson despite existing suitable material.; Recommended OTDR lesson also needs missing glossary tags repaired. | [evidence](initial-group-3.json) |
| photo-sfpplus-label | FIX | Plain repeats Why with generic optical advice; expand causal rated reach/loss-budget distinction.; No professional layer.; Runtime getLessonForQuestion returns no lesson despite existing suitable material. | [evidence](initial-group-3.json) |
| photo-txrx-link | FIX | Plain repeats Why with generic optical advice.; No professional layer.; Runtime getLessonForQuestion returns no lesson despite existing suitable material. | [evidence](initial-group-3.json) |
| review-dot1x-20 | FIX | Runtime getLessonForQuestion returns no lesson despite existing suitable material. | [evidence](initial-group-3.json) |
| review-igmp-9 | FIX | No professional layer.; Runtime getLessonForQuestion returns no lesson despite existing suitable material. | [evidence](initial-group-3.json) |
| review-osi-34 | FIX | Existing osi-pdu gives L5 role only, not checkpoint/idempotent recovery mechanism needed to answer distinctions in both styles. | [evidence](initial-group-3.json) |
| review-ospf-27 | PASS |  | [evidence](initial-group-3.json) |
| review-poe-30 | FIX | Runtime getLessonForQuestion returns no lesson despite existing suitable material. | [evidence](initial-group-3.json) |
| review-ptp-17 | FIX | No professional layer.; Runtime getLessonForQuestion returns no lesson despite existing suitable material.; Essential terminology/interactive definition work: boundary clock, transparent clock, grandmaster | [evidence](initial-group-3.json) |
| review-qos-22 | FIX | Lesson pro tags CE and PHB have no GLOSSARY definitions, so interactive term cards cannot open.; Essential terminology/interactive definition work: CE, PHB | [evidence](initial-group-3.json) |
| review-slaac-4 | PASS |  | [evidence](initial-group-3.json) |
| review-syslog-25 | FIX | {"category":"missingLessonLink","evidence":"Actual resolver lessonId=null. Существующий предметный урок l4-tcp-loss не связан."} | [evidence](initial-group-4.json) |
| stp-new-04 | FIX | {"category":"unrelatedAuxiliary","evidence":"Практический совет про MAC/CAM aging не относится к отказу RSTP Root Port."} | [evidence](initial-group-4.json) |
| stp-new-09 | FIX | {"category":"unrelatedAuxiliary","evidence":"Практический совет про MAC/CAM aging не относится к UDLD aggressive/errdisable."} | [evidence](initial-group-4.json) |
| tcp-05 | FIX | {"category":"missingLessonLink","evidence":"Actual resolver lessonId=null. Существующий предметный урок tcpip-encapsulation не связан."}; {"category":"unrelatedAuxiliary","evidence":"Схема TCP SYN/SYN-ACK/ACK не объясняет проверяемый механизм. Удалить нерелевантную общую схему либо заменить предметной; необязательную картинку добавлять не требуется."} | [evidence](initial-group-4.json) |
| tcp-06 | FIX | {"category":"unrelatedAuxiliary","evidence":"Схема TCP SYN/SYN-ACK/ACK не объясняет проверяемый механизм. Удалить нерелевантную общую схему либо заменить предметной; необязательную картинку добавлять не требуется."} | [evidence](initial-group-4.json) |
| tcp-10 | FIX | {"category":"professional","evidence":"Инженерный разбор отсутствует. Добавить DF=0/1, ICMP Fragmentation Needed и сборку фрагментов на адресате."}; {"category":"missingLessonLink","evidence":"Actual resolver lessonId=null. Существующий предметный урок tcpip-encapsulation не связан."}; {"category":"lessonSectionCoverage","evidence":"Существующий урок содержит фрагменты, но DF=1 и ICMP не раскрыты в обоих стилях. Добавить парный предметный раздел DF/MTU/ICMP."}; {"category":"glossaryDefinition","terms":["DF"],"evidence":"Подтверждённые учебные термины без tooltip definition: DF. Требуется понятное определение и контекст, без подмены одним тегом."}; {"category":"unrelatedAuxiliary","evidence":"Схема TCP SYN/SYN-ACK/ACK не объясняет проверяемый механизм. Удалить нерелевантную общую схему либо заменить предметной; необязательную картинку добавлять не требуется."} | [evidence](initial-group-4.json) |
| tcpip-d01 | FIX | {"category":"unrelatedAuxiliary","evidence":"Схема TCP SYN/SYN-ACK/ACK не объясняет проверяемый механизм. Удалить нерелевантную общую схему либо заменить предметной; необязательную картинку добавлять не требуется."} | [evidence](initial-group-4.json) |
| tcpip-d02 | FIX | {"category":"professional","evidence":"Pro сводится к совету разрешить ICMP PTB либо исправить MTU/MSS clamp. Не объясняет механизм black hole, различие IPv4 Fragmentation Needed и IPv6 PTB, проверку зависимости от размера."}; {"category":"missingLessonLink","evidence":"Actual resolver lessonId=null. Существующий предметный урок tcpip-encapsulation не связан."}; {"category":"lessonSectionCoverage","evidence":"Добавить парный раздел PMTUD black hole: DF=1 → ICMP 3/4 → фильтрация → малые обмены работают, большие зависают. Различать IPv6 PTB."}; {"category":"glossaryDefinition","terms":["DF"],"evidence":"Подтверждённые учебные термины без tooltip definition: DF. Требуется понятное определение и контекст, без подмены одним тегом."}; {"category":"unrelatedAuxiliary","evidence":"Схема TCP SYN/SYN-ACK/ACK не объясняет проверяемый механизм. Удалить нерелевантную общую схему либо заменить предметной; необязательную картинку добавлять не требуется."} | [evidence](initial-group-4.json) |
| tcpip-d04 | FIX | {"category":"professional","evidence":"Pro перечисляет symmetry/state sync/policy routing без механизма и проверки. Термин «full duplex state» в brief смешивает двунаправленное состояние с режимом Ethernet."}; {"category":"missingLessonLink","evidence":"Actual resolver lessonId=null. Существующий предметный урок ts-method не связан."}; {"category":"lessonSectionCoverage","evidence":"В ts-method добавить парный раздел stateful firewall/asymmetric path. Общая проверка доступности сервиса не объясняет размещение состояния."}; {"category":"unrelatedAuxiliary","evidence":"Схема TCP SYN/SYN-ACK/ACK не объясняет проверяемый механизм. Удалить нерелевантную общую схему либо заменить предметной; необязательную картинку добавлять не требуется."} | [evidence](initial-group-4.json) |
| tcpip-ntp01 | FIX | {"category":"professional","evidence":"Инженерный разбор отсутствует. Нужны источник времени, offset, состояние синхронизации и различие event/receive time."}; {"category":"unrelatedAuxiliary","evidence":"Схема TCP SYN/SYN-ACK/ACK не объясняет проверяемый механизм. Удалить нерелевантную общую схему либо заменить предметной; необязательную картинку добавлять не требуется."} | [evidence](initial-group-4.json) |
| tcpip-x14 | FIX | {"category":"professional","evidence":"Инженерный разбор отсутствует. Объяснить DF=1, превышение MTU, ICMP Type 3 Code 4 и возможную фильтрацию ответа."}; {"category":"missingLessonLink","evidence":"Actual resolver lessonId=null. Существующий предметный урок tcpip-encapsulation не связан."}; {"category":"lessonSectionCoverage","evidence":"Раздел о размерах и Offset не заменяет объяснение запрета DF. Добавить парный DF/ICMP раздел в существующий урок."}; {"category":"glossaryDefinition","terms":["DF"],"evidence":"Подтверждённые учебные термины без tooltip definition: DF. Требуется понятное определение и контекст, без подмены одним тегом."}; {"category":"unrelatedAuxiliary","evidence":"Схема TCP SYN/SYN-ACK/ACK не объясняет проверяемый механизм. Удалить нерелевантную общую схему либо заменить предметной; необязательную картинку добавлять не требуется."} | [evidence](initial-group-4.json) |
| tcpip-x21 | REVIEW |  | [evidence](initial-group-4.json) |
| tcpip-x26 | FIX | {"category":"professional","evidence":"Весь pro — «Router rewrite MAC to next-hop. Ошибка. Думать, что TCP ports меняет каждый роутер». Нет TTL, IPv4 checksum, условий Ethernet и без NAT."}; {"category":"missingLessonLink","evidence":"Actual resolver lessonId=null. Существующий предметный урок tcpip-model не связан."}; {"category":"unrelatedAuxiliary","evidence":"Схема TCP SYN/SYN-ACK/ACK не объясняет проверяемый механизм. Удалить нерелевантную общую схему либо заменить предметной; необязательную картинку добавлять не требуется."} | [evidence](initial-group-4.json) |
| tr-01 | REVIEW |  | [evidence](initial-group-4.json) |
| tr-02 | FIX | {"category":"missingLessonLink","evidence":"Actual resolver lessonId=null. Существующий предметный урок ts-method не связан."}; {"category":"lessonSectionCoverage","evidence":"В ts-method добавить парный раздел loopback/Ethernet: что именно установлено успешным ping 127.0.0.1."} | [evidence](initial-group-4.json) |
| tr-03 | FIX | {"category":"missingLessonLink","evidence":"Actual resolver lessonId=null. Существующий предметный урок ts-method не связан."}; {"category":"lessonSectionCoverage","evidence":"Уточнить парный DNS/HTTP Host раздел: корректный DNS не гарантирует одинаковый HTTP-ответ по имени и IP."} | [evidence](initial-group-4.json) |
| tr-05 | FIX | {"category":"missingLessonLink","evidence":"Actual resolver lessonId=null. Существующий предметный урок l3-arp не связан."} | [evidence](initial-group-4.json) |
| tr-08 | FIX | {"category":"missingLessonLink","evidence":"Actual resolver lessonId=null. Существующий предметный урок l4-tcp-loss не связан."}; {"category":"lessonSectionCoverage","evidence":"Plain l4-tcp-loss точно объясняет метку Wireshark. Pro Fast Retransmit не покрывает полноту захвата, reordering и потерю ACK; добавить предметный pro."}; {"category":"unrelatedAuxiliary","evidence":"Общий практический совет L1/L2 → маршруты/DNS не объясняет анализ TCP Retransmission."} | [evidence](initial-group-4.json) |
| tr-09 | FIX | {"category":"missingLessonLink","evidence":"Actual resolver lessonId=null. Существующий предметный урок l2-ethernet не связан."}; {"category":"lessonSectionCoverage","evidence":"Plain l2-ethernet объясняет duplex mismatch. В pro соответствующего блока нет; добавить механизм и счётчики half/full сторон."} | [evidence](initial-group-4.json) |
| tr-10 | FIX | {"category":"missingLessonLink","evidence":"Actual resolver lessonId=null. Существующий предметный урок ts-method не связан."} | [evidence](initial-group-4.json) |
| tr-11 | FIX | {"category":"missingLessonLink","evidence":"Actual resolver lessonId=null. Существующий предметный урок ts-method не связан."}; {"category":"lessonSectionCoverage","evidence":"В ts-method plain есть MRP, в pro MRP отсутствует. Добавить open/closed и работу резервного пути в оба стиля."} | [evidence](initial-group-4.json) |
| tr-12 | FIX | {"category":"missingLessonLink","evidence":"Actual resolver lessonId=null. Существующий предметный урок l2-ethernet не связан."}; {"category":"lessonSectionCoverage","evidence":"Plain l2-ethernet содержит FCS. Pro описывает формат кадра, но не предметную диагностику прироста CRC/FCS; добавить парный раздел."} | [evidence](initial-group-4.json) |
| ts-d02 | FIX | {"category":"professional","evidence":"Pro перечисляет show vlan, switchport, ping SVI, mask/gateway. Не объясняет on-link ARP и границы применимости SVI/inter-VLAN ACL."}; {"category":"missingLessonLink","evidence":"Actual resolver lessonId=null. Существующий предметный урок l2-vlan не связан."}; {"category":"lessonSectionCoverage","evidence":"Использовать l2-vlan; добавить предметный раздел миграции: одинаковая подсеть не соединяет разные L2, SVI/ACL применимы только при реальной маршрутизации."} | [evidence](initial-group-4.json) |
| ts-d03 | FIX | {"category":"professional","evidence":"Pro советует проверить application path, но не объясняет различие обработки проб/ответов и необходимость сравнивать источник, направление и путь."}; {"category":"missingLessonLink","evidence":"Actual resolver lessonId=null. Существующий предметный урок ts-method не связан."}; {"category":"lessonSectionCoverage","evidence":"В ts-method добавить парный traceroute/application раздел с проверкой того же источника, назначения и протокола."} | [evidence](initial-group-4.json) |
| ts-d05 | REVIEW |  | [evidence](initial-group-4.json) |
| ts-linux01 | FIX | {"category":"missingLessonLink","evidence":"Actual resolver lessonId=null. Существующий предметный урок ts-method не связан."}; {"category":"lessonSectionCoverage","evidence":"Нет связанного Linux-урока. Переиспользовать ts-method, добавить парный раздел runtime ip addr / постоянный профиль. Cisco startup-config не подменяет Linux-механизм."} | [evidence](initial-group-4.json) |
| ts-pfc01 | FIX | {"category":"lessonSectionCoverage","evidence":"Plain qos-basics объясняет PFC. В pro сейчас только DSCP/ECN/policing; добавить PFC и congestion spreading."} | [evidence](initial-group-4.json) |
| ts-x01 | FIX | {"category":"professional","evidence":"Pro — «Bottom-up: L1/L2 до L3. show interface; ethtool; DOM». Перечень не объясняет admin/oper, проверку сигнала или интерпретацию показаний."} | [evidence](initial-group-4.json) |
| ts-x02 | REVIEW |  | [evidence](initial-group-4.json) |
| ts-x03 | FIX | {"category":"professional","evidence":"Pro — «dig/nslookup; resolvers; split DNS». Нет ожидаемых ответов, проверки фактического назначения и отдельного пути к резолверу."} | [evidence](initial-group-4.json) |
| ts-x06 | FIX | {"category":"professional","evidence":"Pro — «Hardcode vs autoneg; CRC errors». Не объясняет механизм half/full, разные счётчики сторон и проверку под нагрузкой."}; {"category":"missingLessonLink","evidence":"Actual resolver lessonId=null. Существующий предметный урок l2-ethernet не связан."}; {"category":"lessonSectionCoverage","evidence":"Plain l2-ethernet подходит, в pro нет раздела по дуплексу. Добавить парный раздел в существующий урок."} | [evidence](initial-group-4.json) |
| ts-x07 | FIX | {"category":"professional","evidence":"Pro — «Access VLAN, trunk allowed, SVI». Не объясняет общий L2, ARP и STP. SVI не обязателен для связи соседей одной VLAN."}; {"category":"missingLessonLink","evidence":"Actual resolver lessonId=null. Существующий предметный урок l2-vlan не связан."} | [evidence](initial-group-4.json) |
| ts-x08 | FIX | {"category":"professional","evidence":"Pro — «Проверяйте application path (TCP/443)». Нет объяснения TTL, Time Exceeded, возвратного пути и ответов следующих хопов."}; {"category":"missingLessonLink","evidence":"Actual resolver lessonId=null. Существующий предметный урок ts-method не связан."}; {"category":"lessonSectionCoverage","evidence":"В ts-method добавить парный traceroute/Time Exceeded раздел. Общий ping не объясняет звёздочки промежуточных хопов."} | [evidence](initial-group-4.json) |
| ts-x09 | REVIEW |  | [evidence](initial-group-4.json) |
| ts-x10 | FIX | {"category":"professional","evidence":"Pro — «Implicit deny; order of entries». Нет сопоставления конкретного потока, направления ACL, совпавшего правила и счётчиков."}; {"category":"missingLessonLink","evidence":"Actual resolver lessonId=null. Существующий предметный урок l4-service-ports не связан."}; {"category":"lessonSectionCoverage","evidence":"В pro l4-service-ports упомянут ACL, но нет порядка, направления и implicit deny. Добавить парный предметный раздел."} | [evidence](initial-group-4.json) |
| wifi-roam-01 | FIX | {"category":"technicalScope","evidence":"Ключ [1] верен: ассоциацию выбирает клиент. Но «инфраструктура может лишь» неполно: AP может рекомендовать, отказать или отсоединить. Пороги и дельты зависят от реализации. Sticky client не гарантирует повторы на каждом кадре и замедление всех соседних каналов."} | [evidence](initial-group-4.json) |
| wifi-sec-01 | FIX | {"category":"technicalScope","evidence":"Ключ [2] соответствует корректному SAE. Plain смешивает парольную фразу → PSK/PMK с выводом PTK при handshake; PMKID — идентификатор, не отдельный кадр. Утверждения об отсутствии офлайн-подбора требуют границ корректной реализации и исключения WPA2 Transition. Anti-clogging защищает вычислительный ресурс и не заменяет rate-limit."}; {"category":"glossaryDefinition","terms":["PSK","PMK","PMKID","PTK","PAKE"],"evidence":"Подтверждённые учебные термины без tooltip definition: PSK, PMK, PMKID, PTK, PAKE. Требуется понятное определение и контекст, без подмены одним тегом."} | [evidence](initial-group-4.json) |
| wifi-sec-05 | FIX | {"category":"technicalScope","evidence":"Ключ [0] верен. Фраза «без WPA2/WPA3 весь полезный трафик вообще летит незашифрованным» смешивает WLAN с TLS/SSH/VPN: верхнее шифрование сохраняется. Постоянные directed Probe Request не универсальны для всех клиентов. PMF не является шифрованием всего пользовательского трафика."}; {"category":"glossaryDefinition","terms":["MSDU"],"evidence":"Подтверждённые учебные термины без tooltip definition: MSDU. Требуется понятное определение и контекст, без подмены одним тегом."} | [evidence](initial-group-4.json) |
| wifi-std-01 | FIX | {"category":"technicalScope","evidence":"Ключ [2] — правильный выбор из вариантов. Но «только 1, 6, 11», универсальный минимальный разнос 25 МГц и «полностью исключает ACI» чрезмерны: это распространённый совместимый план, а доступные каналы, маски и помехи зависят от регулятора и оборудования."} | [evidence](initial-group-4.json) |
| wifi-std-04 | FIX | {"category":"technicalScope","evidence":"Лучший ответ [3] однозначно описывает OFDMA. Pro «только ax/be с обязательным WPA3» упускает Enhanced Open/OWE. Доступная часть 6 ГГц региональна. OFDMA не гарантирует резкое снижение задержек при каждой нагрузке; MU-MIMO обслуживал несколько клиентов до 802.11ax."}; {"category":"glossaryDefinition","terms":["RU","MLO"],"evidence":"Подтверждённые учебные термины без tooltip definition: RU, MLO. Требуется понятное определение и контекст, без подмены одним тегом."} | [evidence](initial-group-4.json) |
