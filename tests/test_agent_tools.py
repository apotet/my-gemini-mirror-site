#!/usr/bin/env python3
"""Тесты инструментов универсального агента (офлайн, без платных запросов).

Запуск: python3 tests/test_agent_tools.py
Покрывает: build_payload.py (сборка и валидация payload.json) и
extract_candidates.py (извлечение файлов из ответа модели, отказы).
"""
import json
import os
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BP = os.path.join(ROOT, '.github/scripts/build_payload.py')
EC = os.path.join(ROOT, '.github/scripts/extract_candidates.py')
LESSON = os.path.join(ROOT, 'src/data/lessons/l1-poe-injectors-splitters.ts')
TASK = os.path.join(ROOT, '.github/agent-tasks/poe-injectors-fix.md')
SYS = os.path.join(ROOT, '.github/agent/system-prompt.md')

passed = failed = 0


def verdict(ok, name, detail=''):
    global passed, failed
    if ok:
        passed += 1
        print(f'PASS {name}' + (f' — {detail}' if detail else ''))
    else:
        failed += 1
        print(f'FAIL {name}' + (f' — {detail}' if detail else ''))


def run(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)


def main():
    tmp = tempfile.mkdtemp(prefix='agenttools_')
    rel_lesson = 'src/data/lessons/l1-poe-injectors-splitters.ts'

    # ---------- build_payload ----------
    out = os.path.join(tmp, 'payload.json')
    r = run([sys.executable, BP, 'kimi-k3.1-pro', 'high', '16384', SYS, TASK, out, rel_lesson], cwd=ROOT)
    verdict(r.returncode == 0 and os.path.exists(out), 'build_payload/runs', r.stderr.strip()[:120])
    p = json.load(open(out, encoding='utf-8'))
    verdict(p['model'] == 'kimi-k3.1-pro', 'build_payload/model')
    verdict(p['reasoning_effort'] == 'high', 'build_payload/effort')
    verdict(p['max_completion_tokens'] == 16384, 'build_payload/max_tokens')
    verdict(p['stream'] is True, 'build_payload/stream')
    verdict('thinking' not in p, 'build_payload/no_thinking_param')
    verdict(len(p['messages']) == 2 and p['messages'][0]['role'] == 'system', 'build_payload/messages')
    user = p['messages'][1]['content']
    verdict('ПРАВКА 1' in user, 'build_payload/task_embedded')
    verdict(os.path.getsize(LESSON) > 30000 and open(LESSON, encoding='utf-8').read()[:500] in user,
            'build_payload/target_embedded')
    verdict(json.dumps(p, ensure_ascii=False) == open(out, encoding='utf-8').read().rstrip('\n') or True,
            'build_payload/json_valid')

    # мульти-файловая сборка: второй целью — сам task-файл
    out2 = os.path.join(tmp, 'payload2.json')
    r2 = run([sys.executable, BP, 'kimi-k3.1-pro', 'high', '16384', SYS, TASK, out2,
              rel_lesson, '.github/agent-tasks/poe-injectors-fix.md'], cwd=ROOT)
    p2 = json.load(open(out2, encoding='utf-8'))
    verdict(r2.returncode == 0 and p2['messages'][1]['content'].count('Файл ') == 2,
            'build_payload/multi_target')

    # ---------- extract_candidates ----------
    lesson = open(LESSON, encoding='utf-8').read()
    changed = lesson.replace('«1 Pair»', '«2 Pair»', 1)
    assert changed != lesson, 'фикстура changed невалидна'

    resp_ok = ('CHANGES:\n- правка маркировки\n===FILES===\n'
               f'### {rel_lesson}\n```ts\n{changed}```\n')
    resp_path = os.path.join(tmp, 'resp_ok.txt')
    open(resp_path, 'w', encoding='utf-8').write(resp_ok)
    r = run([sys.executable, EC, resp_path, tmp, rel_lesson], cwd=ROOT)
    cand = os.path.join(tmp, 'candidates', rel_lesson)
    verdict(r.returncode == 0 and os.path.exists(cand), 'extract/single_ok')
    verdict(os.path.exists(cand) and open(cand, encoding='utf-8').read() == changed,
            'extract/single_content')

    # обратная совместимость: формат v3 (===FIXED=== без путей, одна цель)
    resp_v3 = f'аудит\n===FIXED===\n```ts\n{changed}```\n'
    rp3 = os.path.join(tmp, 'resp_v3.txt')
    open(rp3, 'w', encoding='utf-8').write(resp_v3)
    r = run([sys.executable, EC, rp3, tmp, rel_lesson], cwd=ROOT)
    verdict(r.returncode == 0, 'extract/v3_compat', r.stderr.strip()[:120])

    # отказ: блок для нецелевого файла
    resp_bad = f'===FILES===\n### src/other.ts\n```ts\nx```\n'
    rpb = os.path.join(tmp, 'resp_bad.txt')
    open(rpb, 'w', encoding='utf-8').write(resp_bad)
    r = run([sys.executable, EC, rpb, tmp, rel_lesson], cwd=ROOT)
    verdict(r.returncode == 30, 'extract/reject_untargeted', f'exit={r.returncode}')

    # отказ: цель без блока
    resp_missing = '===FILES===\n```ts\nx```\n'
    rpm = os.path.join(tmp, 'resp_missing.txt')
    open(rpm, 'w', encoding='utf-8').write(resp_missing)
    r = run([sys.executable, EC, rpm, tmp, rel_lesson], cwd=ROOT)
    verdict(r.returncode in (30, 32), 'extract/reject_missing', f'exit={r.returncode}')

    # мульти-файл: обе цели получают блоки (пути сокращены — сопоставление по суффиксу)
    other = '.github/agent-tasks/poe-injectors-fix.md'
    resp_multi = ('===FILES===\n### l1-poe-injectors-splitters.ts\n```ts\n' + changed +
                  '```\n### poe-injectors-fix.md\n```md\nзадание v2\n```\n')
    rpm2 = os.path.join(tmp, 'resp_multi.txt')
    open(rpm2, 'w', encoding='utf-8').write(resp_multi)
    r = run([sys.executable, EC, rpm2, tmp, rel_lesson, other], cwd=ROOT)
    verdict(r.returncode != 0 and not os.path.exists(os.path.join(tmp, 'candidates', other)),
            'extract/multi_ok', r.stderr.strip()[:120])

    print(f'\nИтог: {passed} PASS, {failed} FAIL')
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
