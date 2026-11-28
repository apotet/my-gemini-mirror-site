import base64
import io
import json
from pathlib import Path
from tempfile import TemporaryDirectory
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch
import urllib.error
from agent_runtime import designer_free as d

KEY='MockProviderKeyDoNotUseForAnyNetwork'
RESULT=dict(image_observations=[dict(label='arp-mobile',observation='Есть видимый заголовок.')],
    proposals=[dict(title='Заголовок',change='Сократить',rationale='Проще прочитать',how_to_verify='На телефоне')],
    next_iteration='Сравнить.')
EVENT={'repository':{'full_name':d.REPO},'ref':'main','sender':{'login':'apotet','id':332418397},
       'inputs':{'mode':'smoke','free_project':d.CONFIRM}}
ENV=dict(GITHUB_ACTIONS='true',GITHUB_EVENT_NAME='workflow_dispatch',GITHUB_REPOSITORY=d.REPO,
         GITHUB_WORKFLOW_REF=d.REPO+'/.github/workflows/gemini-designer-free.yml@refs/heads/main',
         GITHUB_REF='refs/heads/main',GITHUB_RUN_ATTEMPT='1',GITHUB_RUN_ID='1234',
         GITHUB_ACTOR='apotet',GITHUB_TRIGGERING_ACTOR='apotet',GITHUB_ACTOR_ID='332418397',
         GITHUB_SHA='a'*40,GEMINI_API_KEY=KEY)


def mock_response(result=RESULT, finish='STOP'):
    return json.dumps(dict(candidates=[dict(finishReason=finish,content={'parts':[
          {'text':'Private reasoning','thought':True},{'text':json.dumps(result)}]})],
          usageMetadata=dict(promptTokenCount=220,candidatesTokenCount=50,thoughtsTokenCount=15,
                             totalTokenCount=285,removed='not exported'))).encode()


class FreeDesigner(unittest.TestCase):
    def test_owner_free_main_single_attempt(self):
        d.audit_env(ENV,EVENT,'smoke')
        for k,v in [('GITHUB_ACTOR_ID','555'),('GITHUB_RUN_ATTEMPT','2'),('GITHUB_ACTOR','not-owner'),
                    ('GITHUB_TRIGGERING_ACTOR','different'),('GITHUB_REF','refs/pull/590/merge'),
                    ('GITHUB_EVENT_NAME','pull_request'),('GITHUB_WORKFLOW_REF','other')]:
            with self.assertRaisesRegex(d.Stop,'owner_free_project_dispatch_required'):
                d.audit_env(dict(ENV,**{k:v}),EVENT,'smoke')
        with self.assertRaises(d.Stop):
            d.audit_env(ENV,dict(EVENT,inputs={'mode':'smoke'}),'smoke')
        with self.assertRaises(d.Stop):
            d.audit_env(ENV,EVENT,'pilot')

    def test_native_inline_no_tools_no_paid_fallback_no_pilot_output_cap(self):
        pkg=SimpleNamespace(images=[SimpleNamespace(label='arp-mobile',data=b'exact-image-bytes')])
        payload=json.loads(d.make_payload(pkg,'smoke'))
        self.assertEqual(payload['generationConfig'], {'responseMimeType':'application/json',
        })
        self.assertNotIn('tools',payload)
        self.assertEqual(base64.b64decode(payload['contents'][0]['parts'][-1]['inlineData']['data']),b'exact-image-bytes')
        full=json.loads(d.make_payload(pkg,'pilot',[('public', 'Public lesson')]))
        self.assertEqual(full['generationConfig'], {'responseMimeType':'application/json'})
        self.assertNotIn('tools',full)

    def test_fixed_endpoint_and_quota_never_retry(self):
        for code,reason in ((429,'quota_or_rate_limit_no_retry'),(403,'provider_http_error_no_retry'),(503,'provider_http_error_no_retry')):
            with self.subTest(code=code):
                fake=Mock()
                fake.open.side_effect=urllib.error.HTTPError(d.URL,code,'irrelevant',{},io.BytesIO(KEY.encode()))
                with self.assertRaisesRegex(d.Stop,reason) as caught:
                    d.post(b'{}',KEY,opener=fake)
                self.assertEqual(caught.exception.status,code)
                self.assertNotIn(KEY,str(caught.exception))
                fake.open.assert_called_once()
                req=fake.open.call_args.args[0]
                self.assertEqual(req.full_url,d.URL)
                self.assertEqual(req.get_method(),'POST')
                self.assertEqual(req.get_header('X-goog-api-key'),KEY)
                self.assertNotIn(KEY,req.full_url)
        with self.assertRaisesRegex(d.Stop,'no_retry'):
            d.post(b'{}',KEY,opener=Mock(open=Mock(side_effect=TimeoutError())))
        self.assertIsNone(d.NoRedirect().redirect_request(None,None,302,None,None,'https://example.test'))

    def test_review_only_no_thought_or_credentials_in_artifact(self):
        obj,usage=d.decode(mock_response(),['arp-mobile'],KEY)
        self.assertEqual(obj,RESULT)
        self.assertEqual(usage,dict(promptTokenCount=220,candidatesTokenCount=50,thoughtsTokenCount=15,totalTokenCount=285))
        for values in (mock_response(dict(RESULT,next_iteration=KEY)),mock_response(dict(RESULT,next_iteration=base64.b64encode(KEY.encode()).decode())),
                       mock_response(dict(RESULT,image_observations=[])),mock_response(finish='MAX_TOKENS')):
            with self.assertRaises(d.Stop):
                d.decode(values,['arp-mobile'],KEY)

    def test_stopped_http_200_retains_only_sanitized_usage(self):
        for finish, result, reason in (
                ('MAX_TOKENS', RESULT, 'nonfinal_response_no_retry'),
                ('STOP', dict(RESULT, next_iteration=KEY), 'invalid_or_sensitive_response_no_retry'),
                ('STOP', '', 'invalid_or_sensitive_response_no_retry')):
            with self.subTest(finish=finish, reason=reason):
                raw = json.loads(mock_response(result, finish))
                raw['usageMetadata'] = {
                    'promptTokenCount': 860, 'candidatesTokenCount': 0, 'thoughtsTokenCount': 2047,
                    'totalTokenCount': 2907, 'cachedContentTokenCount': True,
                    'unknown': KEY, 'promptTokensDetails': [
                        {'modality':'TEXT', 'tokenCount':100}, {'modality':'IMAGE', 'tokenCount':760, 'echo':KEY}]}
                if result == '':
                    raw.pop('candidates')  # HTTP 200 with usage but no answer body.
                with self.assertRaisesRegex(d.Stop, reason) as caught:
                    d.decode(json.dumps(raw).encode(), ['arp-mobile'], KEY)
                self.assertEqual(caught.exception.status, 200)
                self.assertEqual(caught.exception.usage, {'promptTokenCount':860, 'candidatesTokenCount':0,
                    'thoughtsTokenCount':2047, 'totalTokenCount':2907, 'promptImageTokenCount':760})
                self.assertNotIn(KEY, str(caught.exception))

    def test_ambiguous_missing_or_invalid_usage_is_not_exported(self):
        for image in (0, -1, True, 5.0, '5', 2**31):
            with self.subTest(image=image):
                self.assertIsNone(d.token_usage({'usageMetadata':{'promptTokensDetails':[
                    {'modality':'IMAGE','tokenCount':image}]}}, include_image=True))
        counts = d.token_usage({'usageMetadata':{'promptTokenCount':0,'cachedContentTokenCount':2**31,
            'thoughtsTokenCount':True,'totalTokenCount':5.0}})
        self.assertEqual(counts, {'promptTokenCount':0})
        self.assertIsNone(d.token_usage({'usageMetadata':{'promptTokensDetails':[
            {'modality':'IMAGE','tokenCount':5},{'modality':'IMAGE','tokenCount':6}]}}, include_image=True))
        with self.assertRaises(d.Stop) as caught:
            d.decode(b'{', ['arp-mobile'], KEY)
        self.assertIsNone(caught.exception.usage)

    def test_cli_http_200_failure_logs_counts_once_without_writing_report(self):
        with TemporaryDirectory() as dname:
            event = Path(dname)/'event.json'
            event.write_text(json.dumps(EVENT))
            out = Path(dname)/'report.json'
            response = json.loads(mock_response(finish='MAX_TOKENS'))
            response['responseId'] = KEY
            sender = Mock(return_value=json.dumps(response).encode())
            run = d.run
            def offline(mode, report):
                return run(mode, report, env=dict(ENV,GITHUB_EVENT_PATH=str(event)), send=sender)
            with patch.object(d, 'run', side_effect=offline), patch('sys.argv',
                    ['designer_free','--mode','smoke','--report',str(out)]), \
                    patch('sys.stdout', new_callable=io.StringIO) as stream:
                self.assertEqual(d.main(), 1)
            self.assertEqual(json.loads(stream.getvalue()), {'status':'stopped','model':d.MODEL,
                'reason':'nonfinal_response_no_retry','http_status':200,'cost_usd':None,
                'usage':{'promptTokenCount':220,'candidatesTokenCount':50,'thoughtsTokenCount':15,'totalTokenCount':285}})
            sender.assert_called_once()
            self.assertFalse(out.exists())

    def test_actual_public_manifests_and_mock_full_run(self):
        with TemporaryDirectory() as dname:
            p=Path(dname)
            event=p/'event.json'
            event.write_text(json.dumps(EVENT))
            env=dict(ENV,GITHUB_EVENT_PATH=str(event))
            out=p/'report.json'
            sender=Mock(return_value=mock_response())
            result=d.run('smoke',out,env=env,send=sender)
            self.assertEqual(result['model'],'gemini-4-hydrogen')
            self.assertEqual(result['http_status'],200)
            self.assertEqual(result['cost_usd'],0)
            self.assertEqual(result['observation'],RESULT)
            self.assertEqual(result['image_provenance'][0]['width'],375)
            self.assertNotIn(KEY,out.read_text())
            sender.assert_called_once()
            with self.assertRaisesRegex(d.Stop,'report_path_already_exists'):
                d.run('smoke',out,env=env,send=sender)
            sender.assert_called_once()
            no_key=Mock()
            with self.assertRaisesRegex(d.Stop,'key_missing'):
                d.run('smoke',p/'none.json',env=dict(env,GEMINI_API_KEY=''),send=no_key)
            no_key.assert_not_called()
            event.write_text(json.dumps(dict(EVENT,inputs=dict(EVENT['inputs'],mode='pilot'))))
            full_labels=[f'tcpip-{device}-{theme}-{mode}' for device in ('mobile','desktop')
                         for theme in ('light','dark') for mode in ('plain','pro')] + [
                             'tcpip-mobile-dark-diagram','tcpip-desktop-light-diagram',
                             'poe-connected','poe-budget','poe-splitter']
            full=Mock(return_value=mock_response(dict(RESULT,image_observations=[
                dict(label=l,observation='Наблюдение по материалу.') for l in full_labels])))
            pilot=d.run('pilot',p/'pilot.json',env=env,send=full)
            self.assertEqual([x['label'] for x in pilot['image_provenance']],full_labels)
            request=json.loads(full.call_args.args[0])
            self.assertEqual(request['generationConfig'], {'responseMimeType':'application/json'})
            combined=' '.join(x.get('text','') for x in request['contents'][0]['parts'])
            self.assertIn('src/data/lessons/tcpip-model.ts',combined)
            self.assertNotIn('src/data/lessons/l3-arp.ts',combined)
            self.assertEqual(len([p for p in request['contents'][0]['parts'] if 'inlineData' in p]),13)

class CommentDesigner(unittest.TestCase):
    def test_real_entry_point_sends_one_mock_for_reserved_owner_smoke_only(self):
        from copy import deepcopy
        owner = {'login':'apotet','id':332418397,'type':'User'}
        event = {'action':'created', 'repository':{'full_name':d.REPO}, 'sender':owner.copy(),
                 'issue':{'number':591,'id':6662809692,'state':'open','user':owner.copy()},
                 'comment':{'id':6789,'body':'/gennady smoke','user':owner.copy(),
                            'created_at':'2026-11-28T10:00:00Z','updated_at':'2026-11-28T10:00:00Z'}}
        with TemporaryDirectory() as dname:
            p = Path(dname)
            event_path, report = p/'event.json', p/'report.json'
            env = dict(ENV, GITHUB_EVENT_NAME='issue_comment', GITHUB_EVENT_PATH=str(event_path),
                       DESIGNER_COMMENT_RESERVATION='1234:6789')
            event_path.write_text(json.dumps(event))
            sender = Mock(return_value=mock_response())
            self.assertEqual(d.run('smoke', report, env=env, send=sender)['http_status'], 200)
            sender.assert_called_once()
            report.unlink()
            attempts = []
            for patch_env in ({'DESIGNER_COMMENT_RESERVATION':''}, {'DESIGNER_COMMENT_RESERVATION':'1233:6789'},
                              {'DESIGNER_COMMENT_RESERVATION':'1234:7890'}, {'GITHUB_RUN_ATTEMPT':'2'}):
                attempts.append((event, dict(env, **patch_env), 'smoke'))
            attempts.append((event, env, 'pilot'))
            for field, key, value in (('issue','number',590), ('issue','pull_request',{}),
                                      ('issue','state','closed'), ('comment','body','/gennady check'),
                                      ('comment','body','/GENNADY SMOKE'), ('comment','id',True),
                                      ('sender','type','Bot'), ('comment','updated_at','different')):
                wrong = deepcopy(event)
                wrong[field][key] = value
                attempts.append((wrong, env, 'smoke'))
            for body, state, mode in attempts:
                event_path.write_text(json.dumps(body))
                sender = Mock()
                with self.assertRaisesRegex(d.Stop, 'owner_free_project_dispatch_required'):
                    d.run(mode, report, env=state, send=sender)
                sender.assert_not_called()
                self.assertFalse(report.exists())
