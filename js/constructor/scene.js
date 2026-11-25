// Escena 3D con Three.js: renderizador, cámara, luces, suelo con cuadrícula y controles de órbita.

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { WORLD_SIZE } from './grid.js';

const COLORS = {
  background: 0x0b0d17,
  ground: 0x141832,
  gridMain: 0x3ee6d0,
  gridLine: 0x2a3160,
  volume: 0x9b7bff,
};

export function createStage(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(COLORS.background);
  scene.fog = new THREE.Fog(COLORS.background, 70, 160);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 500);
  camera.position.set(13, 14, 19);

  // Controles: arrastrar = girar, rueda = zoom, clic derecho arrastrando = mover.
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 6;
  controls.maxDistance = 110;
  controls.maxPolarAngle = Math.PI / 2 - 0.04; // no meterse debajo del suelo
  controls.update();

  // Luces
  scene.add(new THREE.HemisphereLight(0xc8d6ff, 0x1a1530, 1.1));
  const sun = new THREE.DirectionalLight(0xffffff, 1.7);
  sun.position.set(18, 40, 14);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const half = WORLD_SIZE.x / 2 + 2;
  Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 1, far: 100 });
  sun.shadow.bias = -0.0005;
  scene.add(sun);

  // Suelo (también sirve como superficie para apuntar con el mouse)
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(WORLD_SIZE.x, WORLD_SIZE.z),
    new THREE.MeshStandardMaterial({ color: COLORS.ground, roughness: 1 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const grid = new THREE.GridHelper(WORLD_SIZE.x, WORLD_SIZE.x, COLORS.gridMain, COLORS.gridLine);
  grid.position.y = 0.003;
  grid.material.transparent = true;
  grid.material.opacity = 0.7;
  scene.add(grid);

  // Contorno del volumen construible (será la "zona autorizada" del DLC de Minecraft)
  const volume = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(WORLD_SIZE.x, WORLD_SIZE.y, WORLD_SIZE.z)),
    new THREE.LineBasicMaterial({ color: COLORS.volume, transparent: true, opacity: 0.18 }),
  );
  volume.position.y = WORLD_SIZE.y / 2;
  scene.add(volume);

  // Ajustar tamaño cuando cambia el contenedor
  const resize = () => {
    const { clientWidth: width, clientHeight: height } = container;
    if (width === 0 || height === 0) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(container);
  resize();

  const frameCallbacks = [];
  renderer.setAnimationLoop((time) => {
    controls.update();
    for (const callback of frameCallbacks) callback(time);
    renderer.render(scene, camera);
  });

  return {
    renderer,
    scene,
    camera,
    controls,
    ground,
    onFrame: (callback) => frameCallbacks.push(callback),
  };
}
