class Camera{
    static MOVE_SPEED = 1.2;
    static SPIN_SPEED = 2;
    static CAMERA_RADIUS = 0.3;
    constructor(x,y,radians){
        this.x = x;
        this.y = y;
        this.radians = radians;
    }
    moveForward(DeltaT){
    const newx = this.x + Math.cos(this.radians) * DeltaT * Camera.MOVE_SPEED;
    const newy = this.y + Math.sin(this.radians) * DeltaT * Camera.MOVE_SPEED;

    this.x = newx
    this.y = newy
    }
    moveBackward(DeltaT){
        this.moveForward(-DeltaT)
    }
    moveLeft(DeltaT){
        const newx =
      this.x + Math.cos(this.radians + Math.PI / 2) * DeltaT * Camera.MOVE_SPEED;
    const newy =
      this.y + Math.sin(this.radians + Math.PI / 2) * DeltaT * Camera.MOVE_SPEED;

      this.x = newx
      this.y = newy
    }
    moveRight(DeltaT){
        this.moveLeft(-DeltaT)
    }
    spinLeft(DeltaT) {
  this.radians += Camera.SPIN_SPEED * DeltaT;
    }
    spinRight(DeltaT) {
    this.radians -= Camera.SPIN_SPEED * DeltaT;
}
    
}
export {Camera}