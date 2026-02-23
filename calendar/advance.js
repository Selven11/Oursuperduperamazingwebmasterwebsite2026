
import { AUTO_ADVANCE_MS, USER_PAUSE_BEFORE_RESUME_MS } from './constants.js';

let timerId = null;
let pausedUntil = null;

export function startTimer(callback) {
  stopTimer();
  
  function tick() {
    if (pausedUntil && Date.now() < pausedUntil) {
      timerId = setTimeout(tick, 100);
      return;
    }

    pausedUntil = null;
    callback();
    timerId = setTimeout(tick, AUTO_ADVANCE_MS);
  }

  timerId = setTimeout(tick, AUTO_ADVANCE_MS);
}

export function stopTimer() {
  if (timerId) {
    clearTimeout(timerId);
    timerId = null;
  }
}

export function pauseTimer() {
  pausedUntil = Date.now() + USER_PAUSE_BEFORE_RESUME_MS;
}


