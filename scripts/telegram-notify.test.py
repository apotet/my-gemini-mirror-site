import importlib.util
import io
import json
from pathlib import Path
import unittest
from unittest.mock import Mock
from urllib.error import HTTPError
from urllib.parse import parse_qs

spec = importlib.util.spec_from_file_location('telegram_notify', Path(__file__).with_name('telegram-notify.py'))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


def success(chat=12345, message_id=42):
    return io.BytesIO(json.dumps({'ok': True, 'result': {'message_id': message_id, 'chat': {'id': chat}}}).encode())


def rate_limit(seconds=None, headers=None):
    return HTTPError('https://api.telegram.org/botFAKE_TOKEN/sendMessage', 429, 'rate limited', headers or {},
                     io.BytesIO(json.dumps({'ok': False, 'parameters': {'retry_after': seconds}}).encode()))


class DeliveryTests(unittest.TestCase):
    def test_success_requires_actual_message_id_for_configured_chat(self):
        logs = []
        call = Mock(return_value=success())
        self.assertEqual(m.deliver({}, ' FAKE_TOKEN\n', '12345\n', open_url=call, log=logs.append), 42)
        self.assertEqual(call.call_args.args[0], 'https://api.telegram.org/botFAKE_TOKEN/sendMessage')
        self.assertIn('message_id=42', logs[-1])
        self.assertNotIn('FAKE_TOKEN', str(logs))
        self.assertNotIn('12345', str(logs))

    def test_disables_link_preview_without_changing_message_or_target(self):
        run_url = 'https://github.com/example/netops/actions/runs/42'
        for event, expected in [
            ({'workflow_run': {'name': 'Deploy to GitHub Pages', 'conclusion': 'success',
                               'head_sha': '12345678abcd', 'html_url': run_url}},
             '✅ NetOps staging опубликован\nSHA: 12345678\n'
             'https://apotet.github.io/my-gemini-mirror-site/\n' + run_url),
            ({'workflow_run': {'name': 'NetOps checks', 'conclusion': 'failure', 'html_url': run_url}},
             '❌ NetOps staging: NetOps checks — failure\n' + run_url),
            ({}, '✅ NetOps: проверка доставки Telegram.'),
        ]:
            with self.subTest(expected=expected):
                call = Mock(return_value=success())
                m.deliver(event, 'FAKE_TOKEN', '12345', open_url=call, log=lambda _: None)
                call.assert_called_once()
                form = parse_qs(call.call_args.kwargs['data'].decode(), strict_parsing=True)
                self.assertEqual(set(form), {'chat_id', 'text', 'link_preview_options'})
                self.assertEqual(form['chat_id'], ['12345'])
                self.assertEqual(form['text'], [expected])
                self.assertEqual(len(form['link_preview_options']), 1)
                self.assertIs(json.loads(form['link_preview_options'][0])['is_disabled'], True)

    def test_respects_telegram_retry_after(self):
        call = Mock(side_effect=[rate_limit(7), success()])
        pause = Mock()
        m.deliver({}, 'FAKE_TOKEN', '12345', open_url=call, sleep=pause, log=lambda _: None)
        pause.assert_called_once_with(8)
        self.assertEqual(call.call_count, 2)

    def test_respects_http_retry_after_header(self):
        call = Mock(side_effect=[rate_limit(headers={'Retry-After': '13'}), success()])
        pause = Mock()
        m.deliver({}, 'FAKE_TOKEN', '12345', open_url=call, sleep=pause, log=lambda _: None)
        pause.assert_called_once_with(14)

    def test_successful_intermediate_checks_do_not_send(self):
        call = Mock()
        result = m.deliver({'workflow_run': {'name': 'NetOps checks', 'conclusion': 'success'}}, '', '', open_url=call)
        self.assertIsNone(result)
        call.assert_not_called()

    def test_deploy_success_is_a_final_result(self):
        text = m.message_for({'workflow_run': {'name': 'Deploy to GitHub Pages', 'conclusion': 'success', 'head_sha': '12345678abcd'}})
        self.assertIn('опубликован', text)
        self.assertIn('12345678', text)
        self.assertIsNone(m.message_for({'pull_request': {'merged': True}}))

    def test_failure_is_reported(self):
        self.assertIn('failure', m.message_for({'workflow_run': {'name': 'NetOps checks', 'conclusion': 'failure'}}))

    def test_rejected_request_is_not_retried(self):
        call = Mock(side_effect=HTTPError('https://invalid/', 403, 'blocked', {}, None))
        pause = Mock()
        with self.assertRaises(SystemExit):
            m.deliver({}, 'FAKE_TOKEN', '12345', open_url=call, sleep=pause, log=lambda _: None)
        self.assertEqual(call.call_count, 1)
        pause.assert_not_called()

    def test_wrong_chat_or_unconfirmed_message_is_not_success(self):
        for response in [success(chat=98765), success(message_id=None), io.BytesIO(b'{"ok": false}')]:
            with self.assertRaises(SystemExit):
                m.deliver({}, 'FAKE_TOKEN', '12345', open_url=Mock(return_value=response), log=lambda _: None)

    def test_rate_limit_retries_are_bounded(self):
        call = Mock(side_effect=[rate_limit(1), rate_limit(1), rate_limit(1)])
        pause = Mock()
        with self.assertRaises(SystemExit):
            m.deliver({}, 'FAKE_TOKEN', '12345', open_url=call, sleep=pause, log=lambda _: None)
        self.assertEqual(call.call_count, 3)
        self.assertEqual(pause.call_count, 2)


if __name__ == '__main__':
    unittest.main()
