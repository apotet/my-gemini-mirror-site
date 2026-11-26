"""Provider boundary; no financial policy or arbitrary input/output byte caps."""
from dataclasses import dataclass
from decimal import Decimal
import json
import os
from pathlib import Path
import subprocess


@dataclass(frozen=True)
class Model:
    provider: str
    endpoint: str
    context: int
    output: int
    output_parameter: str
    input_rate: str
    output_rate: str
    cache_rate: str
    vision: bool = False


# Official documentation checked 2026-11-25. These are model/API limits, not budgets.
MODELS = {
    'glm-5.3': Model('zai','https://api.z.ai/api/paas/v4/chat/completions',1048576,131072,'max_tokens','1.4','4.4','.26'),
    'glm-5.3-flash': Model('zai','https://api.z.ai/api/paas/v4/chat/completions',1048576,131072,'max_tokens','.15','.50','.03',True),
    'kimi-k3.1-pro': Model('kimi','https://api.moonshot.ai/v1/chat/completions',1048576,1048576,'max_completion_tokens','2','10','.2',True),
    # Runtime output cap, not a claim about this model's native maximum.
    'gemini-3.8-flash': Model('gemini','https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent',1048576,16384,'maxOutputTokens','0','0','0'),
}
DEFAULT = {'zai':'glm-5.3','kimi':'kimi-k3.1-pro','gemini':'gemini-3.8-flash'}


def payload(task, messages):
    model = MODELS[task['model']]
    output = task.get('max_output_tokens',model.output)
    if type(output) is not int or not 1 <= output <= model.output:
        raise ValueError('Output exceeds this model API limit')
    if model.provider == 'gemini':
        system=[m['content'] for m in messages if m['role']=='system']
        history=[{'role':m['role'],'content':m['content']} for m in messages if m['role']!='system']
        return {'systemInstruction':{'parts':[{'text':'\n'.join(system)}]},
                'contents':[{'role':'user','parts':[{'text':json.dumps(history,ensure_ascii=False)}]}],
                'generationConfig':{'maxOutputTokens':output}}
    result = {'model':task['model'],'messages':messages,model.output_parameter:output,
              'stream':True,'stream_options':{'include_usage':True},'reasoning_effort':task.get('reasoning_effort','high')}
    if model.provider == 'zai':
        result['thinking'] = {'type':'enabled'}
    # Do not estimate tokens from bytes and reject otherwise-valid multilingual input.
    # Provider-native context validation is authoritative; an error pauses, never trims.
    return result


def parse_stream(text):
    content, reasoning, chunks = [], [], []
    finish, usage, done = None, None, False
    for line in text.splitlines():
        if not line.startswith('data:'):
            continue
        data = line[5:].strip()
        if done:
            if data: raise ValueError('Data after stream terminator')
            continue
        if data == '[DONE]':
            done = True
            continue
        chunk = json.loads(data)
        chunks.append(chunk)
        if chunk.get('error'): raise ValueError('Provider stream error')
        for choice in chunk.get('choices') or []:
            if choice.get('index',0) != 0: raise ValueError('Unexpected multiple choices')
            delta = choice.get('delta') or {}
            if delta.get('tool_calls'): raise ValueError('Unadvertised provider tools')
            if delta.get('content'): content.append(delta['content'])
            if delta.get('reasoning_content'): reasoning.append(delta['reasoning_content'])
            finish = choice.get('finish_reason') or finish
        usage = chunk.get('usage') or usage
    if not done or finish not in ('stop','length'):
        raise ValueError('Incomplete/unsupported stream; inspect saved raw response, do not resend')
    return {'content':''.join(content),'reasoning_content':''.join(reasoning),'finish_reason':finish,'usage':usage,'chunks':chunks}


def parse_gemini(text):
    data=json.loads(text)
    candidates=data.get('candidates')
    if not isinstance(candidates,list) or len(candidates)!=1:
        raise ValueError('Missing or ambiguous Gemini response')
    candidate=candidates[0]
    finish={'STOP':'stop','MAX_TOKENS':'length'}.get(candidate.get('finishReason'))
    parts=candidate.get('content',{}).get('parts',[])
    if not finish or not isinstance(parts,list):
        raise ValueError('Incomplete or unsupported Gemini response')
    visible=[];reasoning=[]
    for part in parts:
        if not isinstance(part,dict) or not isinstance(part.get('text'),str):
            raise ValueError('Unsupported Gemini response part')
        (reasoning if part.get('thought') else visible).append(part['text'])
    if not visible:raise ValueError('Empty Gemini response')
    raw_usage=data.get('usageMetadata') or {}
    usage=None
    if isinstance(raw_usage,dict):
        inp=raw_usage.get('promptTokenCount')
        output=raw_usage.get('candidatesTokenCount')
        thoughts=raw_usage.get('thoughtsTokenCount',0)
        if all(type(n) is int and n>=0 for n in (inp,output,thoughts)):
            usage={'prompt_tokens':inp,'completion_tokens':output+thoughts,'provider_usage':raw_usage}
    return {'content':''.join(visible),'reasoning_content':''.join(reasoning),
            'finish_reason':finish,'usage':usage}


def infer(task, messages, output_dir, timeout):
    """Exactly one transport attempt; caller must durably reserve it first."""
    key = os.environ.get('PROVIDER_API_KEY','').strip()
    if not key: raise ValueError('Missing provider credential')
    output_dir.mkdir(parents=True,exist_ok=True)
    request = payload(task,messages)
    (output_dir/'request.json').write_text(json.dumps(request,ensure_ascii=False),encoding='utf-8')
    raw, headers = output_dir/'response.sse', output_dir/'headers.tmp'
    try:
        model=MODELS[task['model']]
        auth=('x-goog-api-key: ' if model.provider=='gemini' else 'Authorization: Bearer ')+key
        result = subprocess.run(['curl','-q','--silent','--show-error','--no-buffer','--retry','0',
            '--max-time',str(timeout),'--proto','=https','--output',str(raw),'--dump-header',str(headers),
            '--write-out','%{http_code}',model.endpoint,
            '--header',auth,'--header','Content-Type: application/json',
            '--data-binary','@'+str(output_dir/'request.json')],capture_output=True,text=True,timeout=timeout+15)
        status = result.stdout
    finally:
        billing = {}
        if headers.exists():
            for line in headers.read_text(errors='replace').splitlines():
                name, _, value = line.partition(':')
                if name.lower() in ('msh-usage-cache-write-tokens-5m','msh-usage-cache-write-tokens-1h') and value.strip().isdigit():
                    billing[name.lower()] = int(value.strip())
            headers.unlink()
        (output_dir/'billing.json').write_text(json.dumps(billing))
        if raw.exists(): raw.write_bytes(raw.read_bytes().replace(key.encode(),b'[REDACTED]'))
    if result.returncode or status != '200':
        (output_dir/'transport.json').write_text(json.dumps({'returncode':result.returncode,'http_status':status}))
        raise ValueError('Transport failed; attempted request must not be silently repeated')
    parsed = (parse_gemini if model.provider=='gemini' else parse_stream)(raw.read_text(encoding='utf-8'))
    parsed['billing'] = billing
    parsed['raw'] = raw.read_text(encoding='utf-8')
    return parsed


def cost(model_name, usage, billing):
    model=MODELS[model_name]
    if model.provider=='gemini':
        known=isinstance(usage,dict) and all(type(usage.get(k)) is int and usage[k]>=0 for k in ('prompt_tokens','completion_tokens'))
        return {'exact_usd':None,'range_usd':None,'usage_known':known}
    if not isinstance(usage,dict):return {'exact_usd':None,'range_usd':None,'usage_known':False}
    inp,out=usage.get('prompt_tokens'),usage.get('completion_tokens')
    valid=lambda n:type(n) is int and n>=0
    if not valid(inp) or not valid(out):return {'exact_usd':None,'range_usd':None,'usage_known':False}
    ir,cr,ore=Decimal(model.input_rate),Decimal(model.cache_rate),Decimal(model.output_rate)
    broad=(Decimal(inp)*cr,Decimal(inp)*ir*(2 if model.provider=='kimi' else 1))
    lo,hi=broad;exact=False
    details=usage.get('prompt_tokens_details') or {}
    if not isinstance(details,dict):details={}
    cached=details.get('cached_tokens')
    bad=cached is not None and (not valid(cached) or cached>inp)
    if model.provider=='kimi':
        written=details.get('cache_write_tokens')
        w5,w1=billing.get('msh-usage-cache-write-tokens-5m'),billing.get('msh-usage-cache-write-tokens-1h')
        bad=bad or any(n is not None and not valid(n) for n in (written,w5,w1))
        if not bad:
            if written is None and w5 is not None and w1 is not None:written=w5+w1
            if written is not None:
                bad=written>inp or cached is not None and cached+written>inp
                if w5 is not None and w1 is None:w1=written-w5
                if w1 is not None and w5 is None:w5=written-w1
                if written==0:
                    w5=0 if w5 is None else w5;w1=0 if w1 is None else w1
                bad=bad or any(n is not None and n<0 for n in (w5,w1)) or w5 is not None and w1 is not None and w5+w1!=written
                if not bad:
                    fixed_lo,fixed_hi=Decimal(written)*ir,Decimal(written)*ir*2
                    if w5 is not None and w1 is not None:fixed_lo=fixed_hi=Decimal(w5)*ir+Decimal(w1)*ir*2
                    rest=inp-written
                    lo,hi=fixed_lo+Decimal(rest)*cr,fixed_hi+Decimal(rest)*ir
                    if cached is not None:
                        lo=fixed_lo+Decimal(cached)*cr+Decimal(rest-cached)*ir
                        hi=fixed_hi+Decimal(cached)*cr+Decimal(rest-cached)*ir
                        exact=lo==hi
            elif cached is not None:
                lo=Decimal(cached)*cr+Decimal(inp-cached)*ir
                hi=Decimal(cached)*cr+Decimal(inp-cached)*ir*2
    elif not bad and cached is not None:
        lo=hi=Decimal(cached)*cr+Decimal(inp-cached)*ir;exact=True
    if bad:lo,hi=broad;exact=False
    lo,hi=(lo+Decimal(out)*ore)/1000000,(hi+Decimal(out)*ore)/1000000
    return {'exact_usd':float(lo) if exact else None,'range_usd':{'min':float(lo),'max':float(hi)},
            'usage_known':True,'before_tax':True,'pricing_verified':'2026-11-25','inconsistent_cache':bool(bad)}
