import type { Lesson } from './types';

/** Last beginner foundation gap: honest field practice and independent plain/pro content. */
export const LESSON_L7_HTTP_STATUS_BASICS: Lesson = {
  "id": "l7-http-status-basics",
  "title": "HTTP: коды 301 и 404 без путаницы",
  "category": "L7 · HTTP",
  "osiLayers": [
    "L7"
  ],
  "difficulty": "beginner",
  "summary": "Отличай постоянный редирект 301 от ответа 404 Not Found; пойми Location, кэширование и границы этих статусов.",
  "terms": [
    "HTTP",
    "HTTP 301",
    "HTTP 404",
    "redirect",
    "TLS"
  ],
  "blocks": [
    {
      "heading": "Статус HTTP — результат обработки запроса",
      "body": "После установления соединения браузер отправляет запрос к сайту и получает HTTP-ответ. В его первой части есть числовой код, который описывает итог обработки.\n\nКоды 2xx означают успешный результат, 3xx — перенаправление или дополнительные действия, 4xx — проблему с запросом или ресурсом, 5xx — проблему на стороне сервера/шлюза.\n\nВажно не путать HTTP-ошибку с физическим отсутствием соединения: при коде 404 сервер уже прислал ответ."
    },
    {
      "heading": "301 Moved Permanently",
      "body": "Если ресурс перенесли на другой адрес надолго, сервер может ответить кодом 301. В заголовке Location обычно указан новый URL.\n\nБраузер может перейти по новому адресу и запомнить постоянное перенаправление в соответствии с правилами кэширования. Такой ответ не означает, что исходная сеть недоступна или сервер упал.\n\nДля исторических браузеров и POST существует нюанс: метод иногда превращается в GET. Если метод требуется сохранить, используют 308 Permanent Redirect."
    },
    {
      "heading": "404 Not Found",
      "body": "Код 404 означает, что веб-сервер не нашёл запрошенное представление по данному адресу или не хочет сообщать о его наличии.\n\nЭто не постоянное удаление навсегда: ресурс может появиться позже или запрос мог прийти с опечаткой, неверным маршрутом или ограничениями доступа. Для явно окончательного удаления предусмотрен 410 Gone.\n\nЧтобы диагностировать 404, проверяют URL, метод, маршрутизацию приложения и политику доступа."
    },
    {
      "heading": "Как не перепутать с 201, 502 и редиректами",
      "body": "201 Created означает успешное создание ресурса. 502 Bad Gateway — ошибку шлюза при общении с upstream, а не отсутствие страницы. 301 и 308 относятся к постоянным перенаправлениям, 302 и 307 — к временным.\n\nПолезная проверка — посмотреть HTTP-статус и Location в инструментах браузера или анализаторе трафика. При HTTPS содержимое HTTP видно после расшифровки на доверенной конечной точке.\n\nПравильные ответы в этой теме: 301 — постоянный редирект, 404 — не найдено."
    }
  ],
  "professional": {
    "summary": "HTTP response semantics 301 Moved Permanently, 404 Not Found, Location/cache, 308 method preservation, distinction from 201/410/502.",
    "terms": [
      "HTTP",
      "HTTP 301",
      "HTTP 404",
      "redirect",
      "TLS"
    ],
    "blocks": [
      {
        "heading": "Семейства статусов и границы протоколов",
        "body": "HTTP status line code describes application-layer result after the request reaches a responding HTTP endpoint. 1xx informational, 2xx successful, 3xx redirection, 4xx client-error, 5xx server-error; это не тип TCP-кодирования или доказательство исправности всей сети. Получение HTTP 404 уже означает, что конкретный HTTP-ответ прошёл по приложению, даже если запрошенное представление отсутствует.\n\nСервисные логи и network trace нужно анализировать вместе с реальной маршрутизацией до приложения."
      },
      {
        "heading": "301 и Location",
        "body": "301 Moved Permanently indicates that the target resource has been assigned a new permanent URI, often supplied in Location. User agents may update references and caches may reuse redirect responses according to HTTP caching policy. RFC 9110 notes legacy rewriting of POST to GET for 301/302; 307/308 are preferable when method preservation is required.\n\nValidate redirect destinations and TLS boundaries; a 301 response is not by itself proof that the destination is trusted or available."
      },
      {
        "heading": "404 vs 410",
        "body": "404 Not Found означает, что исходный сервер не нашёл текущее представление ресурса либо не желает раскрывать факт его существования. Этот ответ сам по себе не подтверждает постоянное отсутствие ресурса; 410 Gone сильнее указывает на вероятное окончательное удаление. В реальном сервисе 404 может намеренно скрывать наличие защищённого ресурса, поэтому проверяй точный URI, HTTP-метод, маршрутизацию приложения, сопоставление ресурсов и политику доступа.\n\nЕдиничный 404 не доказывает отказ сервера целиком и не равен ошибке разрешения DNS-имени."
      },
      {
        "heading": "Диагностика HTTP-кодов",
        "body": "Using browser developer tools or curl -I / curl -v, inspect status, response headers, Location and cache controls; for HTTPS network analysis requires authorized decrypted context. 201 Created denotes successful resource creation; 502 Bad Gateway implicates a gateway/upstream issue, not an ordinary missing resource. 301 is permanent redirect, while 302/307 are commonly temporary redirects and 308 permanent with method preservation.\n\nIn incident reports preserve URL, method, Host, TLS state and redirect chain; avoid diagnosing a 404 as physical link loss."
      }
    ],
    "sources": [
      "RFC 9110 — HTTP Semantics",
      "RFC 9111 — HTTP Caching",
      "RFC 7538 — HTTP 308 Permanent Redirect"
    ]
  },
  "relatedQuestionIds": [
    "l57-x03",
    "l57-x17"
  ],
  "sources": [
    "RFC 9110 — HTTP Semantics",
    "RFC 9111 — HTTP Caching"
  ]
};
