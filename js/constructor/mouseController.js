// Control con mouse (y toque): convierte la posición del puntero en un "hit" usando raycasting
// y le pide al editor que actúe.
//   Clic izquierdo       -> herramienta actual (Alt + clic = cuentagotas)
//   Clic derecho         -> borrar
//   Arrastrar            -> lo maneja OrbitControls (girar / mover), no se considera clic

import * as THREE from 'three';
import { pointToCell } from './grid.js';

const CLICK_TOLERANCE_PX = 6;

export class MouseController extends EventTarget {
  constructor({ stage, voxels, editor, world, cursor }) {
    super();
    this.stage = stage;
    this.voxels = voxels;
    this.editor = editor;
    this.cursor = cursor;
    this.canvas = stage.renderer.domElement;
    this.raycaster = new THREE.Raycaster();
    this.ndc = new THREE.Vector2();
    this.pointer = null; // última posición del puntero sobre el lienzo
    this.pressed = null; // dónde empezó el clic

    this.canvas.addEventListener('pointermove', (e) => {
      this.pointer = { x: e.clientX, y: e.clientY, alt: e.altKey };
      this.refresh();
    });
    this.canvas.addEventListener('pointerdown', (e) => {
      this.pressed = { x: e.clientX, y: e.clientY, button: e.button };
    });
    this.canvas.addEventListener('pointerup', (e) => this.handleRelease(e));
    this.canvas.addEventListener('pointerleave', () => {
      this.pointer = null;
      this.refresh();
    });
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Si cambia la herramienta, el mundo o la cámara, el cubo fantasma debe recalcularse.
    editor.addEventListener('statechange', () => this.refresh());
    world.addEventListener('change', () => this.refresh());
    stage.controls.addEventListener('change', () => this.refresh());
  }

  /** Lanza un rayo desde la cámara a través del puntero y devuelve { voxel, adjacent } o null. */
  pick(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    this.ndc.set(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.ndc, this.stage.camera);
    const [hit] = this.raycaster.intersectObjects([...this.voxels.pickables, this.stage.ground], false);
    if (!hit) return null;

    if (hit.object === this.stage.ground) {
      const cell = pointToCell(hit.point);
      return { voxel: null, adjacent: { x: cell.x, y: 0, z: cell.z } };
    }
    const voxel = hit.object.userData.cell;
    const normal = hit.face.normal; // cara del cubo que tocó el rayo
    return {
      voxel: { ...voxel },
      adjacent: {
        x: voxel.x + Math.round(normal.x),
        y: voxel.y + Math.round(normal.y),
        z: voxel.z + Math.round(normal.z),
      },
    };
  }

  currentTool() {
    return this.pointer?.alt ? 'pick' : this.editor.tool;
  }

  refresh() {
    const hit = this.pointer ? this.pick(this.pointer.x, this.pointer.y) : null;
    const tool = this.currentTool();
    const target = this.editor.targetFor(hit, tool);
    if (target) this.cursor.show(target, tool);
    else this.cursor.hide();
    this.dispatchEvent(new CustomEvent('hover', { detail: { cell: target } }));
  }

  handleRelease(e) {
    const start = this.pressed;
    this.pressed = null;
    if (!start || start.button !== e.button) return;
    const moved = Math.hypot(e.clientX - start.x, e.clientY - start.y);
    if (moved > CLICK_TOLERANCE_PX) return; // fue un arrastre de cámara, no un clic

    const hit = this.pick(e.clientX, e.clientY);
    if (e.button === 0) this.editor.act(hit, e.altKey ? 'pick' : this.editor.tool);
    else if (e.button === 2) this.editor.act(hit, 'erase');
  }
}
