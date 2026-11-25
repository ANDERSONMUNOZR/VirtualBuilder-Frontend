// Catálogo de bloques disponibles.
// Cada bloque tiene un id interno, un nombre en español, un color base, una categoría
// y su equivalente en Minecraft Java Edition (campo `mc`), que usará el DLC.

export const CATEGORIES = [
  { id: 'build', name: 'Construcción' },
  { id: 'nature', name: 'Naturaleza' },
  { id: 'color', name: 'Colores' },
  { id: 'special', name: 'Especiales' },
];

export const BLOCKS = [
  { id: 'stone', name: 'Piedra', category: 'build', color: '#7d7d7d', mc: 'minecraft:stone' },
  { id: 'cobblestone', name: 'Adoquín', category: 'build', color: '#6e6e6e', mc: 'minecraft:cobblestone', pattern: 'rough' },
  { id: 'bricks', name: 'Ladrillos', category: 'build', color: '#9c4f3c', mc: 'minecraft:bricks', pattern: 'bricks' },
  { id: 'oak_planks', name: 'Tablas de roble', category: 'build', color: '#b08a55', mc: 'minecraft:oak_planks', pattern: 'planks' },
  { id: 'dark_planks', name: 'Tablas oscuras', category: 'build', color: '#4a3220', mc: 'minecraft:dark_oak_planks', pattern: 'planks' },
  { id: 'quartz', name: 'Cuarzo', category: 'build', color: '#ebe5dc', mc: 'minecraft:quartz_block' },

  { id: 'grass', name: 'Césped', category: 'nature', color: '#5d9b3a', mc: 'minecraft:grass_block' },
  { id: 'dirt', name: 'Tierra', category: 'nature', color: '#86603e', mc: 'minecraft:dirt', pattern: 'rough' },
  { id: 'sand', name: 'Arena', category: 'nature', color: '#dbcf9c', mc: 'minecraft:sand' },
  { id: 'leaves', name: 'Hojas', category: 'nature', color: '#3f7a2a', mc: 'minecraft:oak_leaves', pattern: 'leaves' },
  { id: 'oak_log', name: 'Tronco', category: 'nature', color: '#6b5130', mc: 'minecraft:oak_log', pattern: 'planks' },

  { id: 'white', name: 'Blanco', category: 'color', color: '#e9ecec', mc: 'minecraft:white_wool' },
  { id: 'black', name: 'Negro', category: 'color', color: '#1d1d21', mc: 'minecraft:black_wool' },
  { id: 'red', name: 'Rojo', category: 'color', color: '#b02e26', mc: 'minecraft:red_wool' },
  { id: 'orange', name: 'Naranja', category: 'color', color: '#f07613', mc: 'minecraft:orange_wool' },
  { id: 'yellow', name: 'Amarillo', category: 'color', color: '#f8c527', mc: 'minecraft:yellow_wool' },
  { id: 'lime', name: 'Lima', category: 'color', color: '#70b919', mc: 'minecraft:lime_wool' },
  { id: 'cyan', name: 'Cian', category: 'color', color: '#158991', mc: 'minecraft:cyan_wool' },
  { id: 'light_blue', name: 'Celeste', category: 'color', color: '#3aafd9', mc: 'minecraft:light_blue_wool' },
  { id: 'blue', name: 'Azul', category: 'color', color: '#35399d', mc: 'minecraft:blue_wool' },
  { id: 'purple', name: 'Morado', category: 'color', color: '#792aac', mc: 'minecraft:purple_wool' },
  { id: 'pink', name: 'Rosado', category: 'color', color: '#ed8dac', mc: 'minecraft:pink_wool' },

  { id: 'glass', name: 'Vidrio', category: 'special', color: '#cfeff5', mc: 'minecraft:glass', pattern: 'glass', transparent: true },
  { id: 'gold', name: 'Oro', category: 'special', color: '#f6d03d', mc: 'minecraft:gold_block', shine: true },
  { id: 'diamond', name: 'Diamante', category: 'special', color: '#62ede4', mc: 'minecraft:diamond_block', shine: true },
  { id: 'glowstone', name: 'Piedra luminosa', category: 'special', color: '#f3c46b', mc: 'minecraft:glowstone', emissive: true, pattern: 'rough' },
  { id: 'sea_lantern', name: 'Linterna marina', category: 'special', color: '#b6dcd4', mc: 'minecraft:sea_lantern', emissive: true },
];

const BLOCK_BY_ID = new Map(BLOCKS.map((block) => [block.id, block]));

/** Devuelve la definición de un bloque o undefined si no existe. */
export function getBlock(id) {
  return BLOCK_BY_ID.get(id);
}
