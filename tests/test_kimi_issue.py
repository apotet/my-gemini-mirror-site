"""Offline adapter tests: no live GitHub or model calls; shared SSE/AST tools run locally."""
import copy
import io
import importlib.util
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'.github/scripts'))
spec = importlib.util.spec_from_file_location('kimi_issue',ROOT/'.github/scripts/kimi_issue.py')
k = importlib.util.module_from_spec(spec); spec.loader.exec_module(k)
REAL_GITHUB = k.github
TARGET = 'src/data/lessons/fixture.ts'
ORIGINAL = "export const FIXTURE = { id: 'fixture', title: 'Lesson', blocks: [{ heading: 'One', body: 'Original' }], relatedQuestionIds: []\n};\n"
CANDIDATE = ORIGINAL.replace('Original','Improved')


class IssueAdapter(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        cwd = os.getcwd(); os.chdir(self.root); self.addCleanup(os.chdir,cwd)
        Path(TARGET).parent.mkdir(parents=True)
        Path(TARGET).write_text(ORIGINAL)
        # Test the same trusted scripts with TS 5.9.3 in a self-contained fixture.
        scripts = self.root/'.github/scripts'
        shutil.copytree(ROOT/'.github/scripts',scripts,ignore=shutil.ignore_patterns('__pycache__'))
        (self.root/'.github/agent').mkdir()
        shutil.copyfile(ROOT/'.github/agent/system-prompt.md',self.root/'.github/agent/system-prompt.md')
        vendor = ROOT/'tests/vendor/node_modules'
        modules = vendor if (vendor/'typescript').exists() else ROOT/'node_modules'
        (scripts/'node_modules').symlink_to(modules, target_is_directory=True)
        p=patch.object(k,'SCRIPTS',scripts);p.start();self.addCleanup(p.stop)

        for args in [('init','-q'),('config','user.email','test@example.com'),('config','user.name','test'),('add','src'),('commit','-qm','fixture')]:
            subprocess.run(['git',*args],check=True,capture_output=True)
        self.source = subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip()
        self.task = {'task':'Inspect the full lesson','target_files':[TARGET]}
        self.e = {'action':'opened','sender':{'login':'apotet','type':'User'},'issue':{'number':99,'title':'[KIMI] Test','user':{'login':'apotet','type':'User'},'body':json.dumps(self.task)}}
        self.event_path = self.root/'event.json'; self.write_event()
        env = {'GITHUB_EVENT_PATH':str(self.event_path),'GITHUB_REPOSITORY':'apotet/my-gemini-mirror-site',
               'GITHUB_ACTOR':'apotet','GITHUB_REF':'refs/heads/main','GITHUB_RUN_ATTEMPT':'1',
               'GITHUB_SHA':self.source,'GITHUB_RUN_ID':'123','GITHUB_OUTPUT':str(self.root/'outputs')}
        p=patch.dict(os.environ,env);p.start();self.addCleanup(p.stop)
        for name in ['urlopen','build_opener']:
            p=patch.object(k.urllib.request,name,side_effect=AssertionError('Network forbidden'))
            p.start();self.addCleanup(p.stop)
        p=patch.object(k,'github',side_effect=AssertionError('Unexpected GitHub call'))
        self.gh=p.start();self.addCleanup(p.stop)

    def write_event(self):
        self.event_path.write_text(json.dumps(self.e))

    def prepare(self, mode='audit-only'):
        self.task['mode']=mode; self.e['issue']['body']=json.dumps(self.task);self.write_event();k.prepare()

    def claim(self):
        self.gh.side_effect=[[],{'id':77}]; k.claim();self.gh.reset_mock();self.gh.side_effect=AssertionError('Unexpected GitHub call')

    def response(self, text=None, usage=None, finish='stop', done=True):
        if text is None:
            text = 'Engineering audit with concrete source evidence. '*20
        if usage is None:
            usage={'prompt_tokens':100,'completion_tokens':200,'prompt_tokens_details':{'cached_tokens':0,'cache_write_tokens':0}}
        chunk={'choices':[{'delta':{'content':text},'finish_reason':finish}], 'usage':usage}
        k.save('sse.log','data: '+json.dumps(chunk)+'\n\n'+('data: [DONE]\n' if done else ''))

    def edit_response(self, text=CANDIDATE):
        self.response('CHANGES:\n- Improve text\n===FILES===\n### '+TARGET+'\n```ts\n'+text+'```\n')

    def test_prepare_reuses_payload_tool_without_side_effects(self):
        self.prepare();p=k.load('payload.json');a=k.load('accounting.json')
        self.assertEqual(p['model'],k.MODEL); self.assertTrue(p['stream'])
        self.assertNotIn('thinking',p);self.assertEqual(p['max_completion_tokens'],8192)
        self.assertIn(ORIGINAL,p['messages'][1]['content']);self.assertIn(self.task['task'],p['messages'][1]['content'])
        self.assertLessEqual(a['max_cost_usd'],.25);self.assertEqual(a['api_calls'],0)
        self.gh.assert_not_called();self.assertEqual(Path(TARGET).read_text(),ORIGINAL)

    def test_modes_and_ast_profile(self):
        for mode in ['audit-only','edit']:
            self.task['mode']=mode;self.task['verification']='structure';self.e['issue']['body']=json.dumps(self.task)
            self.assertEqual(k.task_for(self.e['issue'])['mode'],mode)
        self.task['verification']='tsc';self.e['issue']['body']=json.dumps(self.task)
        with self.assertRaises(ValueError):k.task_for(self.e['issue'])

    def test_unknown_fields_and_invalid_parameters(self):
        for mutation in [{'mode':'shell'},{'model':'other'},{'task':''},{'task':'x'*12001},{'target_files':[]},
                         {'target_files':[TARGET]*2},{'target_files':['a']*5},{'max_tokens':True},{'max_tokens':8193},
                         {'max_tokens':0},{'max_tokens':'8192'},{'branch':'main'},{'max_cost_usd':100},{'verification':'poe-full'}]:
            with self.subTest(mutation=mutation):
                self.e['issue']['body']=json.dumps({**self.task,**mutation})
                with self.assertRaises(ValueError):k.task_for(self.e['issue'])
        self.e['issue']['body']='{"task":"a","task":"b","target_files":[]}'
        with self.assertRaises(ValueError):k.task_for(self.e['issue'])

    def test_paths_and_symlinks(self):
        for path in ['../x','/etc/passwd','.github/workflows/ci.yml','src/data/lessons/../x.ts',
                     'src/data/lessons/$(id).ts','src/data/lessons/missing.ts']:
            self.e['issue']['body']=json.dumps({**self.task,'target_files':[path]})
            with self.subTest(path=path),self.assertRaises(ValueError):k.task_for(self.e['issue'])
        Path('src/data/lessons/link.ts').symlink_to(self.root/TARGET)
        with self.assertRaises(ValueError):k.validate_path('src/data/lessons/link.ts','src/data/lessons/','.ts')
        Path('src/data/lessons/index.ts').write_text(ORIGINAL)
        self.e['issue']['body']=json.dumps({**self.task,'target_files':['src/data/lessons/index.ts']})
        with self.assertRaises(ValueError):k.task_for(self.e['issue'])

    def test_identity_trigger_and_rerun_guards(self):
        for env in [{'GITHUB_ACTOR':'other'},{'GITHUB_REPOSITORY':'fork/repo'}, {'GITHUB_REF':'refs/heads/feature'}, {'GITHUB_RUN_ATTEMPT':'2'}]:
            with self.subTest(env=env),patch.dict(os.environ,env),self.assertRaises(ValueError):k.event()
        for change in [{'action':'edited'},{'action':'reopened'},{'sender':{'login':'apotet','type':'Bot'}}]:
            old=copy.deepcopy(self.e);self.e.update(change);self.write_event()
            with self.assertRaises(ValueError):k.event()
            self.e=old
        for field,value in [('title','[ZAI] not Kimi'),('pull_request',{}),('user',{'login':'other','type':'User'})]:
            old=copy.deepcopy(self.e);self.e['issue'][field]=value
            if field=='pull_request':self.e['issue'][field]={'url':'PR'}
            self.write_event()
            with self.assertRaises(ValueError):k.event()
            self.e=old
        self.gh.assert_not_called()

    def test_budget_boundaries_and_rejection_before_claim(self):
        self.prepare();p=k.load('payload.json')
        p['messages']=[{'content':'x'*39000}]
        self.assertEqual(k.budget(p)['max_cost_usd'],.246112)
        p['messages'][0]['content']+='x'
        with self.assertRaises(ValueError):k.budget(p)
        # Independent cost gate, even if the byte limit were raised in trusted code.
        p['messages'][0]['content']='x'*41000
        with patch.object(k,'MAX_BYTES',50000),self.assertRaises(ValueError):k.budget(p)
        Path(TARGET).write_text('x'*50000)
        with self.assertRaises(ValueError):k.prepare()
        self.gh.assert_not_called()

    def test_paginated_durable_claim_blocks_duplicate(self):
        self.prepare();self.gh.side_effect=[[{'body':'ordinary'}]*100,[{'body':k.MARKER}]]
        with self.assertRaises(ValueError):k.claim()
        self.assertEqual(self.gh.call_count,2)
        self.assertTrue(all(c.args[0]=='GET' for c in self.gh.call_args_list))
        self.assertIn('page=2',self.gh.call_args.args[1])

    def test_unsupported_edit_source_rejected_before_claim(self):
        Path(TARGET).write_text('export const ARRAY = [];')
        self.prepare('edit')
        with self.assertRaises(subprocess.CalledProcessError):k.claim()
        self.gh.assert_not_called()

    def test_claim_written_only_after_all_preflight(self):
        self.prepare();self.gh.side_effect=[[],{'id':77}];k.claim()
        self.assertEqual(k.load('claim.json')['comment_id'],77)
        self.assertIn(k.MARKER,self.gh.call_args.args[2]['body'])

    def test_one_request_zero_retry_no_redirect_and_secret_redaction(self):
        self.prepare();self.claim()
        def http(args,**kwargs):
            self.assertEqual(args[:2],['curl','-q']);self.assertNotIn('-L',args)
            self.assertEqual(args[args.index('--retry')+1],'0');self.assertEqual(args[args.index('--max-time')+1],'600')
            k.save('sse.log','test-secret')
            return subprocess.CompletedProcess(args,0,'200','')
        with patch.dict(os.environ,{'MOONSHOT_API_KEY':'test-secret'}),patch.object(k.subprocess,'run',side_effect=http) as paid,patch.object(k,'state_for',return_value=k.load('state.json')):
            k.run();self.assertEqual(paid.call_count,1)
            self.assertEqual(k.load('accounting.json')['api_calls'],1)
            with self.assertRaises(ValueError):k.run()
            self.assertEqual(paid.call_count,1)
        self.assertNotIn('test-secret',(k.OUT/'sse.log').read_text())

    def test_failure_keeps_spent_attempt_and_never_retries(self):
        self.prepare();self.claim()
        with patch.dict(os.environ,{'MOONSHOT_API_KEY':'test-secret'}),patch.object(k,'state_for',return_value=k.load('state.json')),patch.object(k.subprocess,'run',return_value=subprocess.CompletedProcess([],1,'500','secret')) as paid:
            with self.assertRaises(ValueError):k.run()
            self.assertEqual(paid.call_count,1)
        self.assertEqual(k.load('accounting.json')['api_calls'],1)
        self.assertIsNone(k.load('accounting.json')['cost_usd'])

    def test_missing_claim_or_key_no_paid_call(self):
        self.prepare()
        with patch.object(k,'state_for',return_value=k.load('state.json')),patch.object(k.subprocess,'run') as paid:
            with self.assertRaises(FileNotFoundError):k.run()
            k.save('claim.json',{'issue':99})
            with patch.dict(os.environ,{'MOONSHOT_API_KEY':''}),self.assertRaises(ValueError):k.run()
            paid.assert_not_called()

    def test_payload_tampering_no_paid_call(self):
        self.prepare();self.claim();k.save('payload.json',{})
        with patch.object(k,'state_for',return_value=k.load('state.json')),patch.object(k.subprocess,'run') as paid:
            with self.assertRaises(ValueError):k.run()
            paid.assert_not_called()

    def test_audit_protocol_and_exact_cost(self):
        self.prepare();self.response();k.verify()
        self.assertTrue((k.OUT/'report.md').exists());self.assertFalse((k.OUT/'edit-ready.json').exists())
        self.assertEqual(k.load('accounting.json')['cost_usd'],.0022)
        self.assertEqual(Path(TARGET).read_text(),ORIGINAL)

    def test_invalid_protocol_retains_usage_but_blocks_edit(self):
        self.prepare('edit');self.edit_response()
        for done,finish in [(False,'stop'),(True,'length')]:
            self.response('text',finish=finish,done=done)
            with self.assertRaises(subprocess.CalledProcessError):k.verify()
            self.assertIn('usage',k.load('accounting.json'))
            self.assertFalse((k.OUT/'edit-ready.json').exists())
            self.assertEqual(Path(TARGET).read_text(),ORIGINAL)

    def test_invalid_usage_counters_and_unknown_cost(self):
        self.prepare();self.response(usage={'total_tokens':200})
        with self.assertRaises(ValueError):k.verify()
        self.assertIsNone(k.load('accounting.json')['cost_usd'])
        self.response(usage={'prompt_tokens':100,'completion_tokens':200});k.verify()
        self.assertIsNone(k.load('accounting.json')['cost_usd'])
        self.assertEqual(k.load('accounting.json')['usage_cost_upper_bound_usd'],.0024)

    def test_cache_read_write_billing(self):
        self.prepare()
        self.response(usage={'prompt_tokens':100,'completion_tokens':200,'prompt_tokens_details':{'cached_tokens':20,'cache_write_tokens':30}})
        k.save('billing-headers.json',{'msh-usage-cache-write-tokens-5m':10,'msh-usage-cache-write-tokens-1h':20})
        k.verify();self.assertEqual(k.load('accounting.json')['cost_usd'],.002204)

    def test_observed_360_usage_reports_range_not_exact_cost(self):
        usage={'prompt_tokens':5349,'completion_tokens':4076,'prompt_tokens_details':{'cache_write_tokens':5120}}
        headers={'msh-usage-cache-write-tokens-5m':5120,'msh-usage-cache-write-tokens-1h':0}
        cost=k.usage_cost(usage,headers)
        self.assertIsNone(cost['cost_usd'])
        self.assertEqual(cost['cost_range_usd'],{'min':.0510458,'max':.051458,'before_tax':True})
        self.assertIn('диапазон',k.cost_summary(cost))
        self.assertNotIn('по полному usage',k.cost_summary(cost))

    def test_cost_range_missing_ttl_and_all_cache_fields(self):
        result=k.usage_cost({'prompt_tokens':100,'completion_tokens':200},{})
        self.assertEqual(result['cost_range_usd']['min'],.00202)
        self.assertEqual(result['cost_range_usd']['max'],.0024)
        result=k.usage_cost({'prompt_tokens':100,'completion_tokens':200,'prompt_tokens_details':{'cached_tokens':20,'cache_write_tokens':30}},{})
        self.assertIsNone(result['cost_usd'])
        self.assertEqual(result['cost_range_usd']['min'],.002164)
        self.assertEqual(result['cost_range_usd']['max'],.002224)

    def test_inconsistent_cache_counters_never_produce_exact_cost(self):
        for details in [{'cached_tokens':101}, {'cached_tokens':True}, {'cached_tokens':-1}, {'cached_tokens':90,'cache_write_tokens':30}]:
            with self.subTest(details=details):
                result=k.usage_cost({'prompt_tokens':100,'completion_tokens':200,'prompt_tokens_details':details},{})
                self.assertIsNone(result['cost_usd'])
                self.assertNotIn('cost_range_usd',result)

    def test_conflicting_zero_write_usage_and_nonzero_header_is_not_exact(self):
        result=k.usage_cost({'prompt_tokens':100,'completion_tokens':200,'prompt_tokens_details':{'cached_tokens':0,'cache_write_tokens':0}},
                            {'msh-usage-cache-write-tokens-5m':30,'msh-usage-cache-write-tokens-1h':0})
        self.assertIsNone(result['cost_usd'])
        self.assertNotIn('cost_range_usd',result)

    def test_single_known_ttl_header_can_complete_written_total(self):
        usage={'prompt_tokens':100,'completion_tokens':200,'prompt_tokens_details':{'cached_tokens':0,'cache_write_tokens':30}}
        result=k.usage_cost(usage,{'msh-usage-cache-write-tokens-5m':30})
        self.assertEqual(result['cost_usd'],.0022)
        self.assertEqual(result['cache_write_1h_tokens'],0)

    def test_safe_github_error_keeps_status_and_policy_reason(self):
        error=k.urllib.error.HTTPError('https://api.github.com/repos/apotet/my-gemini-mirror-site/pulls',403,'Forbidden',
            {'X-GitHub-Request-Id':'ABCD:1234'},io.BytesIO(json.dumps({'message':'GitHub Actions is not permitted to create or approve pull requests.'}).encode()))
        with patch.dict(os.environ,{'GH_TOKEN':'private-token'}),patch.object(k.urllib.request,'urlopen',side_effect=error),self.assertRaises(k.GitHubAPIError) as caught:
            # Bypass the test's normal GitHub mock to exercise the actual HTTP adapter.
            REAL_GITHUB('POST','/pulls',{'draft':True})
        self.assertEqual(caught.exception.status,403)
        self.assertEqual(caught.exception.reason,'actions_pr_creation_disabled')
        self.assertNotIn('private-token',str(caught.exception.details()))
        unknown=k.GitHubAPIError('POST','/pulls',403,'Bearer private-token')
        self.assertNotIn('private-token',str(unknown.details()))

    def test_github_adapter_preserves_creation_status_and_handles_204(self):
        response=io.BytesIO(b'{"number": 999}')
        response.status=201
        with patch.dict(os.environ,{'GH_TOKEN':'private-token'}),patch.object(k.urllib.request,'urlopen',return_value=response):
            self.assertEqual(REAL_GITHUB('POST','/pulls',{},with_status=True),(201,{'number':999}))
        response=io.BytesIO(b'');response.status=204
        with patch.dict(os.environ,{'GH_TOKEN':'private-token'}),patch.object(k.urllib.request,'urlopen',return_value=response):
            self.assertIsNone(REAL_GITHUB('DELETE','/git/refs/heads/diagnostic'))

    def test_disposable_creation_probe_never_duplicates_or_closes_361(self):
        spec=importlib.util.spec_from_file_location('probe',ROOT/'.github/scripts/kimi_publication_probe.py')
        probe=importlib.util.module_from_spec(spec);spec.loader.exec_module(probe);probe.k=k
        branch='kimi/publication-smoke-123';path='docs/audits/kimi-publication-smoke-123.txt'
        self.gh.side_effect=[{'object':{'sha':'source'}},{'tree':{'sha':'base'}},{'sha':'blob'},{'sha':'tree'},
            {'sha':'commit'},{'ref':'new'}, {'total_commits':1,'files':[{'filename':path}]},
            (201,{'number':999,'head':{'ref':branch},'draft':True,'state':'open','html_url':'https://github.com/example/999'}),
            {'state':'closed'},None,{'draft':True,'state':'open','head':{'sha':'3bf2cfc010de1d95171b1a882a8cc581a219aa89'}}]
        probe.create_smoke()
        evidence=k.load('publication-probe.json')
        self.assertEqual(evidence['model_calls'],0)
        self.assertEqual(evidence['http_status'],201)
        self.assertTrue(evidence['diagnostic_closed'] and evidence['diagnostic_branch_deleted'] and evidence['existing_361_unchanged'])
        writes=[call.args[1] for call in self.gh.call_args_list if call.args[0] in ['PATCH','DELETE']]
        self.assertEqual(writes,['/pulls/999','/git/refs/heads/'+branch])

    def test_existing_draft_is_reused_without_write(self):
        pr={'state':'open','draft':True,'merged_at':None,'head':{'sha':'commit','ref':'kimi/test','repo':{'full_name':'apotet/my-gemini-mirror-site'}},'base':{'ref':'main'},'html_url':'https://github.com/example/361'}
        self.gh.side_effect=[[pr]]
        self.assertEqual(k.ensure_draft_pr('kimi/test','commit','source',360,'changes'),pr)
        self.assertEqual(self.gh.call_count,1)
        self.assertEqual(self.gh.call_args.args[0],'GET')

    def test_existing_pr_state_cannot_be_overwritten_or_readied(self):
        pr={'state':'open','draft':False,'head':{'sha':'commit','ref':'kimi/test','repo':{'full_name':'apotet/my-gemini-mirror-site'}},'base':{'ref':'main'}}
        self.gh.side_effect=[[pr]]
        with self.assertRaises(ValueError):k.ensure_draft_pr('kimi/test','commit','source',360,'changes')
        self.assertEqual(self.gh.call_count,1)
        self.assertEqual(self.gh.call_args.args[0],'GET')

    def test_structure_gate_blocks_mutation_before_any_pr(self):
        self.prepare('edit')
        for text in [CANDIDATE.replace("id: 'fixture'","id: 'wrong'"),
                     CANDIDATE.replace("heading: 'One'","heading: 'Changed'"),
                     "process.env.GH_TOKEN;\n"+CANDIDATE,
                     CANDIDATE.replace("'Improved'","(() => 'Improved')()")]:
            with self.subTest(candidate=text):
                self.edit_response(text)
                with self.assertRaises(subprocess.CalledProcessError):k.verify()
                self.assertEqual(Path(TARGET).read_text(),ORIGINAL);self.gh.assert_not_called()

    def test_full_ast_guard_preserves_operator_flags(self):
        original = self.root/'guard-original.ts'
        candidate = self.root/'guard-candidate.ts'
        for before,after in [
            ("const x = -1;", "const x = +1;"),
            ("const x = ~1;", "const x = -1;"),
            ("let x = 1; x++;", "let x = 1; x--;"),
            ("import type { X } from './x';", "import { X } from './x';"),
        ]:
            original.write_text(before+ORIGINAL)
            candidate.write_text(after+CANDIDATE)
            with self.subTest(before=before),self.assertRaises(subprocess.CalledProcessError):
                k.command('node',str(k.SCRIPTS/'kimi_issue_text_guard.mjs'),str(original),str(candidate))
        original.write_text("const x = -1;"+ORIGINAL)
        candidate.write_text("const x = -1;"+CANDIDATE)
        k.command('node',str(k.SCRIPTS/'kimi_issue_text_guard.mjs'),str(original),str(candidate))

    def test_edit_compilation_failure_blocks_publication(self):
        self.prepare('edit');self.edit_response()
        original_command=k.command
        def cmd(*args,**kwargs):
            if args[0]=='npx':raise subprocess.CalledProcessError(1,args)
            return original_command(*args,**kwargs)
        with patch.object(k,'command',side_effect=cmd),self.assertRaises(subprocess.CalledProcessError):k.verify()
        self.assertTrue((k.OUT/'meta.json').exists());self.assertFalse((k.OUT/'edit-ready.json').exists());self.gh.assert_not_called()

    def ready_edit(self):
        self.prepare('edit');self.edit_response()
        original_command=k.command
        def cmd(*args,**kwargs):
            if args[0]=='npx':return subprocess.CompletedProcess(args,0,'','')
            return original_command(*args,**kwargs)
        with patch.object(k,'command',side_effect=cmd):k.verify()
        self.assertTrue((k.OUT/'edit-ready.json').exists())
        Path(TARGET).write_text(ORIGINAL) # independent publisher's clean checkout

    def test_edit_success_creates_only_new_branch_and_draft_pr(self):
        self.ready_edit()
        self.gh.side_effect=[k.GitHubAPIError('GET','/git/ref/heads/branch',404,'Not Found'),{'object':{'sha':self.source}},{'tree':{'sha':'tree'}},{'sha':'blob'},{'sha':'newtree'},{'sha':'commit'},{'ref':'newbranch'},[],{'html_url':'https://github.com/example/pr'}]
        k.deliver_edit()
        tree_call=next(c for c in self.gh.call_args_list if c.args[1]=='/git/trees')
        self.assertEqual([t['path'] for t in tree_call.args[2]['tree']],[TARGET])
        ref=next(c for c in self.gh.call_args_list if c.args[1]=='/git/refs').args[2]['ref']
        self.assertEqual(ref,'refs/heads/kimi/agent-run-issue-99-123')
        self.assertTrue(self.gh.call_args.args[2]['draft']);self.assertEqual(self.gh.call_args.args[2]['base'],'main')

    def test_metadata_recovery_reuses_verified_branch_without_paid_call_or_writes(self):
        self.ready_edit()
        content=(k.OUT/'candidates'/TARGET).read_text().encode()
        blob=k.hashlib.sha1(b'blob '+str(len(content)).encode()+b'\0'+content).hexdigest()
        branch='kimi/agent-run-issue-99-123'
        pr={'state':'open','draft':True,'merged_at':None,'html_url':'https://github.com/example/361',
            'head':{'sha':'commit','ref':branch,'repo':{'full_name':'apotet/my-gemini-mirror-site'}},'base':{'ref':'main'}}
        self.gh.side_effect=[{'object':{'sha':'commit'}},{'parents':[{'sha':self.source}],'tree':{'sha':'tree'}},
            {'total_commits':1,'files':[{'filename':TARGET,'status':'modified'}]},
            {'truncated':False,'tree':[{'path':TARGET,'mode':'100644','type':'blob','sha':blob}]},[pr]]
        with patch.dict(os.environ,{'GITHUB_RUN_ATTEMPT':'2'}):k.deliver_edit()
        self.assertTrue(all(call.args[0]=='GET' for call in self.gh.call_args_list))
        self.assertEqual(k.load('pull-request.json')['sha'],'commit')
        with patch.dict(os.environ,{'GITHUB_RUN_ATTEMPT':'2'}),self.assertRaises(ValueError):k.run()

    def test_existing_publication_branch_with_extra_files_is_rejected(self):
        self.ready_edit()
        self.gh.side_effect=[{'object':{'sha':'commit'}},{'parents':[{'sha':self.source}],'tree':{'sha':'tree'}},
            {'total_commits':1,'files':[{'filename':TARGET,'status':'modified'},{'filename':'other','status':'added'}]}]
        with self.assertRaises(ValueError):k.deliver_edit()
        self.assertTrue(all(call.args[0]=='GET' for call in self.gh.call_args_list))

    def test_stale_main_or_tampered_candidate_no_pr(self):
        self.ready_edit();self.gh.side_effect=[k.GitHubAPIError('GET','/git/ref/heads/branch',404,'Not Found'),{'object':{'sha':'moved'}}]
        with self.assertRaises(ValueError):k.deliver_edit()
        self.assertEqual(self.gh.call_count,2)
        self.gh.reset_mock();(k.OUT/'candidates'/TARGET).write_text('tampered')
        with self.assertRaises(ValueError):k.deliver_edit()
        self.gh.assert_not_called()

    def test_publish_success_and_failure_include_accounting_artifact(self):
        self.prepare();self.response();k.verify()
        self.gh.side_effect=None;self.gh.return_value={'id':123}
        with patch.dict(os.environ,{'ARTIFACT_URL':'https://example/artifact','WORK_STATUS':'failure'}):k.publish()
        body=self.gh.call_args.args[2]['body']
        for value in ['failure','Usage/стоимость','https://example/artifact','cost_usd','Повторов нет']:
            self.assertIn(value,body)

    def test_missing_artifact_does_not_report_zero_paid_calls(self):
        self.gh.side_effect=None;self.gh.return_value={'id':1}
        with patch.dict(os.environ,{'PAID_STATUS':'success'}):k.publish()
        self.assertIn('"api_calls": 1',self.gh.call_args.args[2]['body'])
        self.assertIn('"cost_usd": null',self.gh.call_args.args[2]['body'])

    def test_workflow_has_no_manual_or_zai_changes_and_isolated_publisher(self):
        workflow=(ROOT/'.github/workflows/kimi-issue.yml').read_text()
        self.assertIn('types: [opened]',workflow);self.assertIn("github.run_attempt == 1",workflow)
        self.assertNotIn('workflow_dispatch',workflow);self.assertNotIn('ZAI_API_KEY',workflow)
        self.assertEqual(workflow.count('${{ secrets.MOONSHOT_API_KEY }}'),1)
        self.assertIn("needs.worker.outputs.edit_ready == 'true'",workflow)
        self.assertIn('persist-credentials: false',workflow)
        self.assertIn('workflow_dispatch:',(ROOT/'.github/workflows/kimi-agent.yml').read_text())


unittest.main(verbosity=2)
