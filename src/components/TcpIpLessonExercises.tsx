import { useId, useState } from 'react';

const choices = [
  { id: 'ip', label: 'Меняются IP-адрес сервера и порт службы.',
    feedback: 'Сначала проверь условие: здесь нет NAT и прокси. Маршрутизатор не меняет адрес конечного сервера или порт службы.' },
  { id: 'hop', label: 'Меняется Ethernet-кадр; TTL и контрольная сумма IPv4 обновляются.',
    feedback: 'Верно. Маршрутизатор переносит пакет в новый кадр, но конечные IP-адреса и порты не меняются.' },
  { id: 'mac', label: 'Меняются только MAC-адреса, поля IPv4 остаются как были.',
    feedback: 'Кадр действительно новый. А что маршрутизатор делает со счётчиком переходов IPv4?' },
] as const;

export function TcpIpHopPrediction({ onExplorePractice }: { onExplorePractice: () => void }) {
  const groupId = useId();
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const answer = choices.find(choice => choice.id === submitted);
  const revealed = answer?.id === 'hop';
  return (
    <div data-tcpip-prediction className="tcpip-exercise">
      <h4>Предскажи: что изменится на маршрутизаторе?</h4>
      <p>Клиент <code>192.0.2.10:51514</code> отправил HTTP-запрос серверу <code>198.51.100.20:80</code>. Сервер подключён к выходной сети маршрутизатора напрямую. NAT и прокси нет. ARP уже отработал, TCP-соединение установлено.</p>
      <form onSubmit={event => { event.preventDefault(); if (selected) setSubmitted(selected); }}>
        <fieldset>
          <legend>Сравни кадр на входе и кадр на выходе.</legend>
          {choices.map(choice => (
            <label key={choice.id} className="tcpip-exercise__choice">
              <input name={groupId} type="radio" value={choice.id} checked={selected === choice.id}
                onChange={() => { setSelected(choice.id); setSubmitted(null); }} required />
              {choice.label}
            </label>
          ))}
        </fieldset>
        <button type="submit" className="tcpip-exercise__submit">Проверить ответ</button>
      </form>
      <p className={answer ? 'tcpip-exercise__feedback' : undefined} role="status">{answer?.feedback}</p>
      {revealed && (
        <div data-tcpip-prediction-result className="tcpip-exercise__comparison">
          <dl>
            <div><dt>Входной кадр</dt><dd>MAC клиента → MAC входного интерфейса маршрутизатора.</dd></div>
            <div><dt>Выходной кадр</dt><dd>MAC выходного интерфейса → MAC сервера. Для нового кадра формируется FCS.</dd></div>
            <div><dt>Пакет IPv4</dt><dd>TTL: 64 → 63. Контрольная сумма заголовка IPv4 пересчитывается.</dd></div>
            <div><dt>Сквозные поля</dt><dd>IP-адреса клиента и сервера и порты <code>51514 → 80</code> не меняются.</dd></div>
          </dl>
          <button type="button" data-tcpip-open-packet-practice className="tcpip-mode-link" onClick={onExplorePractice}>
            Перейти к практике в режиме „По делу“
          </button>
        </div>
      )}
    </div>
  );
}

const packetRows = [
  ['link', 'Ethernet II', 'Source: MAC клиента · Destination: MAC входного интерфейса маршрутизатора · Type: IPv4 (0x0800)'],
  ['internet', 'Internet Protocol Version 4', 'Src: 192.0.2.10 · Dst: 198.51.100.20 · TTL: 64 · Protocol: TCP (6)'],
  ['transport', 'Transmission Control Protocol', 'Src Port: 51514 · Dst Port: 80'],
  ['application', 'Hypertext Transfer Protocol', 'GET / HTTP/1.1 · Host: lesson.test'],
] as const;

export function TcpIpPacketDetails() {
  const titleId = useId();
  return (
    <figure data-tcpip-packet-details className="tcpip-exercise" aria-labelledby={titleId}>
      <figcaption id={titleId}><strong>Packet Details · учебный макет</strong></figcaption>
      <p>Один запрос на стороне клиента, до маршрутизатора. Это иллюстрация структуры, не скриншот и не реальный захват.</p>
      {packetRows.map(([level, label, fields]) => (
        <details className="tcpip-exercise__layer" data-tcpip-level={level} key={level}>
          <summary>{label}</summary>
          <p>{fields}</p>
        </details>
      ))}
      <p>Сетевая карта может снять FCS до записи захвата.</p>
    </figure>
  );
}
