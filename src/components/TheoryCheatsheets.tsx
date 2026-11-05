import React, { useEffect, useRef, useState } from 'react';
import { LEVEL_NOTES } from '../data/levelNotes';
import { ZoomableImage } from './ZoomableImage';

const DUTY_LEVEL = 8;
const sectionId = (level: number) => level === DUTY_LEVEL ? 'cheatsheet-duty' : `cheatsheet-l${level}`;
const NAV_ITEMS = [
  ...LEVEL_NOTES.map(note => ({ level: note.level, label: `L${note.level}` })),
  { level: DUTY_LEVEL, label: 'Дежурство' },
];
const DUTY_NOTES = [
  {
    title: 'Port Security',
    text: 'Protect отбрасывает кадры с недопустимых MAC. Restrict добавляет учёт нарушений, а shutdown переводит порт в err-disabled. Sticky заносит изученный MAC в running-config; для сохранения после перезагрузки сохраняют конфигурацию.',
    commands: ['show port-security'],
  },
  {
    title: 'DHCP Snooping',
    text: 'Ответы DHCP-сервера допускаются с доверенных, trusted-портов. Binding связывает MAC, IP, VLAN и интерфейс клиента. Чрезмерно низкий rate limit может блокировать даже обычный Discover: проверь лимит, прежде чем винить сервер.',
    commands: ['show ip dhcp snooping'],
  },
  {
    title: 'VRRP',
    text: 'Несколько маршрутизаторов обслуживают один виртуальный адрес шлюза — VIP. Более высокий Priority даёт преимущество при выборе Master. Объявления VRRP передаются непосредственно по IP с номером протокола 112, без TCP.',
    commands: ['show vrrp brief'],
  },
  {
    title: '802.1X',
    text: 'В базовой конфигурации до успешной авторизации через Access-Accept клиент обменивается EAPOL с коммутатором, но обычный трафик ещё закрыт. Исключения задаёт политика доступа. Классический RADIUS использует UDP 1812 для аутентификации и UDP 1813 для учёта сессий.',
    commands: [],
  },
  {
    title: 'CoPP и Storm Control',
    text: 'Потери при обращении к самому устройству ещё не доказывают потери транзита: проверь защиту control plane. Нулевой CRC тоже не гарантирует доставку — Storm Control может отбрасывать исправные кадры при превышении порога. Сопоставь политику, пороги и счётчики с моментом сбоя.',
    commands: ['show policy-map control-plane', 'show storm-control'],
  },
];

export const TheoryCheatsheets: React.FC = () => {
  const [activeLevel, setActiveLevel] = useState(LEVEL_NOTES[0].level);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nodes = NAV_ITEMS.map((n) => document.getElementById(sectionId(n.level))).filter(Boolean) as HTMLElement[];
    if (!nodes.length) return;
    let observer: IntersectionObserver;
    const observe = () => {
      observer?.disconnect();
      const visible = new Set<HTMLElement>();
      const bandTop = window.innerHeight * 0.3;
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) visible.add(entry.target as HTMLElement);
            else visible.delete(entry.target as HTMLElement);
          });
          const current = [...visible].sort((a, b) =>
            Math.abs(a.getBoundingClientRect().top - bandTop) - Math.abs(b.getBoundingClientRect().top - bandTop))[0];
          const level = Number(current?.dataset.level);
          if (level) setActiveLevel(level);
        },
        { rootMargin: `-${bandTop}px 0px -${window.innerHeight * 0.5}px 0px`, threshold: 0 }
      );
      nodes.forEach(node => observer.observe(node));
    };
    observe();
    window.addEventListener('resize', observe);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', observe);
    };
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>(`[href="#${sectionId(activeLevel)}"]`);
    if (!nav || !active) return;
    const bounds = nav.getBoundingClientRect();
    const link = active.getBoundingClientRect();
    if (link.left < bounds.left || link.right > bounds.right) {
      nav.scrollTo({
        left: nav.scrollLeft + link.left - bounds.left - (nav.clientWidth - link.width) / 2,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    }
  }, [activeLevel]);

  const scrollToLevel = (level: number) => {
    setActiveLevel(level);
    document.getElementById(sectionId(level))?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
    <div>
      <div className="h-14" aria-hidden />
      <nav
        aria-label="Навигация по шпаргалкам L1–L7 и дежурству"
        className="fixed top-16 left-0 right-0 z-30 px-3 sm:px-6"
      >
        <div ref={navRef} className="max-w-5xl mx-auto flex gap-1 overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 dark:border-cyan-500/20 bg-white/95 dark:bg-[#07111f]/95 p-2 backdrop-blur-xl shadow-lg shadow-black/20">
          {NAV_ITEMS.map((note) => (
            <a
              key={note.level}
              href={`#${sectionId(note.level)}`}
              aria-current={activeLevel === note.level ? 'location' : undefined}
              onClick={(event) => {
                event.preventDefault();
                scrollToLevel(note.level);
              }}
              className={`${note.level === DUTY_LEVEL ? 'shrink-0 px-2 sm:flex-1' : 'flex-1 min-w-6 px-1'} whitespace-nowrap py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold text-center transition-colors ${
                activeLevel === note.level
                  ? 'bg-cyan-400/90 text-slate-950'
                  : 'text-slate-300/80 hover:bg-white/10'
              }`}
            >
              {note.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="space-y-16 sm:space-y-20">
        {LEVEL_NOTES.map((note) => (
          <section
            key={note.level}
            id={sectionId(note.level)}
            data-level={note.level}
            aria-labelledby={`${sectionId(note.level)}-heading`}
            className="scroll-mt-36"
          >
            <div className="flex items-end gap-3 mb-4">
              <span className="text-4xl sm:text-5xl font-black tracking-tight text-cyan-400 leading-none">
                L{note.level}
              </span>
              <h2
                id={`${sectionId(note.level)}-heading`}
                className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white pb-1"
              >
                {note.title.replace(/^L\d\s·\s/, '')}
              </h2>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/40 p-3 sm:p-5 space-y-4">
              <div className="mx-auto max-w-3xl">
                <ZoomableImage
                  src={note.cheatWebp}
                  alt={`Шпаргалка ${note.title}`}
                  caption="Нажмите на картинку — откроется на весь экран"
                  imgClassName="!max-h-none h-auto w-full"
                  fullscreenOnClick
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {note.sections.map((section) => (
                  <div
                    key={section.title}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-950/50"
                  >
                    <div className="text-xs font-bold text-cyan-700 dark:text-cyan-300 mb-1">{section.title}</div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{section.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
        <section
          id={sectionId(DUTY_LEVEL)}
          data-level={DUTY_LEVEL}
          aria-labelledby="cheatsheet-duty-heading"
          className="scroll-mt-36 min-h-[calc(100svh-9rem)] pb-24"
        >
          <h2 id="cheatsheet-duty-heading" className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
            С дежурства
          </h2>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/40 p-3 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DUTY_NOTES.map(note => (
                <div key={note.title} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700/70 bg-slate-50 dark:bg-slate-950/50">
                  <h3 className="text-xs font-bold text-cyan-700 dark:text-cyan-300 mb-1">{note.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{note.text}</p>
                  {note.commands.map(command => (
                    <code key={command} className="block mt-2 text-[11px] sm:text-xs text-slate-700 dark:text-slate-200 break-words">{command}</code>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
