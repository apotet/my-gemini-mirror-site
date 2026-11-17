# NetOps — «База» (партия №3): TCP/IP, PDU, LPM, службы

**Ветка:** `feat/base-foundations-batch3` от принятого staging `main` после PR #242.
**Регламент:** `docs/LEARNING_CONTENT_STANDARD.md`; production `apotet/netops` не изменять без отдельной команды.

## Объём

20 ID beginner; для каждого — отдельный brief, три абзаца plain и самостоятельный инженерный pro, ловушка и только подходящая существующая практика. Банк 862 вопросов, correct и difficulty не менялись. Добавлены два двустильных урока `l3-route-selection` (включая граничное /25) и `l4-service-ports` (порт и реальная служба), остальные связи с полноценными существующими уроками. Нет фальшивой UDP-практики или ссылки на несуществующий стенд.

## Матрица поимённой приёмки

| ID | Проверяемый механизм / правильный ответ | Урок | Практика | Вердикт |
| --- | --- | --- | --- | --- |
| `tcpip-x13` | TCP/UDP соответствуют L4 | `l4-tcp` | tcp | PASS (автор + CI); Codex code review — без замечаний |
| `tcpip-x15` | Слои инкапсуляции: data→TCP/UDP→IP→Ethernet | `tcpip-encapsulation` | packet | PASS (автор + CI); Codex code review — без замечаний |
| `tcpip-x16` | Сокет: protocol и IP:port, 4-tuple TCP | `l4-tcp` | tcp | PASS (автор + CI); Codex code review — без замечаний |
| `tcpip-x17` | Routing/FIB/next-hop по IP | `l3-route-selection` | — | PASS (автор + CI); Codex code review — без замечаний |
| `tcpip-x19` | 32-bit IPv4, 48 MAC, 128 IPv6 | `tcpip-model` | — | PASS (автор + CI); Codex code review — без замечаний |
| `tcpip-x21` | Разные службы на одном IP/транспортных портах | `l4-service-ports` | tcp | PASS (автор + CI); Codex code review — без замечаний |
| `tcpip-x29` | IANA well-known System Ports 0–1023 | `l4-service-ports` | — | PASS (автор + CI); Codex code review — без замечаний |
| `l3-02` | 10.5.5.128 не входит в 10.5.5.0/25, eth1 | `l3-route-selection` | — | PASS (автор + CI); Codex code review — без замечаний |
| `k-06` | Вложенные заголовки и FCS, не шифрование | `tcpip-encapsulation` | packet | PASS (автор + CI); Codex code review — без замечаний |
| `k-08` | PDU разных уровней, SDU и границы | `osi-pdu` | — | PASS (автор + CI); Codex code review — без замечаний |
| `new-l6-format` | Presentation L6: кодировка и сжатие | `osi-session-presentation` | — | PASS (автор + CI); Codex code review — без замечаний |
| `new-tcpip-payload` | TCP segment внутри IPv4 payload | `tcpip-encapsulation` | — | PASS (автор + CI); Codex code review — без замечаний |
| `gen-port-0` | HTTP/1.1 без TLS TCP/80 | `l4-service-ports` | tcp | PASS (автор + CI); Codex code review — без замечаний |
| `gen-port-1` | HTTPS HTTP/1.1 и HTTP/2 TCP/443 | `l4-service-ports` | — | PASS (автор + CI); Codex code review — без замечаний |
| `gen-port-2` | SSH TCP/22, trust host key | `l4-service-ports` | — | PASS (автор + CI); Codex code review — без замечаний |
| `gen-port-3` | Telnet TCP/23 и plaintext | `l4-service-ports` | — | PASS (автор + CI); Codex code review — без замечаний |
| `gen-port-4` | FTP control TCP/21 против data channel | `l4-service-ports` | — | PASS (автор + CI); Codex code review — без замечаний |
| `gen-port-5` | SMTP server-to-server TCP/25 против submission | `l4-service-ports` | — | PASS (автор + CI); Codex code review — без замечаний |
| `gen-port-10` | POP3 TCP/110 и условное удаление | `l4-service-ports` | — | PASS (автор + CI); Codex code review — без замечаний |
| `gen-port-12` | IMAP TCP/143 и STARTTLS/993 | `l4-service-ports` | — | PASS (автор + CI); Codex code review — без замечаний |

## Технические доказательства и риски

- `scripts/base-foundations-batch3.test.mjs`: ровно 20 ID; unchanged questions; конкретный ключ (включая 8 портов); отдельные brief/plain/pro; 3 смысловых абзаца; соответствующий двустильный урок; работающие ссылки и словарные определения.
- `.github/workflows/ci.yml`: TypeScript, test:explanations, script batch3, test:review-navigation, Chromium 375/1440. Перед merge требуется зелёный CI на финальном SHA.
- Изменения защищённых файлов (`questionExplanations.ts`, `lessons/index.ts`) оформлены через контрольные SHA256 в `docs/audits/issue-171-baseline.json`; исходный банк и auditProjectionSHA256 сохранены.
- Отдельно проверить, что новый LPM-урок не смешивает выбор маршрута с разрешением ARP; сервисный урок не утверждает, что HTTP/3 работает поверх TCP и что любой FTP data использует 21/TCP.
- Любые замечания FIX — исправить до merge. Статус REVIEW не равен PASS. В production изменения запрещены.

## Поимённая авторская приёмка и автоматические доказательства (17.11.2026)

- **20/20 AUTHOR PASS:** исходные условия, ключи и варианты из `questions.json`/`questionsExtra.ts` вручную сверены с новыми brief/plain/pro, trap и механизмом связанного урока. У 8 сервисных портов проверены конкретные ключи 80/443/22/23/21/25/110/143 и условия HTTP/HTTPS/SSH/Telnet/FTP/SMTP/POP3/IMAP.
- **Особые сохранённые решения:** у `tcpip-x13` и `tcpip-x15` утверждённый старый brief из `AUDITED_QUESTION_EXPLANATIONS` продолжает выигрывать, а новый plain/pro доступен. `tcpip-x15` приоритетно открывает точный `tcpip-encapsulation`, не общий `tcpip-model`; прежние прочие связи не меняются.
- **LPM:** Destination 10.5.5.128 не входит в 10.5.5.0/25 (.0–.127), но входит в /24, поэтому eth1. Проверены независимость route lookup от ARP, HTTP/3 по UDP/443 и различие FTP control и data; SMTP 25 против submission 587, POP3 110 против IMAP 143.
- **2 урока:** `l3-route-selection` и `l4-service-ports` присутствуют в каталоге и имеют содержательные plain/pro, обратные связи, непустые glossary entries по каждому term. Только действующий TCP-стенд предлагается там, где он реально показывает TCP/80; несуществующие тренажёры не обещаются.
- **CI [#43998829977](https://github.com/apotet/my-gemini-mirror-site/actions/runs/43998829977): PASS** на кодовом SHA `b1fc1651`, включая typecheck/lint, build, test:explanations, все 20 ID, glossary, navigation и Chromium 375/1440. Банк 862 вопросов, 253 beginner, из них 178/253 с индивидуальным подробным разбором (70%), 75 без него.
- **Независимая приёмка:** GitHub Codex выполнил code review на кодовом SHA `b1fc1651da3e21d7e50bfddacebe5bcf7a602f2c` (завершено 17.11.2026 01:57:48 UTC): `has_any_findings=false`, `has_unresolved_findings=false`, новых замечаний нет. Эти 20 поимённых PASS выполнены автором с автоматическими доказательствами, не приписываются Codex; он независимо проверил PR на отсутствие замечаний. До полного финального CI, GATE и staging merge публикации нет.

## Независимая проверка

Выполнена поимённая авторская сверка 20/20 ключей, brief/plain/pro, уроков и существующей практики (матрица выше) и отдельное независимое code review GitHub Codex на последнем кодовом SHA — без новых замечаний. Окончательный CI документационного HEAD и GATE-01…10 обязателен перед merge. После Pages deploy обязательно проверить опубликованную версию. Production не менять без команды владельца.
