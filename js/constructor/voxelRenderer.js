// Dibuja los bloques del mundo. Escucha el evento 'change' del mundo y solo actualiza
// las celdas que cambiaron (no redibuja todo cada vez).

import * as THREE from 'three';
import { cellCenter } from './grid.js';
import { getBlock } from './materials.js';
import { getBlockTexture } from './textures.js';

export class VoxelRenderer {
  constructor(scene, world) {
    this.geometry = new THREE.BoxGeometry(1, 1, 1); // una sola geometría compartida
    this.materials = new Map();
    this.meshes = new Map(); // "x,y,z" -> Mesh
    this.group = new THREE.Group();
    scene.add(this.group);

    world.forEach((x, y, z, block) => this.update({ x, y, z, after: block }));
    world.addEventListener('change', (event) => {
      for (const change of event.detail.diff) this.update(change);
    });
  }

  /** Mallas contra las que el mouse (o la mano) puede apuntar. */
  get pickables() {
    return this.group.children;
  }

  getMaterial(blockId) {
    if (!this.materials.has(blockId)) {
      const block = getBlock(blockId);
      const texture = getBlockTexture(block);
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: block.shine ? 0.35 : 0.9,
        metalness: block.shine ? 0.35 : 0,
      });
      if (block.transparent) material.transparent = true;
      if (block.emissive) {
        material.emissive = new THREE.Color(0xffffff);
        material.emissiveMap = texture;
        material.emissiveIntensity = 0.85;
      }
      this.materials.set(blockId, material);
    }
    return this.materials.get(blockId);
  }

  update({ x, y, z, after }) {
    const key = `${x},${y},${z}`;
    const mesh = this.meshes.get(key);

    if (!after) {
      if (mesh) {
        this.group.remove(mesh);
        this.meshes.delete(key);
      }
      return;
    }

    const block = getBlock(after);
    if (!block) return;
    const material = this.getMaterial(after);

    if (mesh) {
      mesh.material = material;
      mesh.castShadow = !block.transparent;
      return;
    }

    const newMesh = new THREE.Mesh(this.geometry, material);
    const position = cellCenter(x, y, z);
    newMesh.position.set(position.x, position.y, position.z);
    newMesh.castShadow = !block.transparent;
    newMesh.receiveShadow = true;
    newMesh.userData.cell = { x, y, z };
    this.group.add(newMesh);
    this.meshes.set(key, newMesh);
  }
}
