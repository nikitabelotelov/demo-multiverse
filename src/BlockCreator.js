import * as THREE from "three";

const CREATOR_STATES = {
  WAIT: 0,
  START_POINT: 1,
};

const CUBE_SIZE = 50;

class BlockCreator {
  constructor() {
    this.state = CREATOR_STATES.WAIT;
    this.cubeGeo = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
    this.cubeMaterial = new THREE.MeshLambertMaterial({
      color: 0xfeb74c,
      map: new THREE.TextureLoader().load("square-outline-textured.png"),
    });
  }
  click(intersect) {
    switch (this.state) {
      case CREATOR_STATES.WAIT:
        const voxel = new THREE.Mesh(this.cubeGeo, this.cubeMaterial);
        voxel.position.copy(intersect.point).add(intersect.face.normal);
        voxel.position.addScalar(CUBE_SIZE / 2);
        this.state = CREATOR_STATES.START_POINT;
        this.object = voxel;
        this.objectInitial = new THREE.Vector3().copy(voxel.position);
        console.log(this.objectInitial);
        return voxel;
      case CREATOR_STATES.START_POINT:
        this.state = CREATOR_STATES.WAIT;
        return null;
    }
  }
  update(intersect) {
    if (this.state === CREATOR_STATES.START_POINT) {
      const positiveX = intersect.point.x > this.objectInitial.x;
      const positiveZ = intersect.point.z > this.objectInitial.z;
      let multiplierX, multiplierZ;
      console.log("DD:", this.objectInitial, intersect.point)
      if (positiveX) {
        multiplierX =
          Math.abs(this.objectInitial.x - CUBE_SIZE / 2 - intersect.point.x) /
          CUBE_SIZE;
      } else {
        multiplierX =
          Math.abs(intersect.point.x - CUBE_SIZE / 2 - this.objectInitial.x) /
          CUBE_SIZE;
      }
      if (positiveZ) {
        multiplierZ =
          Math.abs(this.objectInitial.z - CUBE_SIZE / 2 - intersect.point.z) /
          CUBE_SIZE;
      } else {
        multiplierZ =
          Math.abs(intersect.point.z - CUBE_SIZE / 2 - this.objectInitial.z) /
          CUBE_SIZE;
      }
      this.object.scale.set(multiplierX, 1, multiplierZ);
      let x, z;
      if (positiveX) {
        x = this.objectInitial.x + (CUBE_SIZE * (multiplierX - 1)) / 2;
      } else {
        x = this.objectInitial.x - (CUBE_SIZE * (multiplierX - 1)) / 2;
      }
      if (positiveZ) {
        z = this.objectInitial.z + (CUBE_SIZE * (multiplierZ - 1)) / 2;
      } else {
        z = this.objectInitial.z - (CUBE_SIZE * (multiplierZ - 1)) / 2;
      }
      this.object.position.set(x, this.objectInitial.y, z);
    }
  }
}
export { BlockCreator };
