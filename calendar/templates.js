function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined) e.textContent = text;
  return e;
}

export function createEventCard({ month, day, dow, cat, name, desc, time, loc }) {
  const card = el('div', 'event-card');

  const dateBlock = el('div', 'event-date-block');
  dateBlock.append(el('div', 'event-month', month), el('div', 'event-day', day), el('div', 'event-dow', dow));

  const info = el('div', 'event-info');
  const meta = el('div', 'event-meta');
  meta.append(el('span', '', `\u{1F550} ${time}`), el('span', '', `\u{1F4CD} ${loc}`));
  info.append(el('div', 'event-cat', cat), el('h3', 'event-name', name), el('p', 'event-desc', desc), meta);

  card.append(dateBlock, info);
  return card;
}

export function createPanelHeader(text) {
  return el('h3', 'panel-title', text);
}

export function createEmptyMessage() {
  return el('p', 'panel-empty', 'No events on this day');
}

export function createSinglePopup(ev) {
  const popup = el('div', 'cal-event-popup show');
  const meta = el('div', 'pop-meta');
  meta.textContent = `\u{1F550} ${ev.time} \u00B7 \u{1F4CD} ${ev.loc}`;
  popup.append(el('div', 'pop-cat', ev.cat), el('div', 'pop-name', ev.name), meta);
  return popup;
}

export function createMultiPopup(eventsArr) {
  const popup = el('div', 'cal-event-popup show');
  popup.appendChild(el('div', 'pop-cat', `${eventsArr.length} Events`));
  eventsArr.forEach(ev => {
    const name = el('div', 'pop-name', ev.name);
    name.style.marginBottom = '2px';
    popup.appendChild(name);
  });
  popup.appendChild(el('div', 'pop-meta', 'Click to see details'));
  return popup;
}
