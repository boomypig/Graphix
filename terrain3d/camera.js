class Camera {
  static MOVE_SPEED    = 12;
  static VERTICAL_SPEED = 8;
  static SPIN_SPEED    = 1.8;
  static PITCH_SPEED   = 1.5;

  /**
   * @param {number} x        - game-space X
   * @param {number} y        - game-space Y (horizontal, maps to world Z)
   * @param {number} z        - height (maps to world Y)
   * @param {number} radians  - yaw angle
   * @param {number} pitch    - vertical look angle (negative = looking down)
   */
  constructor(x, y, z, radians, pitch = -0.25) {
    this.x       = x;
    this.y       = y;
    this.z       = z;
    this.radians = radians;
    this.pitch   = pitch;
  }

  // Fly forward along the camera's look direction (affected by pitch)
  moveForward(DeltaT) {
    const horiz = Math.cos(this.pitch);
    this.x += Math.cos(this.radians) * horiz * DeltaT * Camera.MOVE_SPEED;
    this.y += Math.sin(this.radians) * horiz * DeltaT * Camera.MOVE_SPEED;
    this.z += Math.sin(this.pitch)           * DeltaT * Camera.MOVE_SPEED;
  }

  moveBackward(DeltaT) { this.moveForward(-DeltaT); }

  strafeLeft(DeltaT) {
    this.x += Math.cos(this.radians + Math.PI / 2) * DeltaT * Camera.MOVE_SPEED;
    this.y += Math.sin(this.radians + Math.PI / 2) * DeltaT * Camera.MOVE_SPEED;
  }

  strafeRight(DeltaT) { this.strafeLeft(-DeltaT); }

  moveUp(DeltaT)   { this.z += DeltaT * Camera.VERTICAL_SPEED; }
  moveDown(DeltaT) { this.z -= DeltaT * Camera.VERTICAL_SPEED; }

  spinLeft(DeltaT)  { this.radians -= Camera.SPIN_SPEED * DeltaT; }
  spinRight(DeltaT) { this.radians += Camera.SPIN_SPEED * DeltaT; }

  pitchUp(DeltaT) {
    this.pitch = Math.min(Math.PI / 2 - 0.05, this.pitch + Camera.PITCH_SPEED * DeltaT);
  }

  pitchDown(DeltaT) {
    this.pitch = Math.max(-Math.PI / 2 + 0.05, this.pitch - Camera.PITCH_SPEED * DeltaT);
  }
}

export { Camera };