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
        self.assertEqual(payload['generationConfig']['maxOutputTokens'],2048)
        self.assertNotIn('tools',payload)
        self.assertEqual(base64.b64decode(payload['contents'][0]['parts'][-1]['inlineData']['data']),b'exact-image-bytes')
        full=json.loads(d.make_payload(pkg,'pilot',[('public', 'Public lesson')]))
        self.assertNotIn('maxOutputTokens',full['generationConfig'])
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
            full_labels=['arp-mobile','arp-desktop','poe-connected','poe-budget','poe-splitter']
            full=Mock(return_value=mock_response(dict(RESULT,image_observations=[
                dict(label=l,observation='Наблюдение по материалу.') for l in full_labels])))
            pilot=d.run('pilot',p/'pilot.json',env=env,send=full)
            self.assertEqual([x['label'] for x in pilot['image_provenance']],full_labels)
            request=json.loads(full.call_args.args[0])
            self.assertNotIn('maxOutputTokens',request['generationConfig'])
            self.assertEqual(len([p for p in request['contents'][0]['parts'] if 'inlineData' in p]),5)
