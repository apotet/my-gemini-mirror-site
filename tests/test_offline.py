#!/usr/bin/env python3
"""Офлайн-тесты v3.1: парсер SSE и AST-проверка структуры.

Запуск:  python3 tests/test_offline.py [parse_sse.py structure_check.mjs]
Никаких сетевых обращений и платных запросов. Node и typescript@5.x нужны
только для блока structure_check (в CI ставится --no-save typescript@5.9.3);
при их отсутствии блок честно помечается SKIP, а не PASS.

Каждая негативная мутация перед запуском проверяется на то, что действительно
изменила исходник — иначе тест считается сломанным (не PASS и не FAIL кода,
а ошибка инфраструктуры теста).
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PARSE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, '.github/scripts/parse_sse.py')
STRUCT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, '.github/scripts/structure_check.mjs')
LESSON = os.path.join(ROOT, 'src/data/lessons/l1-poe-injectors-splitters.ts')

passed = failed = skipped = 0


def verdict(ok, name, detail=''):
    global passed, failed
    if ok:
        passed += 1
        print(f'PASS {name}' + (f' — {detail}' if detail else ''))
    else:
        failed += 1
        print(f'FAIL {name}' + (f' — {detail}' if detail else ''))


def skip(name, why):
    global skipped
    skipped += 1
    print(f'SKIP {name} — {why}')


# ---------- фиктивный урок (для тестов парсера) ----------
FAKE_LESSON = """import type { Lesson } from './types';

export const LESSON_L1_POE_TEST: Lesson = {
  "id": "test",
  "blocks": []
};
"""

# «исправленная» версия обязана отличаться от оригинала, иначе сработает
# differs_from_original — и это корректное поведение парсера, а не баг
FAKE_LESSON_FIXED = FAKE_LESSON.replace('"id": "test"', '"id": "test-fixed"')


def sse_chunk(content=None, finish=None, usage=None, choices_empty=False, raw=None):
    if raw is not None:
        return 'data: ' + raw
    if choices_empty:
        return 'data: ' + json.dumps({'choices': [], 'usage': usage})
    ch = {}
    if content is not None:
        ch['delta'] = {'content': content}
    if finish is not None:
        ch['finish_reason'] = finish
    return 'data: ' + json.dumps({'choices': [ch]})


GOOD_RESP = 'CHANGES:\n- списки оформлены\n===FIXED===\n```ts\n' + FAKE_LESSON_FIXED + '```\n'
USAGE = {'prompt_tokens': 100, 'completion_tokens': 50,
         'completion_tokens_details': {'reasoning_tokens': 20}}


def build_sse(text, with_done=True, usage_last=True, split=7, corrupt_mid=False):
    lines = [sse_chunk(p) for p in (text[i:i + split] for i in range(0, len(text), split))]
    lines.append(sse_chunk(finish='stop'))
    if corrupt_mid:
        lines.append(sse_chunk(raw='{not json'))
    if usage_last:
        lines.append(sse_chunk(choices_empty=True, usage=USAGE))
    if with_done:
        lines.append('data: [DONE]')
    return '\n\n'.join(lines) + '\n\n'


def run_parser(tmp, name, log_text):
    log = os.path.join(tmp, f'{name}.log')
    out = os.path.join(tmp, f'out_{name}')
    open(log, 'w', encoding='utf-8').write(log_text)
    r = subprocess.run([sys.executable, PARSE, log, out, os.path.join(tmp, 'orig.ts')],
                       capture_output=True, text=True)
    return r.returncode, out


def main():
    tmp = tempfile.mkdtemp(prefix='v31tests_')
    open(os.path.join(tmp, 'orig.ts'), 'w', encoding='utf-8').write(FAKE_LESSON)

    # ---------- парсер ----------
    cases = [
        ('ok_usage_after_finish', build_sse(GOOD_RESP), 0),
        ('no_done', build_sse(GOOD_RESP, with_done=False), 3),
        ('length_finish', build_sse(GOOD_RESP).replace('"finish_reason": "stop"', '"finish_reason": "length"'), 4),
        ('no_marker', build_sse('Просто текст без маркера.'), 10),
        ('truncated_code', build_sse('===FIXED===\n```ts\nexport const X = {\n'), 11),
        ('identical_candidate',
         build_sse('===FIXED===\n```ts\n' + FAKE_LESSON + '```\n'), 12),
        ('missing_usage', build_sse(GOOD_RESP, usage_last=False), 14),
        ('corrupt_chunk', build_sse(GOOD_RESP, corrupt_mid=True), 15),
        ('post_done_data',
         build_sse(GOOD_RESP) + 'data: ' + json.dumps({'choices': [{'delta': {'content': 'X'}}]}) + '\n\ndata: [DONE]\n', 16),
    ]
    for name, log_text, expect in cases:
        code, out = run_parser(tmp, name, log_text)
        verdict(code == expect, f'parser/{name}', f'exit={code}, ожидался {expect}')
        # артефакты обязательны для всех отказов, кроме exit 16:
        # протокольное нарушение (данные после [DONE]) обнаруживается в потоке
        # раньше, чем ответ разобран — записывать ещё нечего
        if code != 0 and code != 16:
            artifacts_ok = all(os.path.exists(os.path.join(out, f)) for f in ('response.txt', 'meta.json'))
            verdict(artifacts_ok, f'parser/{name}_artifacts', 'response.txt+meta.json сохранены при отказе')

    # ---------- structure_check ----------
    node = shutil.which('node')
    ts_dir = None
    if node:
        r = subprocess.run([node, '-e', 'require.resolve("typescript")'],
                           capture_output=True, text=True, cwd=ROOT)
        if r.returncode != 0:
            # локальный fallback: typescript@5.9.3 из tests/vendor (npm i --prefix tests/vendor typescript@5.9.3)
            vend = os.path.join(ROOT, 'tests/vendor/node_modules')
            if os.path.isdir(vend):
                ts_dir = os.path.join(ROOT, 'tests/vendor')
                r = subprocess.run([node, '-e', 'require.resolve("typescript")'],
                                   capture_output=True, text=True, cwd=ts_dir)
        if r.returncode != 0 and ts_dir is None:
            node = None
    if not node:
        skip('structure/*', 'node или typescript@5.x недоступны (в CI ставится npm i --no-save typescript@5.9.3)')
        print(f'\nИтог: {passed} PASS, {failed} FAIL, {skipped} SKIP')
        sys.exit(1 if failed else 0)

    lesson = open(LESSON, encoding='utf-8').read()
    work = os.path.join(tmp, 'struct')
    os.makedirs(work, exist_ok=True)
    script = os.path.join(work, 'structure_check.mjs')
    shutil.copy(STRUCT, script)
    if ts_dir:
        shutil.copytree(os.path.join(ts_dir, 'node_modules'), os.path.join(work, 'node_modules'), dirs_exist_ok=True)

    def run_struct(name, content, expect):
        if expect != 0:
            assert content != lesson, f'{name}: мутация не изменила исходник — тест сломан'
        cand = os.path.join(work, f'{name}.ts')
        rep = os.path.join(work, f'{name}.txt')
        open(cand, 'w', encoding='utf-8').write(content)
        r = subprocess.run([node, 'structure_check.mjs',
                            os.path.relpath(LESSON, work), os.path.relpath(cand, work),
                            os.path.relpath(rep, work)], cwd=work, capture_output=True, text=True)
        verdict(r.returncode == expect, f'structure/{name}', f'exit={r.returncode}, ожидался {expect}')

    agreed = re.sub(r',\n(\s*)"relatedLesson": \{\s*"id": "l1-poe-screen-reading"[^}]*\}', '', lesson)
    assert agreed != lesson and agreed.count('"relatedLesson"') == 3, 'фикстура agreed_links невалидна'

    def mut(name, old, new, count=1):
        assert old in lesson, f'{name}: паттерн мутации не найден в уроке'
        c = lesson.replace(old, new, count)
        assert c != lesson, f'{name}: мутация не изменила исходник'
        return c

    vals = re.findall(r'"correctChoiceId": "([A-D])"', lesson)
    swapped = lesson.replace(f'"correctChoiceId": "{vals[0]}"', '"correctChoiceId": "TMPX"', 1)
    swapped = swapped.replace(f'"correctChoiceId": "{vals[1]}"', f'"correctChoiceId": "{vals[0]}"', 1)
    swapped = swapped.replace('"correctChoiceId": "TMPX"', f'"correctChoiceId": "{vals[1]}"', 1)

    headings = re.findall(r'^    \{\n      "heading": "([^"]+)"', lesson, re.M)
    bounds = [m.start() for m in re.finditer(r'\n    \},\n', lesson)]
    b1s = lesson.index('    {\n      "heading": "' + headings[0] + '"')
    b2s = lesson.index('    {\n      "heading": "' + headings[1] + '"')
    seg1 = lesson[b1s:bounds[0] + len('\n    },\n')]
    seg2 = lesson[b2s:bounds[1] + len('\n    },\n')]
    reordered = lesson.replace(seg1 + seg2, seg2 + seg1, 1)
    assert reordered != lesson, 'мутация reorder не применилась'

    run_struct('identity', lesson, 0)
    run_struct('agreed_links', agreed, 0)
    run_struct('body_only', mut('body_only', '«1 Pair»', '«2 Pair»'), 0)
    run_struct('reorder_blocks', reordered, 0)
    run_struct('rename_heading',
               mut('rename_heading', '"heading": "Показания прибора: класс и напряжение"',
                   '"heading": "Другое название"'), 22)
    run_struct('swap_correct', swapped, 22)
    run_struct('tamper_choice',
               mut('tamper_choice', '"id": "A",\n            "label": "Кабель Cat6',
                   '"id": "Z",\n            "label": "Кабель Cat6'), 22)
    run_struct('drop_illustration',
               mut('drop_illustration', '"file": "poe-injectors-splitters-approved.png"',
                   '"file": "other.png"'), 22)
    run_struct('truncated', lesson[:len(lesson) // 2], 20)

    print(f'\nИтог: {passed} PASS, {failed} FAIL, {skipped} SKIP')
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
