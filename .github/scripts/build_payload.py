#!/usr/bin/env python3
"""Сборка payload для Kimi API. Безопасная альтернатива jq --rawfile:
никакой интерполяции промптов через shell.

Использование:
  build_payload.py <model> <effort> <max_tokens> <system_prompt.md> <task_file> <out.json> <target1> [target2 ...]

Целевые файлы читаются целиком и прикладываются к пользовательскому
сообщению. Параметры API: reasoning_effort, max_completion_tokens, stream —
подтверждены официальной документацией K3/K3.1 (platform.kimi.ai).
Параметр "thinking" не отправляется: для kimi-k3/k3.1 он не поддерживается.
"""
import os
import json
import sys


def main() -> None:
    model, effort, max_tokens = sys.argv[1], sys.argv[2], int(sys.argv[3])
    sys_prompt_path, task_path, out_path = sys.argv[4], sys.argv[5], sys.argv[6]
    targets = sys.argv[7:]
    if not 1024 <= max_tokens <= 16384:
        raise ValueError("Completion token hard cap: 16384")

    if not targets:
        print("ERROR: нет целевых файлов", file=sys.stderr)
        sys.exit(2)

    system = open(sys_prompt_path, encoding="utf-8").read()
    task = open(task_path, encoding="utf-8").read()

    file_sections = []
    for t in targets:
        with open(t, encoding="utf-8") as f:
            file_sections.append(f"Файл {t}:\n\n{f.read()}")

    if os.environ.get("MODE") == "audit-only":
        system = "Ты — технический и педагогический аудитор NetOps. Только аудит: верни содержательный Markdown-отчёт по заданию, с конкретными примерами из материала, приоритетами и улучшениями. Не возвращай замену файлов. Оценивай иллюстрации только по доступному исходнику; явно укажи пределы проверки."
    if len((system + task + "".join(file_sections)).encode("utf-8")) > 120000:
        raise ValueError("Input hard cap: 120000 UTF-8 bytes")
    payload = {
        "model": model,
        "reasoning_effort": effort,
        "max_completion_tokens": max_tokens,
        "stream": True,
        "stream_options": {"include_usage": True},
        "messages": [
            {"role": "system", "content": system},
            {
                "role": "user",
                "content": task + "\n\n" + "\n\n".join(file_sections),
            },
        ],
    }
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False)
    print(f"payload ok: model={model} effort={effort} max_tokens={max_tokens} "
          f"targets={len(targets)} bytes={out_path and __import__('os').path.getsize(out_path)}")


if __name__ == "__main__":
    main()
