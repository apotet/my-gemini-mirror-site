import { useSyncExternalStore } from 'react';
import { type LessonCheatsheet } from '../data/lessons/types';
import { FormattedExplanation } from './FormattedExplanation';
import { ZoomableImage } from './ZoomableImage';
import './TcpIpReadingBlock.css';

const wideMedia = '(min-width: 56rem)';
const wideSnapshot = () => window.matchMedia(wideMedia).matches;
const narrowSnapshot = () => false;
function subscribeToWidth(onChange: () => void) {
  const media = window.matchMedia(wideMedia);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

const leadBeforeVisual = new Set(['tcpip-why.svg', 'tcpip-osi.svg', 'tcpip-addresses.svg', 'tcpip-transport.svg']);
const levels = [
  ['Прикладной', 'application'],
  ['Транспортный', 'transport'],
  ['Межсетевой', 'internet'],
  ['Сетевой доступ', 'link'],
] as const;

function DiagramDescription({ text }: { text: string }) {
  const level = levels.find(([label]) => text.startsWith(label + ':'));
  return level
    ? <p><strong data-tcpip-level={level[1]}>{level[0]}</strong>{text.slice(level[0].length)}</p>
    : <p>{text}</p>;
}

/** Only this lesson has corresponding wide and narrow art. The same active image is zoomed. */
export function TcpIpDiagram({ visual, cheatsheet = false }: { visual: LessonCheatsheet; cheatsheet?: boolean }) {
  const wide = useSyncExternalStore(subscribeToWidth, wideSnapshot, narrowSnapshot);
  const file = wide ? visual.file.replace(/\.svg$/, '-wide.svg') : visual.file;
  return <figure className="tcpip-reading__visual" data-lesson-visual={cheatsheet ? undefined : visual.file}
    data-tcpip-diagram={visual.file}
    data-tcpip-variant={wide ? 'wide' : 'narrow'} aria-label={visual.title}>
    <ZoomableImage src={`${import.meta.env.BASE_URL}lesson-images/${file}`}
      alt={visual.alt} previewFullHeight className="tcpip-reading__preview" />
    {!!visual.textEquivalent?.length && (
      <figcaption className="tcpip-reading__caption" data-lesson-visual-description={visual.file}>
        <details className="tcpip-reading__description">
          <summary aria-label={`Описание схемы текстом: ${visual.title}`}>Описание схемы текстом</summary>
          <div className="tcpip-reading__description-body">
            {visual.textEquivalent.map(line => <DiagramDescription text={line} key={line} />)}
          </div>
        </details>
      </figcaption>
    )}
  </figure>;
}

export function TcpIpReadingBlock({ body, visual, glossaryScope }: {
  body: string;
  visual?: LessonCheatsheet;
  glossaryScope?: 'poe' | 'ipv6' | 'http';
}) {
  const takeaway = body.match(/(?:^|\n\n)(Запомни:) ([\s\S]+)$/u);
  const text = takeaway ? body.slice(0, takeaway.index) : body;
  const prose = text ? <div className="tcpip-reading__prose">
    <FormattedExplanation text={text} glossaryScope={glossaryScope} />
  </div> : null;
  const lead = !visual || leadBeforeVisual.has(visual.file);

  return (
    <>
      {lead && prose}
      {visual && <TcpIpDiagram visual={visual} />}
      {!lead && prose}
      {takeaway && <p className="tcpip-reading__takeaway">
        <strong>{takeaway[1]}</strong>{' '}<FormattedExplanation text={takeaway[2]} glossaryScope={glossaryScope} inline />
      </p>}
    </>
  );
}
