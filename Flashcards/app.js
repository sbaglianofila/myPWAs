/* ══════════════════════════════════════
   FLASHCARD PWA — app.js
══════════════════════════════════════ */

'use strict';

/* ── STATE ── */
let deck       = null;   // { name, cards: [...] }
let cards      = [];     // working array (shuffled or not)
let studyIndex = 0;
let sideIndex  = 0;
let quizIndex  = 0;
let quizScore  = 0;
let quizCards  = [];
let hintShown  = false;

/* ── DOM REFS ── */
const $ = id => document.getElementById(id);

const screens = {
  home:    $('screen-home'),
  study:   $('screen-study'),
  quiz:    $('screen-quiz'),
  results: $('screen-results'),
};

/* ══════════════════
   NAVIGATION
══════════════════ */
function showScreen(name) {
  Object.entries(screens).forEach(([k, el]) => {
    el.classList.toggle('active', k === name);
  });
}

/* ══════════════════
   HOME SCREEN
══════════════════ */
const fileInput           = $('file-input');
const uploadZone          = $('upload-zone');
const deckListSection     = $('deck-list-section');
const deckListEl          = $('deck-list');
const selectedSection     = $('selected-deck-section');
const deckNameEl          = $('deck-name');
const deckCountEl         = $('deck-count');

// ── Load index.json on startup ──
async function loadIndex() {
  try {
    const res = await fetch('index.json');
    if (!res.ok) return; // no index.json → silently skip
    const index = await res.json();
    if (!Array.isArray(index) || index.length === 0) return;
    renderDeckList(index);
  } catch {
    // fetch failed (local file:// or missing) → skip
  }
}

function deckInitials(name) {
  // Take up to 2 words, first letter each → "Capitali del Mondo" → "CM"
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

// Palette of accent colors cycled by index
const BADGE_COLORS = [
  ['#e8ff47', '#1a1a0a'],
  ['#47d4ff', '#0a1a1f'],
  ['#ff9f47', '#1f120a'],
  ['#c847ff', '#180a1f'],
  ['#4fffb0', '#0a1f16'],
  ['#ff4f6a', '#1f0a0e'],
];

function renderDeckList(index) {
  deckListEl.innerHTML = '';
  index.forEach((entry, i) => {
    const [bg, fg] = BADGE_COLORS[i % BADGE_COLORS.length];
    const initials  = deckInitials(entry.name);
    const item = document.createElement('button');
    item.className = 'deck-list-item';
    item.innerHTML = `
      <div class="deck-list-badge" style="background:${bg};color:${fg}">${initials}</div>
      <div class="deck-list-info">
        <div class="deck-list-name">${escHtml(entry.name)}</div>
        <div class="deck-list-meta">${entry.description || (entry.cards ? `${entry.cards} carte` : 'Tocca per caricare')}</div>
      </div>
    `;
    item.addEventListener('click', () => loadDeckFromEntry(entry, item));
    deckListEl.appendChild(item);
  });
  deckListSection.classList.remove('hidden');
}

async function loadDeckFromEntry(entry, itemEl) {
  // deselect all
  deckListEl.querySelectorAll('.deck-list-item').forEach(el => el.classList.remove('selected'));

  try {
    const res  = await fetch(entry.file);
    if (!res.ok) throw new Error('not found');
    const data = await res.json();
    loadDeck(data);
    itemEl.classList.add('selected');
  } catch {
    alert(`Impossibile caricare "${entry.file}". Assicurati che il file sia nella stessa cartella di index.html.`);
  }
}

// ── Drag & drop ──
uploadZone.addEventListener('dragover', e => {
  e.preventDefault();
  uploadZone.classList.add('drag-over');
});
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  const file = e.dataTransfer?.files?.[0];
  if (file) loadFile(file);
});

fileInput.addEventListener('change', e => {
  const file = e.target.files?.[0];
  if (file) loadFile(file);
  fileInput.value = '';
});

function loadFile(file) {
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      // deselect any list item (manual load)
      deckListEl.querySelectorAll('.deck-list-item').forEach(el => el.classList.remove('selected'));
      loadDeck(data);
    } catch {
      alert('Errore: file JSON non valido.');
    }
  };
  reader.readAsText(file);
}

function loadDeck(data) {
  if (Array.isArray(data)) {
    deck = { name: 'Mazzo', cards: data };
  } else if (data.cards && Array.isArray(data.cards)) {
    deck = data;
  } else {
    alert('Formato JSON non riconosciuto. Vedi README.');
    return;
  }

  const valid = deck.cards.filter(c => c.side1);
  if (valid.length === 0) {
    alert('Nessuna carta valida. Ogni carta deve avere almeno "side1".');
    return;
  }
  deck.cards = valid;
  cards = [...deck.cards];

  deckNameEl.textContent  = deck.name || 'Mazzo';
  deckCountEl.textContent = `${deck.cards.length} ${deck.cards.length === 1 ? 'carta' : 'carte'}`;
  selectedSection.classList.remove('hidden');
}

$('btn-deselect').addEventListener('click', () => {
  deck = null; cards = [];
  selectedSection.classList.add('hidden');
  deckListEl.querySelectorAll('.deck-list-item').forEach(el => el.classList.remove('selected'));
});

$('btn-start-normal').addEventListener('click', () => startStudy(false));
$('btn-start-quiz').addEventListener('click', () => startQuiz());

$('btn-load-sample').addEventListener('click', () => {
  deckListEl.querySelectorAll('.deck-list-item').forEach(el => el.classList.remove('selected'));
  loadDeck(SAMPLE_DECK);
});

// Start loading index on boot
loadIndex();

/* ══════════════════
   STUDY MODE
══════════════════ */
function startStudy(shuffled) {
  if (!deck) return;
  cards = [...deck.cards];
  if (shuffled) shuffle(cards);
  studyIndex = 0;
  sideIndex  = 0;
  hintShown  = false;
  showScreen('study');
  renderStudyCard();
}

$('btn-back').addEventListener('click', () => showScreen('home'));
$('btn-shuffle').addEventListener('click', () => {
  shuffle(cards);
  studyIndex = 0;
  sideIndex  = 0;
  renderStudyCard();
});

const FALLBACK_LABELS = ['Fronte', 'Retro', 'Extra 1', 'Extra 2'];

function getSidesOf(card) {
  const sides = [];
  for (let i = 1; i <= 4; i++) {
    if (card[`side${i}`] === undefined) continue;
    // Priority: card-level label > deck-level label > built-in fallback
    const label = card[`label${i}`]
      || deck?.labels?.[i - 1]
      || FALLBACK_LABELS[i - 1];
    sides.push({
      content: card[`side${i}`],
      label,
      note:  card[`note${i}`]  || null,
      image: card[`image${i}`] || null,
    });
  }
  return sides;
}

function renderStudyCard() {
  const card  = cards[studyIndex];
  const sides = getSidesOf(card);

  // Progress
  const pct = ((studyIndex + 1) / cards.length) * 100;
  $('progress-fill').style.width = pct + '%';
  $('progress-text').textContent = `${studyIndex + 1} / ${cards.length}`;

  // Build sides — all hidden, first one active
  const inner = $('card-inner');
  inner.innerHTML = '';

  sides.forEach((s, idx) => {
    const div = document.createElement('div');
    div.className = 'card-side' + (idx === 0 ? ' active' : '');
    div.dataset.index = idx;
    div.innerHTML = `
      <span class="side-tag side-${idx}">${s.label}</span>
      ${s.image ? `<img src="${s.image}" class="card-image" alt="" />` : ''}
      <p class="card-text">${escHtml(s.content)}</p>
      ${s.note ? `<p class="card-note">${escHtml(s.note)}</p>` : ''}
    `;
    inner.appendChild(div);
  });

  // Side dots
  const dotsEl = $('side-dots');
  dotsEl.innerHTML = '';
  if (sides.length > 1) {
    sides.forEach((_, idx) => {
      const d = document.createElement('span');
      d.className = 'side-dot' + (idx === 0 ? ' active' : '');
      d.addEventListener('click', e => { e.stopPropagation(); goToSide(idx); });
      dotsEl.appendChild(d);
    });
  }

  sideIndex = 0;
  $('side-label').textContent = sides[0]?.label || '';

  // Swipe hint once
  if (!hintShown && sides.length > 1) {
    const hint = $('swipe-hint');
    hint.classList.remove('hidden');
    setTimeout(() => hint.classList.add('hidden'), 2500);
    hintShown = true;
  } else {
    $('swipe-hint').classList.add('hidden');
  }
}

function goToSide(nextIdx) {
  const card  = cards[studyIndex];
  const sides = getSidesOf(card);
  if (nextIdx < 0 || nextIdx >= sides.length || nextIdx === sideIndex) return;

  const goingRight = nextIdx > sideIndex;
  const allSides   = $('card-inner').querySelectorAll('.card-side');
  const current    = allSides[sideIndex];
  const next       = allSides[nextIdx];
  if (!current || !next) return;

  // Prepare next side off-screen (direction-aware)
  next.classList.remove('active', 'slide-from-left');
  if (!goingRight) next.classList.add('slide-from-left');
  // force reflow so transition fires
  next.getBoundingClientRect();

  // Slide out current, slide in next
  current.style.transition = 'opacity .28s ease, transform .28s ease';
  current.style.opacity    = '0';
  current.style.transform  = goingRight ? 'translateX(-48px)' : 'translateX(48px)';
  current.style.position   = 'absolute';

  next.classList.add('active');

  // After transition, clean up current
  const cleanup = () => {
    current.classList.remove('active');
    current.style.cssText = '';  // reset inline styles
    current.removeEventListener('transitionend', cleanup);
  };
  current.addEventListener('transitionend', cleanup, { once: true });

  sideIndex = nextIdx;
  updateSideUI(sides);
}

function updateSideUI(sides) {
  $('side-label').textContent = sides[sideIndex]?.label || '';
  const dots = $('side-dots').querySelectorAll('.side-dot');
  dots.forEach((d, i) => d.classList.toggle('active', i === sideIndex));
}

// Card tap → next side
$('study-card').addEventListener('click', () => {
  const sides = getSidesOf(cards[studyIndex]);
  goToSide((sideIndex + 1) % sides.length);
});

// Nav buttons
$('btn-prev').addEventListener('click', () => {
  if (studyIndex > 0) {
    studyIndex--;
    sideIndex = 0;
    renderStudyCard();
  }
});
$('btn-next').addEventListener('click', () => {
  if (studyIndex < cards.length - 1) {
    studyIndex++;
    sideIndex = 0;
    renderStudyCard();
  }
});

// Swipe support
let touchStartX = null;
let touchStartY = null;

$('card-arena').addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

$('card-arena').addEventListener('touchend', e => {
  if (touchStartX === null) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
    if (dx < 0 && studyIndex < cards.length - 1) { studyIndex++; sideIndex = 0; renderStudyCard(); }
    if (dx > 0 && studyIndex > 0)                 { studyIndex--; sideIndex = 0; renderStudyCard(); }
  } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 40) {
    const sides = getSidesOf(cards[studyIndex]);
    goToSide((sideIndex + 1) % sides.length);
  }
  touchStartX = null;
  touchStartY = null;
}, { passive: true });

/* ══════════════════
   QUIZ MODE
══════════════════ */
function startQuiz() {
  if (!deck) return;
  quizCards  = shuffle([...deck.cards]);
  quizIndex  = 0;
  quizScore  = 0;
  showScreen('quiz');
  renderQuizCard();
}

$('btn-back-quiz').addEventListener('click', () => showScreen('home'));

function renderQuizCard() {
  const card = quizCards[quizIndex];

  // Progress
  const pct = ((quizIndex + 1) / quizCards.length) * 100;
  $('quiz-progress-fill').style.width = pct + '%';
  $('quiz-progress-text').textContent = `${quizIndex + 1} / ${quizCards.length}`;
  $('score-badge').textContent = quizScore;

  // Determine question & answer
  // If card has multiple_choice array → use it
  // Else: question = side1, answer = side2, distractors from other cards' side2
  const feedback = $('quiz-feedback');
  const nextBtn  = $('btn-quiz-next');
  feedback.textContent = '';
  nextBtn.classList.add('hidden');

  if (card.multiple_choice && Array.isArray(card.multiple_choice)) {
    renderMultipleChoice(card);
  } else {
    renderFlipQuiz(card);
  }
}

function renderFlipQuiz(card) {
  $('quiz-question').textContent = card.side1;

  const correctAnswer = card.side2;
  const distractors = quizCards
    .filter(c => c !== card && c.side2)
    .map(c => c.side2)
    .sort(() => Math.random() - .5)
    .slice(0, 3);

  const options = shuffle([correctAnswer, ...distractors]);

  const optsEl = $('quiz-options');
  optsEl.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.textContent = opt;
    btn.addEventListener('click', () => handleAnswer(btn, opt === correctAnswer, correctAnswer));
    optsEl.appendChild(btn);
  });
}

function renderMultipleChoice(card) {
  $('quiz-question').textContent = card.side1;

  const optsEl = $('quiz-options');
  optsEl.innerHTML = '';

  const opts = shuffle([...card.multiple_choice]);
  opts.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.textContent = opt.text;
    btn.addEventListener('click', () => {
      const isCorrect = !!opt.correct;
      const correctText = card.multiple_choice.find(o => o.correct)?.text || '';
      handleAnswer(btn, isCorrect, correctText);
    });
    optsEl.appendChild(btn);
  });
}

function handleAnswer(btn, isCorrect, correctAnswer) {
  const allOpts = $('quiz-options').querySelectorAll('.quiz-option');
  allOpts.forEach(b => b.classList.add('disabled'));

  const feedback = $('quiz-feedback');
  const nextBtn  = $('btn-quiz-next');

  if (isCorrect) {
    btn.classList.add('correct');
    quizScore++;
    $('score-badge').textContent = quizScore;
    feedback.textContent = '✓ Corretto!';
    feedback.style.color = 'var(--correct)';
  } else {
    btn.classList.add('wrong');
    // highlight correct
    allOpts.forEach(b => { if (b.textContent === correctAnswer) b.classList.add('correct'); });
    feedback.textContent = `✗ La risposta era: ${correctAnswer}`;
    feedback.style.color = 'var(--wrong)';
  }

  nextBtn.classList.remove('hidden');
}

$('btn-quiz-next').addEventListener('click', () => {
  quizIndex++;
  if (quizIndex >= quizCards.length) {
    showResults();
  } else {
    renderQuizCard();
  }
});

/* ══════════════════
   RESULTS
══════════════════ */
function showResults() {
  showScreen('results');
  const pct = Math.round((quizScore / quizCards.length) * 100);
  $('results-score').textContent = `${quizScore} / ${quizCards.length}`;
  $('results-detail').textContent = `${pct}% di risposte corrette`;

  let emoji = '😅';
  if (pct >= 90) emoji = '🏆';
  else if (pct >= 70) emoji = '🎉';
  else if (pct >= 50) emoji = '👍';
  $('results-emoji').textContent = emoji;
}

$('btn-retry').addEventListener('click', () => startQuiz());
$('btn-home-from-results').addEventListener('click', () => showScreen('home'));

/* ══════════════════
   UTILS
══════════════════ */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ══════════════════
   SERVICE WORKER
══════════════════ */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

/* ══════════════════
   SAMPLE DECK
══════════════════ */
const SAMPLE_DECK = {
  "name": "Capitali del Mondo",
  "labels": ["Paese", "Capitale", "Continente", "Curiosità"],
  "cards": [
    {
      "side1": "Italia",
      "side2": "Roma",
      "side3": "Europa"
    },
    {
      "side1": "Francia",
      "side2": "Parigi",
      "side3": "Europa"
    },
    {
      "side1": "Giappone",
      "side2": "Tokyo",
      "side3": "Asia",
      "side4": "東京 in giapponese"
    },
    {
      "side1": "Brasile",
      "side2": "Brasilia"
    },
    {
      "side1": "Australia",
      "side2": "Canberra",
      "note2": "Non Sydney!"
    },
    {
      "side1": "Qual è la capitale del Canada?",
      "side2": "Ottawa",
      "label1": "Domanda",
      "label2": "Risposta",
      "multiple_choice": [
        { "text": "Toronto",   "correct": false },
        { "text": "Ottawa",    "correct": true  },
        { "text": "Montreal",  "correct": false },
        { "text": "Vancouver", "correct": false }
      ]
    },
    {
      "side1": "Quale città è la capitale della Spagna?",
      "side2": "Madrid",
      "label1": "Domanda",
      "label2": "Risposta",
      "multiple_choice": [
        { "text": "Barcellona", "correct": false },
        { "text": "Siviglia",   "correct": false },
        { "text": "Madrid",     "correct": true  },
        { "text": "Valencia",   "correct": false }
      ]
    }
  ]
};
