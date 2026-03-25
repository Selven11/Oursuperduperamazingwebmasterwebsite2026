import { ITEMS } from '/tile/data/items.js';
import { renderTile } from '/tile/tile.js';


const TILE_WIDTH    = 320;   
const TILE_GAP      = 20;    
const TILE_STEP     = TILE_WIDTH + TILE_GAP;
const CLONE_COPIES  = 20;    
const SPIN_DURATION = 4000;  


const AGE_STEPS = [
  { label: 'Youth',       key: 'youth'   },
  { label: 'Teen',        key: 'teens'   },
  { label: 'Young Adult', key: 'adults'  },
  { label: 'Adult',       key: 'adults'  },
  { label: '65+',         key: 'seniors' },
];


const sliderIndex = val => Math.round(val / 10);



function daysBetween(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.round((target - today) / 86_400_000);
}

function matchesTimeSlider(dateStr, sliderVal) {
  const d = daysBetween(dateStr);
  switch (sliderIndex(sliderVal)) {
    case 0: return d === 0;                  
    case 1: return d === 1;                  
    case 2: return d >= 0 && d <= 6;         
    case 3: return d >= 7 && d <= 13;        
    default: return true;
  }
}


function filterItems(ageVal, timeVal) {
  const ageKey = AGE_STEPS[sliderIndex(ageVal)].key;

  return ITEMS.filter(item => {
    const ageMatch  = item.age?.[ageKey] === true;
    const timeMatch = matchesTimeSlider(item.date, timeVal);
    return ageMatch && timeMatch;
  });
}

function filterItemsByAge(ageVal) {
  const ageKey = AGE_STEPS[sliderIndex(ageVal)].key;
  return ITEMS.filter(item => item.age?.[ageKey] === true);
}


function showError(container, msg) {
  container.innerHTML = '';
  const err = document.createElement('div');
  err.className = 'roulette-error';
  err.textContent = msg;
  container.appendChild(err);
}


function buildTrack(items) {
  const track = document.createElement('div');
  track.id = 'roulette-track';

  for (let c = 0; c < CLONE_COPIES; c++) {
    items.forEach((item, i) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'roulette-tile';
      if (c === CLONE_COPIES - 1) {
        wrapper.dataset.finalIndex = i;
      }
      wrapper.appendChild(renderTile(item));
      track.appendChild(wrapper);
    });
  }
  return track;
}

function spinTo(track, targetX, onDone) {
  track.style.transition = 'none';
  track.style.transform  = 'translateX(0px)';

  void track.offsetWidth;

  track.style.transition = `transform ${SPIN_DURATION}ms cubic-bezier(0.12, 0.8, 0.2, 1)`;
  track.style.transform  = `translateX(-${targetX}px)`;

  track.addEventListener('transitionend', onDone, { once: true });
}

function runRoulette(container, items) {
  container.innerHTML = '';

  const viewport = document.createElement('div');
  viewport.id = 'roulette-viewport';
  container.appendChild(viewport);

  const track = buildTrack(items);
  viewport.appendChild(track);

  const winnerIndex   = Math.floor(Math.random() * items.length);
  const lastCopyStart = (CLONE_COPIES - 1) * items.length;
  const absoluteIndex = lastCopyStart + winnerIndex;

  const viewportWidth = viewport.offsetWidth || 800;
  const centerOffset  = Math.floor((viewportWidth - TILE_WIDTH) / 2);
  const targetX       = absoluteIndex * TILE_STEP - centerOffset;

  requestAnimationFrame(() => {
    spinTo(track, targetX, () => {
      // Highlight the winner
      const winnerEl = track.querySelector(`[data-final-index="${winnerIndex}"]`);
      if (winnerEl) {
        winnerEl.classList.add('roulette-winner');
        winnerEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });
  });
}


export function initGenerate() {
  const ageSlider   = document.getElementById('age');
  const timeSlider  = document.getElementById('time');
  const generateBtn = document.getElementById('generatebtn');
  const container   = document.getElementById('slideshow-container');

  if (!ageSlider || !timeSlider || !generateBtn || !container) return;

  generateBtn.addEventListener('click', () => {
    const ageVal  = parseInt(ageSlider.value,  10);
    const timeVal = parseInt(timeSlider.value, 10);
    let matched = filterItems(ageVal, timeVal);

    if (matched.length === 0) {
      matched = filterItemsByAge(ageVal);
    }

    if (matched.length === 0) {
      showError(container, "😕 No events match those filters. Try a different age or time range!");
      return;
    }

    runRoulette(container, matched);
  });
}