// Genera con <canvas> las texturas pixel-art (16x16) de cada bloque y una miniatura
// isométrica para la biblioteca. No se descargan imágenes: todo se dibuja con código.

import * as THREE from 'three';

const SIZE = 16;
const canvasCache = new Map();
const textureCache = new Map();
const previewCache = new Map();

// Números pseudoaleatorios con semilla: el mismo bloque siempre tiene el mismo "ruido".
function hashString(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed) {
  return function next() {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const clamp = (value) => Math.max(0, Math.min(255, Math.round(value)));

function drawBlock(ctx, block) {
  const random = seededRandom(hashString(block.id));
  const base = hexToRgb(block.color);
  const image = ctx.createImageData(SIZE, SIZE);
  const variance = { leaves: 0.5, rough: 0.3 }[block.pattern] ?? 0.14;

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const edge = x === 0 || y === 0 || x === SIZE - 1 || y === SIZE - 1;
      let factor = 1 + (random() - 0.5) * variance;
      let color = base;
      let alpha = 255;

      if (block.pattern === 'planks') {
        if (y % 4 === 3) factor *= 0.7;
      } else if (block.pattern === 'bricks') {
        const row = Math.floor(y / 4);
        const mortar = y % 4 === 3 || (x + (row % 2) * 4) % 8 === 7;
        if (mortar) color = [178, 168, 158];
      } else if (block.pattern === 'glass') {
        const streak = (x === y || x === y + 1) && x > 3 && x < 10;
        alpha = edge ? 235 : streak ? 150 : 45;
        factor = 1.05;
      }
      if (edge && block.pattern !== 'glass') factor *= 0.78;

      const i = (y * SIZE + x) * 4;
      image.data[i] = clamp(color[0] * factor);
      image.data[i + 1] = clamp(color[1] * factor);
      image.data[i + 2] = clamp(color[2] * factor);
      image.data[i + 3] = alpha;
    }
  }
  ctx.putImageData(image, 0, 0);
}

function getBlockCanvas(block) {
  if (!canvasCache.has(block.id)) {
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    drawBlock(canvas.getContext('2d'), block);
    canvasCache.set(block.id, canvas);
  }
  return canvasCache.get(block.id);
}

/** Textura de Three.js para las caras del bloque. */
export function getBlockTexture(block) {
  if (!textureCache.has(block.id)) {
    const texture = new THREE.CanvasTexture(getBlockCanvas(block));
    texture.magFilter = THREE.NearestFilter; // píxeles nítidos, estilo vóxel
    texture.colorSpace = THREE.SRGBColorSpace;
    textureCache.set(block.id, texture);
  }
  return textureCache.get(block.id);
}

/** Miniatura isométrica (imagen PNG en base64) para la biblioteca de bloques. */
export function getBlockPreview(block) {
  if (previewCache.has(block.id)) return previewCache.get(block.id);

  const source = getBlockCanvas(block);
  const canvas = document.createElement('canvas');
  canvas.width = 48;
  canvas.height = 50;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const s = SIZE;

  // Cada cara es la textura deformada con una transformación afín: [cara, sombra].
  const faces = [
    [[20 / s, 10 / s, -20 / s, 10 / s, 24, 4], 'rgba(255,255,255,0.10)'], // arriba
    [[20 / s, 10 / s, 0, 22 / s, 4, 14], 'rgba(0,0,0,0.18)'], // izquierda
    [[20 / s, -10 / s, 0, 22 / s, 24, 24], 'rgba(0,0,0,0.38)'], // derecha
  ];
  for (const [matrix, shade] of faces) {
    ctx.setTransform(...matrix);
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(source, 0, 0);
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = shade;
    ctx.fillRect(0, 0, s, s);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  const url = canvas.toDataURL();
  previewCache.set(block.id, url);
  return url;
}
