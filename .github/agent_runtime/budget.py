"""Kimi's per-task and shared UTC-day spending estimates.

Reservations are durable before transport. Unknown outcomes keep their reservation.
Estimates are not provider-enforced monetary limits or guarantees of billing.
"""
import base64
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation, ROUND_CEILING
import json

from . import providers

DAILY_MICRO = 2_000_000


class BudgetExceeded(ValueError):
    pass


def validate_task_budget(value):
    if isinstance(value, bool):
        raise ValueError('Invalid budget')
    try:
        amount = Decimal(str(value))
    except InvalidOperation:
        raise ValueError('Invalid budget') from None
    if not amount.is_finite() or not Decimal('0.01') <= amount <= Decimal('2.00') or amount.as_tuple().exponent < -2:
        raise ValueError('Kimi budget must be $0.01..$2.00 in whole cents')
    return str(amount)


def micro(amount):
    return int((Decimal(str(amount))*1_000_000).to_integral_value(rounding=ROUND_CEILING))


def estimate(state):
    task = state['task']
    if state['provider'] != 'kimi' or any(k not in task for k in ('budget_usd','max_input_tokens','max_output_tokens')):
        raise BudgetExceeded('Legacy or invalid Kimi task lacks explicit budget limits')
    model = providers.MODELS[task['model']]
    request = providers.payload(task, state['messages'])
    # Proxy only: tokenization and image accounting are provider-dependent. This can
    # undercount actual usage; neither this nor the budget is a hard provider limit.
    byte_count = len(json.dumps(request, ensure_ascii=False).encode('utf-8'))
    input_estimate = (byte_count + 1)//2 + 256*len(state['messages'])
    if input_estimate > task['max_input_tokens']:
        raise BudgetExceeded(f'Input estimate {input_estimate} exceeds limit {task["max_input_tokens"]}')
    estimated = int((Decimal(input_estimate)*Decimal(model.input_rate)*2 +
                     Decimal(task['max_output_tokens'])*Decimal(model.output_rate)).to_integral_value(rounding=ROUND_CEILING))
    consumed = 0
    for call in state['calls']:
        reservation = call.get('budget_reservation')
        if not reservation:
            raise BudgetExceeded('Previous call lacks a durable budget reservation')
        interval = call.get('cost',{}).get('range_usd')
        consumed += micro(interval['max']) if interval else reservation['reserved_micro']
    if consumed + estimated > micro(task['budget_usd']):
        raise BudgetExceeded('Estimated request exceeds remaining task budget')
    return {'reserved_micro': estimated, 'input_estimate': input_estimate,
            'output_limit': task['max_output_tokens'], 'task_used_micro': consumed}


class DailyLedger:
    def __init__(self, api, day):
        self.api, self.day = api, day
        self.branch = f'agents/budgets/kimi-{day}'
        self.head = api.ref(self.branch)
        if self.head:
            commit = api.request('GET', '/git/commits/'+self.head)
            entries = api.request('GET', '/git/trees/'+commit['tree']['sha'])['tree']
            entry = next(e for e in entries if e['path'] == 'budget.json')
            blob = api.request('GET', '/git/blobs/'+entry['sha'])
            self.data = json.loads(base64.b64decode(blob['content']))
            if self.data.get('day') != day or self.data.get('kind') != 'kimi-daily-budget-v1':
                raise ValueError('Invalid shared daily budget ledger')
        else:
            self.data = {'kind':'kimi-daily-budget-v1', 'day':day, 'reservations':{}}

    def save(self):
        if self.api.ref(self.branch) != self.head:
            raise BudgetExceeded('Daily ledger changed concurrently; no model call made')
        blob = self.api.blob(json.dumps(self.data, sort_keys=True).encode())
        tree = self.api.request('POST','/git/trees',{'tree':[
            {'path':'budget.json','mode':'100644','type':'blob','sha':blob}]})['sha']
        commit = self.api.request('POST','/git/commits',{'message':'Kimi daily budget '+self.day,
            'tree':tree,'parents':[] if self.head is None else [self.head]})['sha']
        if self.head is None:
            self.api.request('POST','/git/refs',{'ref':'refs/heads/'+self.branch,'sha':commit})
        else:
            self.api.request('PATCH','/git/refs/heads/'+self.branch,{'sha':commit,'force':False})
        self.head = commit


def reserve_daily(api, state, estimate_result, now=None):
    day = (now or datetime.now(timezone.utc)).strftime('%Y-%m-%d')
    ledger = DailyLedger(api, day)
    key = f'{state["key"]}:{len(state["calls"])+1}'
    entries = ledger.data['reservations']
    if key in entries:
        raise BudgetExceeded('Daily reservation already exists; no automatic retry')
    used = sum(entry['held_micro'] for entry in entries.values())
    held = estimate_result['reserved_micro']
    if used + held > DAILY_MICRO:
        raise BudgetExceeded('Estimated request exceeds remaining UTC daily budget')
    entries[key] = {'held_micro':held, 'status':'reserved'}
    ledger.save()
    return {'day':day, 'key':key, **estimate_result, 'daily_used_before_micro':used,
            'daily_limit_micro':DAILY_MICRO}


def settle_daily(api, reservation, cost):
    ledger = DailyLedger(api, reservation['day'])
    entry = ledger.data['reservations'][reservation['key']]
    if entry['status'] != 'reserved':
        raise ValueError('Daily reservation already settled')
    interval = (cost or {}).get('range_usd')
    if interval:
        entry.update(held_micro=micro(interval['max']), status='answered',
                     actual_range_usd=interval)
    else:
        entry['status'] = 'usage_unknown'
    ledger.save()


def daily_status(api, now=None):
    day = (now or datetime.now(timezone.utc)).strftime('%Y-%m-%d')
    entries = DailyLedger(api, day).data['reservations'].values()
    entries = list(entries)
    return {'utc_day':day, 'limit_usd':'2.00',
            'held_or_known_upper_usd':sum(e['held_micro'] for e in entries)/1_000_000,
            'unsettled_or_unknown':sum(e['status'] != 'answered' for e in entries),
            'scope':'Kimi runtime only; not account-wide. Estimate, not a billing guarantee.'}
