
class Rat {
  static SPIN_SPEED = 2;
  static MOVE_SPEED = 1;
  static RAT_RADIUS = 0.3;
  constructor(x, y, radians) {  
    this.x = x;
    this.y = y;
    this.radians = radians;
  }
  spinLeft(DeltaT) {
    this.radians += Rat.SPIN_SPEED * DeltaT;
  }
  spinRight(DeltaT) {
    this.radians -= Rat.SPIN_SPEED * DeltaT;
  }
  scurryForward(DeltaT, maze) {
    const newx = this.x + Math.cos(this.radians) * DeltaT * Rat.MOVE_SPEED;
    const newy = this.y + Math.sin(this.radians) * DeltaT * Rat.MOVE_SPEED;

    if (maze.isLegal(newx, this.y, Rat.RAT_RADIUS)) {
      this.x = newx;
    }
    if (maze.isLegal(this.x, newy, Rat.RAT_RADIUS)) {
      this.y = newy;
    }
  }
  scurryBackward(DeltaT, maze) {
    this.scurryForward(-DeltaT, maze);
  }
  strafeLeft(DeltaT, maze) {
    const newx =
      this.x + Math.cos(this.radians + Math.PI / 2) * DeltaT * Rat.MOVE_SPEED;
    const newy =
      this.y + Math.sin(this.radians + Math.PI / 2) * DeltaT * Rat.MOVE_SPEED;

    if (maze.isLegal(newx, this.y, Rat.RAT_RADIUS)) {
      this.x = newx;
    }
    if (maze.isLegal(this.x, newy, Rat.RAT_RADIUS)) {
      this.y = newy;
    }
  }
  strafeRight(DeltaT, maze) {
    this.strafeLeft(-DeltaT, maze);
  }
}
export { Rat };
