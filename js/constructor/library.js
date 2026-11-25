// Biblioteca de bloques: dibuja las categorías y miniaturas, permite buscar por nombre
// y selecciona el bloque activo en el editor.

import { BLOCKS, CATEGORIES } from './materials.js';
import { getBlockPreview } from './textures.js';

// "Césped" y "cesped" deben coincidir al buscar: quitamos tildes y mayúsculas.
const normalize = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export function initLibrary({ editor, container, searchInput, emptyMessage }) {
  const buttons = new Map();

  for (const category of CATEGORIES) {
    const section = document.createElement('section');
    section.className = 'vb-category';
    section.innerHTML = `<h3 class="vb-category-title">${category.name}</h3>`;
    const grid = document.createElement('div');
    grid.className = 'vb-block-grid';

    for (const block of BLOCKS.filter((b) => b.category === category.id)) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'vb-block';
      button.dataset.block = block.id;
      button.dataset.search = normalize(block.name);
      button.title = `${block.name} · ${block.mc}`;
      button.innerHTML = `<img src="${getBlockPreview(block)}" alt=""><span>${block.name}</span>`;
      button.addEventListener('click', () => {
        editor.setBlock(block.id);
        if (editor.tool === 'erase' || editor.tool === 'pick') editor.setTool('place');
      });
      grid.appendChild(button);
      buttons.set(block.id, button);
    }
    section.appendChild(grid);
    container.appendChild(section);
  }

  const syncSelection = () => {
    for (const [id, button] of buttons) {
      const selected = id === editor.blockId;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    }
  };
  editor.addEventListener('statechange', syncSelection);
  syncSelection();

  searchInput.addEventListener('input', () => {
    const query = normalize(searchInput.value);
    let visibleTotal = 0;
    for (const section of container.querySelectorAll('.vb-category')) {
      let visibleInSection = 0;
      for (const button of section.querySelectorAll('.vb-block')) {
        const match = button.dataset.search.includes(query);
        button.hidden = !match;
        if (match) visibleInSection++;
      }
      section.hidden = visibleInSection === 0;
      visibleTotal += visibleInSection;
    }
    emptyMessage.classList.toggle('d-none', visibleTotal > 0);
  });
}
