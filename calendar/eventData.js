

export function buildEventMap(events) {
  const eventMap = {};

  events.forEach(event => {
    if (!event.date) return;
    const [year, month, day] = event.date.split('-');
    const key = `${year}-${parseInt(month) - 1}-${parseInt(day)}`;

    if (!eventMap[key]) eventMap[key] = [];

    eventMap[key].push({
      cat:  event.category || 'Event',
      name: event.title,
      time: event.time || 'TBD',
      loc:  event.location || '',
      desc: event.description || '',
    });
  });

  return eventMap;
}

export function getMonthEvents(eventMap, year, month) {
  return Object.keys(eventMap)
    .filter(key => key.startsWith(`${year}-${month}-`))
    .sort((a, b) => {
      const dayA = parseInt(a.split('-')[2]);
      const dayB = parseInt(b.split('-')[2]);
      return dayA - dayB;
    });
}


