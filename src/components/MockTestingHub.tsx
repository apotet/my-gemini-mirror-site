import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Target, RotateCcw, Shuffle, Layers, ChevronDown, Play, ArrowLeft, Camera, Check } from 'lucide-react';
import { ALL_QUESTIONS, QUIZ_MODES, resolveImageUrl } from '../data/questionsData';
import { filterLearningLevel, LEARNING_LEVEL_DESCRIPTIONS } from '../data/learningLevelExam';
import { LEARNING_LEVELS, type LearningLevel } from '../types/learningLevel';
import type { Question, QuizModeId } from '../types/quiz';
import { getMistakeQuestions } from '../utils/userProgress';
import { selectFamilyQuestions } from '../data/beginnerExam';
import { KnowledgeRadar } from './KnowledgeRadar';
import { ZoomableImage } from './ZoomableImage';
import { LivingOsiStack as HomeOsiStack } from './HomeOsiStack';

type TrainingMode = 'learn' | 'check' | 'mistakes' | 'mixed' | 'osi';
const modes: {id:TrainingMode; title:string; subtitle:string; Icon:typeof BookOpen}[] = [
  {id:'learn',title:'Обучение',subtitle:'Разбор после ответа',Icon:BookOpen},
  {id:'check',title:'Проверка',subtitle:'Результаты в конце',Icon:Target},
  {id:'mistakes',title:'Работа над ошибками',subtitle:'Повторение сложного',Icon:RotateCcw},
  {id:'mixed',title:'Все темы',subtitle:'Случайная подборка',Icon:Shuffle},
  {id:'osi',title:'По уровням OSI',subtitle:'Выбери L1–L7',Icon:Layers},
];
const layers = [
  {id:1,title:'Физический',groups:['l1-l2','visual-l1']},
  {id:2,title:'Канальный',groups:['l1-l2']},
  {id:3,title:'Сетевой',groups:['l3']},
  {id:4,title:'Транспортный',groups:['l4']},
  {id:5,title:'Сеансовый',groups:['l5-l7']},
  {id:6,title:'Представления',groups:['l5-l7']},
  {id:7,title:'Прикладной',groups:['l5-l7']},
] as const;
// The current bank groups L1/L2 and L5/L6/L7 together. Do not pretend these
// grouped questions are uniquely assigned to an individual OSI layer.
const groupedLayers: Record<number,number[]> = {1:[1,2],2:[1,2],5:[5,6,7],6:[5,6,7],7:[5,6,7]};
const settingsKey = 'netops_mock_testing_settings';
const mockProgressKey = 'netops_mock_testing_progress_v1';
const mockSessionKey = 'netops_mock_testing_active_v1';
type SavedSession = {ids:string[];index:number;answers:Record<string,number[]>;submitted:boolean};
function readSession():SavedSession|null {
  try {
    const v=JSON.parse(localStorage.getItem(mockSessionKey)||'null');
    if(!v||!Array.isArray(v.ids)||!v.ids.length||!v.ids.every((id:unknown)=>typeof id==='string')||!Number.isInteger(v.index)||v.index<0||v.index>=v.ids.length||!v.answers||typeof v.answers!=='object'||typeof v.submitted!=='boolean')return null;
    const known=new Set(ALL_QUESTIONS.map(q=>q.id));
    if(v.ids.some((id:string)=>!known.has(id)))return null;
    if(Object.values(v.answers).some(a=>!Array.isArray(a)||a.some(n=>!Number.isInteger(n))))return null;
    return v;
  }catch{return null;}
}
type MockStats = {rounds:number;answered:number;correct:number;best:number;streak:number};
const emptyMockStats:MockStats = {rounds:0,answered:0,correct:0,best:0,streak:0};
function readMockStats():MockStats {try {const v=JSON.parse(localStorage.getItem(mockProgressKey)||'null');if(v&&['rounds','answered','correct','best','streak'].every(k=>Number.isSafeInteger(v[k])&&v[k]>=0))return v;}catch{}return {...emptyMockStats};}
function initialSettings(): {level:LearningLevel;count:number;mode:TrainingMode;layers:number[];topic:QuizModeId} {
  const defaults = {level:1 as LearningLevel,count:10,mode:'learn' as TrainingMode,layers:[2,3],topic:'mixed' as QuizModeId};
  try {
    const saved = JSON.parse(localStorage.getItem(settingsKey) || '{}');
    return {...defaults,level:([1,2,3,4,5].includes(saved.level)?saved.level:1),count:([5,10,20,30].includes(saved.count)?saved.count:10),mode:modes.some(m=>m.id===saved.mode)?saved.mode:'learn',layers:Array.isArray(saved.layers)?saved.layers.filter((n:unknown)=>typeof n==='number'&&n>=1&&n<=7):[2,3],topic:QUIZ_MODES.some(m=>m.id===saved.topic)?saved.topic:'mixed'};
  } catch {return defaults;}
}
export function MockTestingHub() {
  const [settings,setSettings] = useState(initialSettings);
  const [savedSession] = useState(readSession);
  const [advanced,setAdvanced] = useState(false);
  const [osiPhotosOnly,setOsiPhotosOnly] = useState(false);
  const [questions,setQuestions] = useState<Question[]>(()=>savedSession?savedSession.ids.map(id=>ALL_QUESTIONS.find(q=>q.id===id)!).filter(Boolean):[]);
  const [index,setIndex] = useState(savedSession?.index??0);
  const [answers,setAnswers] = useState<Record<string,number[]>>(savedSession?.answers??{});
  const [submitted,setSubmitted] = useState(savedSession?.submitted??false);
  const [finished,setFinished] = useState(false);
  const [notice,setNotice] = useState('');
  const [sessionExists,setSessionExists] = useState(Boolean(savedSession));
  const [showPreview,setShowPreview] = useState(false);
  const [showReview,setShowReview] = useState(false);
  const [mockStats,setMockStats] = useState(readMockStats);
  useEffect(()=>{
    try {
      if(sessionExists&&!finished&&questions.length) localStorage.setItem(mockSessionKey,JSON.stringify({ids:questions.map(q=>q.id),index,answers,submitted}));
      else localStorage.removeItem(mockSessionKey);
    }catch{}
  },[sessionExists,finished,questions,index,answers,submitted]);
  const mistakesCount = getMistakeQuestions().length;
  const update = (patch:Partial<typeof settings>) => {
    setSettings(prev=>{const next={...prev,...patch};try{localStorage.setItem(settingsKey,JSON.stringify(next));}catch{}return next;});
    setNotice('');
  };
  const selectedGroups = useMemo(()=>new Set<string>(layers.filter(l=>settings.layers.includes(l.id)).flatMap(l=>l.groups)),[settings.layers]);
  const pool = useMemo(()=>{
    const base = settings.mode==='mistakes' ? getMistakeQuestions() : ALL_QUESTIONS;
    if(settings.mode==='mistakes') return base;
    if(settings.mode==='osi') return filterLearningLevel(base.filter(q=>selectedGroups.has(q.group) && (!osiPhotosOnly || Boolean(q.image))),settings.level);
    return filterLearningLevel(base.filter(q=>settings.topic==='mixed'||q.group===settings.topic),settings.level);
  },[settings,selectedGroups,osiPhotosOnly]);
  const start = () => {
    if(!pool.length){setNotice('Для выбранных настроек пока нет вопросов. Измени уровень или тему.');return;}
    // The registry-based selection preserves question-family uniqueness.
    const requestedCount = settings.mode==='mistakes' ? 5 : settings.count;
    const photoOnly = settings.mode==='osi' && osiPhotosOnly;
    const photoPool = pool.filter(q=>Boolean(q.image));
    const textPool = pool.filter(q=>!q.image);
    // Mixed sessions cap photo questions at 20%; explicit photo-only sessions remain unrestricted.
    const photoLimit = photoOnly ? requestedCount : Math.floor(requestedCount/5);
    const textChosen = selectFamilyQuestions(textPool,requestedCount-photoLimit,Math.random);
    const photoChosen = selectFamilyQuestions(photoPool,Math.min(photoLimit,requestedCount-textChosen.length),Math.random);
    const extraText = selectFamilyQuestions(textPool.filter(q=>!textChosen.some(s=>s.id===q.id)),requestedCount-textChosen.length-photoChosen.length,Math.random);
    const chosen = [...textChosen,...extraText,...photoChosen];
    // Spread photo questions through the session instead of allowing a run of photo cards.
    if(photoChosen.length && textChosen.length+extraText.length){
      const textQuestions = [...textChosen,...extraText];
      chosen.splice(0,chosen.length);
      const interval = Math.ceil(requestedCount/(photoChosen.length+1));
      for(let i=0;i<requestedCount;i++){
        if((i+1)%interval===0 && photoChosen.length) chosen.push(photoChosen.shift()!);
        else if(textQuestions.length) chosen.push(textQuestions.shift()!);
        else if(photoChosen.length) chosen.push(photoChosen.shift()!);
      }
    }
    if(!chosen.length){setNotice('Нет доступных вопросов.');return;}
    setQuestions(chosen);setIndex(0);setAnswers({});setSubmitted(false);setFinished(false);setSessionExists(true);setShowPreview(false);setShowReview(false);setNotice('');
  };
  const current=questions[index];
  const picked=current?answers[current.id]||[]:[];
  const correct=current?picked.length===current.correct.length&&picked.every(a=>current.correct.includes(a)):false;
  const score=questions.filter(q=>{const a=answers[q.id]||[];return a.length===q.correct.length&&a.every(n=>q.correct.includes(n));}).length;
  const missed=questions.filter(q=>{const a=answers[q.id]||[];return a.length!==q.correct.length||!a.every(n=>q.correct.includes(n));});
  const restartWith=(items:Question[])=>{setQuestions(items);setIndex(0);setAnswers({});setSubmitted(false);setFinished(false);setSessionExists(true);setShowPreview(false);setShowReview(false);};
  const select=(n:number)=>{
    if(submitted)return;
    setAnswers(prev=>({...prev,[current.id]:current.correct.length>1?(picked.includes(n)?picked.filter(v=>v!==n):[...picked,n]):[n]}));
  };
  const next=()=>{
    if(index===questions.length-1){setFinished(true);setSessionExists(false);setMockStats(prev=>{const result={rounds:prev.rounds+1,answered:prev.answered+questions.length,correct:prev.correct+score,best:Math.max(prev.best,Math.round(score/questions.length*100)),streak:score===questions.length?prev.streak+1:0};try{localStorage.setItem(mockProgressKey,JSON.stringify(result));}catch{}return result;});}
    else {setIndex(v=>v+1);setSubmitted(false);}
  };
  return <div className="max-w-4xl mx-auto space-y-5 pb-16">
    <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-50 via-white to-indigo-50 p-5 dark:from-[#10263a] dark:via-[#0c1728] dark:to-[#161a37] dark:border-cyan-400/20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><div className="text-[11px] uppercase tracking-[.22em] font-bold text-cyan-600 dark:text-cyan-400">Экспериментальный раздел</div><h1 className="text-2xl sm:text-3xl font-black mt-1">Макет тестирования</h1><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Новый интерфейс для сравнения с действующим тестированием</p></div>
        <span className="rounded-full border border-amber-400/40 bg-amber-100/60 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">Макет · не production</span>
      </div>
    </div>
    {questions.length>0 && (sessionExists||finished) ? <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-700 dark:bg-slate-900/60 space-y-4">
      <button type="button" onClick={()=>setShowPreview(true)} className="flex items-center gap-2 text-sm text-cyan-600 dark:text-cyan-400"><ArrowLeft size={16}/> К настройкам</button>
      {showPreview ? <div className="space-y-3"><p>Текущая тренировка сохранена. Можно вернуться позже и продолжить с того же вопроса.</p><button className="rounded-xl bg-cyan-500 px-4 py-3 font-bold text-slate-950" onClick={()=>setShowPreview(false)}>Вернуться к вопросам</button><button className="ml-3 rounded-xl border px-4 py-3" onClick={()=>{setQuestions([]);setSessionExists(false);setFinished(false);setShowPreview(false);}}>Завершить и настроить заново</button></div> : finished ? <div className="space-y-5"><div className="rounded-2xl border border-cyan-300/40 bg-gradient-to-br from-cyan-50 via-white to-indigo-50 p-5 dark:from-cyan-950/40 dark:via-slate-900 dark:to-indigo-950/30 dark:border-cyan-500/30"><div className="text-xs font-bold uppercase tracking-[.2em] text-cyan-700 dark:text-cyan-300">Финиш · тренировочный отчёт</div><h2 className="mt-2 text-2xl sm:text-3xl font-black">{score===questions.length?'Чистая работа!':score>=questions.length*.7?'Хороший заход!':'Есть куда прокачаться'}</h2><div className="mt-4 flex flex-wrap items-end gap-4"><div className="text-5xl font-black tabular-nums text-slate-900 dark:text-white">{Math.round(score/questions.length*100)}<span className="text-2xl text-cyan-600">%</span></div><div className="pb-1 text-sm text-slate-600 dark:text-slate-300"><strong>{score}</strong> точных ответов из {questions.length}<div>{missed.length? `${missed.length} вопросов для разбора`:'Без промахов — красавчик!'}</div></div></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"><div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500" style={{width:`${score/questions.length*100}%`}}/></div></div><div className="grid gap-2 sm:grid-cols-2"><button type="button" className="min-h-12 rounded-xl bg-cyan-500 px-4 py-3 font-bold text-slate-950 hover:bg-cyan-400" onClick={start}><span className="inline-flex items-center gap-2"><Shuffle size={18}/> Ещё раунд · новые вопросы</span></button>{missed.length>0&&<button type="button" className="min-h-12 rounded-xl border border-violet-400/50 bg-violet-50 px-4 py-3 font-bold text-violet-900 dark:bg-violet-500/10 dark:text-violet-200" onClick={()=>restartWith(missed)}><span className="inline-flex items-center gap-2"><RotateCcw size={18}/> Реванш · {missed.length} вопросов</span></button>}<button type="button" className="min-h-12 rounded-xl border border-slate-300 px-4 py-3 font-semibold dark:border-slate-600" onClick={()=>setShowReview(v=>!v)}>{showReview?'Скрыть разбор':'Разобрать ответы'}</button><button type="button" className="min-h-12 rounded-xl border border-slate-300 px-4 py-3 font-semibold dark:border-slate-600" onClick={()=>{setQuestions([]);setFinished(false);setShowReview(false);}}>Сменить режим</button></div>{showReview&&<div className="space-y-2"><h3 className="font-bold">Разбор попытки</h3>{questions.map((q,i)=>{const a=answers[q.id]||[];const ok=a.length===q.correct.length&&a.every(n=>q.correct.includes(n));return <details key={q.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60"><summary className="cursor-pointer font-semibold text-sm">{ok?'✓':'◇'} Вопрос {i+1} · {ok?'Точно':'На повторение'}</summary><div className="mt-3 space-y-2 text-sm"><p className="font-medium">{q.text}</p><p>Твой ответ: {a.length?a.map(n=>q.answers[n]).join('; '):'Нет ответа'}</p><p className="font-semibold">Правильно: {q.correct.map(n=>q.answers[n]).join('; ')}</p><p className="whitespace-pre-line text-slate-600 dark:text-slate-300">{q.explanation}</p></div></details>;})}</div>}<p className="text-xs text-slate-500 dark:text-slate-400">Это пробный результат макета. Основная статистика и достижения не изменяются.</p></div> : current && <div className="space-y-4"><div className="flex justify-between text-xs text-slate-500"><span>Вопрос {index+1} из {questions.length}</span><span>{settings.mode==='check'?'Проверка':'Тренировка'}</span></div><div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"><div className="h-full bg-cyan-500" style={{width:`${((index+1)/questions.length)*100}%`}}/></div><h2 className="text-lg font-semibold whitespace-pre-line">{current.text}</h2>{current.image&&<ZoomableImage src={resolveImageUrl(current.image)} alt={current.imageAlt||'Иллюстрация к вопросу'} caption={current.imageAlt} />}<div className="grid gap-2">{current.answers.map((a,n)=><button key={n} type="button" disabled={submitted} onClick={()=>select(n)} className={`min-h-12 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${picked.includes(n)?'border-cyan-500 bg-cyan-100 dark:bg-cyan-900/30':'border-slate-200 dark:border-slate-700'}`}>{a}</button>)}</div>{submitted&&settings.mode!=='check'&&<div role="status" aria-live="polite" className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 sm:p-5 text-sm shadow-sm ${correct?'border-cyan-300/70 from-cyan-50 via-white to-sky-50 dark:border-cyan-500/40 dark:from-cyan-950/50 dark:via-slate-900 dark:to-sky-950/30':'border-violet-300/70 from-violet-50 via-white to-indigo-50 dark:border-violet-500/40 dark:from-violet-950/40 dark:via-slate-900 dark:to-indigo-950/30'}`}><div className={`absolute inset-y-0 left-0 w-1 ${correct?'bg-cyan-500':'bg-violet-500'}`}/><div className="flex items-start gap-3"><div aria-hidden="true" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${correct?'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300':'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300'}`}>{correct?<Check size={21} strokeWidth={2.5}/>:<BookOpen size={21} strokeWidth={2}/>}</div><div className="min-w-0 flex-1"><div className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-50">{correct?'Точно в цель!':'Разберём момент'}</div><div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{correct?'Отлично, закрепим логику ответа.':'Здесь есть нюанс — смотри объяснение ниже.'}</div><div className="mt-3 whitespace-pre-line leading-relaxed text-slate-700 dark:text-slate-200">{current.explanation}</div></div></div></div>}<button type="button" disabled={!submitted&&picked.length===0} onClick={()=>submitted?next():setSubmitted(true)} className="w-full min-h-12 rounded-xl bg-cyan-500 disabled:opacity-40 font-bold text-slate-950">{submitted?(index===questions.length-1?'Завершить':'Следующий вопрос'):'Ответить'}</button></div>}
    </section> : <>
      <div className="[&>div>button]:hidden [&>div>div:last-child]:hidden"><KnowledgeRadar mistakesCount={mistakesCount} totalQuestionsCount={ALL_QUESTIONS.length} hasActiveSession={false} onStartNewExam={start} onStartExam={()=>start()} onReviewMistakes={()=>update({mode:'mistakes'})} onOpenVisualL1={()=>update({mode:'check',topic:'visual-l1'})}/></div>
      <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-700 dark:bg-slate-900/60 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3"><h2 className="font-bold text-lg">Как будем тренироваться?</h2><div className="flex flex-wrap items-center gap-2">{settings.mode!=='mistakes'&&<><label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300"><span>Уровень</span><select aria-label="Учебный уровень" className="rounded-lg border border-cyan-500/40 bg-cyan-50 px-2 py-1.5 font-semibold text-slate-900 dark:bg-slate-800 dark:text-white" value={settings.level} onChange={e=>update({level:Number(e.target.value) as LearningLevel})}>{([1,2,3,4,5] as const).map(l=><option key={l} value={l}>{LEARNING_LEVELS[l].ru}</option>)}</select></label><label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300"><span>Вопросов</span><select aria-label="Количество вопросов" className="rounded-lg border border-cyan-500/40 bg-cyan-50 px-2 py-1.5 font-semibold text-slate-900 dark:bg-slate-800 dark:text-white" value={settings.count} onChange={e=>update({count:Number(e.target.value)})}>{[5,10,20,30].map(n=><option key={n} value={n}>{n}</option>)}</select></label></>}</div></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{modes.map(({id,title,subtitle,Icon})=><button key={id} type="button" aria-pressed={settings.mode===id} onClick={()=>update({mode:id})} className={`group relative flex min-h-16 items-center gap-2.5 overflow-hidden rounded-xl border px-3 py-2.5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-cyan-500 ${settings.mode===id?'border-cyan-400 bg-gradient-to-br from-cyan-50 to-blue-100/80 shadow-cyan-500/10 dark:from-cyan-950/70 dark:to-blue-950/40':'border-slate-200 bg-slate-50/70 dark:border-slate-700 dark:bg-slate-800/40 hover:border-cyan-500/50'}`}><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${settings.mode===id?'bg-cyan-500 text-white':'bg-slate-200/80 text-slate-600 dark:bg-slate-700 dark:text-slate-200'}`}><Icon className="h-4 w-4"/></span><span className="min-w-0"><span className="block text-xs font-bold leading-tight">{title}</span><span className="mt-0.5 block text-[10px] leading-tight text-slate-500 dark:text-slate-400">{id==='mistakes' ? `По 5 за сеанс · на закреплении ${mistakesCount}` : subtitle}</span></span>{settings.mode===id&&<Check className="absolute right-1.5 top-1.5 h-3.5 w-3.5 text-cyan-600 dark:text-cyan-300"/>}</button>)}</div>
        {settings.mode==='osi'&&<div className="space-y-2"><p className="text-xs text-amber-700 dark:text-amber-300">Банк пока объединяет L1–L2 и L5–L7: выбор любого уровня из этих групп включает всю соответствующую группу. Точная разметка отдельных уровней — следующий этап.</p><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-50/70 px-3 py-2 text-xs font-semibold text-cyan-800 dark:bg-cyan-950/30 dark:text-cyan-200"><input type="checkbox" checked={osiPhotosOnly} onChange={e=>setOsiPhotosOnly(e.target.checked)} className="accent-cyan-600"/><Camera size={15}/> Только вопросы по фото <span className="font-mono opacity-70">({filterLearningLevel(ALL_QUESTIONS.filter(q=>selectedGroups.has(q.group)&&Boolean(q.image)),settings.level).length})</span></label><div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{layers.map(l=><button key={l.id} type="button" aria-pressed={settings.layers.includes(l.id)} onClick={()=>update({layers:settings.layers.includes(l.id)?settings.layers.filter(n=>n!==l.id):[...settings.layers,l.id]})} className={`rounded-xl border p-3 text-left text-sm ${settings.layers.includes(l.id)?'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40':'border-slate-200 dark:border-slate-700'}`}><span className="font-bold">L{l.id}</span><span className="block text-xs text-slate-500">{l.title}</span>{groupedLayers[l.id]&&<span className="text-[10px] text-amber-600 dark:text-amber-400">Группа L{groupedLayers[l.id].join('–L')}</span>}</button>)}</div></div>}
        <button type="button" aria-expanded={advanced} onClick={()=>setAdvanced(v=>!v)} className="w-full flex items-center justify-between rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-3 text-sm font-semibold">Дополнительные настройки <ChevronDown className={`h-4 w-4 transition-transform ${advanced?'rotate-180':''}`}/></button>
        {advanced&&<div className="grid sm:grid-cols-2 gap-3">{settings.mode!=='osi'&&<label className="space-y-1 text-sm block sm:col-span-2"><span>Тема</span><select className="w-full min-h-11 rounded-xl border bg-white text-slate-900 dark:bg-slate-800 dark:text-white dark:border-slate-600 px-3" value={settings.topic} onChange={e=>update({topic:e.target.value as QuizModeId})}>{QUIZ_MODES.map(m=><option key={m.id} value={m.id}>{m.title}</option>)}</select></label>}<p className="sm:col-span-2 text-xs text-slate-500">{LEARNING_LEVEL_DESCRIPTIONS[settings.level]}</p></div>}
        <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-500">{settings.mode==='mistakes' ? <>На закреплении: <strong>{mistakesCount}</strong> · по 5 за сеанс</> : <>Доступно: <strong>{pool.length}</strong> вопросов</>}</p><button type="button" onClick={start} disabled={!pool.length} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 min-h-12 font-bold text-slate-950 disabled:opacity-40"><Play size={17}/> Проверить знания</button></div>
        {notice&&<p role="status" className="text-sm text-amber-600">{notice}</p>}
      </section>
      
      <HomeOsiStack />
    </>}
    <p className="text-xs text-slate-500">Макет изолирован: ответы и результаты не меняют историю и прогресс действующего тестирования. Незавершённая тренировка сохраняется в этом браузере.</p>
  </div>;
}
