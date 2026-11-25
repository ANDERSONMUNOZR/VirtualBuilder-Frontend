// Modelo de datos del mundo: qué bloque hay en cada celda.
// No sabe nada de 3D ni de la interfaz: solo guarda datos y avisa cuando cambian.
// Cada cambio se comunica como un "diff": { x, y, z, before, after }.

import { WORLD_SIZE } from './grid.js';

export class World extends EventTarget {
  constructor(size = WORLD_SIZE) {
    super();
    this.size = size;
    this.blocks = new Map(); // clave "x,y,z" -> id del bloque
  }

  static key(x, y, z) {
    return `${x},${y},${z}`;
  }

  get count() {
    return this.blocks.size;
  }

  inBounds(x, y, z) {
    return (
      Number.isInteger(x) && Number.isInteger(y) && Number.isInteger(z) &&
      x >= 0 && x < this.size.x &&
      y >= 0 && y < this.size.y &&
      z >= 0 && z < this.size.z
    );
  }

  get(x, y, z) {
    return this.blocks.get(World.key(x, y, z)) ?? null;
  }

  /**
   * Aplica una lista de cambios [{ x, y, z, block }] (block = null significa quitar).
   * `source` indica quién hizo el cambio (usuario, deshacer, gestos, minecraft...).
   * `recordable` indica si el historial debe guardarlo para poder deshacerlo.
   * Devuelve el diff con lo que realmente cambió.
   */
  apply(changes, { source = 'user', recordable = true } = {}) {
    const diff = [];
    for (const { x, y, z, block } of changes) {
      if (!this.inBounds(x, y, z)) continue;
      const key = World.key(x, y, z);
      const before = this.blocks.get(key) ?? null;
      const after = block ?? null;
      if (before === after) continue;
      if (after) this.blocks.set(key, after);
      else this.blocks.delete(key);
      diff.push({ x, y, z, before, after });
    }
    if (diff.length > 0) {
      this.dispatchEvent(new CustomEvent('change', { detail: { diff, source, recordable } }));
    }
    return diff;
  }

  place(x, y, z, block, options) {
    return this.apply([{ x, y, z, block }], options);
  }

  remove(x, y, z, options) {
    return this.apply([{ x, y, z, block: null }], options);
  }

  clear(options) {
    const changes = [];
    this.forEach((x, y, z) => changes.push({ x, y, z, block: null }));
    return this.apply(changes, options);
  }

  /** Recorre todos los bloques: callback(x, y, z, blockId). */
  forEach(callback) {
    for (const [key, block] of this.blocks) {
      const [x, y, z] = key.split(',').map(Number);
      callback(x, y, z, block);
    }
  }

  /** Caja mínima que contiene la construcción, o null si está vacía. */
  bounds() {
    if (this.count === 0) return null;
    const min = { x: Infinity, y: Infinity, z: Infinity };
    const max = { x: -Infinity, y: -Infinity, z: -Infinity };
    this.forEach((x, y, z) => {
      min.x = Math.min(min.x, x); min.y = Math.min(min.y, y); min.z = Math.min(min.z, z);
      max.x = Math.max(max.x, x); max.y = Math.max(max.y, y); max.z = Math.max(max.z, z);
    });
    return { min, max };
  }
}
