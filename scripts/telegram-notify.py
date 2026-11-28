"""Deliver final staging results; never print bot tokens, URLs or chat IDs."""
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request


def message_for(event):
    run = event.get('workflow_run')
    if run:
        result = run.get('conclusion')
        deployment = run.get('name') == 'Deploy to GitHub Pages'
        if result == 'success' and deployment:
            return f"✅ NetOps staging опубликован\nSHA: {run.get('head_sha', '')[:8]}\nhttps://apotet.github.io/my-gemini-mirror-site/\n{run.get('html_url', '')}"
        if result in {'failure', 'cancelled', 'timed_out', 'action_required'}:
            return f"❌ NetOps staging: {run.get('name', 'проверка')} — {result}\n{run.get('html_url', '')}"
        return None  # No separate messages for successful intermediate checks.
    if event.get('pull_request'):
        return None  # Publication, not the merge event, is the final result.
    return '✅ NetOps: проверка доставки Telegram.'


def retry_seconds(error, attempt):
    try:
        payload = json.load(error)
    except (ValueError, OSError):
        payload = {}
    value = (payload.get('parameters') or {}).get('retry_after') if isinstance(payload, dict) else None
    if value is None:
        value = error.headers.get('Retry-After') if error.headers else None
    try:
        seconds = int(value)
        if seconds >= 0:
            return seconds + 1
    except (ValueError, TypeError):
        pass
    return 30 * (attempt + 1)


def deliver(event, token, chat, *, open_url=urllib.request.urlopen, sleep=time.sleep, log=print):
    message = message_for(event)
    if message is None:
        log('No final result to notify')
        return None
    token, chat = token.strip(), chat.strip()
    if not token or not chat:
        raise SystemExit('Telegram secrets missing')
    # This private notification target is configured as the numeric chat ID.
    try:
        expected_chat = int(chat)
    except ValueError:
        raise SystemExit('Telegram chat ID must be numeric') from None
    data = urllib.parse.urlencode({
        'chat_id': chat,
        'text': message,
        'link_preview_options': json.dumps({'is_disabled': True}),
    }).encode()
    for attempt in range(3):
        delay = 3 * (attempt + 1)
        try:
            with open_url('https://api.telegram.org/bot' + token + '/sendMessage', data=data, timeout=20) as response:
                payload = json.load(response)
            result = payload.get('result') or {}
            message_id = result.get('message_id')
            if payload.get('ok') is not True or not isinstance(message_id, int) or result.get('chat', {}).get('id') != expected_chat:
                raise SystemExit('Telegram delivery not confirmed for configured chat')
            log(f'Telegram delivery confirmed: message_id={message_id}; configured_chat_matches=true')
            return message_id
        except urllib.error.HTTPError as exc:
            log(f'Telegram HTTP status: {exc.code}')
            if exc.code == 429:
                delay = retry_seconds(exc, attempt)
                log(f'Telegram rate limit: retry_after_seconds={delay}')
            elif exc.code < 500:
                raise SystemExit('Telegram API rejected request') from None
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            log(f'Telegram network failure: {type(getattr(exc, "reason", exc)).__name__}')
        if attempt == 2:
            raise SystemExit('Telegram delivery failed after three attempts')
        if delay > 180:
            raise SystemExit('Telegram retry interval exceeds bounded delivery budget')
        sleep(delay)
    raise SystemExit('Telegram delivery not confirmed')


if __name__ == '__main__':
    with open(os.environ['GITHUB_EVENT_PATH'], encoding='utf-8') as event_file:
        event = json.load(event_file)
    deliver(event, os.environ.get('TELEGRAM_BOT_TOKEN', ''), os.environ.get('TELEGRAM_CHAT_ID', ''))
