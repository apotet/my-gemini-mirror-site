#!/usr/bin/env python3
"""Парсер SSE-ответа Kimi API + извлечение и проверка исправленного файла.

Аргументы: parse_sse.py <sse.log> <outdir> <original_path>

Протокольные коды: 3 — нет [DONE]; 4 — finish_reason != "stop";
  15 — повреждённый JSON-чанк; 16 — данные после [DONE].
Извлечение: 10 — нет маркера ===FIXED===; 11 — нет блока ```ts.
Целостность: 12 — базовые проверки не пройдены (export, конец "};",
  кандидат идентичен оригиналу); 14 — usage отсутствует.
Артефакты пишутся до любой проверки — отклонённый ответ всегда исследуем.
"""
import json
import os
import re
import sys


def fail(code: int, msg: str) -> "None":
    print(f"[parser] ERROR {code}: {msg}", file=sys.stderr)
    sys.exit(code)


def main() -> None:
    sse_path, outdir, orig_path = sys.argv[1], sys.argv[2], sys.argv[3]
    os.makedirs(outdir, exist_ok=True)

    content_parts: list = []
    finish = None
    usage = None
    done_seen = False
    corrupt_chunks = 0

    with open(sse_path, encoding="utf-8", errors="replace") as fh:
        for line in fh:
            line = line.rstrip("\n")
            if not line.startswith("data:"):
                continue
            data = line[len("data:"):].lstrip()
            if data == "[DONE]":
                done_seen = True
                continue
            if done_seen:
                # Любые данные после терминатора [DONE] — протокольная ошибка
                fail(16, "после события [DONE] поступили дополнительные данные")
            try:
                chunk = json.loads(data)
            except json.JSONDecodeError:
                corrupt_chunks += 1
                continue
            choices = chunk.get("choices") or []
            if choices:
                delta = choices[0].get("delta") or {}
                piece = delta.get("content")
                if piece:
                    content_parts.append(piece)
                fr = choices[0].get("finish_reason")
                if fr:
                    finish = fr
            if chunk.get("usage"):
                usage = chunk["usage"]

    text = "".join(content_parts)

    with open(os.path.join(outdir, "response.txt"), "w", encoding="utf-8") as f:
        f.write(text)
    with open(os.path.join(outdir, "meta.json"), "w", encoding="utf-8") as f:
        json.dump(
            {
                "finish_reason": finish,
                "usage": usage,
                "done_seen": done_seen,
                "corrupt_chunks": corrupt_chunks,
                "content_chars": len(text),
            },
            f,
            ensure_ascii=False,
            indent=2,
        )
    print(f"[parser] content_chars={len(text)} finish_reason={finish} "
          f"done={done_seen} corrupt={corrupt_chunks}")

    if corrupt_chunks:
        fail(15, f"{corrupt_chunks} SSE-чанков с повреждённым JSON")
    if not done_seen:
        fail(3, "SSE-поток завершён без события [DONE]")
    if finish != "stop":
        fail(4, f"finish_reason={finish!r}, ожидался 'stop'")
    if usage is None:
        fail(14, "usage отсутствует в ответе — невозможен учёт токенов")

    if os.environ.get("MODE") == "audit-only":
        if len(text.strip()) < 500:
            fail(12, "Audit is empty or too short")
        with open(os.path.join(outdir, "report.md"), "w", encoding="utf-8") as f:
            f.write(text)
        return

    marker = None
    for candidate_marker in ("===FILES===", "===FIXED==="):
        if candidate_marker in text:
            marker = candidate_marker
            break
    if marker is None:
        fail(10, "маркер ===FILES=== или ===FIXED=== не найден")
    idx = text.find(marker)
    head, body = text[:idx], text[idx + len(marker):]

    with open(os.path.join(outdir, "changes.md"), "w", encoding="utf-8") as f:
        f.write(head.strip() + "\n")

    m = re.search(r"```(?:ts|typescript)\s*\n(.*?)```", body, re.S)
    if not m:
        fail(11, "блок ```ts после маркера не найден")
    candidate = m.group(1)
    if not candidate.endswith("\n"):
        candidate += "\n"
    with open(os.path.join(outdir, "candidate.ts"), "w", encoding="utf-8") as f:
        f.write(candidate)

    with open(orig_path, encoding="utf-8") as f:
        orig = f.read()

    const_m = re.search(r"export const (\w+)", orig)
    const = const_m.group(1) if const_m else None
    checks = [
        ("export_const", const is not None and f"export const {const}" in candidate,
         f"ожидался 'export const {const}'" if const else "константа не найдена в оригинале"),
        ("ends_with_brace", re.search(r"\n\};\s*$", candidate) is not None,
         "файл должен заканчиваться на '};'"),
        ("differs_from_original", candidate.strip() != orig.strip(),
         "кандидат байт-в-байт идентичен оригиналу — правки отсутствуют"),
    ]
    lines = []
    failed = False
    for name, ok, detail in checks:
        lines.append(f"{'PASS' if ok else 'FAIL'} {name} — {detail}")
        failed = failed or not ok
    with open(os.path.join(outdir, "checks.txt"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print("\n".join(lines))
    if failed:
        fail(12, "проверки целостности не пройдены")
    print("[parser] OK")


if __name__ == "__main__":
    main()
