#!/usr/bin/env python3
"""Извлечение исправленных файлов из ответа модели (универсальный формат).

Формат ответа (строгий, задаётся системным промптом агента):

    CHANGES:
    - ...
    ===FILES===
    ### <относительный/путь/файла1>
    ```ts
    <полный файл>
    ```
    ### <относительный/путь/файла2>
    ```ts
    <полный файл>
    ```

Использование:
  extract_candidates.py <response.txt> <outdir> <target1> [target2 ...]

Поведение:
  - каждому целевому пути должен соответствовать ровно один блок; иначе exit 30
    с перечнем недостающих/лишних файлов;
  - путь из ответа сопоставляется с целями по совпадению суффикса
    (модель может писать без src/); неоднозначность -> exit 31;
  - если блоков с путями нет и цель одна — принимается единственный блок
    ```ts после маркера ===FIXED=== (обратная совместимость с форматом v3);
  - кандидаты пишутся в <outdir>/candidates/<оригинальный путь> и
    <outdir>/candidates-report.txt.

Коды: 0 ок; 30 несоответствие файлов; 31 неоднозначность; 32 нет блоков.
"""
import os
import re
import sys


def fail(code: int, msg: str):
    print(f"[extract] ERROR {code}: {msg}", file=sys.stderr)
    sys.exit(code)


def main() -> None:
    resp_path, outdir = sys.argv[1], sys.argv[2]
    targets = sys.argv[3:]
    from validate_inputs import validate_path
    for target in targets:
        validate_path(target, "src/data/lessons/", ".ts")
    os.makedirs(outdir, exist_ok=True)
    resp = open(resp_path, encoding="utf-8").read()

    blocks = re.findall(
        r"###\s+(\S+)\s*\n```[\w-]*\s*\n(.*?)```", resp, re.S)

    assigned = {}
    if blocks:
        for path_in_resp, body in blocks:
            norm = path_in_resp.lstrip("./")
            matches = [t for t in targets if t == norm or t.endswith("/" + norm) or norm.endswith("/" + t)]
            if len(matches) > 1:
                fail(31, f"путь '{path_in_resp}' неоднозначен: {matches}")
            if not matches:
                fail(30, f"блок для нецелевого файла '{path_in_resp}'; цели: {targets}")
            t = matches[0]
            if t in assigned:
                fail(30, f"для '{t}' несколько блоков")
            assigned[t] = body if body.endswith("\n") else body + "\n"
        missing = [t for t in targets if t not in assigned]
        if missing:
            fail(30, f"нет блоков для: {missing}")
    else:
        if len(targets) != 1:
            fail(32, "блоки '### path' не найдены, а целей больше одной")
        m = re.search(r"===FIXED===[\s\S]*?```(?:ts|typescript)\s*\n(.*?)```", resp, re.S)
        if not m:
            fail(32, "ни '### path'-блоков, ни ===FIXED=== с ```ts не найдено")
        assigned[targets[0]] = m.group(1)

    report = [f"candidates: {len(assigned)}/{len(targets)}"]
    for t, body in assigned.items():
        dest = os.path.join(outdir, "candidates", t)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, "w", encoding="utf-8") as f:
            f.write(body)
        report.append(f"ok {t} ({len(body)} bytes)")
    with open(os.path.join(outdir, "candidates-report.txt"), "w", encoding="utf-8") as f:
        f.write("\n".join(report) + "\n")
    print("\n".join(report))


if __name__ == "__main__":
    main()
