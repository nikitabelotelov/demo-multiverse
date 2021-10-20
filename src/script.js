import "./style.css";
import * as THREE from "three";
import * as dat from "dat.gui";
import { FirstPersonControls } from "./FirstPersonControls.js";
import { BlockCreator } from "./BlockCreator";

// Debug
const gui = new dat.GUI();

// Canvas
let camera, scene, renderer;
let plane;
let pointer,
  raycaster,
  isShiftDown = false;
let clock;
let controls;
let blockCreator;

const objects = [];

init();
animate();

function initSceneObjects(scene) {
  // grid

  const gridHelper = new THREE.GridHelper(10000, 100);
  scene.add(gridHelper);

  const geometry = new THREE.PlaneGeometry(10000, 10000);
  geometry.rotateX(-Math.PI / 2);

  plane = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ color: 0xff0000, visible: false })
  );
  scene.add(plane);
  const lineXMaterial = new THREE.LineBasicMaterial({color:0xff0000})
  const lineYMaterial = new THREE.LineBasicMaterial({color:0x00ff00})
  const lineZMaterial = new THREE.LineBasicMaterial({color:0x0000ff})

  const lineXPoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(100, 0, 0)]
  const lineYPoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 100, 0)]
  const lineZPoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 100)]

  const lineXGeo = new THREE.BufferGeometry().setFromPoints(lineXPoints)
  const lineYGeo = new THREE.BufferGeometry().setFromPoints(lineYPoints)
  const lineZGeo = new THREE.BufferGeometry().setFromPoints(lineZPoints)

  const lineX = new THREE.Line(lineXGeo, lineXMaterial)
  const lineY = new THREE.Line(lineYGeo, lineYMaterial)
  const lineZ = new THREE.Line(lineZGeo, lineZMaterial)

  scene.add(lineX)
  scene.add(lineY)
  scene.add(lineZ)

  objects.push(lineX, lineY, lineZ)

  objects.push(plane);

  // lights

  const ambientLight = new THREE.AmbientLight(0x606060);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 0.75, 0.5).normalize();
  scene.add(directionalLight);
}

function init() {
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.set(500, 800, 1300);
  camera.lookAt(0, 0, 0);
  clock = new THREE.Clock();

  scene = new THREE.Scene();
  blockCreator = new BlockCreator(scene);
  scene.background = new THREE.Color(0xf0f0f0);
  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  initSceneObjects(scene)

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new FirstPersonControls(camera, renderer.domElement);

  controls.movementSpeed = 500;
  controls.lookSpeed = 0.1;

  document.addEventListener("pointermove", onPointerMove);
  document.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("keydown", onDocumentKeyDown);
  document.addEventListener("keyup", onDocumentKeyUp);

  //

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  controls.handleResize();
}

function onPointerMove(event) {
  pointer.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  raycaster.setFromCamera(pointer, camera);
  blockCreator.update(raycaster);
  render();
}

function onPointerDown(event) {
  pointer.set(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(objects);

  if (intersects.length > 0) {
    const intersect = intersects[0];
    if (isShiftDown) {
      // delete cube
      if (intersect.object !== plane) {
        scene.remove(intersect.object);
        objects.splice(objects.indexOf(intersect.object), 1);
      }
    } else {
      // create cube
      const cube = blockCreator.click(intersects);
      if (cube) {
        scene.add(cube);
        objects.push(cube);
      }
    }
  }
}

function onDocumentKeyDown(event) {
  switch (event.keyCode) {
    case 16:
      isShiftDown = true;
      break;
  }
}

function onDocumentKeyUp(event) {
  switch (event.keyCode) {
    case 16:
      isShiftDown = false;
      break;
  }
}

function render() {
  const delta = clock.getDelta();
  controls.update(delta);
  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  render();
}
