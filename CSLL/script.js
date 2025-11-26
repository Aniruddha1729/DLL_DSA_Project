/*********************************************************
 * Circular Singly Linked List Interactive Animation
 *  - Single direction pointers (only .next)
 *  - Tail.next points back to head (circular)
 *  - Step-by-step visualization
 *********************************************************/

const stage = document.getElementById('stage');
const svg   = document.getElementById('arrowLayer');
const codePanel = document.getElementById('codePanel');

const inputValue     = document.getElementById('inputValue');
const btnInsertAfter = document.getElementById('btnInsertAfter');
const btnDelete      = document.getElementById('btnDelete');
const btnReset       = document.getElementById('btnReset');

const stepsListEl    = document.getElementById('stepsList');
const stepsOpLabel   = document.getElementById('stepsOperationLabel');

let csll = [];         // { id, value, el }
let selectedId = null;
let nextId = 1;

/* --- Configuration --- */
const CONFIG = {
  startX: 40,
  baseY: 95,
  spacing: cssInt('--spacing', 160),
  nodeWidth: cssInt('--node-width', 86),
  nodeHeight: cssInt('--node-height', 64),
  arrowMargin: 14,
  forwardYOffset: 0,
  closureDepth: cssInt('--closure-depth', 90),
  transitionDurationMs: 700
};

// Step reveal interval (ms)
const STEP_INTERVAL = 950;

// Flags
const DRAW_DURING_TRANSITION = false;

// Animation tracking
let animFrameId = null;
let pendingTransitions = 0;
let transitionRedrawScheduled = false;
let transitionTimeoutId = null;

/* ------------- Utility ------------- */
function cssInt(varName, fallback) {
  const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return val ? parseInt(val) : fallback;
}

function log(lines) {
  codePanel.textContent = lines.join('\n');
}

/* ------------- Step Manager ------------- */
let currentStepTimer = null;
let currentSteps = [];
let currentStepIndex = -1;
let currentOperation = 'Idle';

function clearSteps() {
  if (currentStepTimer) clearTimeout(currentStepTimer);
  currentSteps = [];
  currentStepIndex = -1;
  stepsListEl.innerHTML = '';
  currentOperation = 'Idle';
  stepsOpLabel.textContent = currentOperation;
}

function startSteps(operationTitle, stepsArray) {
  clearSteps();
  currentOperation = operationTitle;
  stepsOpLabel.textContent = operationTitle;
  currentSteps = stepsArray.slice();
  stepsArray.forEach((s, i) => {
    const li = document.createElement('li');
    li.className = 'step pending';
    li.dataset.index = i;
    li.innerHTML = `
      <span class="stepBadge">${i + 1}</span>
      <div class="stepText">${s}</div>
      <div class="stepProgress"></div>
    `;
    stepsListEl.appendChild(li);
  });
  stepsListEl.scrollTop = 0;
  revealNextStep();
}

function revealNextStep() {
  currentStepIndex++;
  if (currentStepIndex >= currentSteps.length) {
    return;
  }
  for (let i = 0; i < currentSteps.length; i++) {
    const el = stepsListEl.querySelector(`.step[data-index="${i}"]`);
    if (!el) continue;
    if (i < currentStepIndex) {
      el.classList.remove('current','pending');
      el.classList.add('done');
    } else if (i === currentStepIndex) {
      el.classList.remove('pending','done');
      el.classList.add('current');
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } else {
      el.classList.remove('current','done');
      el.classList.add('pending');
    }
  }
  currentStepTimer = setTimeout(revealNextStep, STEP_INTERVAL);
}

function finishSteps(extraStepText) {
  if (extraStepText) {
    currentSteps.push(extraStepText);
    const i = currentSteps.length - 1;
    const li = document.createElement('li');
    li.className = 'step pending';
    li.dataset.index = i;
    li.innerHTML = `
      <span class="stepBadge">${i + 1}</span>
      <div class="stepText">${extraStepText}</div>
      <div class="stepProgress"></div>
    `;
    stepsListEl.appendChild(li);
  }
  if (currentStepTimer) clearTimeout(currentStepTimer);
  const all = stepsListEl.querySelectorAll('.step');
  all.forEach(el => {
    el.classList.remove('pending','current');
    el.classList.add('done');
  });
}

/* ------------- Arrow + Node Logic ------------- */
function createDefsIfNeeded() {
  if (svg.querySelector('defs')) return;
  const defs = document.createElementNS(svg.namespaceURI, 'defs');
  const markers = [
    { id: 'arrowHeadForward', color: '#2fa4ff' },
    { id: 'arrowHeadClosure', color: '#f4c04a' }
  ];
  markers.forEach(m => {
    const marker = document.createElementNS(svg.namespaceURI, 'marker');
    marker.setAttribute('id', m.id);
    marker.setAttribute('markerWidth','14');
    marker.setAttribute('markerHeight','14');
    marker.setAttribute('refX','10');
    marker.setAttribute('refY','7');
    marker.setAttribute('orient','auto');
    marker.innerHTML = `<path d="M0,0 L14,7 L0,14 z" fill="${m.color}"/>`;
    defs.appendChild(marker);
  });
  svg.appendChild(defs);
}

function nodeDom(value) {
  const div = document.createElement('div');
  div.className = 'node';
  div.textContent = value;
  div.dataset.id = nextId;
  div.addEventListener('click', () => selectNode(parseInt(div.dataset.id)));
  stage.appendChild(div);
  return div;
}

function addNode(value, index = csll.length) {
  const el = nodeDom(value);
  const node = { id: nextId++, value, el };
  csll.splice(index, 0, node);
  el.classList.add('highlight');
  setTimeout(() => el.classList.remove('highlight'), 1500);
  layoutAndSyncArrows();
  return node;
}

function positionNodes() {
  csll.forEach((n, i) => {
    const x = CONFIG.startX + i * CONFIG.spacing;
    n.el.style.left = `${x}px`;
    n.el.style.top  = `${CONFIG.baseY}px`;
  });
}

function clearArrows() {
  [...svg.querySelectorAll('.arrow, .selfText')].forEach(e => e.remove());
}

function redrawArrows() {
  clearArrows();
  createDefsIfNeeded();

  const count = csll.length;
  if (count === 0) return;
  
  if (count === 1) {
    drawSelfLoop(0);
    return;
  }
  
  // Draw horizontal arrows between consecutive nodes
  for (let i = 0; i < count - 1; i++) {
    drawHorizontalArrow(i, i + 1);
  }
  
  // Draw closure arc from tail to head
  drawClosureArc(count - 1, 0);
}

function logicalRect(index) {
  const left = CONFIG.startX + index * CONFIG.spacing;
  const top = CONFIG.baseY;
  return {
    left, right: left + CONFIG.nodeWidth,
    top, bottom: top + CONFIG.nodeHeight
  };
}

function drawHorizontalArrow(iA, iB) {
  const a = logicalRect(iA);
  const b = logicalRect(iB);
  const yCenter = CONFIG.baseY + CONFIG.nodeHeight / 2;
  const x1 = a.right + CONFIG.arrowMargin;
  const x2 = b.left - CONFIG.arrowMargin;
  if (x2 - x1 < 25) return;

  const forward = document.createElementNS(svg.namespaceURI,'line');
  forward.classList.add('arrow','forward');
  forward.setAttribute('x1', x1);
  forward.setAttribute('y1', yCenter + CONFIG.forwardYOffset);
  forward.setAttribute('x2', x2);
  forward.setAttribute('y2', yCenter + CONFIG.forwardYOffset);
  forward.setAttribute('marker-end', 'url(#arrowHeadForward)');
  svg.appendChild(forward);
}

function drawClosureArc(iTail, iHead) {
  const t = logicalRect(iTail);
  const h = logicalRect(iHead);
  const startX = t.right + CONFIG.arrowMargin;
  const endX   = h.left - CONFIG.arrowMargin;
  const baseY  = CONFIG.baseY + CONFIG.nodeHeight / 2;
  const arcY   = baseY + CONFIG.closureDepth;
  const span   = Math.abs(endX - startX);
  const cpOffset = Math.max(span / 3, 140);

  const forwardPath = document.createElementNS(svg.namespaceURI,'path');
  forwardPath.classList.add('arrow','closure','forward');
  forwardPath.setAttribute('d', `M ${startX} ${baseY + CONFIG.forwardYOffset}
    C ${startX + cpOffset} ${arcY}, ${endX - cpOffset} ${arcY}, ${endX} ${baseY + CONFIG.forwardYOffset}`);
  forwardPath.setAttribute('marker-end','url(#arrowHeadClosure)');
  svg.appendChild(forwardPath);
}

function drawSelfLoop(index) {
  const r = logicalRect(index);
  const cx = (r.left + r.right) / 2;
  const topY = r.top - 30;

  const pathF = document.createElementNS(svg.namespaceURI,'path');
  pathF.setAttribute('d', `M ${cx - 25} ${topY} Q ${cx} ${topY - 55} ${cx + 25} ${topY} Q ${cx} ${topY - 25} ${cx - 25} ${topY}`);
  pathF.classList.add('arrow','loop','forward');
  pathF.setAttribute('marker-end','url(#arrowHeadForward)');
  svg.appendChild(pathF);

  const label = document.createElementNS(svg.namespaceURI,'text');
  label.setAttribute('x', cx);
  label.setAttribute('y', topY - 55);
  label.setAttribute('text-anchor','middle');
  label.classList.add('selfText');
  label.textContent = 'self-loop';
  svg.appendChild(label);
}

/* -------- Transition Coordination -------- */
function attachTransitionListeners() {
  csll.forEach(n => {
    n.el.removeEventListener('transitionstart', onNodeTransitionStart);
    n.el.removeEventListener('transitionend', onNodeTransitionEnd);
    n.el.addEventListener('transitionstart', onNodeTransitionStart);
    n.el.addEventListener('transitionend', onNodeTransitionEnd);
  });
}

function onNodeTransitionStart(e) {
  if (e.propertyName === 'left' || e.propertyName === 'top') {
    pendingTransitions++;
  }
}

function onNodeTransitionEnd(e) {
  if (e.propertyName === 'left' || e.propertyName === 'top') {
    pendingTransitions = Math.max(0, pendingTransitions - 1);
    if (pendingTransitions === 0) scheduleFinalRedraw();
  }
}

function scheduleFinalRedraw() {
  if (transitionRedrawScheduled) return;
  transitionRedrawScheduled = true;
  setTimeout(() => {
    transitionRedrawScheduled = false;
    redrawArrows();
    if (DRAW_DURING_TRANSITION) stopPerFrameRedraw();
  }, 30);
}

function layoutAndSyncArrows() {
  positionNodes();
  attachTransitionListeners();
  if (DRAW_DURING_TRANSITION) startPerFrameRedraw();
  redrawArrows();
  if (transitionTimeoutId) clearTimeout(transitionTimeoutId);
  transitionTimeoutId = setTimeout(() => {
    pendingTransitions = 0;
    scheduleFinalRedraw();
  }, CONFIG.transitionDurationMs + 120);
}

function startPerFrameRedraw() {
  if (animFrameId != null) cancelAnimationFrame(animFrameId);
  const loop = () => {
    redrawArrows();
    animFrameId = requestAnimationFrame(loop);
  };
  animFrameId = requestAnimationFrame(loop);
}

function stopPerFrameRedraw() {
  if (animFrameId != null) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
}

/* -------- Interaction Logic -------- */
function selectNode(id) {
  if (!csll.find(n => n.id === id)) return;
  selectedId = id;
  csll.forEach(n => n.el.classList.toggle('selected', n.id === id));
  btnInsertAfter.disabled = false;
  btnDelete.disabled = false;

  const idx = csll.findIndex(n => n.id === id);
  log([
    `Selected node value = ${csll[idx].value}`,
    '',
    'Circular property:',
    'tail.next == head (single direction)'
  ]);

  startSteps('Select Node', [
    'User clicks node S',
    'Mark S as selected (highlight)',
    'Enable Insert After and Delete buttons',
    'Ready for operation'
  ]);
}

function insertAfterSelected() {
  if (selectedId == null) return;
  const valueStr = inputValue.value.trim();
  if (valueStr === '') return flashInput();
  const value = parseInt(valueStr);
  if (Number.isNaN(value)) return flashInput();

  const idx = csll.findIndex(n => n.id === selectedId);

  startSteps('Insert After', [
    'Identify selected node S',
    'Let A = S.next',
    'Allocate new node N with value',
    'Set N.next = A',
    'Link S.next = N',
    'Maintain circular closure (tail → head)',
    'Insertion complete'
  ]);

  addNode(value, idx + 1);
  const selNode = csll[idx];

  log([
    `Insert value ${value} after node (${selNode.value})`,
    '',
    'Steps (CSLL):',
    'N = new Node(value)',
    'A = S.next',
    'N.next = A',
    'S.next = N'
  ]);
}

function flashInput() {
  inputValue.style.outline = '2px solid var(--danger)';
  setTimeout(()=> inputValue.style.outline = 'none', 900);
}

function deleteSelected() {
  if (selectedId == null) return;
  const idx = csll.findIndex(n => n.id === selectedId);
  if (idx < 0) return;
  const node = csll[idx];

  // Single-node case
  if (csll.length === 1) {
    startSteps('Delete Sole Node', [
      'Identify sole node X',
      'Since X.next == X (only node)',
      'Set head = null',
      'Remove X',
      'List becomes empty'
    ]);

    log([
      `Deleting sole node (${node.value})`,
      'head = null afterwards'
    ]);
    node.el.classList.add('deleting');
    setTimeout(() => {
      node.el.classList.add('fadeout');
      setTimeout(() => {
        node.el.remove();
        csll = [];
        selectedId = null;
        btnInsertAfter.disabled = true;
        btnDelete.disabled = true;
        redrawArrows();
        log(['List empty. Insert to create new self-loop.']);
      }, 500);
    }, 250);
    return;
  }

  // Multi-node deletion
  startSteps('Delete Node', [
    'Identify node X to delete',
    'Find predecessor P (P.next == X)',
    'Let N = X.next',
    'Set P.next = N',
    'If X is head: head = N',
    'Visually remove (fade) X',
    'Re-draw arrows (including closure arc)',
    'Deletion complete'
  ]);

  log([
    `Deleting node value ${node.value}`,
    '',
    'CSLL steps:',
    'Find P where P.next = X',
    'N = X.next',
    'P.next = N',
    'If X == head: head = N'
  ]);

  node.el.classList.add('deleting');
  setTimeout(() => {
    node.el.classList.add('fadeout');
    setTimeout(() => {
      node.el.remove();
      csll.splice(idx, 1);
      const newSel = csll[Math.min(idx, csll.length - 1)];
      selectedId = newSel.id;
      csll.forEach(n => n.el.classList.toggle('selected', n.id === selectedId));
      layoutAndSyncArrows();
      log([
        `Node deleted. Selected: ${newSel.value}`,
        `Current order: ${csll.map(n=>n.value).join(' → ')} → (back to head)`
      ]);
    }, 500);
  }, 250);
}

function resetList() {
  stopPerFrameRedraw();
  csll.forEach(n => n.el.remove());
  csll = [];
  selectedId = null;
  nextId = 1;
  clearArrows();
  btnInsertAfter.disabled = true;
  btnDelete.disabled = true;
  inputValue.value = '';
  [10,20,30,50].forEach(v => addNode(v));
  log([
    'Circular list initialized: 10 → 20 → 30 → 50 → (back to 10)',
    'Select a node to operate.'
  ]);
  startSteps('Initialize', [
    'Create nodes: 10, 20, 30, 50',
    'Arrange nodes horizontally',
    'Set each .next pointer (circular)',
    'Draw horizontal arrows',
    'Draw tail→head arc below',
    'Initialization complete'
  ]);
}

/* ---------- Init ---------- */
function init() {
  resetList();
  window.addEventListener('resize', () => redrawArrows());
  btnInsertAfter.addEventListener('click', insertAfterSelected);
  btnDelete.addEventListener('click', deleteSelected);
  btnReset.addEventListener('click', resetList);
  document.addEventListener('keydown', e => {
    if (e.key === 'i' && !btnInsertAfter.disabled) insertAfterSelected();
    else if (e.key === 'Delete' && !btnDelete.disabled) deleteSelected();
  });
}

init();
