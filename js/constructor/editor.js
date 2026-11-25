// Estado del editor (herramienta y bloque seleccionados) y las acciones sobre el mundo.
// Recibe un "hit" = { voxel, adjacent }:
//   voxel    -> celda del bloque apuntado (o null si se apunta al suelo)
//   adjacent -> celda vacía junto a la cara apuntada (donde se colocaría un bloque nuevo)
// El mouse produce hits hoy; en la Etapa 3 los gestos de MediaPipe producirán los mismos hits.

import { getBlock } from './materials.js';

export const TOOLS = {
  place: { label: 'Colocar', key: 'b' },
  erase: { label: 'Borrar', key: 'e' },
  paint: { label: 'Pintar', key: 'p' },
  pick: { label: 'Cuentagotas', key: 'i' },
};

export class Editor extends EventTarget {
  constructor(world) {
    super();
    this.world = world;
    this.tool = 'place';
    this.blockId = 'stone';
  }

  setTool(tool) {
    if (!(tool in TOOLS) || tool === this.tool) return;
    this.tool = tool;
    this.notify();
  }

  setBlock(blockId) {
    if (!getBlock(blockId) || blockId === this.blockId) return;
    this.blockId = blockId;
    this.notify();
  }

  /** Celda sobre la que actuaría la herramienta, o null si no hay nada que hacer ahí. */
  targetFor(hit, tool = this.tool) {
    if (!hit) return null;
    const cell = tool === 'place' ? hit.adjacent : hit.voxel;
    if (!cell || !this.world.inBounds(cell.x, cell.y, cell.z)) return null;
    return cell;
  }

  /** Ejecuta la herramienta. Devuelve true si algo cambió. */
  act(hit, tool = this.tool, source = 'user') {
    const cell = this.targetFor(hit, tool);
    if (!cell) return false;
    const { x, y, z } = cell;

    switch (tool) {
      case 'place':
      case 'paint': // pintar = reemplazar el material de un bloque existente
        return this.world.place(x, y, z, this.blockId, { source }).length > 0;
      case 'erase':
        return this.world.remove(x, y, z, { source }).length > 0;
      case 'pick': {
        const blockId = this.world.get(x, y, z);
        if (!blockId) return false;
        this.blockId = blockId;
        this.tool = 'place'; // después de copiar el material, volvemos a colocar
        this.notify();
        return true;
      }
      default:
        return false;
    }
  }

  notify() {
    this.dispatchEvent(new Event('statechange'));
  }
}
