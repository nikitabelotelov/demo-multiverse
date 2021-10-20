import * as THREE from "three";
import { getIntersect } from "./helpers/intersectHelper";

const CREATOR_STATES = {
  WAIT: 0,
  START_POINT: 1,
  SECOND_POINT: 2
};

const CUBE_SIZE = 50;

class BlockCreator {
  constructor(scene) {
    this.state = CREATOR_STATES.WAIT;
    this.scene = scene;
    this.planeGeometry = new THREE.PlaneGeometry(1000, 1000);
    this.planeGeometry.rotateX(-Math.PI / 2);
    this.planeMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      visible: true,
      opacity: 0.3
    });
    this.cubeGeo = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
    this.cubeMaterial = new THREE.MeshLambertMaterial({
      color: 0xfeb74c,
      map: new THREE.TextureLoader().load("square-outline-textured.png"),
    });
  }
  click(intersects) {
    let intersect
    switch (this.state) {
      case CREATOR_STATES.WAIT:
        intersect = intersects[0];
        const voxel = new THREE.Mesh(this.cubeGeo, this.cubeMaterial);
        voxel.position.copy(intersect.point);
        voxel.position.addScalar(CUBE_SIZE / 2);
        this.scene.add(voxel);
        const plane = new THREE.Mesh(this.planeGeometry, this.planeMaterial);
        plane.position.copy(intersect.point)
        this.scene.add(plane);
        this.state = CREATOR_STATES.START_POINT;
        this.object = voxel;
        this.objectInitial = new THREE.Vector3().copy(intersect.point);
        this.helperPlane = plane;
        return null;
      case CREATOR_STATES.START_POINT:
        intersect = getIntersect(intersects, this.helperPlane);
        this.helperPlane.rotation.x = Math.PI / 2
        this.state = CREATOR_STATES.SECOND_POINT;
        return null;
      case CREATOR_STATES.SECOND_POINT:
        this.state = CREATOR_STATES.WAIT;
        this.scene.remove(this.helperPlane)
        this.scene.remove(this.object)
        this.helperPlane = undefined
        this.objectInitial = undefined
        return this.object;
    }
  }
  update(raycaster) {
    if (this.state === CREATOR_STATES.START_POINT) {
      const intersects = raycaster.intersectObjects([this.helperPlane]);
      const intersect = getIntersect(intersects, this.helperPlane);
      const positiveX = intersect.point.x > this.objectInitial.x;
      const positiveZ = intersect.point.z > this.objectInitial.z;
      let multiplierX, multiplierZ;
      if (positiveX) {
        multiplierX =
          (intersect.point.x - this.objectInitial.x) /
          CUBE_SIZE;
      } else {
        multiplierX =
          Math.abs(intersect.point.x - this.objectInitial.x) /
          CUBE_SIZE;
      }
      if (positiveZ) {
        multiplierZ =
          (intersect.point.z - this.objectInitial.z) /
          CUBE_SIZE;
      } else {
        multiplierZ =
          Math.abs(intersect.point.z - this.objectInitial.z) /
          CUBE_SIZE;
      }
      this.object.scale.set(multiplierX, 1, multiplierZ);
      let x, z;
      if (positiveX) {
        x = this.objectInitial.x + (CUBE_SIZE * multiplierX) / 2;
      } else {
        x = this.objectInitial.x - (CUBE_SIZE * multiplierX) / 2;
      }
      if (positiveZ) {
        z = this.objectInitial.z + (CUBE_SIZE * (multiplierZ)) / 2;
      } else {
        z = this.objectInitial.z - (CUBE_SIZE * (multiplierZ)) / 2;
      }
      this.object.position.set(x, this.objectInitial.y, z);
    } else if (this.state === CREATOR_STATES.SECOND_POINT) {
      const intersects = raycaster.intersectObjects([this.helperPlane]);
      const intersect = getIntersect(intersects, this.helperPlane);
      const positiveY = intersect.point.y > this.objectInitial.y;
      console.log("DD:", intersect.point.y, this.objectInitial.y)
      let multiplierY
      if (positiveY) {
        multiplierY =
          (intersect.point.y - this.objectInitial.y) /
          CUBE_SIZE;
      } else {
        multiplierY =
          Math.abs(intersect.point.y - this.objectInitial.y) /
          CUBE_SIZE;
      }
      this.object.scale.y = multiplierY;
      let y;
      if (positiveY) {
        y = this.objectInitial.y + (CUBE_SIZE * multiplierY) / 2;
      } else {
        y = this.objectInitial.y - (CUBE_SIZE * multiplierY) / 2;
      }
      this.object.position.y = y;
    }
  }
}
export { BlockCreator };
