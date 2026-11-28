# TCP/IP visual pilot — issue #556

Base: `1762df6f553b39634711285d2a109d4a9876abf2` (`main`, cloned 2026-11-28). Head and Draft PR URL are in the PR handoff. Target: staging repository `apotet/my-gemini-mirror-site`, base branch `main`. No merge or deploy.

## Scope and implementation

- `src/data/lessons/tcpip-model.ts`: plain mode rebuilt around one HTTP/TCP/IPv4/Ethernet example; seven plain-mode self-checks with feedback. Professional object and original related IDs compare equal to main.
- `src/data/lessons/types.ts`, `src/components/LessonView.tsx`: optional static primary visual before the explanation, using the existing accessible zoom viewer. No new switches or animation. Lessons without this field retain their renderer.
- `public/lesson-images/tcpip-*.svg`: 13 original Russian static vector illustrations: purpose, four-layer stack with equipment, OSI, encapsulation, decapsulation, addresses, routed path, TCP/UDP, TCP/UDP/IPv4/Ethernet field sheets, final summary.
- `scripts/lesson-art/tcpip.py`: reproducible artwork source; only Python standard library. No borrowed reference images. Labels supplement the blue/green/orange/purple palette. Navy artwork keeps the same readable contrast in both themes. Drawings explicitly do not imply byte scale.
- `scripts/tcpip-visual.test.mjs`, `scripts/tcpip-visual.browser.mjs`: targeted checks. Screenshots and machine-readable route/section/results inventories are in this PR.

Read before editing: both TCP/IP lesson sources, LessonView, FormattedExplanation, lesson registry, lessonSectionLinks, in-depth section injection, glossary and its tooltip renderer, LEARNING_CONTENT_STANDARD, DEVELOPMENT_WORKFLOW, STATE, ROADMAP, AGENT.

## Preserved relationships

[Resolved routes](../../artifacts/tcpip-556/routes.json) enumerate all 16 current real-bank questions resolving to this lesson, rather than only the authored related-ID list. All 16 were opened and returned from in Chromium in each reading mode (32 scenarios). Three stable anchors remain in both modes: `tcpip-end-to-end-fields`, `in-depth-application-protocol-semantics`, `in-depth-four-five-layer-link`. Existing injected sections remain intact. `tcpip-x15` still resolves to the separate `tcpip-encapsulation` lesson. That applied lesson, question bank, lesson IDs, glossary, review status, practice links, learning paths, favorites/progress implementation and URL/hashtag logic are unchanged. Favorite on/off was exercised in Chromium. No new glossary definitions were needed: core terms already have tooltips; new field terms are explained in the expandable sheets.

## Verification

PASS on final code:

- `npm run lint` (TypeScript), `npm run build` (existing large-chunk warning).
- `npm run test:logic`, `npm run test:review-navigation` (860 actual renders; original bank and historical attempt paths).
- `node scripts/lesson-section-links.test.mjs`.
- `node scripts/base-foundations-batch2.test.mjs`, `node scripts/base-foundations-batch3.test.mjs`.
- `node scripts/fundamentals-batch.test.mjs`, `node scripts/fundamentals-batch2.test.mjs`.
- `node scripts/link-layer-wording.test.mjs`.
- `node scripts/tcpip-visual.test.mjs` (professional mode/original IDs unchanged; all actual routes and anchors; SVG existence/static content; seven self-checks).
- Headless system Chromium via Playwright, 375×900 and 1440×900, light/dark, four scenarios: no document horizontal overflow or page errors; actual touch tooltip opening, bounds and dismissal; four sheets expand; zoom opens/closes; seven correct answers, result 7/7 and restart; both style switches. All 32 real route/return scenarios also passed on mobile, with reduced motion and links scrolled to the center before a real click.
- Chromium SVG text bounds inspected: all 13 illustrations fit the 320-unit viewBox after correcting two headings.

Reproduce browser checks (temporary tooling, no dependency/lockfile change):

```sh
npm install --prefix /tmp/tcpip-browser playwright
npm run dev -- --host 0.0.0.0 --port 3000
PLAYWRIGHT_MODULE=/tmp/tcpip-browser/node_modules/playwright/index.mjs node scripts/tcpip-visual.browser.mjs
```

Run the targeted data test first to generate the route inventory. `CHROMIUM_PATH` and `LESSON_URL` optionally override the browser and URL. `SKIP_ROUTES=1` recaptures viewport scenarios only; `ROUTES_ONLY=1` checks just routes and preserves existing viewport results.

## Primary technical references

Retrieved and read relevant passages from RFC Editor plain-text documents: [RFC 1122 §1.1.3](https://www.rfc-editor.org/rfc/rfc1122#section-1.1.3) (four layers), [RFC 9293 §3.1](https://www.rfc-editor.org/rfc/rfc9293#section-3.1) (TCP), [RFC 9768 §3.1](https://www.rfc-editor.org/rfc/rfc9768#section-3.1) (AE replaces historic NS; three reserved bits and nine control bits), [RFC 768](https://www.rfc-editor.org/rfc/rfc768) (UDP), [RFC 791](https://www.rfc-editor.org/rfc/rfc791) (IPv4), [RFC 894](https://www.rfc-editor.org/rfc/rfc894) (IP over Ethernet, minimum data/padding), [RFC 8200 §8.1](https://www.rfc-editor.org/rfc/rfc8200#section-8.1) (IPv6 transport checksum), [RFC 7766](https://www.rfc-editor.org/rfc/rfc7766) (DNS supports TCP and UDP). Checked IANA TCP registry as well. Sources are listed in the lesson. Ethernet sheet names the ordinary untagged frame and excludes jumbo/VLAN variants.

## Limits and acceptance status

- No CAP_NET_RAW in this environment, so a real Ethernet capture could not be made. There is **no fabricated capture or Wireshark screenshot**. The lesson states the limitation and supplies a two-host, isolated-network HTTP capture recipe, display/capture filters and explicit Ethernet II → IPv4 → TCP → HTTP inspection instructions. This recipe has not been executed here on two physical hosts. No claim of live packet-capture verification.
- IEEE's official working-group and publication pages were retrieved; full IEEE 802.3-2022 clause text was not retrieved. The Ethernet field-sheet citation is retained, but an independent clause-level IEEE check remains for the reviewer. RFC 894 was checked directly. Do not treat this as complete standards acceptance.
- Main UI is checked at a normal 900px viewport height. Section-only evidence below expands viewport height for long vertical illustrations and hides only the fixed mobile tab bar in the screenshot operation, so it cannot obscure the section. Product layout/styles are not changed by this evidence capture. Every section is captured in all four width/theme combinations, plus the final self-check result. These are real Chromium screenshots, not generated mockups.
- No general audit of unrelated screens or production. Independent technical/content/visual acceptance by Fedot is pending, followed by the owner's personal acceptance. No USER_APPROVED assignment. Learning standard, roadmap, agents, CI/CD and parallel L3 work were not modified; no reference rollout before personal acceptance.

**Стандарт учебных материалов соблюдён**: both reading styles and existing relationships remain. The capture and full IEEE verification limitations above remain explicit review items.

## Screenshot index

| # | Rendered section | Real Chromium screenshots |
| --- | --- | --- |
| 1 | Зачем делить работу сети на слои | [375 light](../../artifacts/tcpip-556/375-light-01.png) / [375 dark](../../artifacts/tcpip-556/375-dark-01.png) / [1440 light](../../artifacts/tcpip-556/1440-light-01.png) / [1440 dark](../../artifacts/tcpip-556/1440-dark-01.png) |
| 2 | Четыре уровня: кто за что отвечает | [375 light](../../artifacts/tcpip-556/375-light-02.png) / [375 dark](../../artifacts/tcpip-556/375-dark-02.png) / [1440 light](../../artifacts/tcpip-556/1440-light-02.png) / [1440 dark](../../artifacts/tcpip-556/1440-dark-02.png) |
| 3 | Почему TCP/IP не копирует OSI один в один | [375 light](../../artifacts/tcpip-556/375-light-03.png) / [375 dark](../../artifacts/tcpip-556/375-dark-03.png) / [1440 light](../../artifacts/tcpip-556/1440-light-03.png) / [1440 dark](../../artifacts/tcpip-556/1440-dark-03.png) |
| 4 | Четыре и пять уровней: что делится внизу | [375 light](../../artifacts/tcpip-556/375-light-04.png) / [375 dark](../../artifacts/tcpip-556/375-dark-04.png) / [1440 light](../../artifacts/tcpip-556/1440-light-04.png) / [1440 dark](../../artifacts/tcpip-556/1440-dark-04.png) |
| 5 | Что видит человек и что видит кабель | [375 light](../../artifacts/tcpip-556/375-light-05.png) / [375 dark](../../artifacts/tcpip-556/375-dark-05.png) / [1440 light](../../artifacts/tcpip-556/1440-light-05.png) / [1440 dark](../../artifacts/tcpip-556/1440-dark-05.png) |
| 6 | Как сообщение собирают и разбирают | [375 light](../../artifacts/tcpip-556/375-light-06.png) / [375 dark](../../artifacts/tcpip-556/375-dark-06.png) / [1440 light](../../artifacts/tcpip-556/1440-light-06.png) / [1440 dark](../../artifacts/tcpip-556/1440-dark-06.png) |
| 7 | На сервере: распаковка того же запроса | [375 light](../../artifacts/tcpip-556/375-light-07.png) / [375 dark](../../artifacts/tcpip-556/375-dark-07.png) / [1440 light](../../artifacts/tcpip-556/1440-light-07.png) / [1440 dark](../../artifacts/tcpip-556/1440-dark-07.png) |
| 8 | Кому доставлять на каждом шаге | [375 light](../../artifacts/tcpip-556/375-light-08.png) / [375 dark](../../artifacts/tcpip-556/375-dark-08.png) / [1440 light](../../artifacts/tcpip-556/1440-light-08.png) / [1440 dark](../../artifacts/tcpip-556/1440-dark-08.png) |
| 9 | Что сохраняется от клиента до сервера без NAT и прокси | [375 light](../../artifacts/tcpip-556/375-light-09.png) / [375 dark](../../artifacts/tcpip-556/375-dark-09.png) / [1440 light](../../artifacts/tcpip-556/1440-light-09.png) / [1440 dark](../../artifacts/tcpip-556/1440-dark-09.png) |
| 10 | Доставка байтов ещё не объясняет запрос | [375 light](../../artifacts/tcpip-556/375-light-10.png) / [375 dark](../../artifacts/tcpip-556/375-dark-10.png) / [1440 light](../../artifacts/tcpip-556/1440-light-10.png) / [1440 dark](../../artifacts/tcpip-556/1440-dark-10.png) |
| 11 | Путь пакета через маршрутизатор | [375 light](../../artifacts/tcpip-556/375-light-11.png) / [375 dark](../../artifacts/tcpip-556/375-dark-11.png) / [1440 light](../../artifacts/tcpip-556/1440-light-11.png) / [1440 dark](../../artifacts/tcpip-556/1440-dark-11.png) |
| 12 | TCP и UDP: что будет при потере | [375 light](../../artifacts/tcpip-556/375-light-12.png) / [375 dark](../../artifacts/tcpip-556/375-dark-12.png) / [1440 light](../../artifacts/tcpip-556/1440-light-12.png) / [1440 dark](../../artifacts/tcpip-556/1440-dark-12.png) |
| 13 | Шпаргалка: TCP: поля и размеры | [375 light](../../artifacts/tcpip-556/375-light-13.png) / [375 dark](../../artifacts/tcpip-556/375-dark-13.png) / [1440 light](../../artifacts/tcpip-556/1440-light-13.png) / [1440 dark](../../artifacts/tcpip-556/1440-dark-13.png) |
| 14 | Шпаргалка: UDP: поля и размеры | [375 light](../../artifacts/tcpip-556/375-light-14.png) / [375 dark](../../artifacts/tcpip-556/375-dark-14.png) / [1440 light](../../artifacts/tcpip-556/1440-light-14.png) / [1440 dark](../../artifacts/tcpip-556/1440-dark-14.png) |
| 15 | Шпаргалка: IPv4: поля и размеры | [375 light](../../artifacts/tcpip-556/375-light-15.png) / [375 dark](../../artifacts/tcpip-556/375-dark-15.png) / [1440 light](../../artifacts/tcpip-556/1440-light-15.png) / [1440 dark](../../artifacts/tcpip-556/1440-dark-15.png) |
| 16 | Шпаргалка: Ethernet II: поля и размеры | [375 light](../../artifacts/tcpip-556/375-light-16.png) / [375 dark](../../artifacts/tcpip-556/375-dark-16.png) / [1440 light](../../artifacts/tcpip-556/1440-light-16.png) / [1440 dark](../../artifacts/tcpip-556/1440-dark-16.png) |
| 17 | Wireshark: как увидеть вложения | [375 light](../../artifacts/tcpip-556/375-light-17.png) / [375 dark](../../artifacts/tcpip-556/375-dark-17.png) / [1440 light](../../artifacts/tcpip-556/1440-light-17.png) / [1440 dark](../../artifacts/tcpip-556/1440-dark-17.png) |
| 18 | Итог: объясни путь запроса своими словами | [375 light](../../artifacts/tcpip-556/375-light-18.png) / [375 dark](../../artifacts/tcpip-556/375-dark-18.png) / [1440 light](../../artifacts/tcpip-556/1440-light-18.png) / [1440 dark](../../artifacts/tcpip-556/1440-dark-18.png) |

Self-check results: [375 light](../../artifacts/tcpip-556/375-light-check.png), [375 dark](../../artifacts/tcpip-556/375-dark-check.png), [1440 light](../../artifacts/tcpip-556/1440-light-check.png), [1440 dark](../../artifacts/tcpip-556/1440-dark-check.png).

[Browser results](../../artifacts/tcpip-556/browser-results.json) · [Section inventory](../../artifacts/tcpip-556/sections.json).
