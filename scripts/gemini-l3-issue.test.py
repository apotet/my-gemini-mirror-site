import os,json,tempfile,importlib.util,urllib.error
from pathlib import Path
from unittest.mock import patch
script=Path(__file__).resolve().with_name('gemini-l3-issue.py')
with tempfile.TemporaryDirectory() as d:
 os.chdir(d)
 Path('event.json').write_text(json.dumps({'issue':{'number':1}}))
 os.environ.update(GITHUB_REPOSITORY='apotet/my-gemini-mirror-site',GITHUB_EVENT_PATH=d+'/event.json',GITHUB_RUN_ID='1',GEMINI_API_KEY='fake-test-key')
 spec=importlib.util.spec_from_file_location('audit',script); m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
 m.save('task.json',{'model':'gemini-4-hydrogen','sha':'a'*40,'ids':['gen-port-13']})
 m.save('source.json',{'questions':[]})
 for code in [429,503]:
  with patch.object(m.urllib.request.OpenerDirector,'open',side_effect=urllib.error.HTTPError('test',code,'test',{},None)) as call:
   try: m.run()
   except urllib.error.HTTPError: pass
   assert call.call_count==1
   a=json.loads((m.OUT/'api-result.json').read_text()); assert a['status']=='INCONCLUSIVE' and a['httpStatus']==code
 with patch.object(m.urllib.request.OpenerDirector,'open',side_effect=TimeoutError('timeout')) as call:
  try: m.run()
  except TimeoutError: pass
  assert call.call_count==1
  assert json.loads((m.OUT/'api-result.json').read_text())['status']=='INCONCLUSIVE'
 print('PASS: 429, 503, timeout each exactly one attempt; INCONCLUSIVE persisted')
