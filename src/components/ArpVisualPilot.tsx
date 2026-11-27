import { useId, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

const PC = '192.168.1.10';
const GATEWAY = '192.168.1.1';
const NEIGHBOR = '192.168.1.20';
const SERVER_A = '192.168.2.20';
const SERVER_B = '192.168.3.30';
const GATEWAY_MAC = '02:00:00:00:01:01';
const NEIGHBOR_MAC = '02:00:00:00:01:20';
const TITLES = ['Чей MAC нужен?', 'Один запрос на два пакета', 'Диагностика по захвату', 'Две таблицы, два поиска'];
const primary = 'inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-cyan-700 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-cyan-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200 sm:w-auto';
const quiet = 'inline-flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-lg px-2 text-sm font-medium text-slate-600 hover:bg-slate-200/60 focus-visible:outline-2 focus-visible:outline-cyan-600 dark:text-slate-300 dark:hover:bg-slate-800';
const choice = 'min-h-11 cursor-pointer rounded-lg border border-slate-300 px-3 py-2 text-left text-sm font-medium hover:border-cyan-600 hover:bg-cyan-50 focus-visible:outline-2 focus-visible:outline-cyan-600 dark:border-slate-600 dark:hover:bg-cyan-950';
const row = 'rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900';

type Signal = 'preview' | 'request' | 'neighbor' | 'gateway' | 'no-arp' | 'no-echo';
type Action = { label: string; run: () => void };
const diagramZone = 'space-y-1.5 rounded-xl border border-dashed border-[#38506c] bg-[#141f31] p-2';
const diagramTitle = 'text-[11px] font-semibold leading-tight text-[#a4b6cb]';
const diagramText = 'font-mono text-[11px] leading-tight text-[#c3d0e2]';
const routeSegment = {
  idle: 'border-[#2b3d55] bg-[#101a2a] text-[#a4b6cb]',
  local: 'border-amber-500/80 bg-amber-400/10 text-amber-200',
  forwarded: 'border-emerald-500/75 bg-emerald-400/10 text-emerald-200',
  missing: 'border-amber-500/80 bg-amber-400/10 text-amber-200',
};

function DiagramNode({ name, address, mac, status, active }: {
  name: string; address: string; mac?: string; status?: string; active?: boolean;
}) {
  return (
    <div className={`min-w-0 rounded-lg border px-2 py-1.5 ${active ? 'border-indigo-400 bg-[#1d2749]' : 'border-[#405674] bg-[#1c293c]'}`}>
      <p className="text-xs font-bold leading-tight">{name}</p>
      <p className={diagramText}>{address}{mac ? ` · MAC …${mac}` : ''}</p>
      {status && <p className="text-[11px] font-semibold leading-tight text-cyan-200">{status}</p>}
    </div>
  );
}

function DiagramSegment({ tone, children }: { tone: keyof typeof routeSegment; children: ReactNode }) {
  return <p className={`rounded-md border px-1.5 py-0.5 text-center text-[11px] font-semibold leading-tight ${routeSegment[tone]}`}>{children}</p>;
}

/** Compact rendering of the approved prototype: the entire ARP path stays in the labelled local zone. */
function NetworkFigure({ signal, destination = SERVER_A, cache = false, diagnostics = false }: {
  signal: Signal; destination?: string; cache?: boolean; diagnostics?: boolean;
}) {
  const isLocal = signal === 'neighbor' || destination === NEIGHBOR;
  const arrived = signal === 'gateway';
  const hasPacket = arrived || signal === 'neighbor' || signal === 'no-echo';
  const cue = {
    preview: 'Пакет к ' + destination,
    request: 'ARP Request → ' + GATEWAY,
    neighbor: 'Кадр → MAC соседа',
    gateway: 'Кадр → MAC шлюза',
    'no-arp': 'ARP Reply не пришёл',
    'no-echo': 'Echo Reply не вернулся',
  }[signal];
  const route = isLocal ? 'Сосед ' + NEIGHBOR : 'Шлюз ' + GATEWAY + ' → ' + destination;
  return (
    <figure data-arp-network-figure aria-label="Схема ARP: локальная и удалённая сети"
      className="m-0 space-y-1.5 rounded-xl border border-[#344861] bg-[#101a2a] p-2 leading-tight text-slate-100">
      <figcaption className="rounded-lg border border-[#405674] bg-[#1c293c] px-2 py-1.5 text-xs">
        <strong>{cue}</strong><span className="block text-[11px] text-[#c3d0e2]">ПК → коммутатор → {route}</span>
      </figcaption>
      <div className={diagramZone}>
        <p className={diagramTitle}>{cache ? 'Локальная сеть · интерфейс eth0 у ПК' : 'Локальная подсеть 192.168.1.0/24 · область ARP'}</p>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1">
          <DiagramNode name="Твой ПК" address={PC} mac={!cache ? ':01:10' : undefined}
            status={cache && signal === 'request' ? 'Пакет №1 ждёт' : undefined} active />
          <DiagramSegment tone={signal === 'preview' ? 'idle' : 'local'}>
            {signal === 'request' || signal === 'no-arp' ? 'ARP →' : 'L2 →'}
          </DiagramSegment>
          <DiagramNode name="Коммутатор" address="L2 · VLAN" />
        </div>
        <DiagramSegment tone={signal === 'no-arp' ? 'missing' : hasPacket ? 'local' : 'idle'}>
          {signal === 'no-arp' ? '× ARP Reply не получен' : signal === 'request' ? '↓ поиск MAC шлюза' : isLocal ? '← к соседу' : cache || diagnostics ? '↓ к шлюзу' : 'к шлюзу →'}
        </DiagramSegment>
        <div className={cache || diagnostics ? '' : 'grid grid-cols-2 gap-1.5'}>
          {!cache && !diagnostics && <DiagramNode name="Сосед" address={NEIGHBOR} mac=":01:20" active={isLocal && hasPacket} />}
          <DiagramNode name="Шлюз (L3)" address={GATEWAY} mac=":01:01" active={hasPacket && !isLocal} />
        </div>
      </div>
      <div className={diagramZone}>
        <p className={diagramTitle}>{cache ? 'Два удалённых IP за тем же шлюзом' : 'Удалённая сеть · ARP сюда не доходит'}</p>
        <DiagramSegment tone={diagnostics ? (signal === 'no-echo' ? 'missing' : 'idle') : arrived ? 'forwarded' : 'idle'}>
          {diagnostics && signal === 'no-echo' ? 'Echo Reply не виден на ПК · где потеря, неизвестно'
            : signal === 'no-arp' ? 'Кадр с Echo Request не ушёл с ПК'
            : arrived ? 'Шлюз переслал пакет →' : isLocal ? 'Этот кадр не идёт через шлюз' : 'Путь через шлюз →'}
        </DiagramSegment>
        <div className={cache ? 'grid grid-cols-2 gap-1.5' : ''}>
          <DiagramNode name="Сервер A" address={SERVER_A} mac={!cache && !diagnostics ? ':02:20' : undefined}
            active={arrived && destination === SERVER_A} />
          {cache && <DiagramNode name="Сервер B" address={SERVER_B} active={arrived && destination === SERVER_B} />}
        </div>
      </div>
    </figure>
  );
}

function MainAction({ action, actionRef }: { action: Action; actionRef?: React.Ref<HTMLButtonElement> }) {
  return <button ref={actionRef} type="button" data-arp-main-action className={primary} onClick={action.run}>
    {action.label}<ArrowRight size={17} aria-hidden="true" />
  </button>;
}

function Takeaway({ children }: { children: ReactNode }) {
  return <p className="rounded-lg border-l-2 border-amber-500 bg-amber-50 px-2.5 py-2 text-sm dark:bg-amber-950/45"><strong>‼️ Обрати внимание.</strong> {children}</p>;
}

function AddressStrip({ mac, ip }: { mac: string; ip: string }) {
  return (
    <dl className="grid grid-cols-2 gap-2">
      <div className="min-w-0 rounded-lg border border-amber-500/50 bg-amber-400/10 px-2 py-1.5">
        <dt className="text-xs font-semibold leading-tight">Кадр L2 · внешняя наклейка</dt><dd className="break-all font-mono text-xs">MAC: {mac}</dd>
      </div>
      <div className="min-w-0 rounded-lg border border-emerald-500/50 bg-emerald-400/10 px-2 py-1.5">
        <dt className="text-xs font-semibold leading-tight">Пакет L3 · письмо внутри</dt><dd className="break-all font-mono text-xs">IP: {ip}</dd>
      </div>
    </dl>
  );
}

function Envelope({ advance }: { advance: () => void }) {
  const [stage, setStage] = useState(0);
  const actions = [
    { label: 'Отправить соседу', run: () => setStage(1) },
    { label: 'Сравнить: отправить серверу', run: () => setStage(2) },
    { label: 'Далее: кэш соседей', run: advance },
  ];
  return (
    <>
      <NetworkFigure signal={stage === 0 ? 'preview' : stage === 1 ? 'neighbor' : 'gateway'} destination={stage === 2 ? SERVER_A : NEIGHBOR} />
      <div role="status"><AddressStrip mac={stage === 0 ? 'Кого искать?' : stage === 1 ? NEIGHBOR_MAC : GATEWAY_MAC} ip={stage === 2 ? SERVER_A : NEIGHBOR} /></div>
      <MainAction action={actions[stage]} />
      <p role="status">{stage === 0 ? 'Пакет к соседу в своей сети. Какой MAC нужен для кадра?'
        : stage === 1 ? <>Сосед в той же подсети: и IP пакета, и MAC кадра принадлежат <strong>соседу</strong>.</>
          : <>ПК ищет MAC <strong>шлюза</strong>, но IP в пакете остаётся адресом <strong>сервера</strong>.</>}</p>
    </>
  );
}

function Cache({ advance }: { advance: () => void }) {
  const [phase, setPhase] = useState(0);
  const actions = [
    { label: `Отправить пакет №1`, run: () => setPhase(1) },
    { label: 'Получить ARP Reply', run: () => setPhase(2) },
    { label: 'Отправить пакет №2', run: () => setPhase(3) },
    { label: 'Далее: диагностика', run: advance },
  ];
  return (
    <>
      <NetworkFigure signal={phase === 0 ? 'preview' : phase === 1 ? 'request' : 'gateway'} destination={phase === 3 ? SERVER_B : SERVER_A} cache />
      <div role="status" className="space-y-2">
        <div className={row}>
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5">
            <p className="text-xs font-semibold">Таблица соседей · eth0</p>
            <p className="rounded-full bg-cyan-100 px-2 text-xs font-semibold text-cyan-900 dark:bg-cyan-900 dark:text-cyan-100">ARP-запросов: {phase > 0 ? 1 : 0}</p>
          </div>
          <p className={phase >= 2 ? 'break-all font-mono text-xs' : 'text-sm text-slate-600 dark:text-slate-300'}>
            {phase >= 2 ? `${GATEWAY} → ${GATEWAY_MAC}` : phase === 1 ? 'MAC шлюза пока неизвестен' : 'Кэш пуст'}
          </p>
        </div>
      </div>
      <MainAction action={actions[phase]} />
      <div role="status" className="space-y-2">
        <p>{[
          <>Два адреса за одним шлюзом: <strong>{SERVER_A}</strong> и <strong>{SERVER_B}</strong>.</>,
          <>Пакет №1 ждёт на ПК. По сети идёт отдельный <strong>ARP Request</strong>.</>,
          <>ARP Reply заполнил таблицу. Пакет №1 ушёл; теперь отправь пакет к <strong>{SERVER_B}</strong>.</>,
          <>Пакет №2 ушёл к тому же MAC на eth0. <strong>Новый ARP Request не нужен.</strong></>,
        ][phase]}</p>
        {phase === 3 && <Takeaway>Ответ ARP сообщает пару IP и MAC, но не подтверждает подлинность отвечающего.</Takeaway>}
      </div>
    </>
  );
}

const OPTIONS = [
  ['Проверить веб-сервер', 'Проверить VLAN, L2-путь и шлюз', 'Только очистить ARP-кэш'],
  ['Заменить патч-корд', 'Проверить шлюз, маршрут, фильтры и обратный путь', 'Отправить ARP за IP сервера'],
] as const;

function Diagnostics({ advance }: { advance: () => void }) {
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState<'ready' | 'choose' | 'done'>('ready');
  const [wrong, setWrong] = useState(-1);
  const next = useRef<HTMLButtonElement>(null);
  const choices = useRef<HTMLHeadingElement>(null);
  const scenario = run === 0 ? 'A' : 'B';

  function choose(index: number) {
    if (index !== 1) { setWrong(index); return; }
    setPhase('done');
    setWrong(-1);
    requestAnimationFrame(() => next.current?.focus());
  }

  return (
    <>
      <NetworkFigure signal={phase === 'ready' ? 'preview' : run === 0 ? 'no-arp' : 'no-echo'} diagnostics />
      <div role="status" className="space-y-2">
        <p className="font-semibold">Прогон {scenario} · захват на ПК</p>
        {phase === 'ready' ? <p>Кэш пуст. Запусти ping к {SERVER_A}.</p> : (
          <ul className={row + ' space-y-1 text-sm'}>
            <li>✓ Линк поднят, ARP Request ушёл</li>
            {run === 0
              ? <li><strong className="text-amber-800 dark:text-amber-300">✕ ARP Reply нет</strong> → Echo Request не отправлен</li>
              : <><li>✓ ARP Reply есть → Echo Request ушёл с ПК на MAC шлюза</li><li><strong className="text-amber-800 dark:text-amber-300">✕ Echo Reply не виден</strong></li></>}
          </ul>
        )}
        {phase === 'done' && <Takeaway>{run === 0
          ? 'Поднятый линк не гарантирует ARP-ответ. В этом прогоне порт ПК в VLAN 99, а шлюз в VLAN 10.'
          : 'Ответ шлюза на ARP не доказывает доступность сервера. Где потерялся пакет, этот захват не показывает.'}</Takeaway>}
      </div>
      {phase === 'ready' && <MainAction actionRef={next} action={{ label: 'Запустить прогон ' + scenario, run: () => {
        setPhase('choose');
        requestAnimationFrame(() => choices.current?.focus({ preventScroll: true }));
      } }} />}
      {phase === 'choose' && (
        <div className="space-y-2">
          <h5 ref={choices} tabIndex={-1} className="font-semibold">Что проверишь первым?</h5>
          <div className="grid gap-1.5">{OPTIONS[run].map((label, i) => <button type="button" key={label} className={choice} onClick={() => choose(i)}>{label}</button>)}</div>
          <div role="status">{wrong >= 0 && <p>{run === 0 ? 'Сначала выясни, почему ПК не получил MAC шлюза.' : 'Не назначай причину до проверки: захват показывает только события на ПК.'}</p>}</div>
        </div>
      )}
      {phase === 'done' && <MainAction actionRef={next} action={run === 0
        ? { label: 'Перейти к прогону B', run: () => { setRun(1); setPhase('ready'); requestAnimationFrame(() => next.current?.focus()); } }
        : { label: 'Далее: две таблицы', run: advance }} />}
    </>
  );
}

const TABLE_ROWS = [
  { ip: GATEWAY, mac: GATEWAY_MAC, port: 'Порт 1 · шлюз' },
  { ip: NEIGHBOR, mac: NEIGHBOR_MAC, port: 'Порт 2 · сосед' },
] as const;

function CompareTables({ restart }: { restart: () => void }) {
  const [stage, setStage] = useState(0);
  const [answer, setAnswer] = useState('');
  const check = useRef<HTMLHeadingElement>(null);
  const reset = useRef<HTMLButtonElement>(null);
  const selected = stage === 0 ? 0 : 1;
  const entry = TABLE_ROWS[selected];
  const showQuiz = stage === 2;
  return (
    <>
      <figure data-arp-network-figure aria-label="Как связаны таблицы ПК и коммутатора"
        className="m-0 grid grid-cols-2 gap-2">
        <div className={row}>
          <h5 className="text-xs font-semibold">ПК · таблица соседей</h5>
          <p className="text-xs text-slate-600 dark:text-slate-300">IPv4 → MAC</p>
          <table className="mt-1 w-full text-left text-xs" aria-label="Таблица соседей ПК"><tbody>
            {TABLE_ROWS.map(({ ip, mac }, i) => <tr key={ip} className={i === selected ? 'bg-cyan-100 font-semibold dark:bg-cyan-950' : ''}>
              <td className="break-all px-1 py-1 font-mono">{ip}<br />{mac}</td>
            </tr>)}
          </tbody></table>
        </div>
        <div className={row}>
          <h5 className="text-xs font-semibold">Коммутатор · MAC</h5>
          <p className="text-xs text-slate-600 dark:text-slate-300">MAC + VLAN → порт</p>
          <table className="mt-1 w-full text-left text-xs" aria-label="MAC-таблица коммутатора"><tbody>
            {TABLE_ROWS.map(({ ip, mac, port }, i) => <tr key={ip} className={i === selected ? 'bg-cyan-100 font-semibold dark:bg-cyan-950' : ''}>
              <td className="break-all px-1 py-1"><code>{mac}</code><br />VLAN 10 → {port}</td>
            </tr>)}
          </tbody></table>
        </div>
      </figure>
      <p role="status">Для {entry.ip} ПК выбирает MAC, а коммутатор по этому MAC и VLAN 10 находит <strong>{entry.port}</strong>.</p>
      {!showQuiz && <MainAction action={stage === 0 ? { label: 'Проследить кадр к соседу', run: () => setStage(1) }
        : { label: 'Проверить себя', run: () => { setStage(2); requestAnimationFrame(() => check.current?.focus()); } }} />}
      {showQuiz && (
        <div className="space-y-2">
          <h5 ref={check} tabIndex={-1} className="font-semibold">Какой IP ПК ищет через ARP при ping к {SERVER_A}?</h5>
          {answer !== GATEWAY && <div className="flex flex-wrap gap-1.5">{[SERVER_A, GATEWAY, NEIGHBOR].map(ip => <button type="button" className={choice} key={ip} onClick={() => {
            setAnswer(ip);
            if (ip === GATEWAY) requestAnimationFrame(() => reset.current?.focus());
          }}>{ip}</button>)}</div>}
          <div role="status">{answer && (answer === GATEWAY ? <Takeaway>ПК ищет MAC шлюза {GATEWAY}. IP назначения пакета остаётся {SERVER_A}.</Takeaway>
            : <p>Не этот IP. Найди следующий узел в локальной подсети ПК.</p>)}</div>
          {answer === GATEWAY && <MainAction actionRef={reset} action={{ label: 'Начать заново и сбросить ответы', run: restart }} />}
        </div>
      )}
    </>
  );
}

export function ArpVisualPilot() {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [open, setOpen] = useState(false);
  const [scene, setScene] = useState(0);
  const [restartKey, setRestartKey] = useState(0);

  function focusAfterRender(target: 'heading' | 'trigger') {
    requestAnimationFrame(() => {
      const element = target === 'heading' ? heading.current : trigger.current;
      const scrollTarget = target === 'heading' ? panel.current : trigger.current;
      scrollTarget?.scrollIntoView({ block: 'start', behavior: 'instant' });
      element?.focus({ preventScroll: true });
    });
  }
  function goTo(step: number) { setScene(step); focusAfterRender('heading'); }
  function restart() { setRestartKey(key => key + 1); goTo(0); }

  return (
    <section aria-label="Визуальный разбор ARP" className="rounded-2xl border border-cyan-500/35 bg-slate-50 px-3 py-3 text-sm leading-relaxed text-slate-800 dark:bg-[#091524] dark:text-slate-100 sm:px-4">
      {!open && (
        <div className="space-y-2">
          <h3 className="text-base font-bold">Визуальный разбор ARP</h3>
          <p>Четыре короткие сцены: от поиска MAC до проверки связи.</p>
          <button ref={trigger} type="button" className={primary + ' scroll-mt-24'} aria-expanded={false} aria-controls={id}
            onClick={() => { setOpen(true); focusAfterRender('heading'); }}>Открыть визуальный разбор</button>
        </div>
      )}
      <div ref={panel} id={id} hidden={!open} className="scroll-mt-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          {scene > 0 && <button type="button" className={quiet} onClick={() => goTo(scene - 1)} aria-label="Назад к сцене"><ArrowLeft size={17} aria-hidden="true" /><span className="hidden sm:inline">Назад</span></button>}
          <div className="flex items-center gap-2" role="img" aria-label={`Шаг ${scene + 1} из 4`}>
            <span className="text-xs font-semibold">Шаг {scene + 1} / 4</span>
            <span className="flex gap-1" aria-hidden="true">{TITLES.map((title, index) => <span className={`h-1.5 w-4 rounded-full ${index <= scene ? 'bg-cyan-600 dark:bg-cyan-300' : 'bg-slate-300 dark:bg-slate-700'}`} key={title} />)}</span>
          </div>
          <button type="button" className={quiet} aria-label="Закрыть разбор" onClick={() => { setOpen(false); focusAfterRender('trigger'); }}><X size={19} aria-hidden="true" /></button>
        </div>
        <h4 ref={heading} tabIndex={-1} className="text-lg font-bold leading-snug focus-visible:outline-2 focus-visible:outline-cyan-600">{TITLES[scene]}</h4>
        <div key={restartKey}>
          <section aria-label={TITLES[0]} hidden={scene !== 0} className="space-y-2.5"><Envelope advance={() => goTo(1)} /></section>
          <section aria-label={TITLES[1]} hidden={scene !== 1} className="space-y-2.5"><Cache advance={() => goTo(2)} /></section>
          <section aria-label={TITLES[2]} hidden={scene !== 2} className="space-y-2.5"><Diagnostics advance={() => goTo(3)} /></section>
          <section aria-label={TITLES[3]} hidden={scene !== 3} className="space-y-2.5"><CompareTables restart={restart} /></section>
        </div>
      </div>
    </section>
  );
}
