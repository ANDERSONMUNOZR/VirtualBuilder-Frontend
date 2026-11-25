// Interfaz alrededor del lienzo 3D: barra de herramientas, deshacer/rehacer, coordenadas,
// bloque actual, estadísticas, botón de limpiar y atajos de teclado.

import { getBlock } from './materials.js';
import { getBlockPreview } from './textures.js';
import { TOOLS } from './editor.js';

const $ = (selector) => document.querySelector(selector);

export function initHud({ world, history, editor, mouse, toast }) {
  const toolButtons = document.querySelectorAll('[data-tool]');
  const undoButton = $('#btn-undo');
  const redoButton = $('#btn-redo');
  const clearButton = $('#btn-clear');

  // --- Herramientas y bloque actual ---
  toolButtons.forEach((button) => {
    button.addEventListener('click', () => editor.setTool(button.dataset.tool));
  });

  const syncEditor = () => {
    toolButtons.forEach((button) => {
      const active = button.dataset.tool === editor.tool;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    const block = getBlock(editor.blockId);
    $('#current-block-img').src = getBlockPreview(block);
    $('#current-block-name').textContent = block.name;
    $('#current-block-mc').textContent = block.mc;
    $('#current-tool').textContent = TOOLS[editor.tool].label;
  };
  editor.addEventListener('statechange', syncEditor);
  syncEditor();

  // --- Deshacer / rehacer ---
  undoButton.addEventListener('click', () => history.undo());
  redoButton.addEventListener('click', () => history.redo());
  const syncHistory = () => {
    undoButton.disabled = !history.canUndo;
    redoButton.disabled = !history.canRedo;
  };
  history.addEventListener('change', syncHistory);
  syncHistory();

  // --- Coordenadas de la celda apuntada ---
  const coords = $('#hud-coords');
  mouse.addEventListener('hover', (event) => {
    const cell = event.detail.cell;
    coords.textContent = cell ? `X ${cell.x} · Y ${cell.y} · Z ${cell.z}` : 'X — · Y — · Z —';
  });

  // --- Estadísticas (se recalculan como máximo una vez por fotograma) ---
  let statsQueued = false;
  const renderStats = () => {
    statsQueued = false;
    $('#stat-count').textContent = world.count;

    const bounds = world.bounds();
    $('#stat-size').textContent = bounds
      ? `${bounds.max.x - bounds.min.x + 1} × ${bounds.max.y - bounds.min.y + 1} × ${bounds.max.z - bounds.min.z + 1}`
      : '—';

    const totals = new Map();
    world.forEach((x, y, z, id) => totals.set(id, (totals.get(id) ?? 0) + 1));
    const list = $('#stat-materials');
    list.replaceChildren(
      ...[...totals]
        .sort((a, b) => b[1] - a[1])
        .map(([id, total]) => {
          const block = getBlock(id);
          const item = document.createElement('li');
          item.innerHTML = `<img src="${getBlockPreview(block)}" alt=""><span>${block.name}</span><strong>${total}</strong>`;
          return item;
        }),
    );

    $('#empty-hint').hidden = world.count > 0;
    clearButton.disabled = world.count === 0;
  };
  world.addEventListener('change', () => {
    if (statsQueued) return;
    statsQueued = true;
    requestAnimationFrame(renderStats);
  });
  renderStats();

  // --- Limpiar (con confirmación en un modal de Bootstrap) ---
  $('#btn-clear-confirm').addEventListener('click', () => {
    const removed = world.clear().length;
    toast(`Se quitaron ${removed} bloques. Puedes recuperarlos con Deshacer (Ctrl+Z).`);
  });

  // --- Atajos de teclado ---
  const toolByKey = Object.fromEntries(Object.entries(TOOLS).map(([id, tool]) => [tool.key, id]));
  document.addEventListener('keydown', (event) => {
    if (event.target.closest('input, textarea, select, [contenteditable]')) return;
    const key = event.key.toLowerCase();
    const ctrl = event.ctrlKey || event.metaKey;

    if (ctrl && key === 'z') {
      event.preventDefault();
      if (event.shiftKey) history.redo();
      else history.undo();
    } else if (ctrl && key === 'y') {
      event.preventDefault();
      history.redo();
    } else if (!ctrl && !event.altKey && toolByKey[key]) {
      editor.setTool(toolByKey[key]);
    }
  });
}
