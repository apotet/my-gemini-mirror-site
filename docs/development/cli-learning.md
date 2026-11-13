# План развития обучающего раздела CLI
NetOps — от простого к сложному

## Принципы
1. Сценарий ≠ урок. Сценарий — задача. Урок — объяснение «почему так».
2. От одного устройства к нескольким. Не прыгать сразу в кольцо.
3. Сначала настройка, потом диагностика. Человек должен сначала увидеть рабочую конфигурацию.
4. Теория не спойлерит ответ. Ссылки в scenarioTheory.ts — на темы, не на конкретную ошибку.
5. Схематическая топология — обязательный элемент с этапа 2. Человек должен видеть, какие порты trunk, какие access, где хосты.

## Этап 0. Фундамент (уже частично есть)
Цель: человек не боится командной строки и понимает, где он находится.
- Режимы IOS (user → privileged → config) — урок cli-ios-modes
- Справка и автодополнение (?, Tab, show ?) — cli-show-help-tab
- Базовые show (show version, show ip interface brief, show running-config)
- Выход и отмена (exit, end, Ctrl+Z)
Что добавить: короткий сценарий «первый вход» без сети — только режимы и show.

## Этап 1. Один коммутатор — L2
Цель: настроить один свитч и понять, что сделал.
- Access-порт + VLAN
- Trunk (allowed VLANs, native)
- SVI (интерфейс управления)
- Сохранение конфигурации (copy running-config startup-config / write memory)
- Перезагрузка и проверка, что конфиг сохранился
Сценарии: cisco-vlan-access-basic, cisco-trunk-basic, cisco-access-vlan-svi-followup
Не хватает урока: сохранение конфигурации (явно).

## Этап 2. Два коммутатора — связность L2
Цель: трафик идёт между устройствами, человек видит, почему.
- Trunk между двумя свитчами
- Разные VLAN на access-портах
- Проверка (show vlan, show interfaces trunk, show mac address-table)
- Типичная ошибка: VLAN нет на trunk / native mismatch
Сценарии: cisco-two-switch-vlan10, cisco-two-switch-vlan-selective-diagnostics
Не хватает урока: диагностика selective trunk VLAN outage.

## Этап 3. L3 на коммутаторе
Цель: свитч начинает маршрутизировать.
- SVI в разных VLAN
- Статический маршрут
- Default gateway на хостах
- Проверка (ping, show ip route, show ip interface brief)
Сценарии: cisco-l3-gateway-basic, cisco-two-switch-management-svi
Уроки: cli-ip-static-route, l2-svi — уже есть.

## Этап 4. Диагностика по симптомам
Цель: не «настроить», а «найти и починить».
- Порт down / err-disabled
- Trunk разрешает не те VLAN
- SVI не в той VLAN
- Нет маршрута / нет gateway
- STP блокирует нужный порт (когда будет готов)
Сценарии: cisco-show-diagnostic-basic, cisco-three-switch-l2-diagnostics
Урок: ts-method — уже есть, можно расширить под CLI-контекст.

## Этап 5. Несколько устройств + топология
Цель: видеть схему и понимать, где проблема.
- 3–4 свитча, несколько хостов
- Кольцо / избыточные линки
- Смешанные задачи: VLAN + trunk + SVI + маршрут
- Схематическое отображение (уже внедряется)
Сценарии: cisco-four-switch-host-ring
Что развивать: визуальная топология + привязка шагов к урокам.

## Этап 6. Средний уровень — управление и безопасность L2
Цель: коммутатор не только передаёт трафик, но и защищён.
- Port-security (max MAC, violation shutdown/restrict/protect, sticky)
- BPDU Guard / Root Guard / Loop Guard
- DHCP Snooping (базовая настройка, trusted/untrusted)
- Dynamic ARP Inspection (DAI)
- Storm Control
- Сохранение конфигурации + архивирование
Сценарии (новые): cisco-port-security-basic, cisco-dhcp-snooping-basic, cisco-bpdu-guard-basic
Уроки (новые): cli-port-security, cli-dhcp-snooping, cli-bpdu-guard

## Этап 7. Средний уровень — L3 и сервисы
Цель: коммутатор/роутер начинает предоставлять сервисы.
- Inter-VLAN routing
- ACL на SVI (standard/extended, in/out)
- DHCP Relay (ip helper-address)
- NTP (клиент)
- Syslog
- SNMP (базовая community / v3)
Сценарии (новые): cisco-intervlan-routing, cisco-acl-svi-basic, cisco-dhcp-relay-basic
Уроки (новые): cli-intervlan-routing, cli-acl-basics, cli-dhcp-relay

## Этап 8. Продвинутый уровень — протоколы и отказоустойчивость
Цель: понимать, как устройства договариваются между собой.
- OSPF на L3-свитче (network, passive-interface, area, cost)
- BGP (базовое соседство eBGP)
- HSRP / VRRP
- EtherChannel / LACP
- STP tuning (priority, portfast, cost)
Сценарии (новые): cisco-ospf-basic, cisco-hsrp-basic, cisco-etherchannel-basic
Уроки (новые): cli-ospf-basics, cli-hsrp, cli-etherchannel

## Этап 9. Продвинутый уровень — диагностика сложных отказов
Цель: находить проблему в работающей сети, а не в пустом конфиге.
- Асимметричная маршрутизация
- Неправильный next-hop / recursive lookup
- STP blocking + blackhole
- ACL блокирует ответный трафик
- MTU / MSS проблемы
- Несоответствие native VLAN на trunk
Сценарии (новые): cisco-asymmetric-routing, cisco-acl-return-path, cisco-stp-blackhole
Уроки (новые): cli-advanced-troubleshooting, cli-return-path

## Этап 10. Продвинутый уровень — автоматизация и проверка
Цель: не только настроить, но и проверить, что настроил правильно.
- show-команды для верификации
- Сравнение running vs startup
- Rollback / archive config
- Базовые EEM (опционально)
- Экспорт конфига / бэкап
Сценарии (новые): cisco-config-verification, cisco-rollback-basic
Уроки (новые): cli-config-management, cli-verification-methods

## Этап 11. Прогрессивное открытие уроков
Цель: уроки становятся траекторией, а не списком.
Условия открытия (любое из):
- Пройден предыдущий урок в цепочке.
- Сдан короткий тест по теме (3–5 вопросов).
- Вручную открыт через «Я уже знаю».
Реализация:
- Без авторизации: localStorage.
- С авторизацией: сервер.
- На карточке: замок + условие.
Зависимости: авторизация + стабильный банк вопросов.
Приоритет: после авторизации и закрытия основных пробелов.
