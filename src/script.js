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

let rollOverMesh, rollOverMaterial;
let cubeGeo, cubeMaterial;
let clock;
let controls;
let blockCreator = new BlockCreator();

const objects = [];

init();
animate();

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
  scene.background = new THREE.Color(0xf0f0f0);

  // roll-over helpers

  const rollOverGeo = new THREE.BoxGeometry(50, 50, 50);
  rollOverMaterial = new THREE.MeshBasicMaterial({
    color: 0x0000ff,
    opacity: 0.7,
    transparent: true,
  });
  rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
  rollOverMesh.position.addScalar(25);
//   scene.add(rollOverMesh);

  // cubes

  cubeGeo = new THREE.BoxGeometry(50, 50, 50);
  cubeMaterial = new THREE.MeshLambertMaterial({
    color: 0xfeb74c,
    map: new THREE.TextureLoader().load("square-outline-textured.png"),
  });

  // grid

  const gridHelper = new THREE.GridHelper(10000, 200);
  scene.add(gridHelper);

  //

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  const geometry = new THREE.PlaneGeometry(10000, 10000);
  geometry.rotateX(-Math.PI / 2);

  plane = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ visible: false })
  );
  scene.add(plane);

  objects.push(plane);

  // lights

  const ambientLight = new THREE.AmbientLight(0x606060);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 0.75, 0.5).normalize();
  scene.add(directionalLight);

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

  const intersects = raycaster.intersectObjects(objects);

  if (intersects.length > 0) {
    const intersect = intersects[0];

    // rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
    // rollOverMesh.position.addScalar(25);
    blockCreator.update(intersect);
  }
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

    // delete cube

    if (isShiftDown) {
      if (intersect.object !== plane) {
        scene.remove(intersect.object);

        objects.splice(objects.indexOf(intersect.object), 1);
      }

      // create cube
    } else {
      const voxel = blockCreator.click(intersect, cubeGeo, cubeMaterial);
      if (voxel) {
        scene.add(voxel);
        objects.push(voxel);
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
