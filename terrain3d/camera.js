class Camera {
  static MOVE_SPEED = 1.2;
  static SPIN_SPEED = 2;
  static CAMERA_RADIUS = 0.3;
  static HEIGHT_OFFSET = 0.8;

  constructor(x, y, radians, terrain = null) {
    this.x = x;
    this.y = y;
    this.radians = radians;
    this.z = terrain
  ? terrain.getSurfaceHeight(x, y) + Camera.HEIGHT_OFFSET
  : Camera.HEIGHT_OFFSET;
  }

  moveForward(DeltaT, terrain) {
    const newx = this.x + Math.cos(this.radians) * DeltaT * Camera.MOVE_SPEED;
    const newy = this.y + Math.sin(this.radians) * DeltaT * Camera.MOVE_SPEED;

    this.x = newx;
    this.y = newy;
    this.z = terrain.getSurfaceHeight(this.x, this.y) + Camera.HEIGHT_OFFSET;
  }

  moveBackward(DeltaT, terrain) {
    this.moveForward(-DeltaT, terrain);
  }

  moveLeft(DeltaT, terrain) {
    const newx =
      this.x + Math.cos(this.radians + Math.PI / 2) * DeltaT * Camera.MOVE_SPEED;
    const newy =
      this.y + Math.sin(this.radians + Math.PI / 2) * DeltaT * Camera.MOVE_SPEED;

    this.x = newx;
    this.y = newy;
    this.z = terrain.getSurfaceHeight(this.x, this.y) + Camera.HEIGHT_OFFSET;
  }

  moveRight(DeltaT, terrain) {
    this.moveLeft(-DeltaT, terrain);
  }

  spinLeft(DeltaT) {
    this.radians -= Camera.SPIN_SPEED * DeltaT;
  }

  spinRight(DeltaT) {
    this.radians += Camera.SPIN_SPEED * DeltaT;
  }
}

export { Camera };