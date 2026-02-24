

import { MONTHS, DAYS } from './constants.js';
import { createSinglePopup, createMultiPopup } from './templates.js';

export function renderCalendarGrid(grid, year, month, eventMap, onEventClick) {
  grid.innerHTML = '';
  
  renderDayHeaders(grid);
  renderDayCells(grid, year, month, eventMap, onEventClick);
}

export function updateCalendarTitle(titleEl, year, month) {
  if (titleEl) {
    titleEl.textContent = `${MONTHS[month]} ${year}`;
  }
}

function renderDayHeaders(grid) {
  DAYS.forEach(d => {
    const h = document.createElement('div');
    h.className = 'cal-day-name';
    h.textContent = d;
    grid.appendChild(h);
  });
}

function renderDayCells(grid, year, month, eventMap, onEventClick) {
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const today = new Date();
  
  for (let i = 0; i < firstDayOfWeek; i++) {
    createDayCell(grid, daysInPrevMonth - firstDayOfWeek + 1 + i, 'cal-day other-month', null, null, null);
  }
  

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${month}-${day}`;
    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
    const hasEvent = !!eventMap[dateKey]?.length;
    
    createDayCell(grid, day, getDayClasses(isToday, hasEvent), dateKey, () => onEventClick(dateKey), eventMap);
  }
  

  const totalCells = firstDayOfWeek + daysInMonth;
  const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let i = 1; i <= remainingCells; i++) {
    createDayCell(grid, i, 'cal-day other-month', null, null, null);
  }
}

function createDayCell(grid, dayNumber, className, dateKey, onClick, eventMap) {
  const el = document.createElement('div');
  el.className = className;
  el.textContent = dayNumber;
  
  if (dateKey) {
    el.dataset.dateKey = dateKey;
  }
  
  if (onClick) {
    el.addEventListener('click', onClick);
  }

  if (dateKey && eventMap?.[dateKey]?.length) {
    el.addEventListener('mouseenter', () => {
      showHoverPopup(el, eventMap[dateKey]);
    });
    el.addEventListener('mouseleave', () => {
      el.querySelector('.cal-event-popup')?.remove();
    });
  }
  
  grid.appendChild(el);
}

function getDayClasses(isToday, hasEvent) {
  let classes = 'cal-day';
  if (isToday) classes += ' today';
  if (hasEvent) classes += ' has-event';
  return classes;
}

function showHoverPopup(cell, eventsArr) {
  cell.querySelector('.cal-event-popup')?.remove();
  cell.appendChild(
    eventsArr.length === 1
      ? createSinglePopup(eventsArr[0])
      : createMultiPopup(eventsArr)
  );
}
