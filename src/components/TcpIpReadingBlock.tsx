import { type LessonCheatsheet } from '../data/lessons/types';
import { FormattedExplanation } from './FormattedExplanation';
import { ZoomableImage } from './ZoomableImage';
import './TcpIpReadingBlock.css';

const sideBySideVisuals = new Set([
  'tcpip-why.svg',
  'tcpip-layers.svg',
  'tcpip-osi.svg',
  'tcpip-pack.svg',
  'tcpip-unpack.svg',
  'tcpip-addresses.svg',
  'tcpip-route.svg',
  'tcpip-transport.svg',
]);

const levels = [
  ['Прикладной', 'application'],
  ['Транспортный', 'transport'],
  ['Межсетевой', 'internet'],
  ['Сетевой доступ', 'link'],
] as const;

function DiagramDescription({ text }: { text: string }) {
  // Make the actual labels stand out without changing the description or
  // introducing another set of links/tooltip triggers inside the caption.
  const level = levels.find(([label]) => text.startsWith(label + ':'));
  return level
    ? <p><strong data-tcpip-level={level[1]}>{level[0]}</strong>{text.slice(level[0].length)}</p>
    : <p>{text}</p>;
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

  return (
    <>
      {visual ? (
        <figure className="tcpip-reading__visual"
          data-layout={prose && sideBySideVisuals.has(visual.file) ? 'split' : 'stacked'}
          data-lesson-visual={visual.file} aria-label={visual.title}>
          <ZoomableImage src={`${import.meta.env.BASE_URL}lesson-images/${visual.file}`}
            alt={visual.alt} previewFullHeight className="tcpip-reading__preview" />
          {prose}
          {!!visual.textEquivalent?.length && (
            <figcaption className="tcpip-reading__caption" data-lesson-visual-description={visual.file}>
              <span className="tcpip-reading__caption-label">Пояснение к схеме</span>
              {visual.textEquivalent.map(line => <DiagramDescription text={line} key={line} />)}
            </figcaption>
          )}
        </figure>
      ) : prose}
      {takeaway && <p className="tcpip-reading__takeaway">
        <strong>{takeaway[1]}</strong>{' '}<FormattedExplanation text={takeaway[2]} glossaryScope={glossaryScope} inline />
      </p>}
    </>
  );
}
