
const GRID = [
  ['U','N','I','O','N','C','O','U','N','T','Y','T'],
  ['L','E','N','X','B','C','T','K','M','V','B','R'],
  ['Q','A','T','C','P','U','J','G','E','G','B','A'],
  ['C','G','N','U','H','C','T','A','W','A','D','I'],
  ['U','E','L','I','Z','A','B','E','T','H','N','L'],
  ['X','V','B','V','V','N','B','H','B','T','E','S'],
  ['L','I','B','E','R','T','Y','H','A','L','L','I'],
  ['K','P','E','T','D','V','K','T','Y','F','D','D'],
  ['L','E','Z','N','V','V','X','G','M','D','T','E'],
  ['Z','C','V','B','W','G','R','Y','T','P','L','Q'],
  ['E','C','E','K','A','L','O','H','C','E','M','K'],
  ['H','F','Z','H','C','V','K','S','R','L','Q','K'],
];

// Each word mapped to its cell coordinates
const WORD_CELLS = {
  UNIONCOUNTY: [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[0,9],[0,10]],
  WATCHUNG:    [[3,1],[3,2],[3,3],[3,4],[3,5],[3,6],[3,7],[3,8]],
  ELIZABETH:   [[4,9],[4,1],[4,2],[4,3],[4,4],[4,5],[4,6],[4,7],[4,8]],
  LIBERTYHALL: [[6,0],[6,1],[6,2],[6,3],[6,4],[6,5],[6,6],[6,7],[6,8],[6,9],[6,10]],
  KEAN:        [[1,7],[2,8],[3,9],[4,10]],
  ECHOLAKE:    [[10,8],[10,9],[10,2],[10,3],[10,4],[10,5],[10,6],[10,7]],
  TRAILSIDE:   [[0,11],[1,11],[2,11],[3,11],[4,11],[5,11],[6,11],[7,11],[8,11]],
};

const WORDS = Object.keys(WORD_CELLS);

// ── State ─────────────────────────────────────────────────────────
let selected = [];   // [{r, c}, ...]
let foundWords = new Set();

// ── DOM ───────────────────────────────────────────────────────────
const gridEl      = document.getElementById('grid');
const wordListEl  = document.getElementById('wordList');
const enterBtn    = document.getElementById('enterBtn');
const clearBtn    = document.getElementById('clearBtn');
const hintEl      = document.getElementById('hint');
const congratsEl = document.getElementById('thank-you-modal');

// ── Build Grid ────────────────────────────────────────────────────
function buildGrid() {
  gridEl.innerHTML = '';
  for (let r = 0; r < 12; r++) {
    for (let c = 0; c < 12; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.textContent = GRID[r][c];
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.addEventListener('click', () => onCellClick(r, c, cell));
      gridEl.appendChild(cell);
    }
  }
}

// ── Build Word List ───────────────────────────────────────────────
function buildWordList() {
  wordListEl.innerHTML = '';
  WORDS.forEach(w => {
    const li = document.createElement('li');
    li.textContent = w.toLowerCase();
    li.id = `word-${w}`;
    if (foundWords.has(w)) li.classList.add('found');
    wordListEl.appendChild(li);
  });
}

// ── Cell Click ────────────────────────────────────────────────────
function onCellClick(r, c, cell) {
  if (cell.classList.contains('found-word')) return;

  const idx = selected.findIndex(s => s.r === r && s.c === c);
  if (idx !== -1) {
    selected.splice(idx, 1);
    cell.classList.remove('selected');
    setHint('');
    return;
  }

  selected.push({ r, c });
  cell.classList.add('selected');
  setHint('');
}

// ── Enter Button ──────────────────────────────────────────────────
enterBtn.addEventListener('click', () => {
  if (selected.length === 0) {
    setHint('Select some letters first!', 'wrong');
    return;
  }

  let matchedWord = null;
  for (const word of WORDS) {
    if (foundWords.has(word)) continue;
    const wordCells = WORD_CELLS[word];
    if (wordCells.length !== selected.length) continue;
    const allMatch = selected.every(({ r, c }) =>
      wordCells.some(([wr, wc]) => wr === r && wc === c)
    );
    if (allMatch) { matchedWord = word; break; }
  }

  if (matchedWord) {
    foundWords.add(matchedWord);
    WORD_CELLS[matchedWord].forEach(([r, c]) => {
      const cell = getCell(r, c);
      cell.classList.remove('selected');
      cell.classList.add('found-word');
    });
    selected = [];
    buildWordList();
    setHint(`✓ found!`, 'right');

    if (foundWords.size === WORDS.length) {
        setTimeout(() => congratsEl.classList.add('active'), 500);
    }
  } else {
    setHint('Not a match — keep looking!', 'wrong');
    clearSelection();
  }
});

// ── Clear Button ──────────────────────────────────────────────────
clearBtn.addEventListener('click', () => {
  clearSelection();
  setHint('');
});


document.getElementById('modal-close').addEventListener('click', () => {
  congratsEl.classList.remove('active');
});

// ── Helpers ───────────────────────────────────────────────────────
function getCell(r, c) {
  return gridEl.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
}

function clearSelection() {
  selected.forEach(({ r, c }) => getCell(r, c).classList.remove('selected'));
  selected = [];
}

function setHint(msg, type = '') {
  hintEl.textContent = msg;
  hintEl.className = 'hint' + (type ? ` ${type}` : '');
}

// ── Start ─────────────────────────────────────────────────────────
buildGrid();
buildWordList();