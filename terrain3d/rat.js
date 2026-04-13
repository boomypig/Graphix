class Rat {
  static SPIN_SPEED = 2;
  static MOVE_SPEED = 4;
  static RAT_RADIUS = 0.3;

  constructor(x, y, radians, terrain = null) {
    this.x = x;
    this.y = y;
    this.radians = radians;
    this.z = terrain ? terrain.getSurfaceHeight(x, y) : 0;
  }

  spinLeft(DeltaT) {
    this.radians -= Rat.SPIN_SPEED * DeltaT;
  }

  spinRight(DeltaT) {
    this.radians += Rat.SPIN_SPEED * DeltaT;
  }

  scurryForward(DeltaT, terrain) {
    const newx = this.x + Math.cos(this.radians) * DeltaT * Rat.MOVE_SPEED;
    const newy = this.y + Math.sin(this.radians) * DeltaT * Rat.MOVE_SPEED;

    this.x = newx;
    this.y = newy;
    this.z = terrain.getSurfaceHeight(this.x, this.y);
  }

  scurryBackward(DeltaT, terrain) {
    this.scurryForward(-DeltaT, terrain);
  }

  strafeLeft(DeltaT, terrain) {
    const newx =
      this.x + Math.cos(this.radians + Math.PI / 2) * DeltaT * Rat.MOVE_SPEED;
    const newy =
      this.y + Math.sin(this.radians + Math.PI / 2) * DeltaT * Rat.MOVE_SPEED;

    this.x = newx;
    this.y = newy;
   this.z = terrain.getSurfaceHeight(this.x, this.y);
  }

  strafeRight(DeltaT, terrain) {
    this.strafeLeft(-DeltaT, terrain);
  }
}

export { Rat };