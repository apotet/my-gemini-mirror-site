# Smoke-тест: диагностика порта коммутатора (вымышленный пример)

## Сценарий

На условном коммутаторе доступа `SW-ACCESS-01` пользователь рабочей станции, подключённой к порту `Gi0/24`, сообщил о потере сетевого подключения (VLAN 120).

## Проверка состояния и счётчиков

```text
SW-ACCESS-01# show interfaces status | include Gi0/24
Gi0/24    WS-1204-USER       notconnect   120          auto   auto 10/100/1000BaseTX

SW-ACCESS-01# show interfaces GigabitEthernet0/24
GigabitEthernet0/24 is down, line protocol is down (notconnect)
  Hardware is Gigabit Ethernet, address is 0050.56ab.1224 (bia 0050.56ab.1224)
  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec,
  5 minute input rate 0 bits/sec, 0 packets/sec
  5 minute output rate 0 bits/sec, 0 packets/sec
     1842 packets input, 214500 bytes, 0 no buffer
     147 input errors, 147 CRC, 0 frame, 0 overrun, 0 ignored
```

## Вывод и действия

- Состояние `down/down (notconnect)` в сочетании с накопленными `CRC` и `input errors` указывает на физическую проблему линии (неисправный патч-корд, розетка или контакт RJ-45).
- После замены вымышленного патч-корда на заведомо исправный порт `Gi0/24` переходит в `connected` (`up/up`), а счётчики `CRC` перестают расти.
