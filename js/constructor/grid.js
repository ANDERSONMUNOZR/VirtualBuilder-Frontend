// Tamaño del mundo y conversión entre "celdas" (coordenadas enteras de la cuadrícula)
// y posiciones 3D de Three.js. La celda (0,0,0) es la esquina inferior del área de construcción.
// Este mismo sistema de coordenadas es el que se enviará a Minecraft en el DLC.

export const WORLD_SIZE = Object.freeze({ x: 32, y: 32, z: 32 });

/** Centro 3D de una celda (el suelo está centrado en el origen). */
export function cellCenter(x, y, z) {
  return {
    x: x - WORLD_SIZE.x / 2 + 0.5,
    y: y + 0.5,
    z: z - WORLD_SIZE.z / 2 + 0.5,
  };
}

/** Celda que contiene un punto 3D. */
export function pointToCell(point) {
  return {
    x: Math.floor(point.x + WORLD_SIZE.x / 2),
    y: Math.floor(point.y),
    z: Math.floor(point.z + WORLD_SIZE.z / 2),
  };
}
