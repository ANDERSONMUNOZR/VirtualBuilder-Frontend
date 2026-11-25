// Punto de entrada del constructor: crea cada módulo y los conecta entre sí.
//
//   World (datos) ──'change'──► VoxelRenderer (3D)
//        │                 ├──► History (deshacer)
//        │                 ├──► HUD (estadísticas)
//        │                 └──► (Etapa 7) sincronización con Minecraft
//        ▲
//   Editor (herramientas) ◄── MouseController  (y en la Etapa 3: control por gestos)

import { createStage } from './scene.js';
import { World } from './world.js';
import { History } from './history.js';
import { Editor } from './editor.js';
import { VoxelRenderer } from './voxelRenderer.js';
import { BlockCursor } from './cursor.js';
import { MouseController } from './mouseController.js';
import { initLibrary } from './library.js';
import { initHud } from './hud.js';

const stage = createStage(document.getElementById('viewport'));
const world = new World();
const history = new History(world);
const editor = new Editor(world);
const voxels = new VoxelRenderer(stage.scene, world);
const cursor = new BlockCursor(stage.scene);
const mouse = new MouseController({ stage, voxels, editor, world, cursor });

function toast(message) {
  document.getElementById('vb-toast-body').textContent = message;
  window.bootstrap.Toast.getOrCreateInstance(document.getElementById('vb-toast')).show();
}

initLibrary({
  editor,
  container: document.getElementById('block-library'),
  searchInput: document.getElementById('library-search'),
  emptyMessage: document.getElementById('library-empty'),
});
initHud({ world, history, editor, mouse, toast });

// Acceso desde la consola del navegador para depurar y hacer pruebas.
window.VirtualBuilder = { stage, world, history, editor, voxels, mouse };
