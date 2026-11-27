import { useId, useRef, useState } from 'react';

const PC = '192.168.1.10';
const GATEWAY = '192.168.1.1';
const NEIGHBOR = '192.168.1.20';
const SERVER_A = '192.168.2.20';
const SERVER_B = '192.168.3.30';
const GATEWAY_MAC = '02:00:00:00:01:01';
const NEIGHBOR_MAC = '02:00:00:00:01:20';
const SCENES = ['Выбор MAC', 'Кэш соседей', 'Диагностика', 'Две таблицы'] as const;
const TITLES = [
  'Чей MAC нужен для отправки?',
  'Два пакета через один шлюз',
  'Два прогона с пустым кэшем',
  'Таблица соседей ПК и MAC-таблица коммутатора',
] as const;
const control = 'min-h-11 cursor-pointer rounded-lg border border-cyan-700/40 px-3 py-2 text-left text-sm font-semibold text-cyan-900 hover:bg-cyan-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 aria-pressed:border-cyan-700 aria-pressed:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-cyan-600/60 dark:text-cyan-100 dark:hover:bg-cyan-950 dark:aria-pressed:bg-cyan-900';
const card = 'min-w-0 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900';
const code = 'break-words font-mono text-sm';
type Run = 'A' | 'B';
type Answer = 'A' | 'B' | 'C';

function Takeaway({ warning, children }: { warning?: boolean; children: React.ReactNode }) {
  return (
    <aside className={`space-y-1 rounded-xl border-l-4 p-3 ${warning ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/40' : 'border-cyan-600 bg-cyan-50 dark:bg-cyan-950/40'}`}>
      <p className="font-semibold">{warning ? '‼️ Обрати внимание' : 'Вывод'}</p>
      <p>{children}</p>
    </aside>
  );
}

function PathDiagram({ nodes }: { nodes: readonly { title: string; address: string; selected?: boolean }[] }) {
  return (
    <ol aria-label="Участники маршрута" className="flex flex-wrap gap-2">
      {nodes.map(({ title, address, selected }, index) => (
        <li key={title} className="flex min-w-0 items-center gap-2">
          {index > 0 && <span aria-hidden="true" className="text-cyan-600 dark:text-cyan-300">→</span>}
          <div className={card + (selected ? ' ring-2 ring-cyan-600 dark:ring-cyan-400' : '')}>
            <p className="font-semibold">{title}</p>
            <code className={code}>{address}</code>
            {selected && <p className="text-xs font-semibold">Следующий узел</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

function Envelope() {
  const [remote, setRemote] = useState<boolean | null>(null);
  const ip = remote ? SERVER_A : NEIGHBOR;
  return (
    <>
      <p>Выбери получателя и сравни адреса на первом участке: от ПК <code className={code}>{PC}/24</code> через коммутатор.</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={control} aria-pressed={remote === false} onClick={() => setRemote(false)}>Отправить соседу · {NEIGHBOR}</button>
        <button type="button" className={control} aria-pressed={remote === true} onClick={() => setRemote(true)}>Отправить серверу · {SERVER_A}</button>
      </div>
      <div role="status" className="space-y-3">
        {remote !== null && (
          <>
            <PathDiagram nodes={[
              { title: 'ПК', address: PC },
              { title: 'Коммутатор', address: 'L2 · VLAN 10' },
              remote ? { title: 'Шлюз', address: GATEWAY, selected: true } : { title: 'Сосед', address: NEIGHBOR, selected: true },
              ...(remote ? [{ title: 'Сервер в другой сети', address: SERVER_A }] : []),
            ]} />
            <dl className="grid gap-2 sm:grid-cols-2">
              <div className={card}><dt className="font-semibold">Снаружи: кадр Ethernet</dt><dd>MAC назначения: <code className={code}>{remote ? GATEWAY_MAC : NEIGHBOR_MAC}</code></dd></div>
              <div className={card}><dt className="font-semibold">Внутри: IPv4-пакет</dt><dd>IP назначения: <code className={code}>{ip}</code></dd></div>
            </dl>
            <Takeaway>{remote ? 'Кадр адресован шлюзу, но IP-пакет всё ещё адресован серверу. ПК запрашивает MAC локального шлюза, а не удалённого сервера.' : 'Сосед в той же подсети. ПК запрашивает MAC самого соседа.'}</Takeaway>
          </>
        )}
      </div>
    </>
  );
}

function Cache() {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  return (
    <>
      <p>Маршруты к обоим серверам идут через шлюз <code className={code}>{GATEWAY}</code> на <code>eth0</code>. Начинаем с пустого кэша.</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={control} disabled={phase !== 0} onClick={() => setPhase(1)}>Пакет №1 → {SERVER_A}</button>
        <button type="button" className={control} disabled={phase !== 1} onClick={() => setPhase(2)}>Получить ARP Reply</button>
        <button type="button" className={control} disabled={phase !== 2} onClick={() => setPhase(3)}>Пакет №2 → {SERVER_B}</button>
        <button type="button" className={control} onClick={() => setPhase(0)}>Сбросить кэш</button>
      </div>
      <div role="status" className="space-y-2">
        <p className="font-semibold">ARP-запросов: {phase === 0 ? 0 : 1}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className={card}>
            <p className="font-semibold">Таблица соседей · ip neigh show</p>
            {phase >= 2 ? <p><code className={code}>{GATEWAY} dev eth0 lladdr {GATEWAY_MAC}</code></p> : <p>Нет готовой записи IP → MAC.</p>}
          </div>
          <div className={card}>
            <p className="font-semibold">События на ПК</p>
            {phase === 0 ? <p>Очередь пуста. Отправь первый пакет.</p> :
              <ol className="list-decimal space-y-1 pl-5">
                <li>Пакет №1 к {SERVER_A} ждёт на ПК. Отдельный широковещательный ARP Request ищет {GATEWAY}.</li>
                {phase >= 2 && <li>Пришёл ARP Reply. ПК сохранил MAC шлюза и отправил первый пакет.</li>}
                {phase === 3 && <li>Пакет №2 ушёл к тому же MAC через eth0. Новый ARP Request не нужен.</li>}
              </ol>}
          </div>
        </div>
      </div>
      <Takeaway warning>Один и тот же следующий узел на том же интерфейсе может обслуживать разные IP назначения. Полученный ARP Reply сообщает соответствие IP и MAC, но не подтверждает подлинность отвечающего.</Takeaway>
    </>
  );
}

const DIAGNOSES = {
  A: ['Проверить веб-сервер', 'Проверить VLAN на порту, L2-путь, фильтрацию ARP и шлюз', 'Только очистить ARP-кэш'],
  B: ['Заменить патч-корд', 'Проверить прохождение пакета на шлюзе, маршрут, фильтрацию и обратный путь', 'Отправить ARP прямо за удалённым IP'],
} as const;
const ANSWERS = ['A', 'B', 'C'] as const;

function Diagnostics() {
  const [run, setRun] = useState<Run>('A');
  const [results, setResults] = useState<Partial<Record<Run, 'captured' | Answer>>>({});
  const result = results[run];
  const a = run === 'A';
  const right = a
    ? 'ARP Reply не пришёл, кадр с Echo Request не ушёл. Сначала проверяем локальный путь. В этом прогоне порт ПК в VLAN 99, а шлюз в VLAN 10.'
    : 'ARP Reply пришёл, кадр с Echo Request ушёл с ПК, а Echo Reply не вернулся. Где потерялся пакет, этот захват не показывает.';
  return (
    <>
      <p>Каждый прогон начинается с пустого кэша. Посмотри захват на ПК, прежде чем выбирать следующий шаг.</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={control} aria-pressed={a} onClick={() => setRun('A')}>Прогон A</button>
        <button type="button" className={control} aria-pressed={!a} onClick={() => setRun('B')}>Прогон B</button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={control} onClick={() => setResults(prev => ({ ...prev, [run]: 'captured' }))}>Запустить прогон {run} · ping {SERVER_A}</button>
        {result && <button type="button" className={control} onClick={() => setResults(prev => ({ ...prev, [run]: undefined }))}>Очистить захват</button>}
      </div>
      <div role="status" className={card}>
        <p className="font-semibold">Мини-захват на eth0 · Прогон {run}</p>
        {result ? (
          <ul className="list-disc space-y-1 pl-5">
            <li>Link Up · ARP Request: «У кого {GATEWAY}?»</li>
            <li>{a ? 'ARP Reply не пришёл. Запись INCOMPLETE; кадр с Echo Request не отправлен.' : `ARP Reply: ${GATEWAY} сообщает MAC ${GATEWAY_MAC}.`}</li>
            {!a && <li>Echo Request ушёл с ПК: IP назначения {SERVER_A}, MAC назначения {GATEWAY_MAC}. Echo Reply не наблюдался.</li>}
          </ul>
        ) : <p>Кэш пуст. Захват ещё не запущен.</p>}
      </div>
      {result && (
        <>
          <p className="font-semibold">Что проверять дальше?</p>
          <div className="grid gap-2">
            {DIAGNOSES[run].map((choice, index) => <button type="button" className={control} key={choice}
              aria-pressed={result === ANSWERS[index]} onClick={() => setResults(prev => ({ ...prev, [run]: ANSWERS[index] }))}>{choice}</button>)}
          </div>
          <div role="status">
            {result === 'B' && <Takeaway warning>{right}</Takeaway>}
            {(result === 'A' || result === 'C') && <p>Не лучший первый шаг. {a ? 'Сначала выясни, почему ПК не получил MAC шлюза.' : 'Захват с ПК не указывает, на каком участке потерялся пакет.'}</p>}
          </div>
        </>
      )}
    </>
  );
}

const TABLE_ROWS = [
  { ip: GATEWAY, mac: GATEWAY_MAC, port: 'Порт 1 (шлюз)' },
  { ip: NEIGHBOR, mac: NEIGHBOR_MAC, port: 'Порт 2 (сосед)' },
];

function CompareTables() {
  const [selected, setSelected] = useState(0);
  const [answer, setAnswer] = useState<Answer>();
  return (
    <>
      <p>Выбери строку в таблице соседей. Это два отдельных поиска: ПК выбирает MAC для кадра, а коммутатор выбирает физический порт.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className={card + ' space-y-2'}>
          <p className="font-semibold">Таблица соседей ПК · IPv4 → MAC</p>
          {TABLE_ROWS.map(({ ip, mac }, i) => <button type="button" className={control + ' block w-full'} aria-pressed={selected === i} key={ip} onClick={() => setSelected(i)}>{ip} → <code className={code}>{mac}</code></button>)}
        </div>
        <div className={card}>
          <table className="w-full table-fixed text-left">
            <caption className="mb-2 text-left font-semibold">MAC-таблица коммутатора</caption>
            <thead><tr><th scope="col">MAC + VLAN</th><th scope="col">Порт</th></tr></thead>
            <tbody>{TABLE_ROWS.map(({ ip, mac, port }, i) => <tr className={selected === i ? 'bg-cyan-50 font-semibold dark:bg-cyan-950' : ''} key={ip}>
              <td className="break-all py-1"><code>{mac}</code><br />VLAN 10</td><td className="px-1">{port}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </div>
      <div role="status"><Takeaway>Для {TABLE_ROWS[selected].ip} ПК берёт MAC {TABLE_ROWS[selected].mac}. В VLAN 10 коммутатор находит: {TABLE_ROWS[selected].port}.</Takeaway></div>
      <p className="font-semibold">Самопроверка: какой адрес ПК ищет через ARP, когда пингует {SERVER_A}?</p>
      <div className="grid gap-2">
        {[SERVER_A, GATEWAY, NEIGHBOR].map((ip, i) => <button type="button" className={control} aria-pressed={answer === ANSWERS[i]} key={ip} onClick={() => setAnswer(ANSWERS[i])}>{ip}</button>)}
      </div>
      <div role="status">{answer && <p>{answer === 'B' ? `Верно: ПК ищет MAC шлюза ${GATEWAY}, а IP назначения пакета остаётся ${SERVER_A}.` : 'Не этот адрес. Определи следующий узел, который находится в локальной подсети ПК.'}</p>}</div>
    </>
  );
}

export function ArpVisualPilot() {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const panelHeading = useRef<HTMLHeadingElement>(null);
  const [open, setOpen] = useState(false);
  const [scene, setScene] = useState(0);
  const [restartKey, setRestartKey] = useState(0);

  function focusAfterRender(target: 'heading' | 'trigger') {
    requestAnimationFrame(() => {
      const element = target === 'heading' ? panelHeading.current : trigger.current;
      element?.scrollIntoView({ block: 'start', behavior: 'instant' });
      element?.focus({ preventScroll: true });
    });
  }
  function goTo(step: number) {
    setScene(step);
    focusAfterRender('heading');
  }
  function restart() {
    setRestartKey(key => key + 1);
    goTo(0);
  }

  return (
    <section aria-labelledby={id} className="space-y-3 rounded-2xl border border-cyan-400/50 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800 dark:bg-[#091524] dark:text-slate-100">
      <div className="flex flex-wrap items-center gap-2">
        <h3 id={id} className="text-base font-bold">Визуальный разбор ARP</h3>
        <span className="rounded-full bg-cyan-100 px-2 py-1 text-xs font-semibold text-cyan-900 dark:bg-cyan-900 dark:text-cyan-100">Пилот</span>
      </div>
      <p>Четыре интерактивные сцены. Обычный текст урока остаётся ниже и доступен в обоих режимах.</p>
      <button ref={trigger} type="button" className={control + ' scroll-mt-24'} aria-expanded={open} aria-controls={id + '-scenes'}
        onClick={() => { setOpen(!open); if (!open) focusAfterRender('heading'); }}>
        {open ? 'Свернуть визуальный разбор' : 'Открыть визуальный разбор'}
      </button>
      <div id={id + '-scenes'} hidden={!open} className="space-y-4">
        <nav aria-label="Сцены ARP" className="flex flex-wrap gap-2">
          {SCENES.map((title, index) => <button key={title} type="button" className={control + (scene === index ? ' bg-cyan-100 dark:bg-cyan-900' : '')}
            aria-current={scene === index ? 'step' : undefined} onClick={() => goTo(index)}>{index + 1}. {title}</button>)}
        </nav>
        <div key={restartKey} className="space-y-3">
          <h4 ref={panelHeading} tabIndex={-1} className="scroll-mt-24 text-base font-bold focus-visible:outline-2 focus-visible:outline-cyan-600">{scene + 1} из 4 · {TITLES[scene]}</h4>
          <section aria-label={TITLES[0]} hidden={scene !== 0} className="space-y-3"><Envelope /></section>
          <section aria-label={TITLES[1]} hidden={scene !== 1} className="space-y-3"><Cache /></section>
          <section aria-label={TITLES[2]} hidden={scene !== 2} className="space-y-3"><Diagnostics /></section>
          <section aria-label={TITLES[3]} hidden={scene !== 3} className="space-y-3"><CompareTables /></section>
        </div>
        <div className="flex flex-wrap gap-2">
          {scene > 0 && <button type="button" className={control} onClick={() => goTo(scene - 1)}>Назад к сцене</button>}
          {scene < SCENES.length - 1 && <button type="button" className={control} onClick={() => goTo(scene + 1)}>Следующая сцена</button>}
          <button type="button" className={control} onClick={restart}>Начать заново и сбросить ответы</button>
          <button type="button" className={control} onClick={() => { setOpen(false); focusAfterRender('trigger'); }}>Закрыть разбор</button>
        </div>
      </div>
    </section>
  );
}
