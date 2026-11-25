// Cubo "fantasma" que muestra dónde va a actuar la herramienta.
// Su color depende de la herramienta: cian = colocar, rojo = borrar, violeta = pintar, amarillo = cuentagotas.

import * as THREE from 'three';
import { cellCenter } from './grid.js';

const TOOL_COLORS = {
  place: 0x3ee6d0,
  erase: 0xff5d6c,
  paint: 0x9b7bff,
  pick: 0xffd166,
};

export class BlockCursor {
  constructor(scene) {
    const geometry = new THREE.BoxGeometry(1.04, 1.04, 1.04);
    this.fillMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.2, depthWrite: false });
    this.edgeMaterial = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.95 });

    this.group = new THREE.Group();
    this.group.add(new THREE.Mesh(geometry, this.fillMaterial));
    this.group.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry), this.edgeMaterial));
    this.group.visible = false;
    this.group.renderOrder = 10;
    scene.add(this.group);
  }

  show(cell, tool) {
    const position = cellCenter(cell.x, cell.y, cell.z);
    this.group.position.set(position.x, position.y, position.z);
    const color = TOOL_COLORS[tool] ?? TOOL_COLORS.place;
    this.fillMaterial.color.setHex(color);
    this.edgeMaterial.color.setHex(color);
    this.group.visible = true;
  }

  hide() {
    this.group.visible = false;
  }
}
